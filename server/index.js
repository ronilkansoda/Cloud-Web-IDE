const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    env: process.env
});

ptyProcess.onData(data => {
    const cleanData = data.replace(/\x1B\[[0-9;]*[mK]/g, '');
    io.emit('terminal:data', cleanData);
})

io.on('connection', (socket) => {
    console.log('Connected:', socket.id);

    // ptyProcess.on('data', (data) => {
    //     socket.emit('terminal:data', data);
    // });

    socket.on('terminal:write', (data) => {
        ptyProcess.write(data);
    });
});

server.listen(8000, '0.0.0.0', () => {
    console.log('Server running on port 8000');
});