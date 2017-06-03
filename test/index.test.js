
jest.unmock('../index');
jest.unmock('./webpackModules');
jest.unmock('redux');
jest.unmock('faker');

import faker from 'faker'

import { createStore, applyMiddleware, combineReducers } from 'redux'

import   webpackModules   from './webpackModules';
import actions, { auto, reducers, mergeReducers, reset } from '../index';

let middleware,store;

function RefrashStore(){
  // build 'auto' based on target files via Webpack
  middleware = applyMiddleware( auto(webpackModules, webpackModules.keys(),true));
  store = createStore(combineReducers(reducers), middleware );
}

//=====================================================
//=============================================== Setup
//=====================================================
/*
describe('Setup', () => {

    beforeEach(function() {
      webpackModules.clear();
    });

    it('should throw an Error when no index is found', () => expect( RefrashStore ).toThrow() )
}) */
//=====================================================
//====================================== initialization
//=====================================================

describe('initialization', () => {

  let propName, actionName;

    beforeEach(function() {
      webpackModules.clear();
      propName   = faker.address.city();
      actionName = faker.address.streetName();
    });

//++++++++++++++++++++++++ should merge other reducers
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should merge other reducers', () => {

      webpackModules.set(propName,"index","default",(posts=[]) => posts );
      
      RefrashStore();

      const otherReducers = {foo:()=>{}}
      
      const merged = mergeReducers(otherReducers);
      
      expect("function" === typeof merged.foo).toBe(true);
      expect("function" === typeof merged[propName]).toBe(true);
      
    })

//++++ should skip utility files start with underscore
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should skip utility files start with underscore', () => {

      webpackModules.set(propName,"index","default",(posts=[]) => posts );
      webpackModules.set(propName,actionName,"default",() => expect(false).toBe(true) );
      webpackModules.set(propName,"_utility","default",() => expect(false).toBe(true) );
      RefrashStore();
      
      const availableActions = Object.keys(actions[propName])

      expect(availableActions.length).toBe(1);
      expect(availableActions[0]).toBe(actionName);
      
    })

//++++++++++++++++++ should work with an INIT function
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should work with an INIT function ', (done) => {

      webpackModules.set(propName,"index","default",(posts=[],{type})=> {
        expect(type.startsWith("@@") || type.endsWith("INIT"),type).toBe(true);
        return posts;
      } )

      webpackModules.set(propName,"init","default",(posts, payload, stage, result)=> {

        switch(stage){
          case 'FULFILLED':
              expect(true).toBe(true)
              done();
            break;
          case 'PENDING':
              expect(true).toBe(true)
            break;
          case 'REJECTED':
          default :
              expect(false).toBe(true)
            break;
        }
        return posts;

      } )

      webpackModules.set(propName,"init","action", ()=> Promise.resolve({posts:[1,2,3,4,5]}) )
      RefrashStore();
      // should be automatically called
    })

//+++++++++++++++++ should work with an INIT Excepsion
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should work with an INIT Excepsion ', (done) => {

      webpackModules.set(propName,"index","default",(posts=[],{type})=> {
        expect(type.startsWith("@@") || type.endsWith("INIT"),type).toBe(true);
        return posts;
      } )

      webpackModules.set(propName,"init","default",(posts, payload, stage, result)=> {

        switch(stage){
          case 'REJECTED':
              expect(true).toBe(true)
              done();
            break;
          case 'PENDING':
              expect(true).toBe(true)
            break;
          case 'FULFILLED':
          default :
              expect(false).toBe(true)
            break;
        }
        return posts;

      } )

      webpackModules.set(propName,"init","action", ()=> Promise.reject(new Error("Boom!!")) )
      RefrashStore();
      // should be automatically called
    })

