# redux-auto | cookbook 🕮

## other middleware

### using with redux-forms
```JS
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { reducer as forms } from 'redux-form';

import { auto, mergeReducers } from 'redux-auto';

const webpackModules = require.context("./store", true, /\.js$/);

let middleware = applyMiddleware(auto(webpackModules, webpackModules.keys()));

export default createStore( combineReducers(mergeReducers({forms})), middleware );
```
**bonus tip ✍** using with react-redux
```JS
class UserForm extends React.Component {
// ...
}

UserForm = reduxForm({ form: 'Profile/UserForm'})(UserForm)

const map_to_props = (store) => {
  return { ... };
};

export default connect(map_to_props)(UserForm);
```
---
### using with redux [devtools]
from your redux setup file
```JS
// ...
if(window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__)
middleware = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__(middleware);
// ...
```
---
## working with async and server calls

### How to call multiple end-points at the same time?
You hand all api call within your action function. If you have an array of urls, you can use [map] to transform each calls.
```JS
export function action (payload){
  var endpoints = ['//localhost:3000/api/post/1','//localhost:3000/api/post/2']
 return  Promise.all(endpoints.map(url => fetch(url)
                .then(resp => resp.json())))
			    .then(([firstPost,SecPost])=>({firstPost,SecPost}))
}
```
The above code is

 1. Map over endpoints string to create your Ajax calls
 2. Call json on the result of each fetch
 3. Then  combine all responses using Promise.all
 4. Destructor the array into 2 variables
 5. Return a new Object with 2 properties

**result** in you reduct function will now have `firstPost`, `SecPost` that can be used with
```JS
export default function (user, payload, stage, result) {

  switch(stage){
    case 'FULFILLED':
    return {...user, ...payload} // add firstPost, SecPost into users
      break;
    case 'REJECTED':
    console.error("problem loading user from server",result)
      break;
    case 'PENDING':
    default :
      break;
  }
  return user;
}
```
**bonus tip ✍**

You can perform actions after each other by using chain.
For example. Redirecting the user back to the home after login.
```JS
export function fulfilled (access, payload, {status, profile}){
  return access;
} fulfilled.chain = actions.nav.home
```
---

## Show a notification and clear it on server request

Here is an example of showing and hidening a [material - Snackbar](http://www.material-ui.com/#/components/snackbar) after the user has performed an async operation.

The Snackbar popup will show when try click the button and be remove 3secs after the async action has completed
```JS
import React from 'react';
import Snackbar from 'material-ui/Snackbar';

class PlaceHolder extends React.Component {

  render () {
    // if loading.remove is 'false' that its completed
    if( false === this.props.cats.loading.remove ){
      setTimeout(()=>{ this.setState({ snackText:"" }); }, 3000);
      actions.cats.remove.clear(); // clear the loading flag
    }

    return (
      <div>
          <button onClick={()=>{
              actions.cats.remove();
              this.setState({snackText:"You pushed it!!"});
            }}>  

            PUSH ME!!  

          </button>
        <Snackbar open={!!this.state.snackText} message={this.state.snackText} />
      </div>
    );
  }
}

const redux_to_props = ({ cats }) => {
  return {  cats  }
};

export default connect(redux_to_props)(PlaceHolder);
```
**Key lines**
```JS
actions.cats.remove(); // fire the async action
this.props.cats.loading.remove // check the async status via the magic "loading" property
actions.cats.remove.clear(); // clear the loading flag
```
### FYI: store/cats/remove.js
but this could be any async action, **Notting special** :)
```JS
export default function (cats, payload, stage, result) {

  switch(stage){ // DO some work
    case 'FULFILLED':   break;
    case 'REJECTED':    break;
    case 'PENDING':
     default :
      break;
  }
  return cats;
}

export function action (payload){
  console.log("cats / remove / action >> delete API")
  return fetch('https://api.cats.com/remove/1',{ method: 'DELETE' })
}
```



  [devtools]: https://github.com/gaearon/redux-devtools
  [map]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/map
