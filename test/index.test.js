
jest.unmock('../index');
jest.unmock('./webpackModules');
jest.unmock('redux');

import { createStore, applyMiddleware, combineReducers } from 'redux'

import   webpackModules   from './webpackModules';
import { auto, reducers } from '../index';



                                // build 'auto' based on target files via Webpack
const middleware = applyMiddleware( auto(webpackModules, webpackModules.keys()))
console.log(" >reducers> ",reducers)

const store = createStore(combineReducers(reducers), middleware );

describe('Welcome', () => {
  it('Should ', () => {
    console.log(auto);
    console.log(reducers);
    expect(true).toBeTruthy();
  });
})

// redux-middlware
//    - pass default
// store
//   - .test.js
//   ./ _ ...js
// index
//   - no default export
// action-middle
//    - null
//    - string
//    - undefined
//    - object
//    - promuse
//        - pending
//        - filfed
//        - catch
// init
// before
//   - undefined
//   - payload
// after
//   - undefined
//   - state
// actions(file)
//   - no default export
// + same name across actions

// actions(function)
// - strings
// - sub-types via promuses
