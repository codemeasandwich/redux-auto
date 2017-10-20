---

### redux-auto
## a plug and play approach

---

### What is Redux?

+++

![redux architecture](https://s3-eu-west-1.amazonaws.com/redux-auto/pitch/redux-article-3-02.svg)

<span style="font-size:0.6em; color:gray"> css-tricks.com/learning-react-redux</span>

+++

<ol>
<li>Single Source of Truth</li>
<li class="fragment">Time travel debugging</li>
<li class="fragment">Easier to reason application logic</li>
</ol>

+++

![Redux DevTools Dock Monitor](https://s3-eu-west-1.amazonaws.com/redux-auto/pitch/ReduxDevToolsDockMonitor.gif)

<span style="font-size:0.6em; color:gray">Redux DevTools Dock Monitor</span>

+++

## basic example: Redux + React

+++

## infrastructure
```JS
const ActionTypes = {
  task1:"Lots to do!!",
  task2:"...",
  taskn:"..."
}

const task1ActionBuilder = function (someValue) {
    return {
        type : ActionTypes.task1,
        payload : someValue
    }
}
```
@[1-5]
@[7-12]

+++
## reducer
```JS
import ActionTypes from ..

const defaultState = {message:'?'}
const myReducer = (state= defaultState, action) => {

 switch (action.type) {
    case ActionTypes.task1:
      return Object.assign({}, state, {message:action.payload});
    break;  
    // case ActionTypes...  
    //   return ...
    // break;
    default:
      return state;
  }  
}
```
@[4,16]
@[6-9]

+++
## element
```JS
import task1ActionBuilder from ...

const AppElem = ({onClick,message}) => (
  <div> <button onClick={onClick}>click</button>
                 <b>{message}</b>                 </div>
);

const mapStateToProps = (state, ownProps) => {
  return { message: state.myReducer.message }
}
const mapDispatchToProps = (dispatch, ownProps) => {
  return {  onClick: () => {  dispatch(task1ActionBuilder("hello world"))  }  }
}
ReactRedux.connect( mapStateToProps,  mapDispatchToProps)(AppElem);
```
@[3-6]
@[5,8-10]
@[1,4,11-13]
@[14]

+++
## assemble

```JS
import myReducer from ...

const myApp = Redux.combineReducers({ myReducer });
let store = Redux.createStore(myApp)



let Provider = ReactRedux.Provider;
React.render(
  <Provider store={store}>
    <ConnectedApp />
  </Provider>,
  document.getElementById('root')
);
```

+++

# output

 <div class="fragment"> <button onClick={onClick}>click</button>
                 <b>?</b>                 </div>
   <div class="fragment">               ⬇️
 <div> <button onClick={onClick}>click</button>
                 <b>hello world</b>                 </div></div>

+++

![hard](https://s3-eu-west-1.amazonaws.com/redux-auto/pitch/Coding-is-hard...-Why-not-hardcode-.jpg)

+++

![nonredux](https://s3-eu-west-1.amazonaws.com/redux-auto/pitch/nonredux.jpg)

+++

![bad code](https://s3-eu-west-1.amazonaws.com/redux-auto/pitch/4045408.jpg)


---

How to make Redux easier

![thinking](https://s3-eu-west-1.amazonaws.com/redux-auto/pitch/thinking.jpg)

+++


# Logic

<ol>
<li class="fragment"> Action name (Type) </li>
<li class="fragment"> Action creator</li>
<li class="fragment"> Reducer</li>
</ol>
+++

## an action file
<div class="fragment"> /store/ _myReducer_ / _task1 .js </div>

```JS  
export default function (myPieceOfState, {message}) {
  return Object.assign({}, myPieceOfState, {message:message});
}
```

<a href="#/1/5">compare</a>

+++
# using your sexy new action
+++

## element
```JS
import actions from 'redux-auto'

const onClickAction = ()=>actions.myReducer.task1({message:"hello world"})

const AppElem = ({message}) => (
  <div> <button onClick={onClickAction}>click</button>
                 <b>{message}</b>                 </div>
);

const mapStateToProps = (state, ownProps) => {
  return { message: state.myReducer.message }
}

ReactRedux.connect( mapStateToProps)(AppElem);
```
@[5-8]
@[7,10-12]
@[1,3,6]

+++

## assemble

COPY, PASTE 😊

```JS
import { auto, reducers } from 'redux-auto';
// load the folder that hold you store
const webpackModules = require.context("./store", true, /\.js$/);

// build 'auto' based on target files via Webpack
const middleware = Redux.applyMiddleware( auto(webpackModules, webpackModules.keys()))
const store = Redux.createStore(Redux.combineReducers(reducers), middleware );

let Provider = ReactRedux.Provider;
React.render(
  <Provider store={store}>
    <ConnectedApp />
  </Provider>,
  document.getElementById('root')
);
```

+++

![nice](https://s3-eu-west-1.amazonaws.com/redux-auto/pitch/1x9c8i.jpg)


---

# Can we do more ?

+++

![ajax redux](https://s3-eu-west-1.amazonaws.com/redux-auto/pitch/1x8yva.jpg)

Redux is SYNCHRONOUS

+++

Async - wish list 🌠
<div class="fragment">case: talk to server</dic>
<ol>
<li class="fragment">ajax code with reducer</li>
<li class="fragment">manage steps
  <ul class="fragment">
<li>started</li>
<li>completed</li>
<li>error</li>
</ul>
  </li>
<li class="fragment">keep user up-to-date</li>
<li class="fragment">hydrate on start</li>
</ol>

+++

ajax code with reducer + manage steps

```JS  
export function pending (myPieceOfState, payload){
  return myPieceOfState }

export function fulfilled (myPieceOfState, payload, serverData){
  return serverData }// replace

export function rejected (myPieceOfState, payload, error){
  return posts;     }

export function action (payload, myPieceOfState){
    return fetch('/api/data').then( response => response.json() )
}
```
@[10-12]
@[1,2]
@[4,5]
@[7,8]
/store/ _myReducer_ / task1 .js

<a href="#/2/2">compare</a>

+++

keep user up-to-date

```JS  
const AppElem = ({message,loading}) => (
  <div> <button onClick={onClickAction}>click</button>
                 <b>{message}</b>     
    <span>  { loading && "loading data" }  </span> </div>
);

const mapStateToProps = (state, ownProps) => {
  return {
    message: state.myReducer.message,
    loading: state.myReducer.loading.task1
  }
}

ReactRedux.connect( mapStateToProps)(AppElem);
```

@[1-5,10]
+++

hydrate on start


<div class="fragment"><span style="color:gray">change </span> /store/ _myReducer_ / task1 .js</div>
<div class="fragment"><span style="color:gray">to </span> /store/ _myReducer_ / init .js</div>
<div class="fragment">This it!</div>

---

# How to use types.

### Excite and Segment match

+++

## Excite match

**lets do something in "bar" with "foo.A" is fired**

* /store/foo/A.js

* /store/bar/index.js

```JS  
import actions from 'redux-auto'
// bar/index.js
export default function (bar = [], action)
{
  if(action.type == actions.foo.A){
    return bar // DO SOME WORK
  }
  return bar;
}
```
@[5](use "==")


+++

## Segment match

**lets do something in "bar" with any "foo" is fired**

* /store/foo/*.*.js

* /store/bar/index.js

```JS  
import actions from 'redux-auto'
// bar/index.js
export default function (bar = [], action)
{
  if(action.type in actions.foo){
    return bar // DO SOME WORK - action.payload.
  }
  return bar;
}
```
@[5]


---

## How about App life-cycle

+++

* /store/bar/index.js

```JS  
export function before(user, action){
	return action.payload
}

export default function (bar = [], action){
  return bar;
}

export function after(newUserValues, action, oldUserValues){
	return newUserValues
}
```

@[1-3](Fires on every action to tweek the payload that will be passed to you logic functions)
@[9-11](Fires after every action, allowing you to change your piece of the state)

---

## What if I want to dispatch actions one after another?


+++

## create Side-Effects with
# "chain"

+++

**Example: Open a Post's page while getting this Data**

```JS  
export function pending (posts, {index}){
  return { ...posts, selected:index }
} pending.chain = action.nav.postPage

export function fulfilled (posts, payload, serverData){
  return serverData }// replace

export function rejected (posts, payload, error){
  return logging..error.report(error);     }

export function action ({index}){
    return fetch('/api/posts?index='+index).then( response => response.json() )
}
```
@[11-13]
@[1-3]
@[3]

+++

### Action short-hand:

```JS
} pending.chain = action.nav.postPage // action.nav.postPage()
```


### function
```JS
} pending.chain =
      (posts,payload) =>
              action.nav.postPage({meta:{index:payload.index}})
```

+++

This could also be done in **store/nav/index.js**

```JS  
export default function (nav = {}, action){
  if(action.type == actions.posts.get.pending){
    return { ...nav, page="posts",
              meta:{index:action.payload.index}
          }
  }
  return nav;
}
```
@[2-6]

+++

# index vs chain

<div class="fragment">**index:** will make the change on the SAME cycle</div>
<div class="fragment">**chain:** will make the change on the NEXT cycle</div>

<div class="fragment">It's upto you!</div>

---

Redux-auto.. today?


<ul>
<li class="fragment"> Has 100% test coverage</li>
<li class="fragment"> Being used in Production today</li>
<li class="fragment"> Can be dropped into any existing project</li>
<li class="fragment"> compatible with existing redux tooling</li>
</ul>

+++

Thanks for your time

![got this](https://s3-eu-west-1.amazonaws.com/redux-auto/pitch/1x9brn.jpg)

Question time