//++++ should call other indexs for each INIT function
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should call other indexs for each INIT function ', (done) => {

      webpackModules.set(propName+"_other","index","default",(other={},{type})=> {

            if(type.startsWith("@@"))
              return other;

            switch(type){
              case actions[propName].init.fulfilled:
                  expect(true).toBe(true)
                  done();
                break;
              case actions[propName].init.pending:
                  expect(true).toBe(true)
                break;
              case actions[propName].init.rejected:
              default :
                  expect(false).toBe(true)
                break;
            }
            return other;
    })

      webpackModules.set(propName,"index","default",(posts=[],{type})=> {

        expect(type.startsWith("@@")).toBe(true);
        return posts;
      } )

      webpackModules.set(propName,"init","default",(posts, payload, stage, result)=> {

        switch(stage){
          case 'FULFILLED':
              expect(true).toBe(true)
              done();
            break;
          case 'PENDING':
              expect(true).toBe(true)
            break;
          case 'REJECTED':
          default :
              expect(false).toBe(true)
            break;
        }
        return posts;

      })

      webpackModules.set(propName,"init","action", ()=> Promise.resolve({posts:[1,2,3,4,5]}) )
      RefrashStore();
      // should be automatically called
    })
})

//=====================================================
//========================================== life cycle
//=====================================================

describe('life cycle', () => {

  let propName, actionName;

    beforeEach(function() {
      webpackModules.clear();
      propName   = faker.address.city();
      actionName = faker.address.streetName();
    });

//+++++++++++++++ should call default if not a promise
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should NOT change payload or state ', () => {

        const fakerName = faker.name.findName();

        webpackModules.set(propName,"index","default",(posts=[],{type})=> {
          expect(type.startsWith("@@") || type.endsWith("INIT"),type).toBe(true);
          return posts;
        } )

        webpackModules.set(propName,"index","before",(appsState, action)=> {
          return action.payload
        } )

        webpackModules.set(propName,"index","after",(newAppsState, action, oldAppsState)=> {
          return newAppsState;
        } )

        webpackModules.set(propName,actionName,"default",(posts, payload)=>{

          expect(posts).toEqual([])
          expect(payload.name).toBe(fakerName)
          return [payload];
        })

        RefrashStore();
        const actionPayload = {name:fakerName};
        actions[propName][actionName](actionPayload);

        const values = store.getState()[propName];
        expect(Array.isArray(values)).toBe(true)
        expect(values.length).toBe(1)
        expect(values[0]).toBe(actionPayload)

    })

    it('should change payload and state ', () => {

        const fakerName = faker.name.findName();

        webpackModules.set(propName,"index","default",(posts=[],{type})=> {
          expect(type.startsWith("@@") || type.endsWith("INIT"),type).toBe(true);
          return posts;
        } )

        webpackModules.set(propName,"index","before",(appsState, action)=> {

          //console.log(">",action.type,"<")
          //console.log(actions[propName][actionName].toString(),action.type == actions[propName][actionName])


          if(action.type == actions[propName][actionName])
              return {name :action.payload.name.toUpperCase()}
          else
              return action.payload
        } )

        webpackModules.set(propName,"index","after",(newAppsState, action, oldAppsState)=> {
          if(action.type == actions[propName][actionName])
              return [newAppsState[0],newAppsState[0]]
          else
            return newAppsState;
        } )

        webpackModules.set(propName,actionName,"default",(posts, payload)=>{

          expect(posts).toEqual([])
          expect(payload.name).toBe(fakerName.toUpperCase())
          return [payload];
        })

        RefrashStore();
        const actionPayload = {name:fakerName};
        actions[propName][actionName](actionPayload);

        const values = store.getState()[propName];
        expect(Array.isArray(values)).toBe(true)
        expect(values.length).toBe(2)
        expect(values[0].name).toBe(fakerName.toUpperCase())
        expect(values[1].name).toBe(fakerName.toUpperCase())

    })
})

//=====================================================
//==================================== action middlware
//=====================================================

describe('action middlware', () => {

    let propName, actionName;

    beforeEach(function() {
      webpackModules.clear();

      propName   = faker.address.city();
      actionName = faker.address.streetName();
    });

//+++++++++++++++ should call default if not a promise
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should call default if not a promise', (done) => {

        const fakerName = faker.name.findName();

        webpackModules.set(propName,"index","default",(posts=[],{type})=> {
          expect(type.startsWith("@@") || type.endsWith("INIT")).toBe(true);
          return posts;
        } )

        webpackModules.set(propName,actionName,"default",(posts, payload)=>{

          expect(posts).toEqual([])
          expect(payload.author).toBe(fakerName)

          done();
          return posts;
        })

        webpackModules.set(propName,actionName,"action",(payload)=>({author:payload.name}))
        RefrashStore();

        actions[propName][actionName]({name:fakerName});
    })

