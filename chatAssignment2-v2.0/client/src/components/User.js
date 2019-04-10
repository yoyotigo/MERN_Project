import React, { Component } from 'react';
import Chat from "./chatRooms/mainChat";
import Games from "./chatRooms/gamesChat";
import Political from "./chatRooms/politicalChat";
import Adminlogin from "./Adminlogin";
import Admin from "./admin/admin";
import { BrowserRouter, Route, Switch, Link} from "react-router-dom";

class User extends Component {
  render() {
    return (
      <div>
        <h3>Welcome {this.props.user.name} <button onClick={()=>{this.props.logout()}}>Logout</button></h3>
        
      <BrowserRouter>
      <ul className="nav">
      <li><Link to="/">Chat</Link></li>
      <li><Link to="/games">Games</Link></li>
      <li><Link to="/political">Political</Link></li>
      <li><Link to="/login">Login</Link></li>
      
      </ul>
      <Route>
      <Switch>
        <Route path="/" render={() => (<Chat user={this.props.user.name} />)}   exact/>
        <Route path="/games" render={() => (<Games user={this.props.user.name} />)} exact/>
        <Route path="/political" render={() => (<Political user={this.props.user.name} />)} exact/>
        <Route path="/login" component={Adminlogin}/>
        <Route path="/admin" component={Admin}/>
        <Route component={Error}/>
      </Switch>
      </Route>
      </BrowserRouter>

      </div>
    );
  }
}

export default User;