const {createStore, applyMiddleware} = require('redux');
const {default: createSagaMiddleware} = require('redux-saga');
const {take, put, call, actionChannel, debounce, select, all, fork} = require('redux-saga/effects');
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

function* sagaNonBlocking() {
    console.log("Antes do call")
    const {data} = yield call(
        axios.get, 'http://nginx/api/videos'
    );
    console.log("depois do call")
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
            yield fork(sagaNonBlocking);
            console.log("depois do fork");
            // const [response1, response2] = yield all([
            //     call(
            //         axios.get, 'http://nginx/api/videos?search=' + search
            //     ),
            //     call(
            //         axios.get, 'http://nginx/api/videos?search=' + search
            //     )
            // ]);

            // console.log(JSON.stringify(response1.data.data.length), JSON.stringify(response2.data.data.length));

            console.log(search)

            yield put({
                type: 'acaoX',
                value: ''
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

function* helloworld() {
    console.log('Hello world');
}

function* debounceSearch() {
    yield debounce(1000, 'acaoY', searchData);
}

function* rootSaga() {
    yield all([
        helloworld(),
        debounceSearch()
    ])
    yield fork(helloworld)
    yield fork(debounceSearch)

    console.log('final');

}

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
    reducer,
    applyMiddleware(sagaMiddleware)
);

sagaMiddleware.run(rootSaga);

const action = (type, value) => store.dispatch({type, value});

action('acaoY', 'l');
action('acaoY', 'lu');
action('acaoY', 'lui');
action('acaoY', 'luiz');

console.log(store.getState())