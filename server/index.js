const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
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
    }
});

// Helper to generate ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// API Routes

// Get all messages
app.get('/api/messages', (req, res) => {
    const sql = "SELECT * FROM messages ORDER BY timestamp DESC";
    db.all(sql, [], (err, rows) => {
        if (err) {
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
app.post('/api/send', (req, res) => {
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
    
    const sql = `INSERT INTO messages (id, from_addr, to_addr, body, timestamp, status, direction, segments, encoding, templateId, requestId) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [msg.id, msg.from, msg.to, msg.body, msg.timestamp, msg.status, msg.direction, msg.segments, msg.encoding, null, null];
    
    db.run(sql, params, function(err) {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
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
    db.run("DELETE FROM messages WHERE id = ?", id, function(err) {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({"message": "deleted", "changes": this.changes});
    });
});

// Clear all messages
app.delete('/api/messages', (req, res) => {
    db.run("DELETE FROM messages", [], function(err) {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({"message": "deleted", "changes": this.changes});
    });
});

// Catch all for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
