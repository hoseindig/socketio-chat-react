const Chats = ({ users }) => {
    return (<div>
        {users.map(user => {
            return <p key={user.userID}>{user.username} :
                {user.messages.map(msg => {
                    return <p>{msg.content}</p>
                })}

            </p>
        })}


    </div>);
}

export default Chats;