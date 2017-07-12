import React  from "preact"
import actions from 'redux-auto'
import { connect } from 'preact-redux'
import ConsoleElem from "./console.jsx"
import BadgesElem from "./badges.jsx"

function Posts(props){
// preact - expends values when passings as children. THIS LOOSE THE PROTO :(
const posts = props.children;

  if( props.status instanceof Error )
    return <div style={{color:"red"}}> Error: { props.status.message } <button onClick={props.status.clear}> clear </button></div>

  if(props.status.init)
    return <div> loading posts... </div>

   return <ul> { posts.map( ({title, id}) => (
                <li key={id}>#{id} - {title} <button  onClick={()=>actions.posts.delete({id})} className="close" >
 &times;
</button> </li>
              )) }  </ul>
}

const MainUi = (props) => {

  return (
    <div>
    <a href="https://github.com/codemeasandwich/redux-auto" >
        <img style={{ padding: 30 }} src="https://s3-eu-west-1.amazonaws.com/redux-auto/reduxautologo.png" alt="redux-auto" />
    </a>

    <br/>
    <label htmlFor="label-input">Name:</label>
    <input type="text"
             id="label-input"
             onChange={ event => actions.user.changeName({name:event.target.value}) }
             value={props.user.name}/>  = { (props.user.async.init)?"checking..?": <span style={{textShadow: "2px 2px 2px gray"}}>{props.user.name}</span> }



             <Posts status={props.posts.async.init}>{
                props.posts
             }</Posts>

             <ConsoleElem/>
    </div>
  )
}

const mapStateToProps = ( { user,posts }) => {
  return { user,posts }
};

export default connect( mapStateToProps )(MainUi);
