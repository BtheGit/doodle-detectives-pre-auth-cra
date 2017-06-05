import React, { Component } from 'react';
import Room from './components/Room.js'
import './App.css';

class App extends Component {
  render() {
    return (
      <Room />
    );
  }
}

export default App;


// class Game extends Component {
//   constructor() {
//     super();
//   }

//   render() {
//     return (
//       <div>
//         <h1>Game</h1>
//         <Player 
//           player = {{
//                       'id': 1,
//                       'name': 'Brendan'
//                     }}
//         /> 
//       </div>
//     );
//   }
// }

// class Player extends Component {
//   constructor(props) {
//     super();
//     this.state = {
//       id: props.player.id,
//       name: props.player.name,
//       color: '',
//       score: 0,
//       path1: [],
//       path2: []
//     }
//   }

//   render() {
//     return (
//       <div>
//         <h1>Player</h1>
//         <h3>{this.state.name}</h3>
//       </div>      
//     );
//   }
// }
