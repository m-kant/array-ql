
const ARR = [
    { firstName: "Clyde",     lastName: "Griffiths",  gender: "male",   age: 24, addr: { city: "Likurg", num: "143" } },
    { firstName: "Sondra",    lastName: "Finchley",   gender: "female", age: 22, addr: { city: "Likurg", num: "534" } },
    { firstName: "Roberta",   lastName: "Olden",      gender: "female", age: 21, addr: { city: "Likurg", num: "153" } },
    { firstName: "Agrafena",  lastName: "Svetlova",   gender: "female", age: 31, addr: { city: "St. Petersburg", num: "536" } },
    { firstName: "Lev",       lastName: "Myshkin",    gender: "male",   age: 32, addr: { city: "St. Petersburg", num: "476" } },
    { firstName: "Anastasia", lastName: "Barashkova", gender: "female", age: 24, addr: { city: "St. Petersburg", num: "247" } },
].map((r, i) => ({id: i+1, ...r}));


if (typeof module !== "undefined" && module.exports) module.exports = ARR;