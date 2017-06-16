
import React  from 'react'
import Ui from './../index.jsx';
import {mount, shallow} from 'enzyme'

import {Provider} from 'react-redux'
import {createStore, applyMiddleware, combineReducers} from 'redux'

import { auto, reducers } from 'redux-auto';


import fetch from './fetch';

global.fetch = fetch
global.console.log = ()=>{}


import require_context from './require_context'

const webpackModules = require_context("../../store", true, /^(?!.*\.test\.js$).*\.js$/);

                                // build 'auto' based on target files via Webpack
const middleware = applyMiddleware( auto(webpackModules, webpackModules.keys()))

const store = createStore(combineReducers(reducers), middleware )

// https://medium.com/@gethylgeorge/testing-a-react-redux-app-using-jest-and-enzyme-b349324803a9

describe('<Ui/>',()=>{

	it('renders 1 <Ui/> component', ()=>{
    mount( <Provider store={store}><Ui /></Provider> )

	})


    // https://www.youtube.com/watch?v=u5XTnNBotqs

})
