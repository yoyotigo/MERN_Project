import React from "react";
import io from "socket.io-client";
import '../styles/chat.css';

class Chat extends React.Component {
    
    constructor(props){
        super(props);

        this.state = {
            username: '',
            message: '',
            messages: [],
            error:'',
            room:'Main Room'
        };
        this.socket = io('localhost:5000');

        this.socket.on('USER_CONNECTED', (data)=>{
            this.setState({username:data.name})
        })
        this.socket.on('RECEIVE_MESSAGE', function(data){
            addMessage(data);
        });
        this.socket.on('UPDATE_CHAT',(data)=>{
            addUpdate(data)
        })
        const addUpdate=(data)=>{
            this.setState({messages: [...this.state.messages, data]});
        }
        const addMessage = data => {
            console.log(data);
            this.setState({messages: [...this.state.messages, data]});
            console.log(this.state.messages);
        }

        this.sendMessage = ev => {
            ev.preventDefault();
            this.socket.emit('SEND_MESSAGE', {
                author: this.state.username,
                message: this.state.message,
                room: this.state.room
            });
            this.setState({message: ''});
        }        
    }



    render() { 
        return (
           <div>
            <div>
                
            <h1 className="center">Main Chatroom </h1>
            <p>{this.state.username}</p>
                <div className="log-form2">
                    <input type="text" placeholder="message" value={this.state.message} onChange={ev=>this.setState({message: ev.target.value})} />
                    <br/>
                    <button onClick={this.sendMessage} className="btn">Send</button>
                </div>
            </div>
            <div className="log-form">
            {this.state.messages.map(message=>{
                return(
                    <div>{message.author}: {message.message}</div>
                )
            })}
            </div></div>
          );
    }

    

}
 
export default Chat;