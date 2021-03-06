import React from "react";
import io from "socket.io-client";
import '../styles/chat.css';
import SendMessageContainer from '../containers/sendMessageContatiner'
import DisplayMessageContainer from '../containers/displayMessageContainer'
class Political extends React.Component {
    
    constructor(props){
        super(props);

        this.state = {
            username: '',
            author:'',
            message: '',
            messages: [],
            error:'',
            isTyping:false,
            room:'Political Room'
        };
        this.socket = io('localhost:5000');

        this.socket.on('USER_CONNECTED', (data)=>{
            this.setState({username:data})
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
                author: this.props.user,
                message: this.state.message,
                room: this.state.room
            });
            this.setState({message: ''});
        }        

    }



    render() { 
        return (
            <div>
            <h1 className="center">Political Chatroom </h1>
            <DisplayMessageContainer  messages={this.state.messages} /> 
            <SendMessageContainer message={this.state.message} change={ev=>this.setState({message: ev.target.value})} send={this.sendMessage}/>            
            </div>
          );
    }
}
 
export default Political;