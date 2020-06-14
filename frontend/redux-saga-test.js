const {createStore, applyMiddleware} = require('redux');
const {default: createSagaMiddleware} = require('redux-saga');
const {take, put, call} = require('redux-saga/effects');
const axios = require('axios');

function reducer(state, action) {
    if (action.type === 'acaoX') {
        return {value: action.value};
    }
    return state;
}

function* helloWorldSaga() {
    console.log("hellow");

    while (true) {
        console.log("antes da acao y");
        const action = yield take('acaoY');
        const search = action.value;
        const {data} = yield call(() => axios.get('http://nginx/api/videos?search=' + search));
        console.log(data);
        const value = 'novo valor' + Math.random();
        console.log(value);
        yield put({
            type: 'acaoX',
            value: data
        });
    }
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
action('acaoY', 'a');
action('acaoW', 'a');

console.log(store.getState())