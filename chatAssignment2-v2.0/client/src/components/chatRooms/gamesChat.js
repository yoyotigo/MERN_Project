import React from "react";
import io from "socket.io-client";

class Games extends React.Component {
    
    constructor(props){
        super(props);

        this.state = {
            username: '',
            message: '',
            messages: [],
            error:'',
            room:'Games Room'
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
            this.socket.emit('NEW_USER', this.state.username,(data)=>{
                if(!data){
                    this.setState({error: 'That username is already taken! Please Try Again.'})
                }else{
                    this.setState({error: ''})
                }
            })
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
                    Games Chat

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
 
export default Games;