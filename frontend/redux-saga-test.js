const {createStore, applyMiddleware} = require('redux');
const {default: createSagaMiddleware} = require('redux-saga');
const {take, put} = require('redux-saga/effects');

function reducer(state, action) {
    if (action.type === 'acaoX') {
        return {value: action.value};
    }
    return state;
}

function* helloWorldSaga() {
    console.log("hellow");

    const action = yield take('acaoY');

    //logica ---------------

    const result = yield put({
        type: 'acaoX',
        value: 'novo valor',

    });
    // console.log(result);
}

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
    reducer,
    applyMiddleware(sagaMiddleware)
);

sagaMiddleware.run(helloWorldSaga);

const action = (type, value) => store.dispatch({type, value});

action('acaoY', 'a');

console.log(store.getState())