import React, { Component } from 'react';
import History from "../admin/history";
import Events from "../admin/events";

class Admin extends Component {
  render() {
    return (
      <div>
        <History/>
        <Events/>
      </div>
    );
  }
}

export default Admin;