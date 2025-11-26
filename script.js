const socket = io("http://localhost:3000");

// --- DOM Elements ---
const app = document.getElementById("app");
const loginScreen = document.getElementById("loginScreen");
const gameScreen = document.getElementById("gameScreen");

// Login
const usernameInput = document.getElementById("usernameInput");
const createGameBtn = document.getElementById("createGameBtn");
const joinGameBtn = document.getElementById("joinGameBtn");
const roomIdInput = document.getElementById("roomIdInput");

// Game Header
const timerDisplay = document.getElementById("timer");
const wordDisplay = document.getElementById("currentWord");
const roomIdDisplay = document.getElementById("roomIdDisplay");

// Main Content
const playerList = document.getElementById("playerList");
const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlayText");
const toolsBar = document.getElementById("toolsBar");
const colorBar = document.getElementById("colorBar");

// Tools
const brushTool = document.getElementById("brushTool");
const eraserTool = document.getElementById("eraserTool");
const clearTool = document.getElementById("clearTool");
const brushSizeInput = document.getElementById("brushSize");
const colorSwatches = document.querySelectorAll(".color-swatch");

// Chat
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");

// --- State ---
let gameId = "";
let username = "";
let isDrawer = false;
let drawing = false;
let currentColor = "#000000";
let currentSize = 5;
let isEraser = false;

// --- Initialization ---
function init() {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
}

function resizeCanvas() {
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
}

init();

// --- Login Logic ---
createGameBtn.onclick = () => {
    username = usernameInput.value.trim();
    if (!username) return alert("Please enter a nickname!");
    socket.emit("createGame", { username });
};

joinGameBtn.onclick = () => {
    username = usernameInput.value.trim();
    const id = roomIdInput.value.trim();
    if (!username || !id) return alert("Please enter nickname and Room ID!");
    socket.emit("joinGame", { gameId: id, username });
};

// --- Socket Events: Game State ---
socket.on("gameCreated", (data) => {
    gameId = data.gameId;
    enterGame();
});

socket.on("gameJoined", (data) => {
    gameId = data.gameId;
    enterGame();
    updateScores(data.scores);
});

socket.on("error", (msg) => alert(msg));

function enterGame() {
    loginScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    roomIdDisplay.textContent = `Room: ${gameId}`;
    resizeCanvas();
}

socket.on("updateScores", (scores) => {
    updateScores(scores);
});

function updateScores(scores) {
    playerList.innerHTML = "";
    Object.entries(scores).forEach(([name, score]) => {
        const li = document.createElement("li");
        li.className = "player-item";
        li.innerHTML = `
            <span class="name">${name}</span>
            <span class="score">${score} pts</span>
        `;
        playerList.appendChild(li);
    });
}

socket.on("newRound", (data) => {
    isDrawer = data.drawerId === socket.id;
    
    // Reset UI
    overlay.classList.add("hidden");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update Player List UI to show drawer
    document.querySelectorAll(".player-item").forEach(el => {
        el.classList.remove("is-drawer", "has-guessed");
        if (el.querySelector(".name").textContent === data.drawer) {
            el.classList.add("is-drawer");
        }
    });

    if (isDrawer) {
        toolsBar.classList.remove("hidden");
        colorBar.classList.remove("hidden");
        wordDisplay.textContent = "YOUR TURN TO DRAW!";
        addSystemMessage("It's your turn to draw!");
    } else {
        toolsBar.classList.add("hidden");
        colorBar.classList.add("hidden");
        // Show underscores for word
        wordDisplay.textContent = "_ ".repeat(data.wordLength);
        addSystemMessage(`${data.drawer} is drawing!`);
    }
});

socket.on("yourWord", (word) => {
    wordDisplay.textContent = word;
});

socket.on("timer", (time) => {
    timerDisplay.textContent = time;
    if (time <= 10) timerDisplay.style.color = "red";
    else timerDisplay.style.color = "var(--secondary)";
});

socket.on("roundEnd", (data) => {
    overlay.classList.remove("hidden");
    overlayText.innerHTML = `Round Over!<br>The word was: <span style="color:var(--secondary)">${data.word}</span><br>${data.reason}`;
    wordDisplay.textContent = data.word;
});

socket.on("gameOver", (data) => {
    gameScreen.classList.add("hidden");
    document.getElementById("leaderboardScreen").classList.remove("hidden");
    
    const finalScores = document.getElementById("finalScores");
    finalScores.innerHTML = "";
    
    // Sort scores
    const sortedScores = Object.entries(data.scores).sort(([,a], [,b]) => b - a);
    
    sortedScores.forEach(([name, score], index) => {
        const div = document.createElement("div");
        div.className = "leaderboard-item";
        div.innerHTML = `
            <span class="rank">#${index + 1} ${name}</span>
            <span class="score">${score} pts</span>
        `;
        finalScores.appendChild(div);
    });
});

// --- Drawing Logic ---
function startDraw(e) {
    if (!isDrawer) return;
    drawing = true;
    draw(e);
}

function stopDraw() {
    drawing = false;
    ctx.beginPath(); // Reset path to avoid connecting lines
}

function draw(e) {
    if (!drawing || !isDrawer) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    // Local draw
    ctx.lineWidth = currentSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = isEraser ? "#ffffff" : currentColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Emit
    socket.emit("draw", {
        x: x / canvas.width, // Normalize coordinates
        y: y / canvas.height,
        color: isEraser ? "#ffffff" : currentColor,
        size: currentSize,
        isEraser
    });
}

// Event Listeners for Drawing
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDraw);
canvas.addEventListener("mouseout", stopDraw);

canvas.addEventListener("touchstart", (e) => { e.preventDefault(); startDraw(e); });
canvas.addEventListener("touchmove", (e) => { e.preventDefault(); draw(e); });
canvas.addEventListener("touchend", stopDraw);

// --- Chat Logic ---
chatInput.onkeypress = (e) => {
    if (e.key === "Enter") {
        const msg = chatInput.value.trim();
        if (!msg) return;
        socket.emit("chatMessage", { msg, username });
        chatInput.value = "";
    }
};

socket.on("chatMessage", (data) => {
    addMessage(data.username, data.msg);
});

socket.on("correctGuess", (data) => {
    addSystemMessage(`${data.username} guessed the word!`, "correct");
    // Highlight player
    document.querySelectorAll(".player-item").forEach(el => {
        if (el.querySelector(".name").textContent === data.username) {
            el.classList.add("has-guessed");
        }
    });
});

function addMessage(user, msg) {
    const div = document.createElement("div");
    div.className = "chat-msg";
    div.innerHTML = `<strong>${user}:</strong> ${msg}`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addSystemMessage(msg, type = "system") {
    const div = document.createElement("div");
    div.className = `chat-msg ${type}`;
    div.textContent = msg;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}
