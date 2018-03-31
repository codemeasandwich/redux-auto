import React  from "react"
import actions from 'redux-auto'
import { connect } from 'react-redux'
import ConsoleElem from "./console.jsx"
import BadgesElem from "./badges.jsx"

function Posts(props){

const posts = props.children;

  if( posts.async.init instanceof Error )
    return <div style={{color:"red"}}>
              Error: { posts.async.init.message }
              <button onClick={posts.async.init.clear} name="posts.async.init.clear"> clear </button>
            </div>

  if(posts.async.init)
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



             <Posts>{props.posts}</Posts>

             <ConsoleElem/>
    </div>
  )
}

const mapStateToProps = ( { user,posts }) => {
//throw new Error(JSON.stringify(x))
  return { user,posts }
};

export default connect( mapStateToProps )(MainUi);
