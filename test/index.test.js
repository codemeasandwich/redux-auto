//console.warn = jest.genMockFunction();

jest.unmock('../index');
jest.unmock('./webpackModules');
jest.unmock('redux');
jest.unmock('faker');

import faker from 'faker'

import { createStore, applyMiddleware, combineReducers } from 'redux'

import   webpackModules   from './webpackModules';
import actions, { auto, reducers, mergeReducers, reset, after } from '../index';

let middleware,store;

function RefrashStore(reset = true){
  // build 'auto' based on target files via Webpack

  reset && auto.reset();
  middleware = applyMiddleware( auto(webpackModules, webpackModules.keys()));
  store = createStore(combineReducers(reducers), middleware );
}

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

//+ should throw when using mergeReducers before "auto"
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should throw when using mergeReducers before "auto"', () => {

      expect(() => {
        mergeReducers({foo:"bar"});
      }).toThrow(new RegExp("You are trying to get reducers before calling 'auto'. Trying moving applyMiddleware BEFORE combineReducers"));
    })

//+ should throw when using reducers before "auto"
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should throw when using reducers before "auto"', () => {

      expect(() => {
        Object.keys(reducers).forEach(propName=>reducers[propName]());
      }).toThrow(new RegExp("You are trying to get reducers before calling 'auto'. Trying moving applyMiddleware BEFORE combineReducers"));
    })

//+++++++++++ should have place holder action function
//++++++++++++++++++ for reducers to ref at build time

    it('should have a testing function', () => {

      webpackModules.set(propName,"index","default",(posts=[]) => posts );
      webpackModules.set(propName,actionName,"default",data => data );
      auto.reset();
      auto.testing({preOnly:true});
      auto(webpackModules, webpackModules.keys())
    })

//+++++++++++ should have place holder action function
//++++++++++++++++++ for reducers to ref at build time

    it('should have a settings function', () => {
        auto.settings({foo:"bar"})
    })

