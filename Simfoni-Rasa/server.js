// Import native Node.js modules
const http = require('http');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const fetch = require('node-fetch'); // pastikan sudah install node-fetch

// Inisialisasi Firebase Admin SDK
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Konfigurasi
const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Ganti dengan Web API Key Firebase project Anda (bukan service account)
const FIREBASE_API_KEY = 'AIzaSyC6YhPKsphJHtLh96_-Yd_ptLMsu-m5mLw';

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif'
};

/**
 * Handles incoming HTTP requests.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
const requestHandler = (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let pathname = decodeURIComponent(url.pathname);

    console.log(`Request received: ${req.method} ${pathname}`);

    // --- 1. Dynamic API Route Handling ---
    // Endpoint login ke Firebase Auth
    if (pathname === '/api/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const { email, password } = JSON.parse(body);
                fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        password,
                        returnSecureToken: true
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: data.error.message }));
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ idToken: data.idToken, email: data.email }));
                    }
                })
                .catch(() => {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                });
            } catch {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }

    // Endpoint ambil data recipes dari Firestore
    if (pathname === '/api/recipes' && req.method === 'GET') {
        db.collection('recipes').get()
            .then(snapshot => {
                const recipes = [];
                snapshot.forEach(doc => {
                    recipes.push({ id: doc.id, ...doc.data() });
                });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(recipes));
            })
            .catch(() => {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error: Could not load data.' }));
            });
        return;
    }

    // --- 2. Static File Serving ---
    const fileName = pathname.slice(1) || 'index.html';
    const filePath = path.join(PUBLIC_DIR, fileName);

    // Security check: prevent directory traversal
    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403);
        return res.end('Forbidden');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`<h1>404 Not Found</h1><p>The requested URL ${pathname} was not found.</p>`);
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
};

// Create the HTTP server
const server = http.createServer(requestHandler);

// Start listening
server.listen(PORT, (err) => {
    if (err) {
        return console.log('Something bad happened', err);
    }
    console.log(`\n-----------------------------------------`);
    console.log(` Server is running on http://localhost:${PORT}`);
    console.log(`- Static files folder: ${PUBLIC_DIR}`);
    console.log(`- Dynamic data endpoint: /api/recipes`);
    console.log(`- Login endpoint: /api/login`);
    console.log(`-----------------------------------------\n`);
});
