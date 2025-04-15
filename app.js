import express from 'express';
import { Server } from "socket.io";
import http from "http";
import { Chess } from 'chess.js';
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);
dotenv.config();
const chess = new Chess();
let players = {};
let currentPlayer = "w";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
    res.render("index");
});

app.get("/changeBoard", function (req, res) {
    res.render("changeBoard");
});


io.on("connection",function (socket) {
console.log("connected"); 
if(!players.white){
    players.white=socket.id;
    socket.emit("playerRole","w")
}
else if(!players.black){
    players.black=socket.id;
    socket.emit("playerRole","b");
}
else{
    socket.emit("spectatorRole")
}


socket.on("disconnect",function () {
    if(socket.id === players.white){
        delete players.white;
    }
    else if(socket.id === players.black){
        delete players.black;
    }
})

socket.on("move",function (move) {
    console.log(move);
    
    try{
        if(chess.turn()=="w" && socket.id!==players.white)return;
        if(chess.turn()=="b" && socket.id!==players.black)return;

       const result = chess.move(move);
       if(result){
        currentPlayer = chess.turn();
        console.log(currentPlayer);
        
        io.emit("move",move);
        io.emit("boardState",chess.fen());
        io.emit("checkMateStatus",chess.isCheckmate())
        io.emit("checkStatus",chess.inCheck())
        io.emit("currentPlayer",currentPlayer)
        
       }
       else{
        console.log("Something went wrong");
        socket.emit("Invalid move ",move);
        
       }
    }
    catch(e){
        console.log("error: ",e);
        socket.emit("Invalid move: ",move);
    }
})

socket.on("requestBoardState", () => {
    socket.emit("boardState", chess.fen());
  });


})




const PORT = process.env.PORT || 5000;

server.listen(PORT, function () {
    console.log(`Server started at ${PORT}`);
});
