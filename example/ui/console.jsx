import React, { Component } from 'preact';

const consoleFn = window.console.log;
const messages = [];

function padNum(num){
return ("0" + num).slice(-2);
}

function lineElem({time, message},index){
  return <div key={time+message+index} style={{ backgroundColor: "rgba(255, 255, 255, 0.2)", marginBottom: 2, padding:"1px 2px"}}>
            <span style={{ color:"gray"}}> {time} </span> <span style={{ color:"white"}}> { message } </span>
        </div>
}

class ConsoleElem extends Component {

  componentDidMount(){
    window.console.log = function(){
    consoleFn.apply(null,arguments)
        const date = new Date();
        const message = Array.prototype.slice.call(arguments).map( arg => ("object" === typeof arg)?JSON.stringify(arg):arg ).join(' ')
        messages.unshift({message, time:padNum(date.getHours())
        +":"+
        padNum(date.getMinutes())
        +"."+
        padNum(date.getSeconds())})
    }
  }

  componentWillUnmount(){
    window.console.log = consoleFn;
  }

  render() {

  const consoleStyle = {
      overflow:"hidden",
      padding:10,
      width:"90vw",
      height:"25vh",
      backgroundColor:"black",
      position: "absolute",
      bottom: 10,
      marginLeft: "auto",
      marginRight: "auto",
      left: 0,
      right: 0,
      borderRadius: 5
  }

    return <div style={consoleStyle}>
            {
                messages.map( lineElem )
            }
           </div>
  }
}

export default ConsoleElem;
