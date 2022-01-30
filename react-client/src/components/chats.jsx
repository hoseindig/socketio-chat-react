const Chats = ({ messages,users }) => {
    return (<div>
        {messages.map(message=>{
            return <p> from {message.username} say: {message.message}</p>
        })}
        {/* {users.map(user => {
            return <p key={user.userID}>{user.username} :
                {user.messages.map(msg => {
                    return <p>{msg.content}</p>
                })}

            </p>
        })} */}


    </div>);
}

export default Chats;