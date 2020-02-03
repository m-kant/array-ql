# ArrayQL

Treat array of objects as a table SQL-alike way.
Paginate, select, sort, update, insert, delete. Add calculated and default values. Runs in browser and Node.

```javascript
USERS.select("id, name").where("age").between(20,30).limit(0,15).getResult();
```

Mainly intended for mock servers, test, debugging, prototyping purposes.

## Installation

```bash
npm install array-ql
```

## Usage

```javascript
const ArrayQL = require("array-ql");

const table = new ArrayQL(dataArray, options);

const selected = table.select("id, name").where("age").between(20,30).getList();
```

## Keywords

<table>
    <tr>
        <td>select(keys?: string)</td>
        <td>Resets previous select results, sets necessery keys. keys - is optional argument, comma separated string, including renaming, for example: "id, name as username". If no "keys" is set, then complete entries will be returned</td>
    </tr>
    <tr>
        <td>where(key: string)</td>
        <td>Sets active key, subsequent conditions will be applied to it</td>
    </tr>
    <tr>
        <td>and(key: string)</td>
        <td>Sets active key, and logic to "AND". Subsequent conditions will reduce resulting selection</td>
    </tr>
    <tr>
        <td>or(key: string)</td>
        <td>Sets active key, and logic to "OR". Subsequent conditions will extend resulting selection</td>
    </tr>
    <tr>
        <td>sort(key: string, direction?: "asc"|"desc")</td>
        <td>Sorts resulting selection</td>
    </tr>
    <tr>
        <td>orderBy(key: string, direction?: "asc"|"desc")</td>
        <td>Alias to sort()</td>
    </tr>
</table>

## Conditions

<table>
    <tr>
        <td>equalTo(val: any)</td>
        <td>Includes entries where value of active key is stirictly equal to given value (including type)</td>
    </tr>
    <tr>
        <td>is(val:any)</td>
        <td>Alias to equalTo()</td>
    </tr>
    <tr>
        <td>isNull()</td>
        <td>Includes entries where value of active key is NULL</td>
    </tr>
    <tr>
        <td>notNull()</td>
        <td>Includes entries where value of active key is not NULL</td>
    </tr>
    <tr>
        <td>like(val: string)</td>
        <td>Includes entries where active key has value which has partial case-insensitive match with given value</td>
    </tr>
    <tr>
        <td>lessThen(val: number)</td>
        <td>Includes entries where active key has value which is less then given one</td>
    </tr>
    <tr>
        <td>lt(val: number)</td>
        <td>alias to lessThen()</td>
    </tr>
    <tr>
        <td>lessThenOrEqual(val: number)</td>
        <td>Includes entries where active key has value which is less or equal to given one</td>
    </tr>
    <tr>
        <td>lte(val: number)</td>
        <td>alias to lessThenOrEqual()</td>
    </tr>
    <tr>
        <td>greaterThen(val: number)</td>
        <td>Includes entries where active key has value which is greater then given one</td>
    </tr>
    <tr>
        <td>gt(val: number)</td>
        <td>alias to lessThen()</td>
    </tr>
    <tr>
        <td>greaterThenOrEqual(val:number)</td>
        <td>Includes entries where active key has value which is greater or equal to given one</td>
    </tr>
    <tr>
        <td>gte(val:number)</td>
        <td>alias to greaterThenOrEqual()</td>
    </tr>
    <tr>
        <td>between(min: number, max: number)</td>
        <td>Includes entries where active key has value between "min" and "max", including "min" and "max"</td>
    </tr>
    <tr>
        <td>notBetween(min: number, max: number)</td>
        <td>Excludes entries where active key has value between "min" and "max", excluding "min" and "max"</td>
    </tr>
    <tr>
        <td>in(list: any[])</td>
        <td>Leaves in resulting array entries where active key has value from "list"</td>
    </tr>
    <tr>
        <td>notIn(list: any[])</td>
        <td>Excludes entries where active key has value from "list"</td>
    </tr>
    <tr>
        <td>limit(offset: number, limit: number)</td>
        <td>Leaves only "limit" elements from resulting array, beginning from "offset" element. Necessery for pagination . Remembers "unlimited" count for getResult() method</td>
    </tr>