//+++++++++++++++++ should call default with a promise
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should call default with a promise', (done) => {

        const fakerName = faker.name.findName();

        webpackModules.set(propName,"index","default",(posts=[],{type})=> {
          expect(type.startsWith("@@") || type.endsWith("INIT")).toBe(true);
          return posts;
        } )

        let callOrder = ["PENDING","FULFILLED"]
        webpackModules.set(propName,actionName,"default",(posts, payload, stage, result)=>{

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

        webpackModules.set(propName,actionName,"action",(payload)=> Promise.resolve({author:fakerName}) )

        RefrashStore();
        actions[propName][actionName]();
    })

//+++++++++++++++++ should call default with a promise passing part of store
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should call default with a promise passing part of store', (done) => {

        const fakerName = faker.name.findName();

        webpackModules.set(propName,"index","default",(posts=[42],{type})=> {
          expect(type.startsWith("@@") || type.endsWith("INIT")).toBe(true);
          return posts;
        } )

        let callOrder = ["PENDING","FULFILLED"]
        webpackModules.set(propName,actionName,"default",(posts, payload, stage, result)=>{

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

        webpackModules.set(propName,actionName,"action",(payload, posts)=> {
          expect(posts[0]).toBe(42);
          return Promise.resolve({author:fakerName})
        })

        RefrashStore();
        actions[propName][actionName]();
    })

//+ should call fn: pending & fulfilled with a promise
//++++++++++++++++++++++++++++++++++++++++++++++++++++

        it('should call fn: pending & fulfilled with a promise', (done) => {

            const fakerName = faker.name.findName();

            let callOrder = ["PENDING","FULFILLED"];

            webpackModules.set(propName,"index","default",(posts=[],{type})=> {
              expect(type.startsWith("@@") || type.endsWith("INIT")).toBe(true);
              return posts;
            } )
            webpackModules.set(propName,actionName,"default",(posts, payload, stage, result)=>{ expect(false).toBe(true); done();  })
            webpackModules.set(propName,actionName,"REJECTED",(posts, payload, stage, result)=>{ expect(false).toBe(true); done();  })

            webpackModules.set(propName,actionName,"pending",(posts, payload)=>{
              expect(callOrder[0]).toBe("PENDING");
                callOrder.shift();
                return posts;
            })
            webpackModules.set(propName,actionName,"FULFILLED",(posts, payload, result)=>{
              expect(callOrder[0]).toBe("FULFILLED");
              expect(result.author).toBe(fakerName);
              done();
              return posts;
            })

            webpackModules.set(propName,actionName,"action",(payload)=> Promise.resolve({author:fakerName}) )

            RefrashStore();
            actions[propName][actionName]();
        })


//+++++++++ should call REJECTED with a reject promise
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should call REJECTED with a reject promise', (done) => {

        const errorMessage = "an error message";

        webpackModules.set(propName,"index","default",(posts=[],{type})=> {
          expect(type.startsWith("@@") || type.endsWith("INIT")).toBe(true);
          return posts;
        } )

        let callOrder = ["PENDING","REJECTED"]
        webpackModules.set(propName,actionName,"default",(posts, payload, stage, result)=>{

          switch(stage){
            case 'REJECTED':
              expect(callOrder[0]).toBe(stage);
              expect(result instanceof Error).toBe(true);
              expect(result.message).toBe(errorMessage);
              done();
              break;
            case 'PENDING':
              expect(callOrder[0]).toBe(stage);
              callOrder.shift();
              break;
          case 'FULFILLED':
          default :
              expect(false).toBe(true)
              done();
              break;
          }
          return posts;

        })

        webpackModules.set(propName,actionName,"action",(payload)=> Promise.reject(new Error(errorMessage)) )

        RefrashStore();
        actions[propName][actionName]();
    })