//+++++++++++ should have place holder action function
//++++++++++++++++++ for reducers to ref at build time

    it.skip('should have place holder action function for reducers to ref at build time', (done) => {

        webpackModules.set(propName,"index","default",(data=[]) => data );
        webpackModules.set(propName,actionName,"default",data => data );

        auto.testing({preOnly:true})
        auto(webpackModules, webpackModules.keys(),true)

        const pointerToAction = actions[propName][actionName];
                                actions[propName][actionName] = ()=>done();
              pointerToAction();
    })


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

    //should throw when otherReducers used combineReducers
    //++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should throw when otherReducers used combineReducers', () => {

      expect(() => {
        mergeReducers(()=>{})
      }).toThrow(new RegExp("^You need to pass an object of reducers to 'mergeReducers'"));
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

      webpackModules.set(propName,"init","action", function(payload,state){
        expect(Array.isArray(state)).toBe(true)
        return Promise.resolve({posts:[1,2,3,4,5]})
    } )
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

    it('should throw when before returns NOT an object', () => {

        webpackModules.set(propName,"index","default",(posts=[])=> posts )
        webpackModules.set(propName,"index","before",()=> { return 123 } )
        webpackModules.set(propName,actionName,"default", posts => posts);

        RefrashStore();
        expect(() => actions[propName][actionName]()).toThrowError(new RegExp(`${propName}-before returned a "number" should be a payload object`));
    })

    it('should throw when before returns undefined', () => {

        webpackModules.set(propName,"index","default",(posts=[])=> posts )
        webpackModules.set(propName,"index","before",()=> { } )
        webpackModules.set(propName,actionName,"default", posts => posts);

        RefrashStore();
        expect(() => actions[propName][actionName]()).toThrowError(new RegExp(`${propName}-before returned a "undefined" should be a payload object`));
    })

    it('should set async after lifecycle', (done) => {

        webpackModules.set(propName,"index","default",(posts=[])=> posts )

        webpackModules.set(propName,"index","after",(newAppsState, action, oldAppsState)=> {
            return JSON.parse(JSON.stringify(newAppsState)); // return a new object
        } )

        webpackModules.set(propName,actionName,"default",(posts, payload, stage, result)=>  posts )
        webpackModules.set(propName,actionName,"action", ()=> Promise.resolve({ ok:true }) )

        let unsubscribe;
        const values = [false,true];

        const testFn = function() {

          const posts = store.getState()[propName];

          expect(values.pop()).toBe(posts.async[actionName]);

          if (values.length === 0) {
            expect(Array.isArray(posts)).toBe(true);
            expect(typeof posts.map).toBe("function");
            expect(typeof posts.async).toBe("object");
            expect(typeof [].async).toBe("undefined");
            unsubscribe();
            done();
          }
        }
        RefrashStore();
        unsubscribe = store.subscribe(testFn); // fires after a "dispatch"
        actions[propName][actionName]();
    })


    it('should not set async with non-object', (done) => {

        webpackModules.set(propName,"index","default",(txt="")=> txt )

        webpackModules.set(propName,"index","after",(newAppsState, action, oldAppsState)=> {
            return JSON.parse(JSON.stringify(newAppsState)); // return a new object
        } )

        webpackModules.set(propName,actionName,"default",(txt, payload, stage, result)=>  txt )
        webpackModules.set(propName,actionName,"action", ()=> Promise.resolve({ ok:true }) )

        let unsubscribe;
        const values = [undefined,undefined];

        const testFn = function() {

          const txt = store.getState()[propName];

          expect(txt.async).toBe(values.pop());

          if (values.length === 0) {
            expect(typeof txt).toBe("string");
            unsubscribe();
            done();
          }
        }
        RefrashStore();
        unsubscribe = store.subscribe(testFn); // fires after a "dispatch"
        actions[propName][actionName]();
    })

    it('should set async on error with a clear function', (done) => {

        webpackModules.set(propName,"index","default",(user={})=> user )

        webpackModules.set(propName,actionName,"default",(user, payload, stage, result)=> { return user;} )

        const error = new Error("Boom with the async");

        webpackModules.set(propName,actionName,"action", ()=> Promise.reject(error) )

        let unsubscribe;
        const values = [undefined,error,true];

        const testFn = function() {

          const user = store.getState()[propName];

          expect(values.pop()).toBe(user.async[actionName]);

          if (values.length === 0) {
            unsubscribe();
            done();
          } else if (values.length === 1) {
            expect(typeof user).toBe("object");
            expect(typeof user.async).toBe("object");
            expect(({}).async).toBeUndefined();
            expect(user.async[actionName]).toBe(error);
            expect(typeof user.async[actionName].clear).toBe("function");
        //    console.log(user.async[actionName].clear.toString())
            user.async[actionName].clear();
          } else {
            expect(user.async[actionName].clear).toBeUndefined()
          }
        }
        RefrashStore();
        unsubscribe = store.subscribe(testFn); // fires after a "dispatch"
        actions[propName][actionName]();
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

    it('should be able to cancel an action by returning undefined from the action', () => {

      webpackModules.set(propName,"index","default",(posts={},action)=> posts )
      webpackModules.set(propName,actionName,"default",(posts, payload, stage, result)=>{
        expect(false).toEqual(true)
      })

      webpackModules.set(propName,actionName,"action",(payload)=> {} )

      RefrashStore();
      actions[propName][actionName]();
    })

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
        // TEST when NO default is set
        //webpackModules.set(propName,actionName,"default",(posts, payload, stage, result)=>{ expect(false).toBe(true); done();  })
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

//+++++++++++++++++++++++ should only pass the payload
//+++++++++++++++++++++++ if function have 1 aurgument

    it('should only pass the payload', () => {

        webpackModules.set(propName,"index","default",(posts=[])=> posts )
        webpackModules.set(propName,actionName,"default", posts => posts);

        webpackModules.set(propName,actionName,"action",function(payload) {
          expect(arguments.length).toEqual(1);
          return payload
        } )

        RefrashStore();
        actions[propName][actionName]();
    })

//+++++ should only pass the payload and current state
//+++++++++++++++++++++++ if function have 2 aurgument
// Similar to : should call default with a promise passing part of store
    it('should pass the payload and current state', () => {

          const defaultPosts = [1,2,3]

          webpackModules.set(propName,"index","default",(posts=defaultPosts)=> posts )
          webpackModules.set(propName,actionName,"default", posts => posts);

          webpackModules.set(propName,actionName,"action",function(payload,posts) {
            expect(arguments.length).toEqual(2);
            expect(posts).toBeInstanceOf(Array);
            expect(posts).toEqual(defaultPosts);
            return payload
          } )

          RefrashStore();
          actions[propName][actionName]();
    })

describe('handling the result of fetch', () => {

      it('should handle a good request', (done) => {

          webpackModules.set(propName,"index","default",(data={})=> data )
          webpackModules.set(propName,actionName,"default", data => data )

          const serverData = {name:faker.name.firstName()}

          webpackModules.set(propName,actionName,"FULFILLED", (data,payload,reqPayload) => {

            reqPayload.json().then(reqJson => {
              expect(serverData).toEqual(reqJson);
              done();
            });
            return data;
          })

          webpackModules.set(propName,actionName,"action",()=> Promise.resolve({json:()=>Promise.resolve(serverData)}) )

          RefrashStore();
          actions[propName][actionName]();

      })

      it('should handle a bad request', (done) => {

          webpackModules.set(propName,"index","default",(data={})=> data )
          webpackModules.set(propName,actionName,"default", data => data )

          webpackModules.set(propName,actionName,"rejected",(data,payload,err) => {
            expect("Network response was not ok.").toEqual(err.message);
            done();
            return data
          })

          webpackModules.set(propName,actionName,"action",()=> Promise.reject(new Error("Network response was not ok.")) )

          RefrashStore();
          actions[propName][actionName]();

      })
})

describe('handling the result of GraphQl VIA "smartAction"', () => {

      beforeAll(() => {
        auto.settings({smartActions:true})
      });

      it('should handle a good GraphQl request', (done) => {

            webpackModules.set(propName,"index","default",(data={})=> data )
            webpackModules.set(propName,actionName,"default", data => data )

            const serverData = {name:faker.name.firstName()}

            const fulfilledFunction = (data,payload,reqPayload) => {
              expect(serverData).toEqual(reqPayload);
              return data;
            };
            fulfilledFunction.chain = done;

            webpackModules.set(propName,actionName,"fulfilled",fulfilledFunction)

            webpackModules.set(propName,actionName,"action",()=> Promise.resolve({json:()=>Promise.resolve({data:serverData})}) )

            RefrashStore(false);
            actions[propName][actionName]();

      })

      it('should handle a good fetch request with GraphQl enabled', (done) => {

          webpackModules.set(propName,"index","default",(data={})=> data )
          webpackModules.set(propName,actionName,"default", data => data )

          const serverData = {name:faker.name.firstName()}

          webpackModules.set(propName,actionName,"FULFILLED", (data,payload,reqPayload) => {
              expect(serverData).toEqual(reqPayload);
              done();
            return data;
          })

          webpackModules.set(propName,actionName,"action",()=> Promise.resolve({ok:true, json:()=>Promise.resolve(serverData)}) )

          RefrashStore(false);
          actions[propName][actionName]();

      })

      it('should handle a good Blob request', (done) => {

          webpackModules.set(propName,"index","default",(data={})=> data )
          webpackModules.set(propName,actionName,"default", data => data )

          const serverData = {name:faker.name.firstName()}

          webpackModules.set(propName,actionName,"FULFILLED", (data,payload,reqPayload) => {
            done();
            return data;
          })

          webpackModules.set(propName,actionName,"action",()=> Promise.resolve({
            ok:true,
            //json:()=>Promise.reject(new SyntaxError("Unexpected token ? in JSON at position ###"))
            json:()=>{throw new SyntaxError("Unexpected token ? in JSON at position ###")}
          }) )

          RefrashStore(false);
          actions[propName][actionName]();

      })

      it('should handle a "Failed to fetch"', (done) => {

          webpackModules.set(propName,"index","default",(data={})=> data )
          webpackModules.set(propName,actionName,"default", data => data )

          webpackModules.set(propName,actionName,"rejected",(data,payload,err) => {
            expect("Network response was not ok.").toEqual(err.message);
            done();
            return data
          })

          webpackModules.set(propName,actionName,"action",()=> Promise.reject(new Error("Network response was not ok.")) )

          RefrashStore(false);
          actions[propName][actionName]();

      })

      it('should handle a rejection', (done) => {

          webpackModules.set(propName,"index","default",(data={})=> data )
          webpackModules.set(propName,actionName,"default", data => data )


          const serverResponce = {  bodyUsed:false,
                                    headers:{},
                                    ok:false,
                                    redirected:false,
                                    status:404,
                                    statusText:"",
                                    type:"basic",
                                    url:"https://some.domain.com/kjhgfd" }

          webpackModules.set(propName,actionName,"rejected",(data,payload,err) => {
            expect(serverResponce).toEqual(err);
            done();
            return data
          })

          webpackModules.set(propName,actionName,"action",()=> Promise.resolve(serverResponce) )

          RefrashStore(false);
          actions[propName][actionName]();

      })

      it('should handle a bad GraphQl request', (done) => {

            webpackModules.set(propName,"index","default",(data={})=> data );

            const fulfilledCallback = jest.fn();
            const errorMessage = "error1"
            webpackModules.set(propName,actionName,"pending",data=>data)
            webpackModules.set(propName,actionName,"fulfilled",fulfilledCallback)
            webpackModules.set(propName,actionName,"rejected", (data,payload,err) =>{
              expect(fulfilledCallback).toHaveBeenCalledTimes(0);
              expect(err.message).toEqual(errorMessage);
              done();
              return data
            })

            webpackModules.set(propName,actionName,"action",()=> Promise.resolve({
              ok:false,
              json:()=>Promise.resolve({data:{user:null},errors:[{message:errorMessage}]})
            }) )

            RefrashStore(false);
            actions[propName][actionName]();

      })

      it('should handle muilt bad GraphQl requests', (done) => {

            let errors = [{message:"error1"},{message:"error2"}], callCount = 0;

            webpackModules.set(propName,"index","default",(data={})=> data )
            webpackModules.set(propName,actionName,"default", data => data )

            const rejectedFunction = (data,payload,error) => {

              expect(errors[callCount].message).toEqual(error.message);
              callCount++

              if(errors.length === callCount) done();

              return data
            };
                //  rejectedFunction.chain = done;
            webpackModules.set(propName,actionName,"rejected",rejectedFunction)

            webpackModules.set(propName,actionName,"action",()=> Promise.resolve({ok:false,json:()=>Promise.resolve({errors})}) )

            RefrashStore(false);
            actions[propName][actionName]();

      })

      it('should handle a blank reply', (done) => {

            webpackModules.set(propName,"index","default",(data={})=> data )
            webpackModules.set(propName,actionName,"default", data => data )

            webpackModules.set(propName,actionName,"fulfilled",data => {done();return data;})

            webpackModules.set(propName,actionName,"action",()=> Promise.resolve({}) )

            RefrashStore(false);
            actions[propName][actionName]();

      })

})

describe('chaining action together', () => {
//++++++++++ should chain actions for default function
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should chain actions for default function', (done) => {

        webpackModules.set(propName,"index","default",(data={})=> data )

        const actionFunction = data => data;
              actionFunction.chain = done;

        webpackModules.set(propName,actionName,"default",actionFunction)
        RefrashStore();
        actions[propName][actionName]();

    })

 // expect(action).toHaveProperty('type', actions[propName][actionName].toString());

//+++++ should pass calling values to chain with async
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should pass calling values to chain with async', (done) => {

      const defaultData = {}

        webpackModules.set(propName,"index","default",(data=defaultData)=> data )
        webpackModules.set(propName,actionName,"default",(data)=>data)

        const actionFunction = function (data, payload, error){ return data }
              actionFunction.chain = (data, payload, error)=>{
                expect(data).toEqual(defaultData);
                expect(Object.keys(payload).length).toEqual(0);
                expect(error).toBeInstanceOf(Error);
                done()
              };

        webpackModules.set(propName,actionName,"REJECTED",actionFunction)

        webpackModules.set(propName,actionName,"action",()=> Promise.reject(new Error("testing: calling values to chain with async")) )

        RefrashStore();
        actions[propName][actionName]();

    })

