const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const chokidar = require('chokidar');

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

chokidar.watch('./user').on('all', (event, path) => {
    io.emit('file:refresh', path);
});

ptyProcess.onData(data => {
    const cleanData = data.replace(/\x1B\[[0-9;]*[mK]/g, '');
    io.emit('terminal:data', cleanData);
});

io.on('connection', (socket) => {
    console.log('Connected:', socket.id);

    socket.on('file:change', async ({ path, content }) => {
        await fs.promises.writeFile(`./user${path}`, content);
    });

    socket.on('terminal:write', (data) => {
        ptyProcess.write(data);
    });
});

app.get('/files', async (req, res) => {
    const filesTree = await generateFileTree('./user');
    return res.json({ tree: filesTree });
});

app.get('/files/content', (req, res) => {
    const filePath = path.join(__dirname, 'user', req.query.path);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.json({ content: data });
    });
});

async function generateFileTree(directory) {
    const tree = {};

    async function buildTree(currentDir, currentTree) {
        const files = await fs.promises.readdir(currentDir);

        for (const file of files) {
            const filePath = path.join(currentDir, file);
            const stat = await fs.promises.stat(filePath);

            if (stat.isDirectory()) {
                currentTree[file] = {};
                await buildTree(filePath, currentTree[file]);
            } else {
                currentTree[file] = null;
            }
        }
    }

    await buildTree(directory, tree);
    return tree;
}

server.listen(8000, '0.0.0.0', () => {
    console.log('Server running on port 8000');
});