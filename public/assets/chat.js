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

function setupAttachBtn(){
  const fileMsg = document.getElementById('msg-file')
  const attachBtn = document.getElementById('attach-btn')

  attachBtn.onclick = () => {
    fileMsg.click()
  }

 fileMsg.onchange = () => {
   OnSendMessageFile(fileMsg);
 }
}

setupAttachBtn();

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
    setTimeout(() => {
      SendMessageToOther(`ID: ${getDeviceID()}`)
    }, 1000)
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
    SendMessageToOther(`ID: ${getDeviceID()}`)
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


function createTextChat(text, sender = true, _peerId = peerId, now = Date.now()) {
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
  span.textContent = generateDateText(now)
  span.classList.add("msg-time")
  container.appendChild(span)

  message.appendChild(container)
  document.getElementById("msg-box")?.appendChild(message)

  return message
}

function createFileChat(data, sender = true, _peerId= peerId, now = Date.now()) {
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
  const {file, type, name} = data;
  const bytes = new Uint8Array(file)
  const dataEncoded = encodeFile(bytes);
  if(type.includes('image')) {
    const imgData = document.createElement('img')
    imgData.classList.add('msg-image')
    imgData.src = 'data:image/png;base64,' + dataEncoded
    imgData.alt = name
    container.appendChild(imgData)
  } else if(type.includes('video')){
    const videoData = document.createElement('video')
    videoData.classList.add('msg-video')
    videoData.src = 'data:video/mp4;base64,' + dataEncoded
    container.appendChild(videoData)
    videoData.controls = true;
  } else if(type.includes('audio')) {
    const audioData = document.createElement('audio')
    audioData.src = `data:audio/mp3;base64,${dataEncoded}`
    container.appendChild(audioData)
    audioData.controls = true;
  }else {
    const itemDownload = document.createElement('a')
    itemDownload.innerHTML = name
    itemDownload.href = `data:application/octet-stream;base64,${dataEncoded}`
    itemDownload.download = name
    container.appendChild(itemDownload)
  }

  container.classList.add(`msg-cotainer${sender? "-send" : ""}`)

  const span = document.createElement("span")
  span.textContent = generateDateText(now)
  span.classList.add("msg-time")
  container.appendChild(span)

  message.appendChild(container)
  document.getElementById("msg-box")?.appendChild(message)

  return message
}

function generateDateText(now = Date.now()) {
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

  
  return `${hours < 10 ? "0":""}${hours}:${minutes < 10 ? "0":""}${minutes}, ${today}`
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

  const chat = createTextChat(msg, true, peerId);
  SendMessageToOther(msg)
  chat.scrollIntoView()
  ele.value = ""
}

async function OnSendMessageFile(fileMsg) {
  const {files} = fileMsg || {}

  if(!files || files.length <= 0) {
    return
  }

  const file = files[0]
  const {type, name} = file
  const blob = new Blob(files, {type})


  const chat = createFileChat({
    file: await blob.arrayBuffer(),
    name,
    type,
  })
  SendMessageToOther({file: blob, name}, type)
  chat.scrollIntoView()
}

function SendMessageToOther(data, type = 'text') {
  if(!conn) {
    return;
  }

  if(type === 'text') {
    conn.send([type, encodeURI(data), Date.now()])
  } else {
    const {file, name} = data;
    conn.send([type, file, name, Date.now()])
  }
}

function ReceiveMessage(){
  conn.on("data", (ev) =>{
    const type = ev[0] || '';

    if (type === 'text') {
      createTextChat(decodeURI(ev[1]), false, other.peerId, ev[2])
    } else if (type) {
      createFileChat({
        file: ev[1],
        name: ev[2],
        type
      }, false, other.peerId, ev[3])
    }
 
  })
}

function encodeFile(input) {
  const keyStr =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  let output = ''
  let chr1, chr2, chr3, enc1, enc2, enc3, enc4
  let i = 0
  while (i < input.length) {
    chr1 = input[i++]
    chr2 = i < input.length ? input[i++] : Number.NaN // Not sure if the index
    chr3 = i < input.length ? input[i++] : Number.NaN // checks are needed here
    enc1 = chr1 >> 2
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
    enc4 = chr3 & 63
    if (isNaN(chr2)) {
      enc3 = enc4 = 64
    } else if (isNaN(chr3)) {
      enc4 = 64
    }
    output +=
      keyStr.charAt(enc1) +
      keyStr.charAt(enc2) +
      keyStr.charAt(enc3) +
      keyStr.charAt(enc4)
  }
  return output
}

window.addEventListener("resize", (ev) => {
  dynamicChatRoom()
})