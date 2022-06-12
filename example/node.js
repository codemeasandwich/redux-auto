import { createRequire } from "module"
import a from "module"
import * as b from "module"
//console.log(a,b)
const require = createRequire(import.meta.url)
require('babel-register')({
//  ignore:[/(node_module)/],
  presets:["env","react"]
})

//import actions from 'redux-auto';
const mainSSR = require("./mainSSR.jsx").default
//console.log("Node js Loaded",mainSSR)
