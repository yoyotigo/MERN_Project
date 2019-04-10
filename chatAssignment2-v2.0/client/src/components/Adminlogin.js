import React, { Component } from "react";
import { Button, FormGroup, FormControl } from "react-bootstrap";
import './styles/login.css';   

class Adminlogin  extends Component {

    constructor(props){
        super(props);

        this.state={
            username: "",
            password: "",
            redirectToReferrer: false
        };
    }
    
    validateForm(){
        return this.state.username.length > 0 && this.state.password.length > 0;
    }
    
    handleChange = event => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }

    handleSubmit = event => {
        event.preventDefault();
        this.setState({
            redirectToReferrer: true
        });
    }

    render() { 
        const redirectToReferrer = this.state.redirectToReferrer;
        if (redirectToReferrer === true){
            this.props.history.push("/admin");
        }
        return (
            <div className="log-form2">
                <form onSubmit={this.handleSubmit}>
                    <FormGroup controlId="username">
                        <label>username</label>
                    <FormControl autoFocus value={this.state.username} onChange={this.handleChange}/>
                    </FormGroup>
                    <FormGroup controlId="password">
                        <label>password</label>
                        <FormControl value={this.state.password} onChange={this.handleChange} type="password"/>
                    </FormGroup>
                    <Button block disabled={!this.validateForm()} type="submit">Login</Button>
                </form>
            </div>
          );
    }
}
 
export default Adminlogin ;