const http = require('http');
const express = require('express');
const { Server: SocketServer } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new SocketServer({
    cors: '*'
})

io.attach(server);

io.on('connection', (socket) => {
    console.log('server connected', socket.id);
})

server.listen(9000, () => { console.log('Docker Server Running') })