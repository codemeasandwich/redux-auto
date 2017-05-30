
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

describe('action middlware', () => {

    beforeEach(function() {
      webpackModules.reset();
    });

    it('should call default if not a promise', (done) => {

        const fakerName = Faker.Name.findName();

        webpackModules.set("posts","index","default",(posts=[])=> posts )

        webpackModules.set("posts","newPosts","default",(posts, payload)=>{

          expect(posts).toEqual([])
          expect(payload.author).toBe(fakerName)

          done();
          return posts;
        })

        webpackModules.set("posts","newPosts","action",(payload)=>({author:payload.name}))
        RefrashStore();

        actions.posts.newPosts({name:fakerName});
    })

    it('should call default with a promise', (done) => {

        const fakerName = Faker.Name.findName();

        webpackModules.set("posts","index","default",(posts=[])=> posts )

        let callOrder = ["PENDING","FULFILLED"]
        webpackModules.set("posts","newPosts","default",(posts, payload, stage, result)=>{

          switch(stage){
            case 'FULFILLED':
              expect(callOrder[0]).toBe(stage);
              expect(result.author).toBe(fakerName);
              done();
              break;
            case 'PENDING':
              expect(callOrder[0]).toBe(stage);
              callOrder.shift();
              break;
          case 'REJECTED':
          default :
              expect(false).toBe(true)
              done();
              break;
          }
          return posts;

        })

        webpackModules.set("posts","newPosts","action",(payload)=> Promise.resolve({author:fakerName}) )

        RefrashStore();
        actions.posts.newPosts();
    })
})

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

    //console.log(store.getState())

    const newPost = store.getState().posts[0];

    expect(newPost.name).toBe(fakerName)

    //console.log(auto);
    //console.log(reducers);
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
