import React from "react";
class OnlineUsersContainer extends React.Component {

    render() { 
        return (
            <div>
                 <div>
                    ONLINE USERS
                </div>
                <div>
                    <ul>
                        {
                            this.props.online.map((user, i)=>{
                                return <li key={i}>{user}</li>
                            })
                        }
                    </ul>
                </div>
            </div>
          );
    }
}
 
export default OnlineUsersContainer;