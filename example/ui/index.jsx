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
    </div>
  )
}

const mapStateToProps = store => {
  return { name : store.user.name }
};

export default connect( mapStateToProps )(MainUi);
