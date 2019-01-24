import React from 'preact'
import { render } from 'preact'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import { auto, reducers } from 'redux-auto';
import { Provider } from 'preact-redux'

import Ui from './ui/index.jsx';

//++++++++++++++++++++++++++++++++++++++++++++ Webpack
//++++++++++++++++++++++++++++++++++++++++ redux logic

const webpackModules = require.context("./store", true, /^(?!.*\.test\.js$).*\.js$/);

                                // build 'auto' based on target files via Webpack
let middleware = applyMiddleware( auto(webpackModules, webpackModules.keys()))

if(window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__)
middleware = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__(middleware);

const store = createStore(combineReducers(reducers), middleware );


// === create the element to attach react
const reactElement = document.createElement('div');
document.body.appendChild(reactElement);

render(
  <Provider store={store}>
    <Ui />
  </Provider>,
  reactElement
)
