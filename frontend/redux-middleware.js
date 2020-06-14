const {createStore, applyMiddleware} = require('redux');

function reducer(state, action) {
    console.log('reducer')
    return {value: action.value};
}

const customMiddleware = store => next => action => {
  console.log("Hello world");
  next(action);
  console.log("teste");
};

const store = createStore(
    reducer,
    applyMiddleware(customMiddleware)
);

const action = (type, value) => store.dispatch({type, value});

action('acaoX', 'a')

console.log(store.getState())