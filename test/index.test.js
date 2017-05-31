
jest.unmock('../index');
jest.unmock('./webpackModules');
jest.unmock('redux');
jest.unmock('Faker');

import Faker from 'Faker'
import { createStore, applyMiddleware, combineReducers } from 'redux'

import   webpackModules   from './webpackModules';
import actions, { auto, reducers, reset } from '../index';

let middleware,store;

function RefrashStore(){
  // build 'auto' based on target files via Webpack
  middleware = applyMiddleware( auto(webpackModules, webpackModules.keys(),true));
  store = createStore(combineReducers(reducers), middleware );
}

//=====================================================
//========================================== life cycle
//=====================================================

describe('life cycle', () => {

  let propName, actionName;

    beforeEach(function() {
      webpackModules.clear();
      propName   = Faker.Address.city();
      actionName = Faker.Address.streetName();
    });

//+++++++++++++++ should call default if not a promise
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should NOT change payload or state ', () => {

        const fakerName = Faker.Name.findName();

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

        const fakerName = Faker.Name.findName();

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

      propName   = Faker.Address.city();
      actionName = Faker.Address.streetName();
    });

//+++++++++++++++ should call default if not a promise
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should call default if not a promise', (done) => {

        const fakerName = Faker.Name.findName();

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

        const fakerName = Faker.Name.findName();

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

//+ should call fn: pending & fulfilled with a promise
//++++++++++++++++++++++++++++++++++++++++++++++++++++

        it('should call fn: pending & fulfilled with a promise', (done) => {

            const fakerName = Faker.Name.findName();

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
