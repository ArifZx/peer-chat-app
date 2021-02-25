// import Peer from "peerjs"
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

function inputMsg(){
  return document.getElementById("input-msg")
}

function inputAlert(){
  return document.getElementById("input-alert")
}

function CreateRoom() {
  console.log("Creating room")

  if (!checkIsConnected()) {
    return
  }

  inputMsg()?.classList.add("d-none")

  peer.on("connection", (c) => {
    if (conn) {
      c.close()
      return
    }
    inputAlert()?.remove()
    inputMsg()?.classList.remove("d-none")
    conn = c
    ReceiveMessage()
  })

  setChatRoomID(peerId);
  BeginChat()
}

function JoinRoom() {
  console.log("Join Room")

  if (!checkIsConnected()) {
    return
  }

  const destId = prompt("Room ID:")
  if (!destId) return

  inputAlert()?.remove()
  console.log("Trying connect to", destId)
  const dataConnection = peer.connect(destId, {
    reliable: true,
  })
  dataConnection.on("open", () => {
    alert
    other.peerId = destId
    setChatRoomID(destId)
    BeginChat()
  })

  conn = dataConnection
  ReceiveMessage()
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

function setChatRoomID(id) {
  document.getElementById("room-info").innerHTML = `${id}`
}


function createChat(text, sender = true, _peerId = peerId, now = Date.now()) {
  const id = `chat-${now}-${_peerId}`
  const message = document.createElement("div")
  message.classList.add("d-flex")
  message.classList.add(`justify-content-${sender? "end" : "start"}`)
  message.classList.add("mb-4")
  message.id = id;

  if(!sender) {
    const divImg = document.createElement("div")
    divImg.classList.add("img-cont-msg")
    const img = document.createElement("img")
    img.classList.add("rounded-circle")
    img.classList.add("user-img-msg")
    img.src = "//static.turbosquid.com/Preview/001292/481/WV/_D.jpg"
    divImg.appendChild(img)
    
    message.appendChild(divImg)
  }

  const container = document.createElement("div")
  container.innerHTML = text
  container.classList.add(`msg-cotainer${sender? "-send" : ""}`)
  const span = document.createElement("span")
  const date = new Date(now)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const day = date.getDay()
  const weekday = new Array(7);
      weekday[0]="Monday";
      weekday[1]="Tuesday";
      weekday[2]="Wednesday";
      weekday[3]="Thursday";
      weekday[4]="Friday";
      weekday[5]="Saturday";
      weekday[6]="Sunday";
  const today = new Date().getDay() === day ? "Today" : weekday[day]

  
  span.textContent = `${hours < 10 ? "0":""}${hours}:${minutes < 10 ? "0":""}${minutes}, ${today}`
  span.classList.add("msg-time")
  container.appendChild(span)

  message.appendChild(container)
  document.getElementById("msg-box")?.appendChild(message)

  return message
}

function dynamicChatRoom() {
  const chatRoom = document.getElementById("chat-card")
  chatRoom.style.height = `${window.innerHeight}px`
}
dynamicChatRoom()

function ShareRoom(){
  let cp = document.getElementById("copy");
  if(!cp) {
    const target = document.createElement("textarea")
    target.id = "copy"
    target.style.position = "absolute";
    target.style.left = "-9999px";
    target.style.top = "0"
    document.body.appendChild(target)
    cp = target;
  }
  
  cp.value = peerId;
  cp.focus();
  cp.setSelectionRange(0, cp.value.length)

  try {
    document.execCommand("copy")
    alert("Copied: " + cp.value)
  } catch (error) {
    
  }
}

function OnSendMessage(){
  const ele = document.getElementById("msg-text")
  let msg = ele?.value || ""

  if(!msg || !conn) {
    return;
  }
  msg = msg.replace(/\n\r?/g, "<br />")

  const chat = createChat(msg, true, peerId);
  SendMessageToOther(msg)
  chat.scrollIntoView()
  ele.value = ""
}

function SendMessageToOther(message) {
  if(!conn) {
    return;
  }
  conn.send([encodeURI(message), Date.now()])
}

function ReceiveMessage(){
  conn.on("data", (ev) =>{
    console.log(ev)
    createChat(decodeURI(ev[0]), false, other.peerId, ev[1])
  })
}

window.addEventListener("resize", (ev) => {
  dynamicChatRoom()
})