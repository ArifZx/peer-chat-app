// const Peer = require("peerjs")
let peerId = ""
let conn = null

// #region initialize
const { hostname, port, protocol } = location
const peer = new Peer("", {
  host: hostname,
  port: port || (protocol === "https:" ? 443 : 80),
  path: "/peerjs",
})
peer.on("open", (id) => (peerId = id))
peer.on("error", (err) => {
  alert("" + err)
  if (err.type === "") {
  }
})

function ping() {
  peer.socket.send({
    type: "ping",
  })
  setTimeout(ping, 16000)
}
ping()
// #endregion of initialize

function CreateRoom() {
  console.log("Creating room")
}

function JoinRoom() {}
