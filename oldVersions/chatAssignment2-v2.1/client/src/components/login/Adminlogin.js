import React, { Component } from "react";
import { Button, FormGroup, FormControl } from "react-bootstrap";
import '../styles/login.css';

class Adminlogin  extends Component {

    constructor(props){
        super(props);

        this.state={
            dbuser:'',
            dbpass:'',
            username: "",
            password: "",
            redirectToReferrer: false
        };
    }
    componentWillMount(){
       // axios.get('http://localhost:5000/api/admin')  
         //   .then(response => this.setState({dbuser: response.data[0].username, dbpass:response.data[0].password}))
    }
    validateForm(){
        return this.state.username === this.state.dbuser && this.state.password === this.state.dbpass;
    }
    
    handleChange = event => {
        console.log([event.target.id]+"  "+ event.target.value)
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