//++ should allow calling values to be paseed to chain
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should allow calling values to be paseed to chain', (done) => {

        const defaultData = {};

        webpackModules.set(propName,"index","default",(data=defaultData)=> data )

        const actionFunction = data => data;
              actionFunction.chain = (data,payload)=>{
                expect(Object.keys(payload).length).toEqual(0);
                expect(data).toEqual(defaultData);
                done()
              };

        webpackModules.set(propName,actionName,"default",actionFunction)
        RefrashStore();
        actions[propName][actionName]();
    })


//++++++++++ should chain actions for PENDING function
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should chain actions for PENDING function', (done) => {

        const actionFunction = function (data, payload){ return data }
              actionFunction.chain =  function(data, payload){
                expect(arguments.length).toEqual(3);
                done();
          };

        webpackModules.set(propName,"index","default",(data={})=> data )
        webpackModules.set(propName,actionName,"default",(data)=>data)

        webpackModules.set(propName,actionName,"pending",actionFunction)

        webpackModules.set(propName,actionName,"action",()=> Promise.resolve() )

        RefrashStore();
        actions[propName][actionName]();

    })

//++++++++++ should chain actions for fulfilled function
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should chain actions for fulfilled function', (done) => {

        const actionFunction =  data => data;
              actionFunction.chain = function(){
                      expect(arguments.length).toEqual(0);
                      done();
                }

        webpackModules.set(propName,"index","default",(data={})=> data )
        webpackModules.set(propName,actionName,"default", data => data )

        webpackModules.set(propName,actionName,"FULFILLED",actionFunction)

        webpackModules.set(propName,actionName,"action",()=> Promise.resolve() )

        RefrashStore();
        actions[propName][actionName]();

    })