</table>

## Fetch result

<table>
    <tr>
        <td>getById(id: number|string)</td>
        <td>Returns row with given id</td>
    </tr>
    <tr>
        <td>get(id: number|string)</td>
        <td>Alias to getById()</td>
    </tr>
    <tr>
        <td>getResult()</td>
        <td>Returns object with data necessery for pagination - {content: array, totalElements: number, totalPages: number, last: boolean, first: boolean}</td>
    </tr>
    <tr>
        <td>getList()</td>
        <td>Returns array with selected elements</td>
    </tr>
    <tr>
        <td>count()</td>
        <td>Returns length of resulting array</td>
    </tr>
    <tr>
        <td>unlimitedCount()</td>
        <td>Returns length of resulting array BEFORE last limit() condition. Limit() must be a last condition in selection</td>
    </tr>
</table>

## Data manipulation (CRUD)

<table>
    <tr>
        <td>insert(row: any) => row</td>
        <td>Adds a new entry to the array, taking into account getters and default entry. If new row contains "id" and entry with such id already exists, exception will be thrown. Returns inserted row.</td>
    </tr>
    <tr>
        <td>update(rowData: any) => row</td>
        <td>Updates elements by id. "Id" must be set in rowData. Deep merge does not supported Returns updated row.</td>
    </tr>
    <tr>
        <td>delete(removingIds: number[]|string[]) => row[]</td>
        <td>Deletes elements by id. removedIds - array of ids. Returns array - deleted rows</td>
    </tr>
</table>

## Additional

<table>
    <tr>
        <td>filter( callback(row: any) => boolean )</td>
        <td>Applies standart Array.filter() method to selection and changes it, returns ArrayQL instance (thus, can be used in chaining).</td>
    </tr>
    <tr>
        <td>map( callback(row: any) => any )</td>
        <td>Applies standart Array.map() method to selection and transforms it, returns ArrayQL instance (thus, can be used in chaining).</td>
    </tr>
</table>

## Options

<table>
    <tr>
        <td>idName: string</td>
        <td>Default is "id". Name of identification key</td>
    </tr>
    <tr>
        <td>default: object</td>
        <td>Default row, for example: {name: null, age: "Not set"}</td>
    </tr>
    <tr>
        <td>getters: {[index: string]: getter(row:object)=>any}</td>
        <td>Computed fields. Index (keys) of object - keynames of resulting row, "getter" is a function with only argument - row data, must return calculated value.</td>
    </tr>
</table>


## Examples

```javascript
const ArrayQL = require("array-ql");

// regular array of objects with same structure
const arr = [
  { id: 1, firstName: "Clyde",  lastName: "Griffiths", gender: "male",   age: 24 },
  { id: 5, firstName: "Sondra", lastName: "Finchley",  gender: "female", age: 22 }
]

const options = {
  idName: "id",
  // default field values
  default: { firstName: "Unknown", lastName: "", gender: null, age: null },
  getters: {
    // getter for field "name"
    name(row){ return `${row.firstName} ${row.lastName}`; }
  }
}

const users = new ArrayQL(arr, options);

users.select("id, name").where("gender").is("male").getList(); // [{id: 1, name: "Clyde Griffiths"}]

users.insert({firstName: "Agrafena"}); // {id: 6, firstName: "Agrafena",  lastName: "", name: "Agrafena ", gender: null, age: null}

users.update({lastName: "Svetlova"}); // Error: "No id specified for update"

users.update({id: 6, lastName: "Svetlova", gender: "female", age: 31}); // {id: 6, firstName: "Agrafena",  lastName: "Svetlova", name: "Agrafena Svetlova", gender: female, age: 31}

users.select("name as username").where("age").gt(30).getList(); // [{username: "Agrafena Svetlova"}]

users.select("id, name").limit(0, 2).getResult(); // {content: [{id: 1, name: "Clyde Griffiths"}, {id: 5, name "Sondra Finchley"}], totalElements: 3, totalPages: 2, last: false, first: true}
```
