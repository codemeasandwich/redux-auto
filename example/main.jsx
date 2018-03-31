import React from 'react'
import { render } from 'react-dom'

// React Component
class Box extends React.Component {
  constructor(...rest) {
    super(...rest);
    this.state = { color: 'red' };
  } 
  handleClick() {
    this.setState({ color: 'green' });
  } 
  render() {
    return (
      <div 
        style={{background: this.state.color, margin: 10, width: 200, cursor: 'pointer'}} 
        onClick={e => this.handleClick(e)}>
            Name: <input value={this.state.name} onChange={(e)=>this.setState({name:e.target.value})} /><br/>
        Hello {this.state.name}!
        {this.props.label} <br /> CLICK ME { this.props.name }

      </div>
    );
  }
};

// Web Component Wrapper
class BoxWebComponentWrapper extends HTMLElement {
  createdCallback() {
    this.el      = this.createShadowRoot();
    this.mountEl = document.createElement('div');
    this.el.appendChild(this.mountEl);

    (document.onreadystatechange = () => {
      if (document.readyState === "complete") {
        
      const props = Array.prototype.slice
      .call(this.attributes)
      .reduce((props, prop) => Object.assign(props,{[prop.name]: prop.value}),{});
        
      ReactDOM.render(React.createElement(Box, props), this.mountEl );
        
        this.retargetEvents(); 
      }
    })();
  }
  retargetEvents() {
    let events = ["onClick","onChange", "onContextMenu", "onDoubleClick", "onDrag", "onDragEnd", 
      "onDragEnter", "onDragExit", "onDragLeave", "onDragOver", "onDragStart", "onDrop", 
      "onMouseDown", "onMouseEnter", "onMouseLeave","onMouseMove", "onMouseOut", 
      "onMouseOver", "onMouseUp"];
    
    function dispatchEvent(event, eventType, itemProps) {
      if (itemProps[eventType]) {
        itemProps[eventType](event);
      } else if (itemProps.children && itemProps.children.forEach) {
        itemProps.children.forEach(child => {
          child.props && dispatchEvent(event, eventType, child.props);
        })
      }
    }
    
    // Compatible with v0.14 & 15
    function findReactInternal(item) {
      let instance;
      for (let key in item) {
        if (item.hasOwnProperty(key) && ~key.indexOf('_reactInternal')) {
          instance = item[key];
          break;
        } 
      }
      return instance;
    }
    
    events.forEach(eventType => {
      let transformedEventType = eventType.replace(/^on/, '').toLowerCase();

      this.el.addEventListener(transformedEventType, event => {
        let path = [];

        for (let i in event.path) {
          let item = event.path[i];
          path.push(item);

          let internalComponent = findReactInternal(item);
          if (internalComponent
              && internalComponent._currentElement 
              && internalComponent._currentElement.props
          ) {
            dispatchEvent(event, eventType, internalComponent._currentElement.props);
          }

          if (item == this.el) break;
        }
        
        // CHECK OUT THE OUTPUT FOR CLICK
        if (eventType == 'onClick') console.log(path);
      });
    });
  }
}

// Register Web Component
document.registerElement('box-webcomp', {
  prototype: BoxWebComponentWrapper.prototype
});



// === create the element to attach react
const reactElement = document.createElement('div');
document.body.appendChild(reactElement);

render(
  <box-webcomp></box-webcomp>,
  reactElement
)
