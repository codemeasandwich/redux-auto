# Redux-Auto

### Removing the boilerplate code in setting up a store & actions

[![npm version](https://badge.fury.io/js/redux-auto.svg)](https://badge.fury.io/js/redux-auto)
[![Build Status](https://travis-ci.org/codemeasandwich/redux-auto.svg?branch=master)](https://travis-ci.org/codemeasandwich/redux-auto)
[![Coverage Status](https://coveralls.io/repos/github/codemeasandwich/redux-auto/badge.svg?branch=master)](https://coveralls.io/github/codemeasandwich/redux-auto?branch=master)

## why

I created this utility to allow you to get up and running with Rudux in a fraction of the time!

### plug & Play
* No wiring togetter of actions & reduces 
* No hardcoding actions types
* No action creater or dispatcher to worry about
* Easy Asyn for calling APIs
* Easy *initialize* for parts of your store
* Easy install = works as the same as other redux middleware

Have an exising project? No worries. Drop it in, to work along side the traditional redux way. 

# [DEMO](https://github.com/codemeasandwich/redux-auto/tree/master/example)

## How

Redux-Auto was create to work with Webpacks.

Steps:

1) Create a folder to represent your store
	* This is where the data, logic & flow control of the application lives. This can be named whatever, just point to it with webpacks - require.context
2) In this folder you will create folders to represent each attribute on the store
	* For example. the "user" folder will create an attribute of 'user'
	* the JS files within the folder are **actions** that can be fired to change the share for user.
3) Create an index.js file to set default values 
	* **export default** is catch all reducer function *(if an action cant be found)*
	* export "before" & "after" function. Give lifecyclie functions
4) Create a js file with the name of the action you want it mapped to
	* **export default** is the reducer function 
	* export "action" function. Is an **action-middleware** that will allow you to create promises
5) You can create an init.js that is automatically run once after store created
	* using this to initialize from an API

```
└── store/ (1)
    └──user/ (2)
       └── index.js (3)
       └── changeName.js (4)
       └── init.js (5)
```


## setup

inside you enter file

```JS
...
import { auto, reducers } from 'redux-auto';
...
// load the folder that hold you store
const webpackModules = require.context("./store", true, /\.js$/);
...
                                // build 'auto' based on target files via Webpack
const middleware = applyMiddleware( auto(webpackModules, webpackModules.keys()))
const store = createStore(combineReducers(reducers), middleware );
...

```

### Using along side an existing Redux setup.

inside you enter file

```JS
...
// import your exiting reducers
import reducers from './reducers';
// include mergeReducers
import { auto, mergeReducers } from 'redux-auto';
...
// pass into: reducers >> mergeReducers >> combineReducers
const store = createStore(combineReducers(mergeReducers(reducers)), middleware );
...

```

### Using along side other Redux middleware.

```JS

...
import logger from 'redux-logger';
import { auto, reducers } from 'redux-auto';
...
                                // pass all the middlewares in a normal arguments
const middleware = applyMiddleware( logger, auto(webpackModules, webpackModules.keys()))
const store = createStore(combineReducers(reducers), middleware );
...

```


### actions are available in the UI

Example:

```JS
import actions from 'redux-auto'
...
//action[folder][file]( data )
action.apps.chageAppName({appId:123})
```

## action files

the action file live within you attribute folder and become the exposed actions for the UI
the default export should be a funciton that will take 1) your piece of the state 2) the payload data


Example: of an action to update the logged-in users name

```JS
// /store/user/changeUserName.js

export default function (user, payload) {

  return Object.assign({}, user,{ name : payload.name } );
}

```

Sometime we want to talk to the server. This is done by action-middleware

Example: saving the uses name to the server

```JS
// /store/user/changeUserName.js

export default function (user, payload, state) {
switch(stage){
    case 'FULFILLED':
     // ...
      break;
    case 'REJECTED':
     // ...
      break;
    case 'PENDING':
    default :
     // ...
      break;
  }
}

export function action (payload,apps){
	return fetch('/api/foo/bar/user/'+payload.userId)
}

```

## lifecycle diagrame

![action lifecycle][lifecycle]



## index files

**"index"** files need for each attribute folder you make.
the default export should be a funciton that will




[lifecycle]:https://docs.google.com/uc?id=0B39u552cxASjU2M5TVZkRGlzZkE
