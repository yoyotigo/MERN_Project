import React, { Component } from 'react';
import Login from '../login/Userlogin'
import User from '../routing/User'
import io from 'socket.io-client'
import { BrowserRouter, Route, Switch, Link} from "react-router-dom";
import Admin from "../admin/admin";

import Adminlogin from "../login/Adminlogin";
const socketUrl = "http://localhost:5000"
export default class Landing extends Component {
		
	constructor(props) {
		super(props);
	  
		this.state = {
			socket:null,
			user:null,
			isadmin:false,
			isuser:false
		};
	  }
	  componentWillMount() {
		  this.initSocket()
	  }
  
	  /*
	  *	Connect to and initializes the socket.
	  */
	  initSocket = ()=>{
		  const socket = io(socketUrl)
  
		  socket.on('connect', ()=>{
			  console.log("Connected");
		  })
		  
		  this.setState({socket})
	  }
  
	  /*
	  * 	Sets the user property in state 
	  *	@param user {id:number, name:string}
	  */	
	  setUser = (user)=>{
		  const { socket } = this.state
		  socket.emit('CONNECTED')
		  socket.emit('USER_CONNECTED', user);
		  this.setState({user})
	  }
  
	  /*
	  *	Sets the user property in state to null.
	  */
	  logout = ()=>{
		  const { socket } = this.state
		  socket.emit('LOGOUT')
		  this.setState({user:null, isuser:false})
		  window.location.replace('/')
  
	  }

  
	  render() {
		  const { socket, user, isadmin, isuser} = this.state
		  let admin;
		  let usr;
		 this.isUser=()=>{
			return this.setState({isuser:true})
		 }
		 this.isAdmin=()=>{
			return this.setState({isadmin:true})
		 }
		
		  if(isuser){
			usr= 
				<div >
				{
					!user?
					<Login socket={socket} setUser={this.setUser} />
					:
					<User socket={socket} user={user} logout={this.logout}/>
				}
			  </div>
		  }else if(!isuser && !isadmin){
			  usr = <button onClick={this.isUser}>I am a User</button>
		  }
		  if(isadmin){
			admin = 
			<div className="nav">
				<BrowserRouter>
      				<ul >
	  					<li><Link to="/"></Link></li>
      				</ul>
      				<Route>
     					<Switch>
	  						<Route path="/" component={Adminlogin}   exact/>
        					<Route path="/admin" component={Admin}   />
        					<Route component={Error}/>
     					</Switch>
      				</Route>
      			</BrowserRouter>
			</div>
		  }else if(!isadmin && !isuser){
			 admin =  <button onClick={this.isAdmin}>I am an Admin</button>
		  }
		
		  return (
			<div>
				{usr}
				{admin}
			</div>
		  );
	  }
  }