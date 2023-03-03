import React from 'react'


const EditableContext = React.createContext();


export class EditableFormRow extends React.Component {
  constructor({ form, index, ...props }) {
    super({ form, index, ...props });
    this.state = {
      props,
      form
    };
  }
    render(){
      
      console.log(this.state)
      return (
       
        <EditableContext.Provider value={this.state.form}>
        <tr {...this.state.props} />
      </EditableContext.Provider>
     )

}
}