//+++++++++ should chain actions for rejected function
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should chain actions for rejected function', (done) => {

        const actionFunction =  data => data;
              actionFunction.chain = done;

        webpackModules.set(propName,"index","default",(data={})=> data )
        webpackModules.set(propName,actionName,"default", data => data )

        webpackModules.set(propName,actionName,"rejected",actionFunction)

        webpackModules.set(propName,actionName,"action",()=> Promise.reject({}) )

        RefrashStore();
        actions[propName][actionName]();

    })

//++++ should chain actions for async default function
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should chain actions for async default function', (done) => {

        const actionFunction = data => data;
              actionFunction.chain = done;

        webpackModules.set(propName,"index","default",(data={})=> data )
        webpackModules.set(propName,actionName,"default",actionFunction)
        webpackModules.set(propName,actionName,"action",()=> Promise.resolve() )

        RefrashStore();
        actions[propName][actionName]();

    })

//++ should throw if chained actions is not a function
//++++++++++++++++++++++++++++++++++++++++++++++++++++
/*
    it('should throw if chained actions is not a function', () => {

        const actionFunction = data => data
              actionFunction.chain = "";

        webpackModules.set(propName,"index","default",(data={})=> data )
        webpackModules.set(propName,actionName,"default", actionFunction )

        RefrashStore();
        expect(actions[propName][actionName]).toThrow(new RegExp(`Chaining function used with ${actions[propName][actionName]} was not a function. string`));

    })
*/
  }) // END describe('chaining action together'
}) // END describe('action middlware'


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
        const value = 1
        expect(() => {
          actions[propName][actionName](value);
        }).toThrow(new RegExp(`${typeof value} was passed as payload to ${propName}.${actionName}. This need to be an object. Check you have not misspelled of the variable`));

    })

