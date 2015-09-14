// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "deps/phoenix_html/web/static/js/phoenix_html"

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

import socket from "./socket"

let rooms = ["general", "mix", "ecto", "plug", "elixir", "erlang"]

let Dashboard = React.createClass({
  configureChannel(channel) {
    channel.join()
      .receive("ok", () => { console.log(`Succesfully joined the ${this.state.activeRoom} chat room.`) })
      .receive("error", () => { console.log(`Unable to join the ${this.state.activeRoom} chat room.`) })
    channel.on("message", payload => {
      this.setState({messages: this.state.messages.concat([payload.body])})
    })
  },
  handleMessageSubmit(message) {
    this.state.channel.push("message", {body: message})
  },
  handleRoomLinkClick(room) {
    let channel = socket.channel(`topic:${room}`)
    this.setState({activeRoom: room, messages: [], channel: channel})
    this.configureChannel(channel)
  },
  getInitialState() {
    return {activeRoom: "general", messages: [], channel: socket.channel("topic:general")}
  },
  componentDidMount() {
    this.configureChannel(this.state.channel)
  },
  render() {
    return(
      <div>
        <RoomList onRoomLinkClick={this.handleRoomLinkClick} rooms={rooms}/>
        <ActiveRoom room={this.state.activeRoom} messages={this.state.messages} onMessageSubmit={this.handleMessageSubmit}/>
      </div>
    )
  }
})

let RoomList = React.createClass({
  render() {
    return (
      <div>
        {this.props.rooms.map(room => {
          return <span><RoomLink onClick={this.props.onRoomLinkClick} name={room} /> | </span>
        })}
      </div>
    )
  }
})

let RoomLink = React.createClass({
  handleClick() {
    this.props.onClick(this.props.name)
  },
  render() {
    return(
      <a style={{ cursor: "pointer"}} onClick={this.handleClick}>{this.props.name}</a>
    )
  }
})

let ActiveRoom = React.createClass({
  render() {
    return (
      <div>
        <span>Welcome to the {this.props.room} chat room!</span>
        <MessageInput onMessageSubmit={this.props.onMessageSubmit}/>
        <MessageList messages={this.props.messages}/>
      </div>
    )
  }
})

let MessageList = React.createClass({
  render() {
    return (
      <div>
        {this.props.messages.map(message => {
          return <Message data={message} />
        })}
      </div>
    )
  }
})

let Message = React.createClass({
  render() {
    return (
      <div>
        <div>{this.props.data.text}</div>
        <div>{this.props.data.date}</div>
      </div>
    )
  }
})

let MessageInput = React.createClass({
  handleSubmit(e) {
    e.preventDefault()
    let text = React.findDOMNode(this.refs.text).value.trim()
    let date = (new Date()).toLocaleTimeString()
    React.findDOMNode(this.refs.text).value = ""
    this.props.onMessageSubmit({text: text, date: date})
  },
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="text" ref="text"/>
      </form>
    )
  }
})

React.render(<Dashboard />, document.getElementById("dashboard"))
