import React from "react";
import '../styles/chat.css';

class DisplayMessageContainer extends React.Component {
    render() { 
        return (
            <div className="log-form2">
            {this.props.messages.map((message, i)=>{
                return(
                    <div key={i}>{message.author}: {message.message}</div>
                )
            })}
            </div>
            
          );
    }
}
 
export default DisplayMessageContainer;