//+ should call fn: pending & fulfilled with a promise
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should call fn: pending & rejected with a promise', (done) => {

        const errorMessage = "an error message";
        let callOrder = ["PENDING","REJECTED"];

        webpackModules.set(propName,"index","default",(posts=[],{type})=> {
          expect(type.startsWith("@@") || type.endsWith("INIT")).toBe(true);
          return posts;
        } )
        webpackModules.set(propName,actionName,"default",(posts, payload, stage, result)=>{ expect(false).toBe(true); done();  })
        webpackModules.set(propName,actionName,"FULFILLED",(posts, payload, stage, result)=>{ expect(false).toBe(true); done();  })

        webpackModules.set(propName,actionName,"PENDING",(posts, payload)=>{
          expect(callOrder[0]).toBe("PENDING");
            callOrder.shift();
            return posts;
        })
        webpackModules.set(propName,actionName,"REJECTED",(posts, payload, error)=>{
          expect(callOrder[0]).toBe("REJECTED");
          expect(error instanceof Error).toBe(true);
          expect(error.message).toBe(errorMessage);
          done();
          return posts;
        })

        webpackModules.set(propName,actionName,"action",(payload)=> Promise.reject(new Error(errorMessage)) )

        RefrashStore();
        actions[propName][actionName]();
    })

})


//=====================================================
//==================================== Using the stores
//=====================================================

describe('Using the stores', () => {

  let propName, actionName;

    beforeEach(function() {
      webpackModules.clear();
      propName   = faker.address.city();
      actionName = faker.address.streetName();
    });

//should throw an exception if you dont pass an object
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should throw an exception if you dont pass an object ', () => {

        webpackModules.set(propName,"index","default",(posts=[])=> posts )
        webpackModules.set(propName,actionName,"default",(posts, payload)=> expect(false).toEqual(true) )

        RefrashStore();

        expect(() => {
          actions[propName][actionName](1);
        }).toThrow(new RegExp("^payload must be an object if set:"));

    })

//++++++++ should throw an exception if using a action
//+++++++++++++++++++++++++++++++ with async separator

    it.skip('should throw an exception if using a action with async separator ', () => {

        webpackModules.set(propName,"index","default",(posts=[])=> posts )
        webpackModules.set(propName,actionName+">>y>>","default",(posts, payload)=> expect(false).toEqual(true) )

        RefrashStore();

        expect(() => {
          actions[propName][actionName+">>y>>"]();
        }).toThrow(new RegExp("^bad Action prefix:"));

    })


//+++ should throw an exception if undefined is passed
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should throw an exception if undefined is passed ', () => {

        webpackModules.set(propName,"index","default",(posts=[])=> posts )
        webpackModules.set(propName,actionName,"default",()=> expect(false).toEqual(true) )

        RefrashStore();
        expect(() => {
          actions[propName][actionName](undefined);
        }).toThrow(new RegExp("Undefined was passed as payload. You may have misspelled of the variable"));

    })

//+++++++++++++should throw an exception if not return
//++++++++++++++++++++++++++++++++ from action-creater

    it('should throw an exception if not return from action-creater', () => {

        webpackModules.set(propName,"index","default",(posts=[])=> posts )
        webpackModules.set(propName,actionName,"default",()=> expect(false).toEqual(true) )
        webpackModules.set(propName,actionName,"action",()=> {} )

        RefrashStore();
        expect(() => {
          actions[propName][actionName]();
        }).toThrow(new RegExp("^action with bad payload"));

    })
//++++++++ should throw an exception if undefined from
//+++++++++++++++++++++++++++++++++++++ action-creater

    it('should throw an exception if undefined from action-creater', () => {

        webpackModules.set(propName,"index","default",(posts=[])=> posts )
        webpackModules.set(propName,actionName,"default",()=> expect(false).toEqual(true) )
        webpackModules.set(propName,actionName,"action",()=> undefined )

        RefrashStore();
        expect(() => {
          actions[propName][actionName]();
        }).toThrow(new RegExp("^action with bad payload"));

    })
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
