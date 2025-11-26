// Import native Node.js modules
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 3000;
// Use __dirname to ensure paths are always relative to the server.js file location
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');

// Helper to determine the content type based on file extension
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
    // 1. Sanitize the URL path
    const url = new URL(req.url, `http://${req.headers.host}`);
    let pathname = url.pathname;

    // Decode and clean up path segments (important for paths like /images/ayam panggang.png)
    pathname = decodeURIComponent(pathname);

    console.log(`Request received: ${req.method} ${pathname}`);

    // --- 1. Dynamic API Route Handling ---
    // --- 1. Dynamic API Route Handling ---
    if (pathname === '/api/recipes') {
        const filePath = path.join(DATA_DIR, 'recipes.json');

        if (req.method === 'GET') {
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    console.error('Error reading recipes data file:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Internal Server Error: Could not load data.' }));
                }

                // Success: Serve the JSON data
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            });
            return;
        } else if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                try {
                    const newRecipe = JSON.parse(body);

                    // Basic validation
                    if (!newRecipe.title || !newRecipe.ingredients || !newRecipe.steps) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ error: 'Missing required fields' }));
                    }

                    fs.readFile(filePath, (err, data) => {
                        if (err) {
                            console.error('Error reading recipes for update:', err);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            return res.end(JSON.stringify({ error: 'Internal Server Error' }));
                        }

                        let recipes = [];
                        try {
                            recipes = JSON.parse(data);
                        } catch (parseErr) {
                            console.error('Error parsing existing recipes:', parseErr);
                            // If file is corrupt, we might want to start fresh or error out. 
                            // For now, let's assume we start with an empty array if parse fails but file exists? 
                            // Or better, error out to be safe.
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            return res.end(JSON.stringify({ error: 'Database error' }));
                        }

                        // Generate a new ID (simple max ID + 1)
                        const maxId = recipes.reduce((max, r) => (r.id > max ? r.id : max), 0);
                        newRecipe.id = maxId + 1;

                        recipes.push(newRecipe);

                        fs.writeFile(filePath, JSON.stringify(recipes, null, 4), (writeErr) => {
                            if (writeErr) {
                                console.error('Error writing new recipe:', writeErr);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                return res.end(JSON.stringify({ error: 'Could not save recipe' }));
                            }

                            console.log(`New recipe added: ${newRecipe.title} (ID: ${newRecipe.id})`);
                            res.writeHead(201, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Recipe added successfully', recipe: newRecipe }));
                        });
                    });
                } catch (e) {
                    console.error('Invalid JSON in request body:', e);
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            });
            return;
        } else if (req.method === 'DELETE') {
            const id = url.searchParams.get('id');
            if (!id) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Missing recipe ID' }));
            }

            fs.readFile(filePath, (err, data) => {
                if (err) {
                    console.error('Error reading recipes for delete:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Internal Server Error' }));
                }

                let recipes = [];
                try {
                    recipes = JSON.parse(data);
                } catch (parseErr) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Database error' }));
                }

                const initialLength = recipes.length;
                recipes = recipes.filter(r => r.id != id);

                if (recipes.length === initialLength) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Recipe not found' }));
                }

                fs.writeFile(filePath, JSON.stringify(recipes, null, 4), (writeErr) => {
                    if (writeErr) {
                        console.error('Error deleting recipe:', writeErr);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ error: 'Could not delete recipe' }));
                    }

                    console.log(`Recipe deleted: ID ${id}`);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Recipe deleted successfully' }));
                });
            });
            return;
        }
    }

    // --- 2. Static File Serving ---

    // Normalize path: If root '/', serve index.html
    const fileName = pathname.slice(1) || 'index.html';
    const filePath = path.join(PUBLIC_DIR, fileName);

    // Security check: prevent directory traversal (e.g., ../../secret.txt)
    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403);
        return res.end('Forbidden');
    }

    // Determine the content type
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Read and serve the file
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found (404)
                console.log(`404: File not found at path: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`<h1>404 Not Found</h1><p>The requested URL ${pathname} was not found.</p>`);
            } else {
                // Server error (500)
                console.error(`500: Error reading file ${filePath}:`, err);
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // Success: Serve the file content
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
    console.log(`-----------------------------------------\n`);
});
