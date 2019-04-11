import React from "react";
import io from "socket.io-client";
import '../styles/chat.css';
import SendMessageContainer from '../containers/sendMessageContatiner'
import DisplayMessageContainer from '../containers/displayMessageContainer'
import RoomSelectionContainer from '../containers/roomSelectionContainer'

class OtherRooms extends React.Component {
    
    constructor(props){
        super(props);

        this.state = {
            username: '',
            author:'',
            message: '',
            messages: [],
            error:'',
            isTyping:false,
            rooms:[]
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
        this.logout=()=>{
            this.socket.emit('LOGOUT')
            this.setState({user:null})
        }

    }
    render() { 
        return (
            <div>
            <h1 className="center">Chatroom </h1>
            <RoomSelectionContainer/>
            <DisplayMessageContainer  messages={this.state.messages} /> 
            <SendMessageContainer message={this.state.message} change={ev=>this.setState({message: ev.target.value})} send={this.sendMessage}/>            
            </div>
          );
    }
}
 
export default OtherRooms;