const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'data', 'threats.json');

function readThreats() {
    try {
        if (!fs.existsSync(DATA_FILE)) return [];
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function saveThreats(threats) {
    try {
        const dataDir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(threats, null, 2));
        return true;
    } catch (error) {
        console.error('Błąd zapisu:', error);
        return false;
    }
}

// Proste endpointy BEZ logowania
app.get('/api/threats', (req, res) => {
    const threats = readThreats();
    res.json(threats);
});

app.post('/api/threats', (req, res) => {
    const { lat, lng, type, level, description } = req.body;
    
    if (!lat || !lng || !type || !level || !description) {
        return res.status(400).json({ error: 'Brakujące wymagane pola' });
    }

    const threats = readThreats();
    
    const newThreat = {
        id: Date.now().toString(),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        type,
        level: parseInt(level),
        description,
        date: new Date().toISOString(),
        status: 'active',
        votes: {
            resolved: 0,
            notResolved: 0,
            voters: []
        },
        reportedBy: 'Użytkownik'
    };

    threats.push(newThreat);
    
    if (saveThreats(threats)) {
        res.status(201).json(newThreat);
    } else {
        res.status(500).json({ error: 'Błąd zapisu danych' });
    }
});

app.post('/api/threats/:id/vote', (req, res) => {
    const { id } = req.params;
    const { vote, voter } = req.body;

    const threats = readThreats();
    const threatIndex = threats.findIndex(threat => threat.id === id);
    
    if (threatIndex === -1) {
        return res.status(404).json({ error: 'Zgłoszenie nie znalezione' });
    }

    const threat = threats[threatIndex];
    
    // Proste sprawdzenie czy już głosował
    if (threat.votes.voters.includes(voter)) {
        return res.status(400).json({ error: 'Już zagłosowano na to zgłoszenie' });
    }

    if (vote === 'resolved') {
        threat.votes.resolved++;
    } else if (vote === 'notResolved') {
        threat.votes.notResolved++;
    }

    threat.votes.voters.push(voter);
    
    if (saveThreats(threats)) {
        res.json(threats[threatIndex]);
    } else {
        res.status(500).json({ error: 'Błąd aktualizacji' });
    }
});

app.delete('/api/threats/:id', (req, res) => {
    const { id } = req.params;
    const threats = readThreats();
    const filteredThreats = threats.filter(threat => threat.id !== id);
    
    if (saveThreats(filteredThreats)) {
        res.json({ message: 'Zgłoszenie usunięte' });
    } else {
        res.status(500).json({ error: 'Błąd usuwania' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🎯 Serwer SafePlace działa na http://localhost:${PORT}`);
    console.log('✅ Aplikacja gotowa! Możesz zgłaszać zagrożenia i głosować.');
});