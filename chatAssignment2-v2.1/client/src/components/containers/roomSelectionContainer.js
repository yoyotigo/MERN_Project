import React from "react";
import '../styles/chat.css';
import axios from "axios";

class RoomDisplayContainer extends React.Component {

    state={
        rooms:[]
    }
    componentDidMount(){
        axios.get('http://localhost:5000/api/room')
            .then(room=>{
                this.setState({rooms:room.data})
            })
    }
    render() { 
        const {rooms} = this.state
        let roomName=[]
        rooms.map(room=>{
            if(room.room !== 'Main'){
                return roomName.push(room.room)
            }
        })
        return (
            <div align='center'>
            {
                roomName.map((room, i)=>{
                    return <button key={i} onClick={this.props.onChangeValue} value={room}>{room}</button>
                })
            }
            </div>
          );
    }
}
 
export default RoomDisplayContainer;