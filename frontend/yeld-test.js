function* test() {
    yield "react";
    console.log("teste")
    yield "saga";
}

const iterator = test();

console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());