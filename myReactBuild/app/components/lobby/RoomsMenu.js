import React, { Component } from 'react';
import { Link } from 'react-router-dom';

const RoomsMenu = ({activeRooms}) => {

	const showRooms = () => {
		return	activeRooms.map((room, index) => {
			return (
				<div className="roomsmenu-room" key={index}>
					<div className="roomsmenu-room-players">
						{room.clients.map((player, index) => <div key={index}>{player}</div>)}
					</div>
					<div className="roomsmenu-room-link">
						<Link to={'/room/' + room.sessionId}>Join</Link>
					</div>
				</div>
			)
		})
	}

	const showEmpty = () => {
		return (
			<div>No Active Rooms</div>
		)
	}

	return (
		<div className='roomsmenu'>
			{activeRooms.length > 0 ? showRooms() : showEmpty()}
		</div>
	)
}

export default RoomsMenu;