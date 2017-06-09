import React  from "react"
import actions from 'redux-auto'
import { connect } from 'react-redux'
import ConsoleElem from "./console.jsx"

const MainUi = (props) => {

  return (
    <div>
    <img style={{ padding: 30 }} src="https://s3-eu-west-1.amazonaws.com/redux-auto/reduxautologo.png" alt="redux-auto" />
    <br/>
    <label htmlFor="label-input">Name:</label>
    <input type="text"
             id="label-input"
             onChange={ event => actions.user.changeName({name:event.target.value}) }
             value={props.name}/>  = { props.name }

             <ul>
             {
              props.posts.map( ({title, id}) => (
                <li key={id}>#{id} - {title} <button onClick={()=>actions.posts.delete({id})}> X </button> </li>
              ))
             }
             </ul>
             <ConsoleElem/>
    </div>
  )
}

const mapStateToProps = store => {
  return { name : store.user.name, posts:store.posts }
};

export default connect( mapStateToProps )(MainUi);
