import React from "react";
class RoomSelectionContainer extends React.Component {

    render() { 
        return (
            <div>
                <div>
                    Chat Rooms
                </div>
                <div>
                    <ul>
                        <div>
                            <div id='rooms'>
                                {
                                    this.props.rooms.map((room, i)=>{
                                        return <li><button key={i} onClick={this.props.onChangeValue} value={room}>{room}</button></li>
                                    })
                                }
                            </div>
                        </div>
                    </ul>
                </div>
            </div>
          );
    }
}
 
export default RoomSelectionContainer;