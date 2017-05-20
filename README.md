This is where the data, logic & flow control of the application lives.

 - each folder is an attribute on the state object. For example. the "user" folder will create an attribute of 'user'
 - the JS files within the folder are **actions** that can be fired to change the share for user.



### actions are avabile in the UI

Example:

```JS
import actions from 'actions'
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