//++ should throw if action contains a DOT in its name
//+++++++++++++++++++++++++++++++ with async separator

    it('should throw if action contains a DOT in its name', () => {

        webpackModules.set(propName,"index","default",(posts=[])=> posts )
        webpackModules.set(propName,actionName+".cats","default",(posts, payload)=> {} )

        expect(() => {
        RefrashStore();
      }).toThrow(new RegExp(`file ${actionName+".cats"} in ${propName} contains a DOT in its name`));
    })

//++++ should throw if prop contains a DOT in its name
//+++++++++++++++++++++++++++++++ with async separator

    it('should throw if prop contains a DOT in its name', () => {

        webpackModules.set(propName+".dog","index","default",(posts=[])=> posts )
        webpackModules.set(propName+".dog",actionName,"default",(posts, payload)=> {} )

        expect(() => {
        RefrashStore();
      }).toThrow(new RegExp(`the folder ${propName+".dog"} contains a DOT in its name`));
    })

//+++ should throw an exception if undefined is passed
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('should throw an exception if undefined is passed ', () => {

        webpackModules.set(propName,"index","default",(posts=[])=> posts )
        webpackModules.set(propName,actionName,"default",()=> expect(false).toEqual(true) )

        RefrashStore();
        expect(() => {
          actions[propName][actionName](undefined);
        }).toThrow(new RegExp(`undefined was passed as payload to ${propName}.${actionName}. This need to be an object. Check you have not misspelled of the variable`));

    })

