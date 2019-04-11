import React from "react";
import '../styles/chat.css';
import axios from "axios";

class RoomDisplayContainer extends React.Component {
    constructor(props){
        super(props)
        this.roomChange=this.roomChange.bind(this)
    }
    state={
        rooms:[]
    }
    componentDidMount(){
        axios.get('http://localhost:5000/api/room')
            .then(room=>{
                this.setState({rooms:room.data})
            })
    }
    roomChange(a){
        console.log(a)
    }
    render() { 
        const {rooms} = this.state
        let roomName=[]
        rooms.map(room=>{
            if(room.room !== 'main'){
                return roomName.push(room.room)
            }
        })
        return (
            <div align='center'>
            {
                roomName.map((room, i)=>{
                    return <button key={i} onClick={()=>this.roomChange({room})}>{room}</button>
                })
            }
            </div>
          );
    }
}
 
export default RoomDisplayContainer;