import socket from "../socket";
import User from './user'
import Chats from "./chats";

import React, { Component } from 'react';
class MainPage extends Component {
  state = { users: [], user: {}, selectedUser: {}, usernameAlreadySelected: false, messages: [] }

  //handele socket.on event 
  componentDidMount() {
    console.log('componentDidMount');
    socket.on("connect", () => {
      this.state.users.forEach((user) => {
        if (user.self) {
          user.connected = true;
        }
      });
    });

    socket.on("disconnect", () => {
      this.state.users.forEach((user) => {
        if (user.self) {
          user.connected = false;
        }
      });
    });

    const initReactiveProperties = (user) => {
      user.connected = true;
      user.messages = [];
      user.hasNewMessages = false;
    };

    socket.on("users", (users) => {
      console.log("users", users);
      users.forEach((user) => {
        user.self = user.userID === socket.id;
        initReactiveProperties(user);
      });
      // put the current user first, and sort by username
      users.sort((a, b) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      });
      this.setState({ users })
    });

    socket.on("user connected", (user) => {
      initReactiveProperties(user);
      const { users } = this.state
      users.push(user);
      this.setState({ users })
    });

    socket.on("user disconnected", (id) => {
      const { users } = this.state

      for (let i = 0; i < users.length; i++) {
        const user = this.state.users[i];
        if (user.userID === id) {
          user.connected = false;
          break;
        }
      }
      this.setState({ users })
    });

    socket.on("private message", ({ content, from }) => {
      const { users, messages } = this.state
      debugger
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        if (user.userID === from) {
          messages.push({ ...user, message:content })
          user.messages.push({
            content,
            fromSelf: false,
          });
          if (user !== this.state.selectedUser) {
            user.hasNewMessages = true;
          }
          break;
        }
      }
      this.setState({ messages, users })
    });

  }
  //handele socket.off  
  componentWillUnmount() {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("users");
    socket.off("user connected");
    socket.off("user disconnected");
    socket.off("private message");
  }

  onMessage(content) {
    // debugger
    if (this.state.selectedUser.userID) {
      socket.emit("private message", {
        content,
        to: this.state.selectedUser.userID,
      });
      this.state.selectedUser.messages.push({
        content,
        fromSelf: true,
      });
    } else alert("select user")
  }
  onSelectUser = (user) => {
    console.log("onSelectUser user.username", user.username);
    const selectedUser = {
      ...user,
      hasNewMessages: false
    }
    this.setState({ selectedUser })
  }

  onUsernameSelection = (username, password, ptype) => {
    console.log("onUsernameSelection username", username);
    this.setState({ usernameAlreadySelected: true })
    const type = ptype ? ptype : 1
    socket.auth = { username, password, type };
    socket.connect();
  }

  handleChange = ({ currentTarget: input }) => {
    const user = { ...this.state.user };
    user[input.name] = input.value;
    this.setState({ user });
  };
  render() {
    // const { users, user } = this.state;
    return (
      <div>
        {/* <h1>main page</h1> */}
        <h4>User List # {this.state.users.length}</h4>
        {this.state.users.map(user => {
          return <User user={user} key={user.userID} onSelectUser={this.onSelectUser} />
        })}
        <Chats messages={this.state.messages} />
        <h4>chat message</h4>
        <input type="text" name="username" placeholder="user name" onChange={this.handleChange} />
        <input type="text" name="password" placeholder="password" onChange={this.handleChange} />
        <button onClick={() => this.onUsernameSelection(this.state.user.username)}>register</button>
        <button onClick={() => this.onUsernameSelection(this.state.user.username, this.state.user.password, 2)}>register as Admin</button>
        <br />
        <input type="text" name="message" placeholder="message" onChange={this.handleChange} />
        <button onClick={() => this.onMessage(this.state.user.message)}>send</button>
      </div>);
  }
}



export default MainPage;