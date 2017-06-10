import React  from "react"
import actions from 'redux-auto'
import { connect } from 'react-redux'
import ConsoleElem from "./console.jsx"

function Posts(props){

const posts = props.children;

  if(posts.async.init)
    return <div> loading posts... </div>
    
  if(Object === typeof posts.async.init)
    return <div style={{color:"red"}}> Error: { posts.async.init.message } </div>
  
   return <ul> { posts.map( ({title, id}) => (
                <li key={id}>#{id} - {title} <button  onClick={()=>actions.posts.delete({id})} className="close" >
 &times;
</button> </li>
              )) }  </ul>
}

const MainUi = (props) => {

  return (
    <div>
    <a href="https://www.npmjs.com/package/redux-auto"><img style={{ padding: 30 }} src="https://s3-eu-west-1.amazonaws.com/redux-auto/reduxautologo.png" alt="redux-auto" /></a>
    <br/>
    <label htmlFor="label-input">Name:</label>
    <input type="text"
             id="label-input"
             onChange={ event => actions.user.changeName({name:event.target.value}) }
             value={props.user.name}/>  = { (props.user.async.init)?"checking..?": props.user.name }

             
             
             <Posts>{props.posts}</Posts>
            
             <ConsoleElem/>
    </div>
  )
}

const mapStateToProps = ({user,posts}) => {
  return { user,posts }
};

export default connect( mapStateToProps )(MainUi);
