import React, { Component } from 'react';
import History from "../admin/history";
import Events from "../admin/events";
import Rooms from "../admin/rooms";

class Admin extends Component {
  render() {
    return (
      <div>
        <History/>
        <Events/>
        <Rooms/>
      </div>
    );
  }
}

export default Admin;