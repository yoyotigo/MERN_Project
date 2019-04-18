import React from "react";
import '../styles/chat.css';

class SendMessageContainer extends React.Component {
    render() { 
        return (

            <div className="log-form">
            
                <input type="text" placeholder="message" value={this.props.message} onChange={this.props.change} />
                <br/>
                <button onClick={this.props.send} className="btn">Send</button>
            </div>
          );
    }
}
 
export default SendMessageContainer;