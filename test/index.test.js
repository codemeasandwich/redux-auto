
jest.unmock('../index');
jest.unmock('./webpackModules');
jest.unmock('redux');
jest.unmock('Faker');

import  Faker from 'Faker'
import { createStore, applyMiddleware, combineReducers } from 'redux'

import   webpackModules   from './webpackModules';
import actions, { auto, reducers } from '../index';

let middleware,store;

function RefrashStore(){
  // build 'auto' based on target files via Webpack
  middleware = applyMiddleware( auto(webpackModules, webpackModules.keys()));
  store = createStore(combineReducers(reducers), middleware );
}

describe('Welcome', () => {

/*
  before(function() {


  });

  after(function() {
    webpackModules.reset();
    // runs after all tests in this block
  });

  beforeEach(function() {
    // runs before each test in this block
  });

  afterEach(function() {
    // runs after each test in this block
  });*/



  it('Should ', () => {

    webpackModules.set("posts","index","default",(posts = [])=>{
      return posts;
    })

    const fakerName = Faker.Name.findName();

    webpackModules.set("posts","create","default",(posts,{name})=>{
      return [...posts,{name}];
    })

    RefrashStore();

    actions.posts.create({name:fakerName});
console.log(store.getState())
    const newPost = store.getState().posts[0];

    expect(newPost.name).toBe(fakerName)

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
