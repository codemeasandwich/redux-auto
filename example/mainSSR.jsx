import React, { h, Component } from 'preact';
import render from "preact-render-to-string/jsx"

import { createStore, applyMiddleware, combineReducers } from 'redux'
import { auto, reducers } from 'redux-auto';
import { Provider } from 'preact-redux'

import Ui from './ui/index.jsx';

import fsModules from 'redux-auto/test/fsModules'
import path from 'path';
import fs from 'fs';

const storePath = path.join(path.dirname(fs.realpathSync(__filename)), 'store');
const webpackModules = fsModules(storePath)
const middleware = applyMiddleware( auto(webpackModules, webpackModules.keys()))
const store = createStore(combineReducers(reducers), middleware );

export default render(
  <Provider store={store}>
    <Ui />
  </Provider>,
  {}, { pretty: true }
)
