/**
 * @constructor
 * @param {Array|string} rowsOrPath array of records of path to json array
 * @param {Object} options
 * @returns {ArrayQL}
 */
declare class ArrayQL {
    constructor(rowsOrPath: any[] | string, options: any);
    /** Resets previous select results
     * @returns {ArrayQL}
     */
    resetResult(): ArrayQL;
    /** Adds getters to all entries in array
     */
    _mapGetters(): void;
    /** Adds getters to one entry
     * @param {object} row
     *
     */
    _addGetters(row: any): void;
    /** Adds defaults to all entries in array
     */
    _mapDefaults(): void;
    /** Adds defaults to one entry
     * @param {object} record
     *
     */
    _addDefaults(record: any): void;
    /** Resets previous select results
     * @param {string[]|string} keys comma separated string of array of keynames
     * @returns {ArrayQL}
     */
    select(keys: string[] | string): ArrayQL;
    /** Set active key name, dot notation is allowed
     * @param {string} key
     * @returns {ArrayQL}
     */
    where(key: string): ArrayQL;
    /** Set active key name, dot notation is allowed
     * @param {string} key
     * @returns {ArrayQL}
     */
    and(key: string): ArrayQL;
    /** Set active key name, dot notation is allowed
     * @param {string} key
     * @returns {ArrayQL}
     */
    or(key: string): ArrayQL;
    /**
     * Includes entries where value of active key is NULL
     * @returns {ArrayQL}
     */
    isNull(): ArrayQL;
    /**
     * Includes entries where value of active key is not NULL
     * @returns {ArrayQL}
     */
    notNull(): ArrayQL;
    /**
     * Includes entries where value of active key
     * is stirictly equal to given value (including type)
     * @param {any} val
     * @returns {ArrayQL}
     */
    equalTo(val: any): ArrayQL;
    /**
     * Alias to equalTo
     * @param {any} val any value will be stringified
     * @returns {ArrayQL}
     */
    is(val: any): ArrayQL;
    /**
     * Includes entries where active key has value
     * which has partial case-insensitive match with given value
     * @param {any} val any value will be stringified
     * @returns {ArrayQL}
     */
    like(val: any): ArrayQL;
    /**
     * Includes entries where active key has value which is less then given one
     * @param {number} val
     * @throws {Error} condition is only for numbers
     * @returns {ArrayQL}
     */
    lessThen(val: number): ArrayQL;
    /**
     * Includes entries where active key has value is less then or equal to given,
     * @param {number} val
     * @throws {Error} condition is only for numbers
     * @returns {ArrayQL}
     */
    lessThenOrEqual(val: number): ArrayQL;
    /**
     * Includes entries where active key has value is more then given,
     * @param {number} val
     * @throws {Error} condition is only for numbers
     * @returns {ArrayQL}
     */
    greaterThen(val: number): ArrayQL;
    /**
     * Includes entries where active key has value is more or equal to given,
     * @param {number} val
     * @throws {Error} condition is only for numbers
     * @returns {ArrayQL}
     */
    greaterThenOrEqual(val: number): ArrayQL;
    /**
     * Includes entries where active key has value between "min" and "max",
     * including "min" and "max"
     * @param {number} min
     * @param {number} max
     * @throws {Error} condition is only for numbers
     * @returns {ArrayQL}
     */
    between(min: number, max: number): ArrayQL;
    /**
     * Excludes entries where active key has value between "min" and "max",
     * excluding "min" and "max"
     * @param {number} min
     * @param {number} max
     * @throws {Error} condition is only for numbers
     * @returns {ArrayQL}
     */
    notBetween(min: number, max: number): ArrayQL;
    /**
     * Leaves in resulting array entries where active key has value from "list"
     * @param {any[]} list
     * @throws {Error} "notIn" condition is only for arrays
     * @returns {ArrayQL}
     */
    in(list: any[]): ArrayQL;
    /**
     * Excludes entries where active key has value from "list"
     * @param {any[]} list
     * @throws {Error} "notIn" condition is only for arrays
     * @returns {ArrayQL}
     */
    notIn(list: any[]): ArrayQL;
    /**
     * filtrates src array depending on this._logic and this._activeKey
     * fn() got only arg - is active value from current row
     * must return TRUE if value is corresponds to condition, and FALSE otherwise
     * @param {function} fn  (value: any) => boolean
     */
    _filtrate(fn: (...params: any[]) => any): void;
    /** apply map to array
     * @param {function} callback
     * @returns {ArrayQL}
     */
    map(callback: (...params: any[]) => any): ArrayQL;
    /** apply filter to array
     * @param {function} fn
     * @returns {ArrayQL}
     */
    filter(fn: (...params: any[]) => any): ArrayQL;
    /**
     * Sorts result by specified key
     * @param {String} keyname
     * @param {String} direction "asc" or "desc"
     * @returns {ArrayQL}
     */
    sort(keyname: string, direction?: string): ArrayQL;
    /**
     * Leaves only "limit" elements from resulting array,
     * beginning from "offset" element. Necessery for pagination.
     * Remembers "unlimited" count for getResult() method
     * @param {number} offset
     * @param {number} limit
     * @returns {ArrayQL}
     */
    limit(offset: number, limit?: number): ArrayQL;
    /** Adds a new entry to the array,
     * taking into account the getters and the default entry.
     * If newRow contains "id" and entry with such id already exists,
     * exception will be thrown
     * @param {Object} newRow
     * @throws {Error} Item with given id already exist
     * @returns {Object} inserted entry (with id and getters)
     */
    insert(newRow: any): any;
    /** Updates elements by id. Deep merge does not supported
     * @param {Object} newData updating fields with id
     * @returns {Object} updated entry
     */
    update(newData: any): any;
    /** deletes elements by id
     * @param {string|number|string[]|number[]} removingIds
     * @returns {object[]} deleted elements
     */
    delete(removingIds: string | number | string[] | number[]): object[];
    /** Returns row with given id
     * @param {string|number} id
     * @returns {object}
     */
    getById(id: string | number): any;
    /** alias for getById
     * @param {number|string} id
     * @returns {object}
     */
    get(id: number | string): any;
    /** resulting array length
     * @returns {Number}
     */
    count(): number;
    /** resulting array length before last limit()
     * @returns {Number}
     */
    unlimitedCount(): number;
    /** resulting array
     * @returns {Object[]}
     */
    getList(): object[];
    /**
     * Object with resulting array and data for pagination
     * @returns {Object} {content: array, totalElements: number, totalPages: number, last: boolean, first: boolean}
     */
    getResult(): any;
}

