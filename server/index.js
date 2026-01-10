const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for development
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5081;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// Database setup
const dbDir = process.env.DB_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)){
    fs.mkdirSync(dbDir, { recursive: true });
}
const dbPath = path.join(dbDir, 'messages.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database at ' + dbPath);
        
        // Basic Migration Helper: Ensure columns exist
        const ensureColumn = (table, column, definition) => {
            db.all(`PRAGMA table_info(${table})`, [], (err, rows) => {
                if (err) return;
                const exists = rows.some(r => r.name === column);
                if (!exists) {
                    console.log(`Migrating: Adding ${column} to ${table}`);
                    db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
                }
            });
        };

        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            from_addr TEXT,
            to_addr TEXT,
            body TEXT,
            timestamp TEXT,
            status TEXT,
            direction TEXT,
            segments INTEGER,
            encoding TEXT,
            templateId TEXT,
            requestId TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS templates (
            id TEXT PRIMARY KEY,
            name TEXT,
            content TEXT,
            type TEXT,
            status TEXT,
            created TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS signatures (
            id TEXT PRIMARY KEY,
            text TEXT,
            status TEXT,
            created TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS logs (
            requestId TEXT PRIMARY KEY,
            timestamp TEXT,
            method TEXT,
            endpoint TEXT,
            statusCode INTEGER,
            latency INTEGER,
            requestBody TEXT,
            responseBody TEXT
        )`);
    }
});

// Helper to generate ID
const generateId = () => Math.random().toString(36).substring(2, 9);

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// API Routes

// --- LOGS ---
app.get('/api/logs', (req, res) => {
    db.all("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100", [], (err, rows) => {
        if (err) {
            console.error("Error fetching logs:", err.message);
            return res.status(500).json({error: err.message});
        }
        const logs = rows.map(row => ({
            ...row,
            requestBody: row.requestBody ? JSON.parse(row.requestBody) : {},
            responseBody: row.responseBody ? JSON.parse(row.responseBody) : {}
        }));
        res.json(logs);
    });
});

app.post('/api/logs', [
    body('requestId').isString().notEmpty(),
    body('timestamp').isISO8601(),
    body('method').isString(),
    body('endpoint').isString(),
    body('statusCode').isInt(),
    body('latency').isInt()
], validateRequest, (req, res) => {
    const { requestId, timestamp, method, endpoint, statusCode, latency, requestBody, responseBody } = req.body;
    console.log(`[LOG] ${method} ${endpoint} - ${statusCode}`);
    const sql = "INSERT INTO logs (requestId, timestamp, method, endpoint, statusCode, latency, requestBody, responseBody) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    db.run(sql, [requestId, timestamp, method, endpoint, statusCode, latency, JSON.stringify(requestBody), JSON.stringify(responseBody)], function(err) {
        if (err) {
            console.error("Error saving log:", err.message);
            return res.status(500).json({error: err.message});
        }
        res.json({ message: "Log saved" });
    });
});

// --- TEMPLATES ---
app.get('/api/templates', (req, res) => {
    console.log('[API] GET /api/templates');
    db.all("SELECT * FROM templates ORDER BY created DESC", [], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(rows);
    });
});

app.post('/api/templates', [
    body('id').isString().notEmpty(),
    body('name').isString().trim().notEmpty().isLength({ max: 50 }),
    body('content').isString().trim().notEmpty().isLength({ max: 500 }),
    body('type').isIn(['OTP', 'Notification', 'Marketing']),
    body('status').isString(),
    body('created').optional().isISO8601()
], validateRequest, (req, res) => {
    console.log('[API] POST /api/templates');
    const { id, name, content, type, status, created } = req.body;
    const sql = "INSERT INTO templates (id, name, content, type, status, created) VALUES (?, ?, ?, ?, ?, ?)";
    db.run(sql, [id, name, content, type, status, created], function(err) {
        if (err) return res.status(500).json({error: err.message});
        console.log(`[API] Template added: ${id}`);
        res.json({ id, name, content, type, status, created });
    });
});

app.put('/api/templates/:id', [
    body('name').isString().trim().notEmpty().isLength({ max: 50 }),
    body('content').isString().trim().notEmpty().isLength({ max: 500 }),
    body('type').isIn(['OTP', 'Notification', 'Marketing']),
    body('status').isString()
], validateRequest, (req, res) => {
    console.log(`[API] PUT /api/templates/${req.params.id}`);
    const { name, content, type, status } = req.body;
    const sql = "UPDATE templates SET name = ?, content = ?, type = ?, status = ? WHERE id = ?";
    db.run(sql, [name, content, type, status, req.params.id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ message: "Updated", changes: this.changes });
    });
});

app.delete('/api/templates/:id', (req, res) => {
    console.log(`[API] DELETE /api/templates/${req.params.id}`);
    db.run("DELETE FROM templates WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ message: "Deleted", changes: this.changes });
    });
});

// --- SIGNATURES ---
app.get('/api/signatures', (req, res) => {
    console.log('[API] GET /api/signatures');
    db.all("SELECT * FROM signatures ORDER BY created DESC", [], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(rows);
    });
});

app.post('/api/signatures', [
    body('id').isString().notEmpty(),
    body('text').isString().trim().notEmpty().isLength({ max: 20 }),
    body('status').isString(),
    body('created').optional().isISO8601()
], validateRequest, (req, res) => {
    console.log('[API] POST /api/signatures');
    const { id, text, status, created } = req.body;
    const sql = "INSERT INTO signatures (id, text, status, created) VALUES (?, ?, ?, ?)";
    const createdDate = created || new Date().toISOString();
    db.run(sql, [id, text, status, createdDate], function(err) {
        if (err) return res.status(500).json({error: err.message});
        console.log(`[API] Signature added: ${id}`);
        res.json({ id, text, status, created: createdDate });
    });
});

app.delete('/api/signatures/:id', (req, res) => {
    console.log(`[API] DELETE /api/signatures/${req.params.id}`);
    db.run("DELETE FROM signatures WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ message: "Deleted", changes: this.changes });
    });
});

// Get all messages
app.get('/api/messages', (req, res) => {
    console.log('[API] GET /api/messages');
    const sql = "SELECT * FROM messages ORDER BY timestamp DESC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('[API] Error fetching messages:', err.message);
            res.status(400).json({"error": err.message});
            return;
        }
        // Map database columns to API response
        const messages = rows.map(row => ({
            id: row.id,
            from: row.from_addr,
            to: row.to_addr,
            body: row.body,
            timestamp: row.timestamp,
            status: row.status,
            direction: row.direction,
            segments: row.segments,
            encoding: row.encoding,
            templateId: row.templateId,
            requestId: row.requestId
        }));
        res.json(messages);
    });
});

// Send a message (simulated)
app.post('/api/send', [
    body('to').isString().trim().notEmpty().matches(/^\+?[0-9]{7,15}$/), // Basic phone validation
    body('body').isString().trim().notEmpty().isLength({ max: 1000 }),
    body('from').optional().isString().trim().isLength({ max: 20 }),
    body('direction').optional().isIn(['inbound', 'outbound']),
    body('status').optional().isString()
], validateRequest, (req, res) => {
    console.log('[API] POST /api/send');
    const { to, body, from, direction, status } = req.body;
    
    // Default values
    const msgDirection = direction || 'outbound';
    const msgStatus = status || (msgDirection === 'inbound' ? 'received' : 'delivered');
    
    const msg = {
        id: generateId(),
        from: from || (msgDirection === 'inbound' ? 'Sender' : 'System'),
        to: to,
        body: body,
        timestamp: new Date().toISOString(),
        status: msgStatus,
        direction: msgDirection,
        segments: Math.ceil((body || '').length / 160),
        encoding: 'GSM-7'
    };
    
    console.log(`[API] Sending message: ${msg.id} to ${msg.to}`);

    const sql = `INSERT INTO messages (id, from_addr, to_addr, body, timestamp, status, direction, segments, encoding, templateId, requestId) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [msg.id, msg.from, msg.to, msg.body, msg.timestamp, msg.status, msg.direction, msg.segments, msg.encoding, null, null];
    
    db.run(sql, params, function(err) {
        if (err) {
            console.error('[API] Error sending message:', err.message);
            res.status(400).json({"error": err.message});
            return;
        }
        io.emit('messages_update');
        res.json({
            "message": "success",
            "data": msg,
            "id": msg.id
        });
    });
});

// Delete a message
app.delete('/api/messages/:id', (req, res) => {
    const id = req.params.id;
    console.log(`[API] DELETE /api/messages/${id}`);
    db.run("DELETE FROM messages WHERE id = ?", id, function(err) {
        if (err) {
            console.error('[API] Error deleting message:', err.message);
            res.status(400).json({"error": err.message});
            return;
        }
        io.emit('messages_update');
        res.json({"message": "deleted", "changes": this.changes});
    });
});

// Clear all messages
app.delete('/api/messages', (req, res) => {
    console.log('[API] DELETE /api/messages (Clear All)');
    db.run("DELETE FROM messages", [], function(err) {
        if (err) {
            console.error('[API] Error clearing messages:', err.message);
            res.status(400).json({"error": err.message});
            return;
        }
        io.emit('messages_update');
        res.json({"message": "deleted", "changes": this.changes});
    });
});

// Catch all for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
