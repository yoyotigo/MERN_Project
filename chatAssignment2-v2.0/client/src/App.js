import React, { Component } from 'react';
import Chat from "./components/chatRooms/mainChat";
import Games from "./components/chatRooms/gamesChat";
import Political from "./components/chatRooms/politicalChat";
import Login from "./components/login";
import Admin from "./components/admin/admin";
import '../src/App.css';
import { BrowserRouter, Route, Switch, Link} from "react-router-dom";

class App extends Component {
  render() {
    return (
      <div>
      <BrowserRouter>
      <ul class="nav">
      <li><Link to="/">Chat</Link></li>
      <li><Link to="/games">Games</Link></li>
      <li><Link to="/political">Political</Link></li>
      <li><Link to="/login">Login</Link></li>
      </ul>
      <Route>
      <Switch>
        <Route path="/" component={Chat} exact/>
        <Route path="/games" component={Games} exact/>
        <Route path="/political" component={Political} exact/>
        <Route path="/login" component={Login}/>
        <Route path="/admin" component={Admin}/>
        <Route component={Error}/>
      </Switch>
      </Route>
      </BrowserRouter>
      </div>
    );
  }
}

export default App;