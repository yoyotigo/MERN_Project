import React from "react";
import { Button, FormGroup, FormControl } from "react-bootstrap";

class Username extends React.Component {

    render() { 
        return (
            <div>
                <form onSubmit={this.props.submit}>
                <span>
                    Member Login
                </span>
                <FormGroup controlId="username">
                    <label>username</label>
                    <FormControl autoFocus value={this.props.user} onChange={this.props.change}/>
                </FormGroup>
                <Button type="submit">Login</Button>
                <p>{this.error}</p>
                </form>
            </div>
          );
    }
}
 
export default Username;