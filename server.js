const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const path = require('path');

const app = express();
app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Serve index.html for any unknown routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity in local dev
        methods: ["GET", "POST"]
    }
});

const WORDS = [
    "apple", "banana", "cherry", "dog", "elephant", "fish", "guitar", "house", "ice cream", "jellyfish",
    "kite", "lion", "monkey", "nest", "orange", "penguin", "queen", "rabbit", "snake", "tree",
    "umbrella", "violin", "whale", "xylophone", "yacht", "zebra", "airplane", "ball", "cat", "drum",
    "egg", "flower", "grapes", "hat", "igloo", "jacket", "key", "lamp", "moon", "nose",
    "owl", "pencil", "quilt", "robot", "sun", "table", "unicorn", "vase", "watch", "x-ray",
    "yo-yo", "zipper", "ant", "bear", "car", "duck", "ear", "frog", "goat", "hand",
    "island", "juice", "kangaroo", "lemon", "mouse", "nut", "octopus", "pig", "question", "rain",
    "star", "train", "ufo", "volcano", "water", "box", "yarn", "zoo", "bed", "cow",
    "door", "fan", "glass", "horse", "ink", "jar", "king", "leaf", "map", "net"
];

class Room {
    constructor(id) {
        this.id = id;
        this.players = {}; // socketId -> { username, score, isDrawer }
        this.currentDrawer = null;
        this.currentWord = "";
        this.roundActive = false;
        this.timer = null;
        this.timeLeft = 0;
        this.roundTime = 60; // seconds
        
        // Game Loop State
        this.maxRounds = 3;
        this.currentRound = 1;
        this.turnsPerRound = 3; // Each player draws 3 times per round
        this.roundDrawCounts = {}; // socketId -> count
        this.usedWords = new Set(); // Track used words to avoid repetition

        // Drawing History
        this.drawHistory = []; // Array of strokes (each stroke is array of points)
        this.redoStack = [];
        this.currentStroke = [];
    }

    addPlayer(socketId, username) {
        this.players[socketId] = {
            username,
            score: 0,
            isDrawer: false
        };
        // Initialize draw count if new player joins mid-game (optional handling)
        if (!this.roundDrawCounts[socketId]) {
            this.roundDrawCounts[socketId] = 0;
        }
    }

    removePlayer(socketId) {
        delete this.players[socketId];
        delete this.roundDrawCounts[socketId];
        
        // If drawer left, end round or assign new drawer
        if (this.currentDrawer === socketId) {
            this.endRound("Drawer left!");
        }
        // If room empty, it will be cleaned up by GameManager
    }

    startRound() {
        if (this.roundActive) return;
        
        const playerIds = Object.keys(this.players);
        if (playerIds.length < 2) {
            io.to(this.id).emit('gameInfo', "Waiting for more players...");
            return;
        }

        // Check if all players have drawn 'turnsPerRound' times
        const availableDrawers = playerIds.filter(id => {
            return (this.roundDrawCounts[id] || 0) < this.turnsPerRound;
        });
        
        if (availableDrawers.length === 0) {
            // Round Complete (everyone drew 3 times)
            this.currentRound++;
            
            // Reset counts for next round
            playerIds.forEach(id => this.roundDrawCounts[id] = 0);
            
            if (this.currentRound > this.maxRounds) {
                this.endGame();
                return;
            }
        }

        // Pick random drawer from available
        const candidates = availableDrawers.length === 0 ? playerIds : availableDrawers;
        const drawerIndex = Math.floor(Math.random() * candidates.length);
        this.currentDrawer = candidates[drawerIndex];
        
        // Increment draw count
        this.roundDrawCounts[this.currentDrawer] = (this.roundDrawCounts[this.currentDrawer] || 0) + 1;
        
        // Reset drawer status
        playerIds.forEach(id => this.players[id].isDrawer = false);
        this.players[this.currentDrawer].isDrawer = true;

        // Pick word (No Repeat Logic)
        let availableWords = WORDS.filter(w => !this.usedWords.has(w));
        if (availableWords.length === 0) {
            this.usedWords.clear(); // Reset if all words used
            availableWords = WORDS;
        }
        this.currentWord = availableWords[Math.floor(Math.random() * availableWords.length)];
        this.usedWords.add(this.currentWord);
        
        this.roundActive = true;
        this.timeLeft = this.roundTime;

        // Clear Drawing History
        this.drawHistory = [];
        this.redoStack = [];
        this.currentStroke = [];
        io.to(this.id).emit('clearCanvas');

        // Notify players
        io.to(this.id).emit('newRound', {
            drawer: this.players[this.currentDrawer].username,
            wordLength: this.currentWord.length,
            drawerId: this.currentDrawer,
            round: this.currentRound,
            maxRounds: this.maxRounds
        });

        // Send word to drawer only
        io.to(this.currentDrawer).emit('yourWord', this.currentWord);

        // Start timer
        this.timer = setInterval(() => {
            this.timeLeft--;
            io.to(this.id).emit('timer', this.timeLeft);
            
            if (this.timeLeft <= 0) {
                this.endRound("Time's up!");
            }
        }, 1000);
    }

