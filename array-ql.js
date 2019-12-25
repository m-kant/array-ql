/**
 * @class Manipulate with array of objects SQL-alike way.
 * Paginate, filtrate, sort, update, insert, delete
 * For example: USERS.select("name, gender").where("gender").is("female").limit(0,2).getResult()
 * Mainly intended for mocking servers, test, debugging, prototyping purposes
 * 
 */
class ArrayQL {
  /**
   * @constructor
   * @param {Array|string} rowsOrPath array of records of path to json array
   * @param {Object} options
   * @returns {ArrayQL}
   */
  constructor(rowsOrPath, options) {
    const _srcArray =
      typeof rowsOrPath === "string" ? require(rowsOrPath) : rowsOrPath;
    if (!(_srcArray instanceof Array)) throw new Error("List must be an array");
    
    this.trace = true;

    // acquire data
    this._srcArray = _srcArray;
    this.options = Object.assign(
      {
        idName: "id",
        default: {}, // default record
        getters: {} // computed fields
      },
      options
    );
    this._mapGetters();
    this.idName = this.options.idName; // shortcut

    this.resetResult();

    this._nextId = this.maxId() + 1; // find id for new row
  }
  
  /** Adds getters to all entries in array */
  _mapGetters() {
    const getterNames = Object.keys(this.options.getters);
    if (!getterNames || !getterNames.length) return;
    this._srcArray.forEach(this._addGetters.bind(this));
  }

  /** Adds getters to one entry 
   * @param {object} record
   * */
  _addGetters(record) {
    const getterNames = Object.keys(this.options.getters);
    if (!getterNames || !getterNames.length) return;

    getterNames.forEach(getterName => {
      Object.defineProperty(record, getterName, {
        get: this.options.getters[getterName].bind(record),
        enumerable: true
      });
    });
    return record;
  }

  /** Resets previous select results
   * @returns {ArrayQL} */
  resetResult() {
    // put result to wrapper in SPRING format
    this._filtered = this._srcArray;
    this._unlimitedCount = this._filtered.length;
    this._keys = null;
    this._activeKey = null;
    this._selectedKyes = null; // null means "ALL"
    this._logic = "and";
    this._limit = null;
    this._offset = null;


    if (this.trace) console.log(`ArrayQL.select()`, this._filtered.length);
    return this;
  }
  maxId() {
    if (!this._srcArray) return null;
    if (!this._srcArray.length) return 0;
    return Math.max(...this._srcArray.map(r => r[this.idName]));
  }

  /** Resets previous select results
   * @param {string[]|string} keys comma separated string of array of keynames
   * @returns {ArrayQL} */
  select(keys) {
	this.resetResult();
	if(!keys) return this;
    
	if(typeof keys === "string" && Array.isArray(keys)){
	  throw new Error(
		`"keys" must be an array of ids or comma separated string of ids, ${typeof keys} given: ${keys}`
	  );		
	}
	
	let keysArr = Array.isArray(keys) ? keys : keys.split(/\s*,\s*/);
	this._keys = keysArr.map(k => {
		let [src, dest] = k.split(/\s+as\s+/).map(s => s.trim());
		if(!dest) dest = src;
		return {src, dest};
	});
	
    return this;
  }

  /** Set active key name, dot notation is allowed
   * @param {string} key
   * @returns {ArrayQL} */
  where(key) {
    this._activeKey = key;
    return this;
  }

  /** Set active key name, dot notation is allowed
   * @param {string} key
   * @returns {ArrayQL} */
  and(key) {
    this._activeKey = key;
    this._logic = "and";
    return this;
  }
  // does not work
  or(key) {
    this._activeKey = key;
    this._logic = "or";
    return this;
  }
  concat(keys) {
    this._activeKey = keys;
    if (this.trace) console.log(`ArrayQL.concat(${keys})`);
    return this;
  }

  // CONDITIONS ===

