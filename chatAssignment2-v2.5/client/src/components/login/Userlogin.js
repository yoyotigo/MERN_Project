import React, { Component } from "react";
import '../styles/login.css';   

class Userlogin  extends Component {

    constructor(props){
        super(props);

        this.state={
            nickname:"",
            error:""
        };
    }
    setUser = ({user, isUser})=>{

		if(isUser){
			this.setError("User name taken")
		}else{
			this.setError("")
			this.props.setUser(user)
		}
	}
	handleSubmit = (e)=>{
		e.preventDefault()
		const { socket } = this.props
		const { nickname } = this.state
		if(nickname.length>=1){
			socket.emit('VERIFY_USER', nickname, this.setUser)
		}else{
			alert('Invalid Username')
		}
    }
    handleChange = (e)=>{	
			this.setState({nickname:e.target.value})
	}

	setError = (error)=>{
		this.setState({error})
    }

    render() { 
        const { nickname, error } = this.state
        return (
            <div className="log-form2">
                <div className="login">
				    <form onSubmit={this.handleSubmit} className="login-form" >
					    <label htmlFor="nickname">
						    <h2>Choose a nickname?</h2>
					    </label>
					    <input
						    ref={(input)=>{ this.textInput = input }} 
						    type="text"
						    id="nickname"
						    value={nickname}
						    onChange={this.handleChange}
						    placeholder={'Username'}
						/>
						<div className="error">{error ? error:null}</div>
				    </form>
			    </div>
            </div>
          );
    }
}
 
export default Userlogin ;