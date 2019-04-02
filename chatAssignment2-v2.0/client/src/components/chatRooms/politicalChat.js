import React from "react";
import io from "socket.io-client";

class Political extends React.Component {
    
    constructor(props){
        super(props);

        this.state = {
            username: '',
            message: '',
            messages: []
        };
        this.socket = io('localhost:5000');

        this.socket.on('RECEIVE_MESSAGE', function(data){
            addMessage(data);
        });
        
        const addMessage = data => {
            console.log(data);
            this.setState({messages: [...this.state.messages, data]});
            console.log(this.state.messages);
        }

        this.sendMessage = ev => {
            ev.preventDefault();
            this.socket.emit('SEND_MESSAGE', {
                author: this.state.username,
                message: this.state.message
            });
            this.setState({message: ''});
        }        
    }



    render() { 
        return (
            <div>
                <div>
                    Global Chat

                    <div className="messages">
                    {this.state.messages.map(message=>{
                        return(
                            <div>{message.author}: {message.message}</div>
                        )
                    })}
                    </div>
                </div>
                <div>
                    <input type="text" placeholder="username" value={this.state.username} onChange={ev=> this.setState({username: ev.target.value})} />
                    <br/>
                    <input type="text" placeholder="message" value={this.state.message} onChange={ev=>this.setState({message: ev.target.value})} />
                    <br/>
                    <button onClick={this.sendMessage} className="btn">Send</button>
                </div>
            </div>
          );
    }

    

}
 
export default Political;