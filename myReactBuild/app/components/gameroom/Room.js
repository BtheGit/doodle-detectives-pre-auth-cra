import React, { Component } from 'react';
import Chatroom from './Chatroom.js';
import Drawingboard from './Drawingboard.js';
import io from 'socket.io-client';
import { connect } from 'react-redux';

//For now, I will handle all server communication and global state from here
//Could potentially be pushed off to redux and middleware later
class Room extends Component {
  constructor(props) {
    super(props);
    this.socket = null;
    this.state = { 
      socketId: '',
      //If coming from newroom route, no id will be provided, default to empty string
      sessionId: this.props.match.params.id || '',
      clientColor: 'black',
      chatMessages: [],
      playerList: [],
    }
  }

  //################ SOCKET METHODS #####################

  //Initiate Socket Connection
  setupSocket() {
    this.socket = io('/gameroom');
    this.socket.on('connect', () => {
      this.socket.emit('setup_client', {
        socket: this.socket.id,
        name: this.props.playerName,
        sessionId: this.state.sessionId
      })
    });
    this.socket.on('packet', this.handleSocketMessages)
  }

  //Socket Handlers
  handleSocketMessages = packet => {
    console.log('Packet Received')
    if(packet.type === 'setup_session') {
      //Handle user name/socket id/etc. here
      //Player color and such will be created later when game starts
      this.setState({
        sessionId: packet.payload.id, 
        clientColor: packet.payload.color
      });
      console.log('Session:', this.state.sessionId)
      console.log('Color:', packet.payload.color, this.state.clientColor)
    }
    else if (packet.type === 'broadcast_session') {
      this.handleSessionUpdate(packet.clients)
    }
    else if(packet.type ==='chat_message') {
      this.handleChatMessage(packet.payload);
    }
    else if(packet.type === 'path') {
      this.handlePath(packet.payload);
    }
  }

  //Handle new remote clients joining session or leaving session
  //Create a filtered list of remote peers
  //TODO? Can add more player state info through this function if needed later
  handleSessionUpdate = clients => {
    const myId = clients.self;
    const peers = clients.players.filter(player => player.id !== myId)
    this.setState({playerList: peers})
    console.log('Playerlist updated', this.state.playerList)
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
        name: this.props.playerName,
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

  componentWillUnmount() {
    this.socket.disconnect();
  }

  renderDrawingboard() {
    return (
      <Drawingboard 
        playerName={this.props.playerName}
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

const mapStateToProps = (state) => {
  return {
    playerName: state.gameReducer.playerName
  }
}

export default connect(mapStateToProps)(Room);