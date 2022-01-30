const User = ({ user, onSelectUser }) => {
    return (<div>
        <button onClick={() => onSelectUser(user)}> {user.username}  {user.self ? '(self)' : ''}</button>
    </div>);
}

export default User;