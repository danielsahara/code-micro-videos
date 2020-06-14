const {createStore, applyMiddleware} = require('redux');
const {default: createSagaMiddleware} = require('redux-saga');
const {take, put, call, actionChannel, debounce, select} = require('redux-saga/effects');
const axios = require('axios');

function reducer(state= {value: 1}, action) {
    if (action.type === 'acaoY'){
        return {...state, text: action.value}
    }
    if (action.type === 'acaoX') {
        return {value: action.value};
    }
    return state;
}

function* searchData(action) {
    // console.log("hellow");
    // const channel = yield actionChannel('acaoY');
    // console.log(channel);
    // while (true) {
        console.log(yield select((state) => state.text));
        console.log("antes da acao y");
        // const action = yield take(channel);
        const search = action.value;
        try {
            const {data} = yield call(() => axios.get('http://nginx/api/videos?search=' + search));
            console.log(search)

            yield put({
                type: 'acaoX',
                value: data
            });
        }
        catch (e) {
            yield put({
                type: 'acaoX',
                error: e
            });
        }
    // }
    // console.log(result);
}

function* debounceSearch() {
    yield debounce(1000, 'acaoY', searchData);
}

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
    reducer,
    applyMiddleware(sagaMiddleware)
);

sagaMiddleware.run(debounceSearch);

const action = (type, value) => store.dispatch({type, value});

action('acaoY', 'l');
action('acaoY', 'lu');
action('acaoY', 'lui');
action('acaoY', 'luiz');

console.log(store.getState())