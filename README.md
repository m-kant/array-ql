# ArrayQL

Manipulate with array of objects SQL-alike way.
Paginate, filtrate, sort, update, insert, delete.

```javascript
// For example:
USERS.select("name as username, gender").where("gender").is("female").sortBy("name").limit(0,15).getResult();
```

Mainly intended for mock servers, test, debugging, prototyping purposes
