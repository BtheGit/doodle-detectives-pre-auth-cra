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
      myId: '', //TEMP until auth and persistent login (necessary for self-identifying in state updates)
      //If coming from newroom route, no id will be provided, default to empty string
      sessionId: this.props.match.params.id || '',
      clientColor: 'black',
      chatMessages: [],
      sessionState: {
        players: [],
        currentSessionStatus: '', //['isWaitingForPlayers', 'isWaitingToStart', 'isGameActive']
      },
      gameState: {}
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
    if(packet.type === 'setup_client') {
      //Handle user name/socket id/etc. here
      //Player color and such will be created later when game starts
      this.setState({
        sessionId: packet.payload.id, 
        clientColor: packet.payload.color,
        chatMessages: packet.payload.chatLog
      });
      console.log('Session:', this.state.sessionId)
    }
    else if(packet.type === 'temp_get_myid'){
      this.setState({myId: packet.id})
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
    else if(packet.type === 'session_state_update') {
      this.handleSessionStateUpdate(packet.sessionState);
    }
    else if(packet.type === 'game_state_update') {
      //set local isGameActive toggle here which will prevent drawing unless activePlayer is me
      this.handleGameStateUpdate(packet.gameState);
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

  handleSessionStateUpdate = sessionState => {
    //Do I need to filter local client out?
    // sessionState.players = sessionState.players.filter(player => player.id !== this.state.myId)
    this.setState({sessionState})
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

  emitVoteToBegin = () => {
    const packet = {
      type: 'vote_to_begin',
      clientId: this.state.myId
    }
    this.socket.emit('packet', packet);
  }

  //############### LIFECYCLE AND RENDER METHODS ####################
  componentDidMount = () => {
    this.setupSocket();
  }

  componentWillUnmount = () => {
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

  renderStatusDisplay() {
    const state = this.state.sessionState.currentSessionStatus; //for brevity
    const statusMessage = (state === 'isGameActive') ? 'Game Active' 
                        : (state === 'isWaitingToStart') ? 'Waiting to Begin'
                        : (state === 'isWaitingForPlayers') ? 'Waiting for Players'
                        : 'Waiting for Status';

    return(
      <div className='statusdisplay-container'>
        <div>{statusMessage}</div>
      </div>
    )
  }

  renderVoteToBegin() {
    return(
    <div className='statusdisplay-votetobegin-container'>
      <button onClick={}>Begin</button>
      <div>Vote 'Begin' to get this party started! Game will commence when all players vote.</div>
    </div>
    )
  }

  render() {
    return (
      <div id="room-container">
        {this.renderDrawingboard()}
        <div id="sidebar-container">
          {this.renderChatroom()}
          {this.renderStatusDisplay()}
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