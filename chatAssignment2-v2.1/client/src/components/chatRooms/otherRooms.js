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
            room:'',
            currentRoom:'Main'
        };

        this.socket = io('localhost:5000');
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
        const {room, currentRoom} = this.state
        let display1;
        let display2
        let socket = io('localhost:5000');
        this.handleRoom = e =>{ 
            this.setState({room:e.target.value})
            e.persist()
            setTimeout(()=>{
                this.handleRoomChange(e.target.value)
            }, 1)
        }
        this.handleRoomChange=(ro)=>{
            if(ro!==currentRoom){
                socket.emit('SWITCHED_ROOM',{
                    user:this.props.user,
                    current:currentRoom,
                    new:ro
                })
                this.setState({currentRoom:ro})
                alert('Switched to ' + ro +' Room')
            }else{
                alert('Currently in '+ currentRoom +' Room' )                
            }
        }
        if(!room){
            display1=<h3 align="center">Choose a Room</h3>
        }else{
            display1=<DisplayMessageContainer  messages={this.state.messages} />
            display2=<SendMessageContainer message={this.state.message} change={ev=>this.setState({message: ev.target.value})} send={this.sendMessage}/> 
        }
        return (
            <div>
            <h1 align="center">{room} Chatroom</h1>
            <RoomSelectionContainer value={this.state.room} onChangeValue={this.handleRoom}/> 
            <div>
               {display1}
               {display2}
           </div>
                
                  
              
               
            </div>
          );
    }
}
 
export default OtherRooms;