  /**
   * Includes entries where value of target key is NULL
   * @param {any} val 
   * @returns {ArrayQL}
   */
  isNull(val) {
    if (val === undefined || val === null) return this;

    this._filtered = this._filtered.filter(r => {
      const rowVal = this._extractValue(r);
      return rowVal === null;
    });

    this._unlimitedCount = this._filtered.length;
    if (this.trace)
      console.log(`ArrayQL.isNull(${val})`, this._filtered.length);
    return this;
  }
  /**
   * Includes entries where value of target key is not NULL
   * @param {any} val 
   * @returns {ArrayQL}
   */
  notNull(val) {
    if (val === undefined || val === null) return this;

    this._filtered = this._filtered.filter(r => {
      const rowVal = this._extractValue(r);
      return rowVal !== null;
    });

    this._unlimitedCount = this._filtered.length;
    if (this.trace)
      console.log(`ArrayQL.isNull(${val})`, this._filtered.length);
    return this;
  }


  /**
   * Includes entries where value of target key 
   * is stirictly equal to given value (including type)
   * @param {any} val 
   * @returns {ArrayQL}
   */
  equalTo(val) {
    if (val === undefined || val === null) return this;

    this._filtered = this._filtered.filter(r => {
      const rowVal = this._extractValue(r);
      return rowVal === val;
    });

    this._unlimitedCount = this._filtered.length;
    if (this.trace)
      console.log(`ArrayQL.equalTo(${val})`, this._filtered.length);
    return this;
  }

  /**
   * Alias to equalTo
   * @param {any} val any value will be stringified
   * @returns {ArrayQL}
   */
  is(val) {
    return this.equalTo(val);
  }

  /**
   * Includes entries where target key has value
   * which has partial case-insensitive match with given value
   * @param {any} val any value will be stringified
   * @returns {ArrayQL}
   */
  like(val) {
    if (val === undefined || val === null) return this;
    // if (typeof val !== "string")
    //   throw new Error(
    //     `"Like" condition is only for strings, ${typeof val} given`
    //   );
    val = String(val).toLowerCase();

    this._filtered = this._filtered.filter(r => {
      let rowVal = this._extractValue(r);
      if (typeof rowVal !== "string") return false;
      return rowVal.toLowerCase().includes(val);
    });

    this._unlimitedCount = this._filtered.length;
    if (this.trace) console.log(`ArrayQL.like(${val})`, this._filtered.length);
    return this;
  }
  /**
   * Includes entries where target key has value is less then given,
   * @param {number} val
   * @throws {Error} condition is only for numbers
   * @returns {ArrayQL}
   */
  lessThen(val) {
    if (val === undefined || val === null) return this;
    if (typeof val !== "number")
      throw new Error(
        `"lessThen" condition is only for numbers, ${typeof val} ${val} given`
      );

    this._filtered = this._filtered.filter(r => {
      let rowVal = this._extractValue(r);
      if (typeof rowVal !== "number") return false;
      return rowVal < val;
    });
    this._unlimitedCount = this._filtered.length;
    return this;
  }
  /**
   * Includes entries where target key has value is more then given,
   * @param {number} val
   * @throws {Error} condition is only for numbers
   * @returns {ArrayQL}
   */
  moreThen(val) {
    if (val === undefined || val === null) return this;
    if (typeof val !== "number")
      throw new Error(
        `"moreThen" condition is only for numbers, ${typeof val} ${val} given`
      );

    this._filtered = this._filtered.filter(r => {
      let rowVal = this._extractValue(r);
      if (typeof rowVal !== "number") return false;
      return rowVal > val;
    });
    this._unlimitedCount = this._filtered.length;
    return this;
  }
  /**
   * Includes entries where target key has value between "min" and "max",
   * including "min" and "max"
   * @param {number} min
   * @param {number} max
   * @throws {Error} condition is only for numbers
   * @returns {ArrayQL}
   */
  between(min, max) {
    if (min === undefined || min === null) min = -Infinity;
    if (max === undefined || max === null) max = Infinity;
    if (typeof min !== "number")
      throw new Error(
        `"between" condition is only for numbers, ${typeof min} "${min}" given for "min"`
      );
    if (typeof max !== "number")
      throw new Error(
        `"between" condition is only for numbers, ${typeof max} "${max}" given for "max"`
      );

    this._filtered = this._filtered.filter(r => {
      let rowVal = this._extractValue(r);
      if (typeof rowVal !== "number") return false;
      return rowVal >= min && rowVal <= max;
    });
    this._unlimitedCount = this._filtered.length;
    return this;
  }
  /**
   * Excludes entries where target key has value between "min" and "max",
   * excluding "min" and "max"
   * @param {number} min
   * @param {number} max
   * @throws {Error} condition is only for numbers
   * @returns {ArrayQL}
   */
  notBetween(min, max) {
    if (min === undefined || min === null) min = -Infinity;
    if (max === undefined || max === null) max = Infinity;
    if (typeof min !== "number")
      throw new Error(
        `"notBetween" condition is only for numbers, ${typeof min} ${min} given`
      );
    if (typeof max !== "number")
      throw new Error(
        `"notBetween" condition is only for numbers, ${typeof max} ${max} given`
      );

    this._filtered = this._filtered.filter(r => {
      let rowVal = this._extractValue(r);
      if (typeof rowVal !== "number") return false;
      return rowVal < min || rowVal > max;
    });
    this._unlimitedCount = this._filtered.length;
    return this;
  }

