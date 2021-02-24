const Peer = require("peerjs")
let peerId = ""
let conn = null
const other = {
  peerId: "",
}

const CHAT_SECTION = "chat-room"
const MENU_SECTION = "menu"

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

  if (!checkIsConnected()) {
    return
  }

  peer.on("connection", (c) => {
    if (conn) {
      c.close()
      return
    }
    conn = c
    BeginChat()
  })
}

function JoinRoom() {
  console.log("Join Room")

  if (!checkIsConnected()) {
    return
  }

  const destId = prompt("Room ID:")
  if (!destId) return

  console.log("Trying connect to", destId)
  const dataConnection = peer.connect(destId, {
    reliable: true,
  })
  dataConnection.on("open", () => {
    alert
    other.peerId = destId
    BeginChat()
  })

  conn = dataConnection
}

function BeginChat() {
  showDisplay(MENU_SECTION, false)
  showDisplay(CHAT_SECTION)
}

function checkIsConnected(msg = "Servers are not connected") {
  !peerId && msg && alert(msg)
  return !!peerId
}

function toggleDisplay(id) {
  document.getElementById(id)?.classList.toggle("d-none")
}

function showDisplay(id, value = true) {
  const { classList } = document.getElementById(id) || {}

  if (!classList) {
    return
  }

  if (value) {
    classList.remove("d-none")
  } else if (!classList.contains("d-none")) {
    classList.add("d-none")
  }
}
