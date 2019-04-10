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
        <h3>Welcome {this.props.user.name}</h3>
      <BrowserRouter>
      <ul className="nav">
      <li><Link to="/">Chat</Link></li>
      <li><Link to="/games">Games</Link></li>
      <li><Link to="/political">Political</Link></li>
      <li><Link to="/login">Login</Link></li>
      </ul>
      <Route>
      <Switch>
        <Route path="/" component={Chat}  exact/>
        <Route path="/games" component={Games} exact/>
        <Route path="/political" component={Political} exact/>
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