  /**
   * Leaves in resulting array entries where target key has value from "list"
   * @param {any[]} list
   * @throws {Error} "notIn" condition is only for arrays
   * @returns {ArrayQL}
   */
  in(list) {
    if (list === undefined) return;
    if (!(list instanceof Array))
      throw new Error(
        `"in" condition is only for arrays, ${typeof list} given`
      );

    this._filtered = this._filtered.filter(r => {
      let rowVal = this._extractValue(r);
      return list.includes(rowVal);
    });
    this._unlimitedCount = this._filtered.length;
    return this;
  }
  /**
   * Excludes entries where target key has value from "list"
   * @param {any[]} list
   * @throws {Error} "notIn" condition is only for arrays
   * @returns {ArrayQL}
   */
  notIn(list) {
    if (list === undefined) return;
    if (!(list instanceof Array))
      throw new Error(
        `"notIn" condition is only for arrays, ${typeof list} given`
      );

    this._filtered = this._filtered.filter(r => {
      let rowVal = this._extractValue(r);
      return !list.includes(rowVal);
    });
    this._unlimitedCount = this._filtered.length;
    return this;
  }

  /** apply map to array
   * @param {function} callback
   * @returns {ArrayQL}
   */
  map(callback) {
    this._filtered = this._filtered.map(callback);
    return this;
  }
  /** apply filter to array
   * @param {function} fn
   * @returns {ArrayQL}
   */
  filter(fn) {
    this._filtered = this._filtered.filter(fn);
    return this;
  }

  query(queryStr) {}

  _extractDotted(row, dottedName) {
    if (!row) return row;
    if (!dottedName.includes(".")) return row[dottedName];
    const chain = dottedName.split(".");
    let res = row;
    for (let i = 0; i < chain.length; i++) {
      if (res === undefined) return;
      let key = chain[i];
      res = res[key];
    }
    return res;
  }

  _extractValue(row, keys) {
    if (keys === undefined) keys = this._activeKey;
    return this._extractDotted(row, keys);
  }

  _clone(data) {
    return JSON.parse(JSON.stringify(data));
  }

  /**
   * Sorts _srcArray by specified key
   * @param {String} keyname
   * @param {String} direction "asc" or "desc"
   * @returns {ArrayQL}
   */
  sort(keyname, direction = "desc") {
    if (keyname === undefined || keyname === null) return this;

    const compare = (a, b) => {
      const res = a[keyname] > b[keyname] ? 1 : -1;
      return direction === "asc" ? res : res * -1;
    };
    this._filtered.sort(compare);
    return this;
  }
  orderBy(keyname, direction) {
    return this.sort(keyname, direction);
  }

