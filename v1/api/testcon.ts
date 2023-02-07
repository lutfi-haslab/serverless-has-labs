import { io } from "socket.io-client";

var socket = io('ws://localhost:3000')

socket.emit("chat message", "Halo guyss test yaa")

setInterval(() => {
  socket.emit("/sendfn", {id: "63e06217d7a2c4233e9a5adb", fn: "callApi", name: "user"})
}, 1000)
