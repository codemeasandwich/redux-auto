![redux-auto][logo]

[logo]: https://s3-eu-west-1.amazonaws.com/redux-auto/reduxautologo.png "redux-auto logo"

## Redux made easy (with a plug and play approach)
##### Removing the boilerplate code in setting up a store & actions

[![npm version](https://badge.fury.io/js/redux-auto.svg)](https://badge.fury.io/js/redux-auto)
[![npm downloads](https://img.shields.io/npm/dt/redux-auto.svg)](http://www.npmtrends.com/redux-auto)
[![Build Status](https://travis-ci.org/codemeasandwich/redux-auto.svg?branch=master)](https://travis-ci.org/codemeasandwich/redux-auto)
[![Coverage Status](https://coveralls.io/repos/github/codemeasandwich/redux-auto/badge.svg?branch=master)](https://coveralls.io/github/codemeasandwich/redux-auto?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/npm/redux-auto/badge.svg)](https://snyk.io/test/npm/redux-auto)
[![compatible with preact-redux](https://img.shields.io/badge/compatible%20with-preact--redux-673ab8.svg)](https://github.com/developit/preact-redux)
[![Cookbook](https://img.shields.io/badge/coding%20cookbook-%F0%9F%95%AE-yellowgreen.svg)](https://github.com/codemeasandwich/redux-auto/blob/master/cookbook.md)

## why

I created this utility to allow you to get up and running with Redux in a fraction of the time!

### Plug & Play
* No wiring together of actions & reduces
* No hardcoding actions types
* No action creator or dispatcher to worry about
* Easy Async for calling APIs
* Easy *initialize* for parts of your store
* Easy install = works as the same as other redux middleware
* Pure JS no external dependencies!
* SuperSmall: under 3k (minify + gzip)

#### Have an existing project? No worries. Drop it in, to work along side the traditional redux way.

# [Live Demo](https://bit.ly/redux-auto-demo) / [Demo Source](https://bit.ly/redux-auto-example)

### If you like it, [★ it on github](https://bit.ly/redux-auto-star) and share  :beers:

  * [Why](#why)
    + [plug & Play](#plug--play)
    + [asynchronous](#asynchronous)
- [Live Demo](https://bit.ly/redux-auto-demo)
  * [Source](https://bit.ly/redux-auto-example)
- [Overview](#overview)
- [setup](#setup)
  * [Using along side an existing Redux setup](#using-along-side-an-existing-redux-setup)
  * [Using along side other Redux middleware](#using-along-side-other-redux-middleware)
  * [Actions are available in the UI](#actions-are-available-in-the-ui)
- [Action files](#action-files)
  * [Chaining action together](#chaining-actions-together)
  * [Cancel an action](#cancel-an-action)
- [Index files](#index-files)
  * [before](#before)
  * [logic](#default)
  * [after](#after)
- [handling async actions in your ui](#handling-async-actions-in-your-ui)
- [smart actions](#smart-actions)

### asynchronous

In Redux your reducer returns a state object. This is very straight forward, but makes dealing with asynchronous updates quite tricky (there are [more than 60 different libraries](https://github.com/markerikson/redux-ecosystem-links/blob/master/side-effects.md) tackling this problem).

redux-auto fixes this asynchronous problem simply by allowing you to create an ["action" function that returns a promise](#action-files). To accompany your "default" function action logic.

> [asynchronous: example](https://github.com/codemeasandwich/redux-auto/blob/master/example/store/user/init.js)

1) No need for other Redux async middleware. e.g. thunk, promise-middleware, saga
2) Easily allows you to pass a promise into redux and have it managed for you
3) Allows you to co-locate external service calls with where they will be transformed
4) Naming the file "**init**.js" will have it called once at app start. This is good for loading data from the server to warm up you client cache.

## Overview

**Redux-Auto was created to work with Webpacks.*

Steps:

1) Create a folder to represent your store
	* This is where the data, logic & flow control of the application lives. This can be named whatever, just point to it with webpacks - require.context
2) In this folder you will create folders to represent each attribute on the store
	* For example. the "user" folder will create an attribute of 'user'
	* the JS files within the folder are **actions** that can be fired to change the shape of user.
3) Create an index.js file to set default values
	* **[export default](#default)** is a catch all reducer function *(if an action cant be found)*
	* export "[before](#before)" & "[after](#after)" as lifecycle functions
4) Create js files with the name of the [action](#action-files) you want it mapped to
	* **export default** is the reducer function
	* export "action" function. Is an **action-middleware** that will allow you to create promises
5) You can create an init.js It will be automatically run once after store created
	* using this to initialize from an API

Example layout:
```
└── store/ (1)
    └──user/ (2)
       └── index.js (3)
       └── changeName.js (4)
       └── init.js (5)
```


## setup

### Inside your setup file

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

import logger from 'redux-logger';
import { auto, reducers } from 'redux-auto';
...
                                // pass all the middlewares in a normal arguments
const middleware = applyMiddleware( logger, auto(webpackModules, webpackModules.keys()))
const store = createStore(combineReducers(reducers), middleware );

```


### actions are available in the UI

Just import "redux-auto" and the actions are automatically available by default

```JS
import actions from 'redux-auto'
...
//action[folder][file]( data )
action.apps.chageAppName({appId:123})
```

## action files

The action file lives within your attribute folder and becomes the exposed action.
The default export should be a function that will take 1) your piece of the state 2) the payload data


Example: of an action to update the logged-in users name

```JS
// /store/user/changeUserName.js

export default function (user, payload) {

  return Object.assign({}, user,{ name : payload.name } );
}

```

★ Sometimes we want to talk to the server. This is done by action-middleware

This is done by exporting a function named "action" that returns a promise. The default function will now receive a 3rd argument "state". With the 2nd argument being the payload used to create the request

Example: saving the uses name to the server

```JS
// /store/user/changeUserName.js

export default function (user, payload, stage, data) {
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
  return user;
}

export function action (payload,user){
	return fetch('/api/foo/bar/user/'+payload.userId)
}

```

An alternative declaration for the same as above

```JS
// /store/user/changeUserName.js

export function pending (posts, payload){
  return posts
}

export function fulfilled (posts, payload, serverPosts){
  return serverPosts
}

export function rejected (posts, payload, error){
  return posts;
}

export function action (payload,posts){
	return fetch('/api/foo/bar/user/'+payload.userId)
}

```

### chaining actions together

You chain actions back-to-back by setting an "chain" property on the exported function.

Attach a function as the "chain" property

**Example:**
/store/user/getInfo
```JS
export function fulfilled (user, payload, userFromServer){
  return userFromServer;
} fulfilled.chain = (user, payload, userFromServer) => actions.nav.move({page:"home"})

export function rejected (user, payload, userFromServer){
  return userFromServer;
} rejected.chain = actions.user.reset

export function pending (user, payload){
  return user
}

export function action (payload){
	return fetch('/api/foo/bar/user/'+payload.userId)
}
```

If you pass your own function. Like with the **'fulfilled'** example. It will be passed all the arguments, the same as the host function was.

Else you can pass **thought** an "redux-auto" action function. Like with the **'rejected'** example. It will called without any arguments.

So calling "**actions.user.getInfo({userId:1})**" will automatically call  **actions.nav.move** with the host arguments OR **actions.user.reset** *with out arguments.


### cancel an action

You can cancel an action from with-in the action .js file before it starts by not returning any value

**Example:**
```JS
export function action (payload,user){
  if(payload.id === user.id)
    return
  else
	 return fetch('/api/foo/bar/user/'+payload.userId)
}
```

## index files

**"index"** files are need for each attribute folder you make.

This file can exposes three funtions
1) before
2) default
3) after

#### before

Fires on every action, to tweek the **payload** that will be passed to you logic functions.

```js
// add a time stamp to the payload that will be recived by user reduced
export function before(user, action){

	return Object.assign({},action.payload,{ timeStamp : new Date() })
}

```

#### default

This is a normal redux reducer function, being passed the **previousState** and the **action**.
```js
export default function user(user = {name:"?"}, action) {
  return user;
}

```

⚠ This function will be fired on all actions, **EXCEPT** for actions that are handled by a specific action file in this reducer folder.

Lets understand this with an example:

**Files:**
```
store/
 ├──user/
 │  └── index.js
 │  └── changeName.js
 └──posts/
    └── index.js
    └── delete.js
```
**code:**

```JS
import actions from 'redux-auto'
...
actions.user.changeName({name:"brian"})
```
The default functions for **store/user/changeName.js** & **store/post/index.js** will be fired.

**store/user/index.js was NOT** called because there is a specific action file a to handle it for user.


#### after

Fires after every action, allowing you to change your piece of the **state**.

```js
import actions from 'redux-auto'

// automatically keep a log of all actions against user
export function after(newUserValues, action, oldUserValues){

	const changes = {}

	if(action.type in actions.user) // log if this is a user action!
		changes.log = newUserValues.concat(log,[{action.type:action.payload}])

	return Object.assign({}, newUserValues, changes)
}

```

## handling async actions in your UI

redux-auto has a built in mechanism to flag what stage an async action is in..

if the state that you returned from your reduce function is an object or array. redux-auto will transparently attach a "loading" property representing all async actions.

The "loading" flag can have 1 of 4 values

1) `undefined` : the async action has not been fired yet
2) `true` : the action is in progress
3) `false` : the action has completed successfully
4) `error` : an error occurred and here is the error object + a "clear" function to reset the async to `undefined`

* Note: The async action will also have the clear function if at any time you want to reset the "loading" property.

     `actions.user.save()` is the async function and

     `actions.user.save.clear()` will clear the "loading" property.


example:


```JS

// user = { name:"tom" }

JSON.stringify(state.user) // "{ "name":"tom" }"

state.user.loading.save // = undefined

actions.user.save()

state.user.loading.save // = true

// when the request or promuse completed

state.user.loading.save // = false

// if the was a problem. it will be was to the error object

state.user.loading.save // = Error("some problem")
// + with an Error, there will also be a "clear" function to set the "loading" back to undefined
// e.g. state.user.loading.save.clear()

```
> [handling async actions in your ui:- example](https://github.com/codemeasandwich/redux-auto/blob/master/example/ui/index.jsx)

## smart actions

**smart actions** is an options flag that handly `actions` function more intelligently.

Currently facilitates [graphql](http://graphql.org/) and [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) responses returned by action's promises.

**To enable:**

```JS

import { auto } from 'redux-auto';

auto.settings({smartActions:true})

```

This will now parce fetch and graphQL errors into your `rejected` function.
As well as parsing the json if available


[lifecycle]:https://s3-eu-west-1.amazonaws.com/redux-auto/flow.png
