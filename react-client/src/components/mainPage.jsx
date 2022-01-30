import socket from "../socket";
import User from './user'
import Chats from "./chats";

import React, { Component } from 'react';
class MainPage extends Component {
  state = { users: [], user: {}, selectedUser: {}, usernameAlreadySelected: false }

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
      this.state.users.push(user);
    });

    socket.on("user disconnected", (id) => {
      for (let i = 0; i < this.state.users.length; i++) {
        const user = this.state.users[i];
        if (user.userID === id) {
          user.connected = false;
          break;
        }
      }
    });

    socket.on("private message", ({ content, from }) => {
      for (let i = 0; i < this.state.users.length; i++) {
        const user = this.state.users[i];
        if (user.userID === from) {
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

  onUsernameSelection = (username) => {
    console.log("onUsernameSelection username", username);
    this.setState({ usernameAlreadySelected: true })
    socket.auth = { username };
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
        <h1>main page</h1>
        <h4>User List # {this.state.users.length}</h4>
        {this.state.users.map(user => {
          return <User user={user} key={user.userID} onSelectUser={this.onSelectUser} />
        })}
        <Chats users={this.state.users} />
        <h1>chat message</h1>
        <input type="text" name="username" placeholder="user name" onChange={this.handleChange} />
        <button onClick={() => this.onUsernameSelection(this.state.user.username)}>register</button>
        <br />
        <input type="text" name="message" placeholder="message" onChange={this.handleChange} />
        <button onClick={() => this.onMessage(this.state.user.message)}>send</button>
      </div>);
  }
}



export default MainPage;