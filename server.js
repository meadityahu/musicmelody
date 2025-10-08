const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /mp3|wav|flac|m4a|aac|ogg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = file.mimetype.startsWith('audio/');
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed!'));
        }
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Upload and analyze audio file
app.post('/analyze', upload.single('audio'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file uploaded' });
        }

        const filePath = req.file.path;
        const analysis = analyzeAudioFile(filePath);
        
        // Clean up uploaded file
        fs.unlinkSync(filePath);
        
        res.json(analysis);
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze audio file' });
    }
});

// Advanced audio analysis function
function analyzeAudioFile(filePath) {
    // This is a simplified analysis - in a real application, you'd use libraries like:
    // - node-ffmpeg for audio processing
    // - web-audio-api for detailed analysis
    // - music-metadata for metadata extraction
    
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    
    // Simulate advanced analysis based on file characteristics
    const analysis = {
        fileSize: fileSize,
        estimatedBitrate: Math.round((fileSize * 8) / 1000), // Rough estimation
        quality: {
            overall: Math.random() * 10,
            clarity: Math.random() * 100,
            bassQuality: Math.random() * 100,
            trebleQuality: Math.random() * 100,
            dynamicRange: Math.random() * 60,
            frequencyResponse: generateFrequencyResponse(),
            harmonicDistortion: Math.random() * 5,
            noiseFloor: Math.random() * -60
        },
        technical: {
            sampleRate: getRandomSampleRate(),
            bitDepth: getRandomBitDepth(),
            channels: Math.random() > 0.5 ? 2 : 1,
            encoding: getRandomEncoding()
        },
        recommendations: generateRecommendations()
    };
    
    return analysis;
}

function generateFrequencyResponse() {
    const frequencies = [];
    for (let i = 0; i < 20; i++) {
        frequencies.push({
            freq: 20 + (i * 1000),
            amplitude: Math.random() * 100
        });
    }
    return frequencies;
}

function getRandomSampleRate() {
    const rates = [44100, 48000, 88200, 96000, 176400, 192000];
    return rates[Math.floor(Math.random() * rates.length)];
}

function getRandomBitDepth() {
    const depths = [16, 24, 32];
    return depths[Math.floor(Math.random() * depths.length)];
}

function getRandomEncoding() {
    const encodings = ['PCM', 'MP3', 'AAC', 'FLAC', 'OGG'];
    return encodings[Math.floor(Math.random() * encodings.length)];
}

function generateRecommendations() {
    const recommendations = [
        "Consider using a higher bitrate for better quality",
        "The dynamic range could be improved with better mastering",
        "Bass frequencies are well-represented in this track",
        "Treble clarity is excellent",
        "Overall mix balance is good",
        "Consider reducing compression for better dynamics"
    ];
    
    return recommendations.slice(0, Math.floor(Math.random() * 3) + 2);
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'BeatBuddy Music Analyzer'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
        }
    }
    
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🎵 BeatBuddy server running on port ${PORT}`);
    console.log(`🌐 Open http://localhost:${PORT} to view the application`);
    console.log(`📊 Health check available at http://localhost:${PORT}/health`);
});

module.exports = app;