//+++++++++++++should throw an exception if not return
//++++++++++++++++++++++++++++++++ from action-creater

    it('should throw an exception if not returning a Promise from action-creater', () => {

        webpackModules.set(propName,"index","default",(posts=[])=> posts )
        webpackModules.set(propName,actionName,"default",()=> expect(false).toEqual(true) )
        webpackModules.set(propName,actionName,"action",()=> 123 )

        RefrashStore();
        expect(() => {
          actions[propName][actionName]();
        }).toThrow(new RegExp("^action with bad payload"));

    })


//+++++++ should be able to check if an action.type is
//++++++++++++++++++++++++++++ within a actions[state]

    it('should be able to check if an action.type is within a actions[state]', done => {

        webpackModules.set(propName,"index","before",(Posts, action)=> {

          if(actions[propName][actionName] == action.type)
            expect(action.type in actions[propName]).toBeTruthy()

          return action.payload
        })
        webpackModules.set(propName,"index","default",(posts=[])=> posts )
        webpackModules.set(propName,"index","after",(newPosts, action, oldPosts)=> {

          if(actions[propName][actionName] == action.type
          && action.type in actions[propName]){
            done();
          }
          return newPosts
        })
        webpackModules.set(propName,actionName,"default",posts => posts )
        RefrashStore();
        actions[propName][actionName]();
    })

//+ should throw from UI and with out being handled by
//++++++++++++++++++++++++++++++++++++++++ async catch

    it.skip('should throw from UI and with out being handled by async catch', () => {

        let currentStage;

        webpackModules.set(propName,"index","default",(user={})=> user )

        webpackModules.set(propName,actionName,"default",(user, payload, stage, result)=> {
          currentStage = stage;
          //console.log(currentStage)
          if(stage === "REJECTED")
            expect(false).toEqual(true);

          return user;
        } )

        webpackModules.set(propName,actionName,"action", ()=> Promise.resolve() )

        let unsubscribe;

        const testFn = function() {
          if("FULFILLED" === currentStage)
          throw new Error("render problem");
        }
        RefrashStore();
        unsubscribe = store.subscribe(testFn);
        actions[propName][actionName]();
        unsubscribe();
    })

//++++ should hide "async/loading" from the store prop
//+++++++++++++++++++++++++++++++++++++++++++ (Object)

    it('should hide "async/loading" from the store prop(Object)', (done) => {

        let currentStage;

        const defaultUser = {name:"?"}

        webpackModules.set(propName,"index","default",( user = defaultUser )=> user )

        webpackModules.set(propName,actionName,"default",(user, payload, stage, name)=> Object.assign({},user,{name}) )

        webpackModules.set(propName,actionName,"action", ()=> Promise.resolve("joe") )

        let unsubscribe;

        const testFn = function() {

          const user = store.getState()[propName]

          for(const val in user){
            // will have name
            expect(defaultUser.hasOwnProperty(val)).toEqual(true);
            // but NOT async or async
          }

          if(user && "joe" === user.name){
            expect('name'in user).toEqual(true);
            expect('async'in user).toEqual(true);
            expect('loading'in user).toEqual(true);
            unsubscribe();
            done();
          }
        }

        RefrashStore();
        unsubscribe = store.subscribe(testFn);
        actions[propName][actionName]();
    })