  /**
   * Cutting of resulting array for pagination
   * Does not affect this._unlimitedCount
   * @param {number} offset
   * @param {number} limit
   * @returns {ArrayQL}
   */
  limit(offset = 0, limit = 15) {
    limit = Number(limit);
    offset = Number(offset);
    this._offset = offset;
    this._limit = limit;
    if (this.limit === 0) throw new Error("Unreasonable value of Limit=0");

    const start = limit * offset;
    const end = start + limit;
    this._filtered = this._filtered.slice(start, end);
    if (this.trace)
      console.log(`ArrayQL.limit(${limit}, ${offset})`, this._filtered.length);
    return this;
  }
  /** Adds a new entry to the array,
   * taking into account the getters and the default entry.
   * If newRow contains id and entry with such id already exists
   * exception will be thrown
   * @param {Object} newRow
   * @throws {Error} Item with given id already exist
   * @returns {Object} inserted entry (with id and getters)
   */
  insert(newRow) {
    newRow = Object.assign({}, this.options.default, newRow);

    // id given by user
    if (newRow[this.idName] !== undefined && newRow[this.idName] !== null) {
      const existing = this._srcArray.find(
        r => r[this.idName] === newRow[this.idName]
      );
      if (existing)
        throw new Error(`Item with id "${newRow[this.idName]}" already exist`);
      // assign id automatically
    } else {
      newRow[this.idName] = this._nextId++; // increment id to make it unique
    }
    this._addGetters(newRow);

    this._srcArray.unshift(newRow); // add to start of _srcArray
    if (this.trace) console.log(`ArrayQL.insert()`, this._filtered.length);
    return newRow;
  }

  /** Updates elements by id. Deep merge does not supported
   * @param {Object} newData updating fields with id
   * @returns {Object} updated entry
   */
  update(newData) {
    if (newData[this.idName] === null || newData[this.idName] === undefined)
      throw new Error("No id given for update");
    const existing = this._srcArray.find(
      el => el[this.idName] === newData[this.idName]
    );
    if (!existing)
      throw new Error(
        `No element with id "${newData[this.idName]}" found for update`
      );

    if (this.trace) console.log(`ArrayQL.update()`, this._filtered.length);
    Object.assign(existing, newData);
    return existing;
  }
  /** deletes elements by id
   * @param {string|number|string[]|number[]} removingIds
   * @returns {object[]} deleted elements
   */
  delete(removingIds) {
    if (removingIds === undefined || removingIds === null)
      throw new Error("No ids given to delete");
    if (!(removingIds instanceof Array)) removingIds = [removingIds];

    const deleted = [];
    this._srcArray = this._srcArray.filter(el => {
      if (removingIds.includes(el[this.idName])) {
        deleted.push(el);
        return false;
      } else {
        return true;
      }
    });
    if (this.trace) console.log(`ArrayQL.delete()`, this._filtered.length);
    return deleted;
  }

  /** Returns row with given id
   * @param {string|number} id
   * @returns {object}
   */
  getById(id) {
    const record = this._srcArray.find(r => r[this.idName] === id);
    if (!record) throw new Error(`No record with id "${id}" found`);
    return record;
  }
  /** alias for getById
   * @param {number|string} id
   * @returns {object}
   */
  get(id) {
    return this.getById();
  }

  /** resulting array length
   * @returns {Number}
   */
  count() {
    return this._filtered.length;
  }
  /** resulting array length before last limit()
   * @returns {Number}
   */
  unlimitedCount() {
    return this._unlimitedCount;
  }

  /** resulting array
   * @returns {Object[]}
   */
  getList() {
    if (!this._keys) return this._filtered;
    return this._filtered.map(r => {
      const res = {};
      this._keys.forEach(k => {
        res[k.dest] = this._extractValue(r, k.src);
      });
      return res;
    });
  }
  /**
   * Object with resulting array and data for pagination
   * @returns {Object} {content: array, totalElements: number, totalPages: number, last: boolean, first: boolean}
   */
  getResult() {
    const content = this.getList();
    const totalPages = this._limit
      ? Math.ceil(this._unlimitedCount / this._limit)
      : null;
    return {
      content,
      totalElements: this._unlimitedCount,
      totalPages,
      last:  this._limit ? this._limit * this._offset >= totalPages : null,
      first: this._limit ? this._offset === 0 : null
      // sort: null,
      // size: null,
      // number: null,
      // numberOfElements: null
    };
  }
}


if (typeof module !== "undefined" && module.exports) module.exports = ArrayQL;