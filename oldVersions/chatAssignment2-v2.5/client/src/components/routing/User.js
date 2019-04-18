import React, { Component } from 'react';
import Chat from "../chatRooms/mainChat";
import OtherRooms from "../chatRooms/otherRooms";
import { BrowserRouter, Route, Switch, Link} from "react-router-dom";

class User extends Component {



  render() {
    return (
      <div>   
      <BrowserRouter>
      <ul className="nav">
      <li><Link to="/">Main Room</Link></li>
      <li><Link to="/other">Topic Room</Link></li>
      <button onClick={()=>{this.props.logout()}}>Logout</button>
      </ul>
      <Route>
      <Switch>
        <Route path="/" render={() => (<Chat user={this.props.user.name} />)}   exact/>
        <Route path="/other" render={() => (<OtherRooms user={this.props.user.name} />)}   exact/>
        <Route component={Error}/>
      </Switch>
      </Route>
      </BrowserRouter>
      
      </div>
    );
  }
}

export default User;