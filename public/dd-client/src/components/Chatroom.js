import React, { Component } from 'react';

export default class Chatroom extends Component {
  constructor(props) {
    super()
    this.state = {
      chatInputValue: '',
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChatInput = this.handleChatInput.bind(this)
  }

  handleChatInput(e) {
    this.setState({chatInputValue: e.target.value})
  }

  handleSubmit(e)  {
    e.preventDefault();
    this.props.emitChatMessage(this.state.chatInputValue);
    this.setState({chatInputValue: ''})
  }

  renderChatDisplay() {
    return(
      <ChatOutput 
        messages = {this.props.messages}
      />
    )

  }

  renderChatInput() {
    return(
      <form id="chat-input" onSubmit={this.handleSubmit}>
        <input 
          id="message-box" 
          autoComplete="off"
          value={this.state.chatInputValue} 
          onChange={this.handleChatInput}
        />
      </form>        
    )
  }

  render() {
    return(
      <div id="chat-container">
        {this.renderChatDisplay()}
        {this.renderChatInput()}
      </div>    
    )
  }
}

const ChatOutput = (props) => {
  return (
    <div id="chat-display">
      {props.messages.map((message, index) => {
        return (
          <div className='chat-message' key={index}>
            <span className='chat-message-name'>{message.name}:</span> {message.content}
          </div>
        )
      })}
    </div>    
  )
}