//++++ should hide "async/loading" from the store prop
//++++++++++++++++++++++++++++++++++++++++++++ (Array)

    it('should hide "async/loading" from the store prop(Array)', (done) => {

        let currentStage;

        const defaultList = [1,2,3]

        webpackModules.set(propName,"index","default",( list = defaultList )=> list )
        webpackModules.set(propName,actionName,"default",(list, payload, stage, name)=> [...list,0] )
        webpackModules.set(propName,actionName,"action", ()=> Promise.resolve() )

        let unsubscribe;

        const testFn = function() {

          const list = store.getState()[propName]

          for(const val in list){
            // will be a number
            expect(isNaN(val)).toEqual(false);
            // but NOT async or async
          }

          if(list && list.length === 5){
            expect('length'in list).toEqual(true);
            expect('map'in list).toEqual(true);
            expect('async'in list).toEqual(true);
            expect('loading'in list).toEqual(true);
            unsubscribe();
            done();
          }
        }

        RefrashStore();
        unsubscribe = store.subscribe(testFn);
        actions[propName][actionName]();
    })

//++++ should handle coding errors in reduce functions
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it.skip('should handle coding errors in reduce functions', () => {

      webpackModules.set(propName,"index", "default",(data={})=> data )
      webpackModules.set(propName,actionName, "default", function(data,action) {
        return Object.assign({},data,undefinedValue)
      })

      RefrashStore();
      expect(actions[propName][actionName]).toThrow();


    })

//++++ should handle coding errors in reduce functions
//++++++++++++++++++++++++++++++++++++++++ with action

// react-redux Provider has it own way of rendeing on state change.
// this is diffent from subscribe. So I cant test this case >:(

    it.skip('should handle coding errors in reduce functions, while rendeing a state change', () => {

      const Apn = "A "+propName,
            Aan = "A "+actionName,
            Ban = "B "+actionName;

      webpackModules.set(Apn,"index", "default",(data={})=> data )
      webpackModules.set(Apn, Aan, "default", x => x )
      webpackModules.set(Apn, Aan, "action", () => Promise.resolve(true))
      webpackModules.set(Apn, Ban, "default",   data    => {

        return Object.assign({},data,undefinedValue.foo);
      })

      RefrashStore();

      const unsubscribe = store.subscribe(()=>{
      //  console.log("rendeing a state change",store.getState()[Apn].loading)
      //  console.log(Apn,Aan,store.getState()[Apn].loading[Aan])
          if(store.getState()[Apn].loading[Aan] === false){
            unsubscribe();
            actions[Apn][Ban]();
          }
      });

      //expect(
        actions[Apn][Aan]()
    //  ).toThrow();

    })

})


//=====================================================
//================================== Issues from GitHub
//=====================================================

describe('Issues', () => {

  let propName, actionName;

    beforeEach(function() {
      webpackModules.clear();
      propName   = faker.address.city();
      actionName = faker.address.streetName();
    });


//++ Chaining Example is invalid. Throws reducer error
//++++++++++++++++++++++++++++++++++++++++++++++++++++

    it('#5 Chaining Example is invalid; throws reducer error', (done) => {
      // filled by: https://github.com/jschimmoeller

      webpackModules.set("user","index","default",(data={})=> data )
      webpackModules.set("user","getInfo","default", data => data )
      webpackModules.set("user","reset",  "default", data => data )

      webpackModules.set("nav","index","default",(data={})=> data )
      webpackModules.set("nav","move", "default", data => { done(); return data } )

      // ==== pending
      const pendingFunction = (user, payload) => {
        return user;
      };

      // ==== fulfilled
      const fulfilledFunction = (user, payload, userFromServer) => {
        return userFromServer;
      };
      fulfilledFunction.chain = (user, payload, userFromServer) => actions.nav.move({page:"home"})//setTimeout(()=>actions.nav.move({page:"home"}),0)

      // ==== rejecteded
      const rejectededFunction = (user, payload, userFromServer) => {
        return userFromServer;
      };
      rejectededFunction.chain = ()=>actions.user.reset()

      // ==== action
      const actionFunction = (payload) => {
        return Promise.resolve({name:faker.name.firstName()});
      //return Promise.resolve({data:{name:faker.name.firstName()}});
      };

      webpackModules.set("user","getInfo","pending",    pendingFunction)
      webpackModules.set("user","getInfo","fulfilled",fulfilledFunction)
      webpackModules.set("user","getInfo","rejected",rejectededFunction)
      webpackModules.set("user","getInfo","action",      actionFunction)

      RefrashStore(false);
      actions.user.getInfo();

    })
})
