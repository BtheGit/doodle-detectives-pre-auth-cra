import React, { Component } from 'react';
import Chatroom from './Chatroom.js';
import Drawingboard from './Drawingboard.js';
import io from 'socket.io-client';

//For now, I will handle all server communication and global state from here
//Could potentially be pushed off to redux and middleware later
export default class Room extends Component {
  constructor() {
    super();
    this.socket = null;
    this.state = {
      socketId: '',
      clientName: '',
      clientColor: 'black',
      chatMessages: [],
    }
  }

  //################ SOCKET METHODS #####################

  //Initiate Socket Connection
  setupSocket() {
    this.socket = io('/gameroom');
    this.socket.on('connect', () => {
      console.log('Connected')
    });
    this.socket.on('packet', this.handleSocketMessages)
  }

  //Socket Handlers
  handleSocketMessages = packet => {
    console.log('Packet Received')
    if(packet.type === 'client_setup') {
      //Handle user name/socket id/etc. here
      //Player color and such will be created later when game starts
      this.setState({
        socketId: packet.payload.id,
        clientName: packet.payload.name
      })
    }
    else if(packet.type ==='chat_message') {
      this.handleChatMessage(packet.payload);
    }
    else if(packet.type === 'path') {
      this.handlePath(packet.payload);
    }
  }

  handleChatMessage = message => {
    this.setState({chatMessages: [...this.state.chatMessages, message]})
  }

  //TODO: For now I will use this hack to access the child component method
  handlePath = path => {
    this.drawingboard.drawPath(path)
  }

  //Socket Emitters
  emitChatMessage = content => {
    const packet = {
      type: 'chat_message',
      payload: {
        name: this.state.clientName,
        id: this.state.socketId,
        time: Date.now(),
        content
      }
    };

    this.socket.emit('packet', packet);
  }

  emitPath = path => {
    const packet = {
      type: 'path',
      payload: path
    };
    this.socket.emit('packet', packet);
  }

  //############### LIFECYCLE AND RENDER METHODS ####################
  componentDidMount = () => {
    this.setupSocket();
  }

  renderDrawingboard() {
    return (
      <Drawingboard 
        onRef = {ref => (this.drawingboard = ref)}
        emitPath = {this.emitPath}
        clientColor = {this.state.clientColor}
        clientId = {this.state.socketId}
      />
    )
  }

  renderChatroom() {
    return (
      <Chatroom 
        messages = {this.state.chatMessages}
        emitChatMessage = {this.emitChatMessage}
      />     
    )
  }

  render() {
    return (
      <div id="room-container">
        {this.renderDrawingboard()}
        <div id="sidebar-container">
          {this.renderChatroom()}
        </div>        
      </div>
    );
  }
}