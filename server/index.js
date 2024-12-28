const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');
const fs = require('fs');
const path = require('path');
const cors = require('cors')

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());

const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.cwd() + '/user',
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

app.get('/files', async (req, res) => {
    const filesTree = await generateFileTree('./user')
    return res.json({ tree: filesTree })
})

async function generateFileTree(directory) {
    const tree = {}

    async function buildTree(currentDir, currentTree) {
        const files = await fs.promises.readdir(currentDir)

        for (const file of files) {
            const filePath = path.join(currentDir, file)
            const stat = await fs.promises.stat(filePath)

            if (stat.isDirectory()) {
                currentTree[file] = {}
                await buildTree(filePath, currentTree[file])
            } else {
                currentTree[file] = null
            }
        }
    }

    await buildTree(directory, tree);
    return tree
}

server.listen(8000, '0.0.0.0', () => {
    console.log('Server running on port 8000');
});