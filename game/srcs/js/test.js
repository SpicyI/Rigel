import {io} from "socket.io-client";
// Get the input text element
const inputText = document.getElementById('input-text');

// Get the button element
const btn = document.getElementById('btn');

const par = document.getElementById('par');

const socket = io("http://10.14.5.8:3000");
socket.on("connect", ()=>{
	console.log(`connected with id: ${socket.id}`);
});

// game starter
const lobbyID = "6969";

socket.emit("join", lobbyID);

btn.addEventListener("click", ()=>{
    socket.emit("msg", inputText.value);
});

socket.on("joined", (data)=>{
    console.log(data);
});

socket.on("time", (data)=>{
    par.textContent = data + "\n";
});
