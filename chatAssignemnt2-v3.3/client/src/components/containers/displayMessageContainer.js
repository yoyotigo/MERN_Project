import React from "react";

class DisplayMessageContainer extends React.Component {
    render() { 
        return (
            <div className="log-form2">
                <div>
                    Chat History
                </div>
                <div>
                    <ul>
                        <div>
                            <div id='chat'>
                                {this.props.messages.map((message, i)=>{
                                    return(
                                        <div key={i}>{message.author}: {message.message}</div>
                                    )
                                })}
                            </div>
                        </div>
                    </ul>
                </div>
            </div>
          );
    }
}
 
export default DisplayMessageContainer;