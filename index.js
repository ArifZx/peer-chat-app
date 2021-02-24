const express = require("express")
const { ExpressPeerServer } = require("peer")

const app = new express()

app.use(express.static("./public"))

app.set("view engine", "pug")
app.set("views", "./views")

app.route("/").get(function (req, res) {
  res.render("layout")
})

const port = process.env.PORT
const srv = app.listen(port, function () {
  console.log("Listening on " + port)
})

app.use(
  "/peerjs",
  ExpressPeerServer(srv, {
    debug: true,
  }),
)
