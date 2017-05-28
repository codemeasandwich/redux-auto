import React  from "react"
import actions from 'redux-auto'
import { connect } from 'react-redux'

const MainUi = (props) => {
console.log("index.jsx:MainUI = ",props.name)
  return (
    <div>
      redux-auto: 
      <input type="text"
             onChange={ event => actions.user.changeName({name:event.target.value}) }
             value={props.name}/>
             
             <ul>
             {
              props.posts.map( ({title, id}) => (
                <li key={id}>#{id} - {title} <button onClick={()=>actions.posts.delete({id})}> X </button> </li>
              ))
             }
             </ul>
             
    </div>
  )
}

const mapStateToProps = store => {
  return { name : store.user.name, posts:store.posts }
};

export default connect( mapStateToProps )(MainUi);