    endRound(reason) {
        if (!this.roundActive) return;
        
        clearInterval(this.timer);
        this.roundActive = false;
        
        io.to(this.id).emit('roundEnd', {
            reason,
            word: this.currentWord
        });

        // Start new round after delay
        setTimeout(() => {
            this.startRound();
        }, 5000);
    }

    endGame() {
        io.to(this.id).emit('gameOver', {
            scores: this.getScores()
        });
    }

    handleGuess(socketId, guess) {
        if (!this.roundActive || socketId === this.currentDrawer) return false;

        if (guess.toLowerCase() === this.currentWord.toLowerCase()) {
            // Correct guess
            const player = this.players[socketId];
            const drawer = this.players[this.currentDrawer];
            
            // Calculate score based on time left
            const points = Math.ceil(this.timeLeft / 2) + 10;
            player.score += points;
            drawer.score += 5; // Drawer gets points too

            io.to(this.id).emit('chatMessage', {
                username: "System",
                message: `${player.username} guessed the word!`,
                type: "correct"
            });
            
            io.to(this.id).emit('updateScores', this.getScores());
            
            this.endRound(`${player.username} guessed it!`);
            return true;
        }
        return false;
    }

    getScores() {
        return Object.entries(this.players).reduce((acc, [id, p]) => {
            acc[p.username] = p.score;
            return acc;
        }, {});
    }
    
    // Drawing History Methods
    startStroke(point) {
        this.currentStroke = [point];
    }
    
    addPoint(point) {
        this.currentStroke.push(point);
    }
    
    endStroke() {
        if (this.currentStroke.length > 0) {
            this.drawHistory.push([...this.currentStroke]);
            this.currentStroke = [];
            this.redoStack = []; // Clear redo stack on new action
        }
    }
    
    undo() {
        if (this.drawHistory.length > 0) {
            const stroke = this.drawHistory.pop();
            this.redoStack.push(stroke);
            return true;
        }
        return false;
    }
    
    redo() {
        if (this.redoStack.length > 0) {
            const stroke = this.redoStack.pop();
            this.drawHistory.push(stroke);
            return true;
        }
        return false;
    }
    
    clearCanvas() {
        this.drawHistory = [];
        this.redoStack = [];
        this.currentStroke = [];
    }
}

const rooms = {}; // roomId -> Room

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    let currentRoomId = null;

    socket.on('createGame', ({ username }) => {
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const room = new Room(roomId);
        rooms[roomId] = room;
        
        socket.join(roomId);
        currentRoomId = roomId;
        
        room.addPlayer(socket.id, username);
        
        socket.emit('gameCreated', { gameId: roomId });
        io.to(roomId).emit('updateScores', room.getScores());
    });

    socket.on('joinGame', ({ gameId, username }) => {
        const room = rooms[gameId];
        if (!room) {
            socket.emit('error', 'Room not found');
            return;
        }

        socket.join(gameId);
        currentRoomId = gameId;
        
        room.addPlayer(socket.id, username);
        
        socket.emit('gameJoined', { 
            gameId, 
            scores: room.getScores() 
        });
        io.to(gameId).emit('updateScores', room.getScores());
        
        // If enough players, try to start round
        if (!room.roundActive) {
            room.startRound();
        } else {
             // Send current game state to joiner
             socket.emit('newRound', {
                drawer: room.players[room.currentDrawer].username,
                wordLength: room.currentWord.length,
                drawerId: room.currentDrawer
            });
            // If they are not drawer, they just watch
        }
    });
    socket.on('chatMessage', ({ msg, username }) => {
        if (!currentRoomId || !rooms[currentRoomId]) return;
        
        const room = rooms[currentRoomId];
        
        // Check if it's a guess
        if (room.handleGuess(socket.id, msg)) {
            return; // It was a correct guess, handled in Room class
        }

        io.to(currentRoomId).emit('chatMessage', { username, msg });
    });

    socket.on('draw', (data) => {
        if (!currentRoomId || !rooms[currentRoomId]) return;
        socket.to(currentRoomId).emit('draw', data);
    });

    socket.on('clearCanvas', () => {
        if (!currentRoomId || !rooms[currentRoomId]) return;
        socket.to(currentRoomId).emit('clearCanvas');
    });

    socket.on('beginPath', () => {
        if (!currentRoomId || !rooms[currentRoomId]) return;
        socket.to(currentRoomId).emit('beginPath');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (currentRoomId && rooms[currentRoomId]) {
            rooms[currentRoomId].removePlayer(socket.id);
            io.to(currentRoomId).emit('updateScores', rooms[currentRoomId].getScores());
            
            // Cleanup empty room
            if (Object.keys(rooms[currentRoomId].players).length === 0) {
                delete rooms[currentRoomId];
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
