import React, { Component } from 'react';

const consoleFn = window.console.log;
const messages = [];

class ConsoleElem extends Component {

  componentDidMount(){
    window.console.log = function(str){  messages.push(str)  }
  }

  componentWillUnmount(){
    window.console.log = consoleFn;
  }

  render() {
    return <div style={{overflow:"scroll", padding:10, width:"100%", height:400, backgroundColor:"black" }}> {  messages.map( message => <div style={{ color:"white",   backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 2}}> { message } </div> )  } </div>
  }
}

export default ConsoleElem;
