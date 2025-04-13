const socket = io();

const chess = new Chess();

const boardElement = document.querySelector(".chessboard");
const turn = document.querySelector(".turn");
const button = document.querySelector("button");



button.addEventListener("click",function () {
    window.location.href="http://localhost:3000/changeBoard"
})

let dragPiece = null;
let sourceSquare = null;
let playerRole = null;
let checkMateSquare = null;
let checkSquare = null;
let winner=null;
const renderBoard = () => {
  const board = chess.board();

  boardElement.innerHTML = "";

  board.forEach((row, rowIndex) => {
    row.forEach((square, sqaureIndex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        (rowIndex + sqaureIndex) % 2 === 0 ? "light" : "dark"
      );

      squareElement.dataset.row = rowIndex;
      squareElement.dataset.col = sqaureIndex;

      if(checkMateSquare && checkMateSquare.row==rowIndex && checkMateSquare.col==sqaureIndex){
          squareElement.classList.add("checkmate");
      }
      else if(checkSquare && checkSquare.row==rowIndex && checkSquare.col==sqaureIndex){
        squareElement.classList.add("check");
      }
      

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceElement.innerText = getPieceUnicode(square);
        pieceElement.draggable = playerRole === square.color;
        
        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            dragPiece = pieceElement;
            sourceSquare = { row: rowIndex, col: sqaureIndex };
            e.dataTransfer.setData("text/plain", "");
          }
        });
        pieceElement.addEventListener("dragend", (e) => {
          dragPiece = null;
          sourceSquare = null;
        });
        squareElement.appendChild(pieceElement);

        if(winner!=null){
            // pieceElement.innerText="";
            if(winner=="b"){
                turn.innerText=`♛ wins!`
            }
            else{
                const span = document.createElement("span");
                span.innerText = "♕";
                span.style.color = "white";
            
                turn.innerText = ""; // Clear previous content
                turn.appendChild(span);
                turn.append(" wins!");
            }
          }
      }
      squareElement.addEventListener("dragover", function (e) {
        e.preventDefault();
      });
      squareElement.addEventListener("drop", function (e) {
        e.preventDefault();
        if (dragPiece) {
          const targetSource = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
          };
          handleMove(sourceSquare, targetSource);
        }
      });
      boardElement.appendChild(squareElement);
    });
  });
  if (playerRole === "b") {
    boardElement.classList.add("flipped");
  } else {
    boardElement.classList.remove("flipped");
  }
};

const handleMove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
    promotion: "q",
  };

  socket.emit("move", move);
};

const getPieceUnicode = (piece) => {
  const unicodePieces = {
    p: "\u265F",
    r: "♜",
    n: "♞",
    b: "♝",
    q: "♛",
    k: "♚",
    P: "\u2659",
    R: "♖",
    N: "♘",
    B: "♗",
    Q: "♕",
    K: "♔",
  };
  return unicodePieces[piece.type] || "";
};
socket.on("playerRole", function (role) {
  playerRole = role;
  renderBoard();
});

socket.on("spectatorRole", function () {
  playerRole = null;
  renderBoard();
});

socket.on("boardState", function (fen) {
  chess.load(fen);
  renderBoard();
});
socket.on("move", function (move) {
  chess.move(move);
  renderBoard();
});

socket.on("checkMateStatus", function (isCheckmate) {
    const board = chess.board();
  if (isCheckmate) {
    const kingColor = chess.turn();
    winner = (kingColor==="w")?"b":"w";
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        let piece = board[row][col];
        if (piece && piece.type === "k" && piece.color == kingColor) {
          checkMateSquare = { row, col };
          break;
        }
      }
    }
  }
});


socket.on("checkStatus",function (inCheck) {
    const board = chess.board();
  if (inCheck) {
    const kingColor = chess.turn();
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        let piece = board[row][col];
        if (piece && piece.type === "k" && piece.color == kingColor) {
          checkSquare = { row, col };
          break;
        }
      }
    }
  }
  else{
    checkSquare=null;
  }
  renderBoard();
})

socket.on("currentPlayer", function (currentPlayer) {
  
    const piece = document.createElement("span");
    piece.innerText = currentPlayer === "w" ? "\u2659" : "\u265F";
    piece.style.color = currentPlayer === "w" ? "white" : "black";
  
    turn.innerText = "Turn: ";
    turn.appendChild(piece);
    renderBoard();
  });

    
  let color = {};
  const colorId = localStorage.getItem("boardTheme") || "green";
      if(colorId=="grey"){
           color = {
              light:"#ffffff",
              dark:"#999999"
          }
      }
      else if(colorId=="blue"){
           color = {
              light:"#9acdff",
              dark:"#006699"
          }
      }
      else if(colorId=="orange"){
           color = {
              light:"#f0d9b5",
              dark:"#b58863"
          }
      }
      else if(colorId=="green"){
           color = {
              light:"#eeeed2",
              dark:"#769656"
          }
      }
  
      document.documentElement.style.setProperty('--light', color.light);
      document.documentElement.style.setProperty('--dark', color.dark);
renderBoard();
