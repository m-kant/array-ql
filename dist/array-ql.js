"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * @class Manipulate with array of objects SQL-alike way.
 * Paginate, filtrate, sort, update, insert, delete
 * For example: USERS.select("name, gender").where("gender").is("female").limit(0,2).getResult()
 * Mainly intended for mocking servers, test, debugging, prototyping purposes
 * 
 */
var ArrayQL =
/*#__PURE__*/
function () {
  /**
   * @constructor
   * @param {Array|string} rowsOrPath array of records of path to json array
   * @param {Object} options
   * @returns {ArrayQL}
   */
  function ArrayQL(rowsOrPath, options) {
    _classCallCheck(this, ArrayQL);

    var _srcArray = typeof rowsOrPath === "string" ? require(rowsOrPath) : rowsOrPath;

    if (!(_srcArray instanceof Array)) throw new Error("List must be an array");
    this.trace = true; // acquire data

    this._srcArray = _srcArray;
    this.options = Object.assign({
      idName: "id",
      "default": {},
      // default record
      getters: {} // computed fields

    }, options);

    this._mapGetters();

    this.idName = this.options.idName; // shortcut

    this.resetResult();
    this._nextId = this.maxId() + 1; // find id for new row
  }
  /** Resets previous select results
   * @returns {ArrayQL} */


  _createClass(ArrayQL, [{
    key: "resetResult",
    value: function resetResult() {
      // put result to wrapper in SPRING format
      this._filtered = this._srcArray;
      this._unlimitedCount = this._filtered.length;
      this._keys = null;
      this._activeKey = null;
      this._selectedKyes = null; // null means "ALL"

      this._logic = "and";
      this._limit = null;
      this._offset = null;

      this._trace("ArrayQL.select()", this._filtered.length);

      return this;
    }
    /** Adds getters to all entries in array */

  }, {
    key: "_mapGetters",
    value: function _mapGetters() {
      var getterNames = Object.keys(this.options.getters);
      if (!getterNames || !getterNames.length) return;

      this._srcArray.forEach(this._addGetters.bind(this));
    }
    /** Adds getters to one entry
     * @param {object} record
     * */

  }, {
    key: "_addGetters",
    value: function _addGetters(record) {
      var _this = this;

      var getterNames = Object.keys(this.options.getters);
      if (!getterNames || !getterNames.length) return;
      getterNames.forEach(function (getterName) {
        Object.defineProperty(record, getterName, {
          get: _this.options.getters[getterName].bind(record),
          enumerable: true
        });
      });
      return record;
    }
  }, {
    key: "maxId",
    value: function maxId() {
      var _this2 = this;

      if (!this._srcArray) return null;
      if (!this._srcArray.length) return 0;
      return Math.max.apply(Math, _toConsumableArray(this._srcArray.map(function (r) {
        return r[_this2.idName];
      })));
    }
    /** Resets previous select results
     * @param {string[]|string} keys comma separated string of array of keynames
     * @returns {ArrayQL} */

  }, {
    key: "select",
    value: function select(keys) {
      this.resetResult();
      if (!keys) return this;

      if (typeof keys !== "string" && !Array.isArray(keys)) {
        throw new Error("\"keys\" must be an array of ids or comma separated string of ids, ".concat(_typeof(keys), " given: ").concat(keys));
      }

      var keysArr = Array.isArray(keys) ? keys : keys.split(/\s*,\s*/);
      this._keys = keysArr.map(function (k) {
        var _k$split$map = k.split(/\s+as\s+/).map(function (s) {
          return s.trim();
        }),
            _k$split$map2 = _slicedToArray(_k$split$map, 2),
            src = _k$split$map2[0],
            dest = _k$split$map2[1];

        if (!dest) dest = src;
        return {
          src: src,
          dest: dest
        };
      });
      return this;
    }
    /** Set active key name, dot notation is allowed
     * @param {string} key
     * @returns {ArrayQL} */

  }, {
    key: "where",
    value: function where(key) {
      this._activeKey = key;
      return this;
    }
    /** Set active key name, dot notation is allowed
     * @param {string} key
     * @returns {ArrayQL} */

  }, {
    key: "and",
    value: function and(key) {
      this._activeKey = key;
      this._logic = "and";
      return this;
    }
    /** Set active key name, dot notation is allowed
     * @param {string} key
     * @returns {ArrayQL} */

  }, {
    key: "or",
    value: function or(key) {
      this._activeKey = key;
      this._logic = "or";
      return this;
    }
  }, {
    key: "concat",
    value: function concat(keys) {
      this._activeKey = keys;

      this._trace("ArrayQL.concat(".concat(keys, ")"));

      return this;
    } // CONDITIONS ===

    /**
     * Includes entries where value of active key is NULL
     * @returns {ArrayQL}
     */

  }, {
    key: "isNull",
    value: function isNull() {
      this._filtrate(function (v) {
        return v === null;
      });

      this._trace("ArrayQL.isNull(".concat(val, ")"), this._filtered.length);

      return this;
    }
    /**
     * Includes entries where value of active key is not NULL
     * @returns {ArrayQL}
     */

  }, {
    key: "notNull",
    value: function notNull() {
      this._filtrate(function (v) {
        return v !== null;
      });

      this._trace("ArrayQL.isNull(".concat(val, ")"), this._filtered.length);

      return this;
    }
    /**
     * Includes entries where value of active key
     * is stirictly equal to given value (including type)
     * @param {any} val
     * @returns {ArrayQL}
     */

  }, {
    key: "equalTo",
    value: function equalTo(val) {
      if (val === undefined || val === null) return this;

      this._filtrate(function (v) {
        return v === val;
      });

      this._trace("ArrayQL.equalTo(".concat(val, ")"), this._filtered.length);

      return this;
    }
    /**
     * Alias to equalTo
     * @param {any} val any value will be stringified
     * @returns {ArrayQL}
     */

  }, {
    key: "is",
    value: function is(val) {
      return this.equalTo(val);
    }
    /**
     * Includes entries where active key has value
     * which has partial case-insensitive match with given value
     * @param {any} val any value will be stringified
     * @returns {ArrayQL}
     */

  }, {
    key: "like",
    value: function like(val) {
      if (val === undefined || val === null) return this;
      val = String(val).toLowerCase();

      this._filtrate(function (v) {
        return String(v).toLowerCase().includes(val);
      });

      this._trace("ArrayQL.like(".concat(val, ")"), this._filtered.length);

      return this;
    }
    /**
     * Includes entries where active key has value which is less then given one
     * @param {number} val
     * @throws {Error} condition is only for numbers
     * @returns {ArrayQL}
     */

  }, {
    key: "lessThen",
    value: function lessThen(val) {
      if (val === undefined || val === null) return this;

      this._filtrate(function (v) {
        return Number(v) < val;
      });

      return this;
    }
    /**
     * Includes entries where active key has value is less then or equal to given,
     * @param {number} val
     * @throws {Error} condition is only for numbers
     * @returns {ArrayQL}
     */

  }, {
    key: "lessThenOrEqual",
    value: function lessThenOrEqual(val) {
      if (val === undefined || val === null) return this;

      this._filtrate(function (v) {
        return Number(v) <= val;
      });

      return this;
    }
    /**
     * Includes entries where active key has value is more then given,
     * @param {number} val
     * @throws {Error} condition is only for numbers
     * @returns {ArrayQL}
     */

  }, {
    key: "greaterThen",
    value: function greaterThen(val) {
      if (val === undefined || val === null) return this;

      this._filtrate(function (v) {
        return Number(v) > val;
      });

      return this;
    }
    /**
     * Includes entries where active key has value is more or equal to given,
     * @param {number} val
     * @throws {Error} condition is only for numbers
     * @returns {ArrayQL}
     */

  }, {
    key: "greaterThenOrEqual",
    value: function greaterThenOrEqual(val) {
      if (val === undefined || val === null) return this;

      this._filtrate(function (v) {
        return Number(v) >= val;
      });

      return this;
    }
  }, {
    key: "gt",
    value: function gt(val) {
      return this.greaterThen(val);
    }
  }, {
    key: "lt",
    value: function lt(val) {
      return this.lessThen(val);
    }
  }, {
    key: "gte",
    value: function gte(val) {
      return this.greaterThenOrEqual(val);
    }
  }, {
    key: "lte",
    value: function lte(val) {
      return this.lessThenOrEqual(val);
    }
    /**
     * Includes entries where active key has value between "min" and "max",
     * including "min" and "max"
     * @param {number} min
     * @param {number} max
     * @throws {Error} condition is only for numbers
     * @returns {ArrayQL}
     */

  }, {
    key: "between",
    value: function between(min, max) {
      if (min === undefined || min === null) min = -Infinity;
      if (max === undefined || max === null) max = Infinity;

      this._filtrate(function (v) {
        return Number(v) >= min && Number(v) <= max;
      });

      return this;
    }
    /**
     * Excludes entries where active key has value between "min" and "max",
     * excluding "min" and "max"
     * @param {number} min
     * @param {number} max
     * @throws {Error} condition is only for numbers
     * @returns {ArrayQL}
     */

  }, {
    key: "notBetween",
    value: function notBetween(min, max) {
      if (min === undefined || min === null) min = -Infinity;
      if (max === undefined || max === null) max = Infinity;
      if (typeof min !== "number") throw new Error("\"notBetween\" condition is only for numbers, ".concat(_typeof(min), " ").concat(min, " given"));
      if (typeof max !== "number") throw new Error("\"notBetween\" condition is only for numbers, ".concat(_typeof(max), " ").concat(max, " given"));

      this._filtrate(function (v) {
        return Number(v) < min || Number(v) > max;
      });

      return this;
    }
    /**
     * Leaves in resulting array entries where active key has value from "list"
     * @param {any[]} list
     * @throws {Error} "notIn" condition is only for arrays
     * @returns {ArrayQL}
     */

  }, {
    key: "in",
    value: function _in(list) {
      if (list === undefined) return;
      if (!(list instanceof Array)) throw new Error("\"in\" condition is only for arrays, ".concat(_typeof(list), " given"));

      this._filtrate(function (v) {
        return list.includes(v);
      });

      return this;
    }
    /**
     * Excludes entries where active key has value from "list"
     * @param {any[]} list
     * @throws {Error} "notIn" condition is only for arrays
     * @returns {ArrayQL}
     */

  }, {
    key: "notIn",
    value: function notIn(list) {
      if (list === undefined) return;
      if (!(list instanceof Array)) throw new Error("\"notIn\" condition is only for arrays, ".concat(_typeof(list), " given"));

      this._filtrate(function (v) {
        return !list.includes(v);
      });

      return this;
    }
    /**
     * filtrates src array depending on this._logic and this._activeKey
     * fn() got only arg - is active value from current row
     * must return TRUE if value is corresponds to condition, and FALSE otherwise
     * @param {function} fn  (value: any) => boolean
     */

  }, {
    key: "_filtrate",
    value: function _filtrate(fn) {
      var _this3 = this;

      // logic is "OR"
      if (this._logic === "or") {
        for (var i = 0; i < this._srcArray.length; i++) {
          var row = this._srcArray[i];

          var value = this._extractValue(row); // extract value depending of this._activeKey


          if (!fn.call(null, value)) continue;
          if (this._filtered.includes(row)) continue;

          this._filtered.push(row);
        } // logic is "AND"

      } else {
        this._filtered = this._filtered.filter(function (row) {
          // extract value depending of this._activeKey
          var value = _this3._extractValue(row);

          return fn.call(null, value);
        });
      }

      this._unlimitedCount = this._filtered.length;
      return this;
    }
  }, {
    key: "_trace",
    value: function _trace() {
      if (!this.trace) return;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      console.log.apply(null, args);
    }
    /** apply map to array
     * @param {function} callback
     * @returns {ArrayQL}
     */

  }, {
    key: "map",
    value: function map(callback) {
      this._filtered = this._filtered.map(callback);
      return this;
    }
    /** apply filter to array
     * @param {function} fn
     * @returns {ArrayQL}
     */

  }, {
    key: "filter",
    value: function filter(fn) {
      this._filtered = this._filtered.filter(fn);
      return this;
    }
  }, {
    key: "_extractDotted",
    value: function _extractDotted(row, dottedName) {
      if (!row) return row;
      if (!dottedName.includes(".")) return row[dottedName];
      var chain = dottedName.split(".");
      var res = row;

      for (var i = 0; i < chain.length; i++) {
        if (res === undefined) return;
        var key = chain[i];
        res = res[key];
      }

      return res;
    }
  }, {
    key: "_extractValue",
    value: function _extractValue(row, keys) {
      if (keys === undefined) keys = this._activeKey;
      return this._extractDotted(row, keys);
    }
  }, {
    key: "_clone",
    value: function _clone(data) {
      return JSON.parse(JSON.stringify(data));
    }
    /**
     * Sorts result by specified key
     * @param {String} keyname
     * @param {String} direction "asc" or "desc"
     * @returns {ArrayQL}
     */

  }, {
    key: "sort",
    value: function sort(keyname) {
      var direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "desc";
      if (keyname === undefined || keyname === null) return this;

      var compare = function compare(a, b) {
        var res = a[keyname] > b[keyname] ? 1 : -1;
        return direction === "asc" ? res : res * -1;
      };

      this._filtered.sort(compare);

      return this;
    }
  }, {
    key: "orderBy",
    value: function orderBy(keyname, direction) {
      return this.sort(keyname, direction);
    }
    /**
     * Leaves only "limit" elements from resulting array, 
     * beginning from "offset" element. Necessery for pagination. 
     * Remembers "unlimited" count for getResult() method
     * @param {number} offset
     * @param {number} limit
     * @returns {ArrayQL}
     */

  }, {
    key: "limit",
    value: function limit() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      var _limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 15;

      _limit = Number(_limit);
      offset = Number(offset);
      this._offset = offset;
      this._limit = _limit;
      if (this.limit === 0) throw new Error("Unreasonable value of Limit=0");
      var start = _limit * offset;
      var end = start + _limit;
      this._filtered = this._filtered.slice(start, end);

      this._trace("ArrayQL.limit(".concat(_limit, ", ").concat(offset, ")"), this._filtered.length);

      return this;
    }
    /** Adds a new entry to the array,
     * taking into account the getters and the default entry.
     * If newRow contains "id" and entry with such id already exists,
     * exception will be thrown
     * @param {Object} newRow
     * @throws {Error} Item with given id already exist
     * @returns {Object} inserted entry (with id and getters)
     */

  }, {
    key: "insert",
    value: function insert(newRow) {
      var _this4 = this;

      newRow = Object.assign({}, this.options["default"], newRow); // id given by user

      if (newRow[this.idName] !== undefined && newRow[this.idName] !== null) {
        var existing = this._srcArray.find(function (r) {
          return r[_this4.idName] === newRow[_this4.idName];
        });

        if (existing) throw new Error("Item with id \"".concat(newRow[this.idName], "\" already exist")); // assign id automatically
      } else {
        newRow[this.idName] = this._nextId++; // increment id to make it unique
      }

      this._addGetters(newRow);

      this._srcArray.push(newRow); // add to start of _srcArray


      this._trace("ArrayQL.insert()", this._filtered.length);

      return newRow;
    }
    /** Updates elements by id. Deep merge does not supported
     * @param {Object} newData updating fields with id
     * @returns {Object} updated entry
     */

  }, {
    key: "update",
    value: function update(newData) {
      var _this5 = this;

      if (newData[this.idName] === null || newData[this.idName] === undefined) throw new Error("No id specified for update");

      var existing = this._srcArray.find(function (el) {
        return el[_this5.idName] === newData[_this5.idName];
      });

      if (!existing) throw new Error("No element with id \"".concat(newData[this.idName], "\" found for update"));
      if (this.trace) console.log("ArrayQL.update()", this._filtered.length);
      Object.assign(existing, newData);
      return existing;
    }
    /** deletes elements by id
     * @param {string|number|string[]|number[]} removingIds
     * @returns {object[]} deleted elements
     */

  }, {
    key: "delete",
    value: function _delete(removingIds) {
      var _this6 = this;

      if (removingIds === undefined || removingIds === null) throw new Error("No ids specified to delete");
      if (!(removingIds instanceof Array)) removingIds = [removingIds];
      var deleted = [];
      this._srcArray = this._srcArray.filter(function (el) {
        if (removingIds.includes(el[_this6.idName])) {
          deleted.push(el);
          return false;
        } else {
          return true;
        }
      });

      this._trace("ArrayQL.delete()", this._filtered.length);

      return deleted;
    }
    /** Returns row with given id
     * @param {string|number} id
     * @returns {object}
     */

  }, {
    key: "getById",
    value: function getById(id) {
      var _this7 = this;

      var record = this._srcArray.find(function (r) {
        return r[_this7.idName] === id;
      });

      if (!record) throw new Error("No record with id \"".concat(id, "\" found"));
      return record;
    }
    /** alias for getById
     * @param {number|string} id
     * @returns {object}
     */

  }, {
    key: "get",
    value: function get(id) {
      return this.getById();
    }
    /** resulting array length
     * @returns {Number}
     */

  }, {
    key: "count",
    value: function count() {
      return this._filtered.length;
    }
    /** resulting array length before last limit()
     * @returns {Number}
     */

  }, {
    key: "unlimitedCount",
    value: function unlimitedCount() {
      return this._unlimitedCount;
    }
    /** resulting array
     * @returns {Object[]}
     */

  }, {
    key: "getList",
    value: function getList() {
      var _this8 = this;

      if (!this._keys) return this._filtered;
      return this._filtered.map(function (r) {
        var res = {};

        _this8._keys.forEach(function (k) {
          res[k.dest] = _this8._extractValue(r, k.src);
        });

        return res;
      });
    }
    /**
     * Object with resulting array and data for pagination
     * @returns {Object} {content: array, totalElements: number, totalPages: number, last: boolean, first: boolean}
     */

  }, {
    key: "getResult",
    value: function getResult() {
      var content = this.getList();
      var totalPages = this._limit ? Math.ceil(this._unlimitedCount / this._limit) : null;
      return {
        content: content,
        totalElements: this._unlimitedCount,
        totalPages: totalPages,
        last: this._limit ? this._limit * this._offset >= totalPages : null,
        first: this._limit ? this._offset === 0 : null // sort: null,
        // size: null,
        // number: null,
        // numberOfElements: null

      };
    }
  }]);

  return ArrayQL;
}();

if (typeof module !== "undefined" && module.exports) module.exports = ArrayQL;