const User = ({ user, onSelectUser }) => {
    return (<div>
        <button onClick={() => onSelectUser(user)}> {user.username}  {user.self ? '(self)' : ''}   {user.isAdmin ? 'Admin' : ''}</button>
    </div>);
}

export default User;