# BeatBuddy - Music Quality Analyzer 🎵

A stunning 3D web application that analyzes music quality and provides detailed audio metrics with vibrant colors and interactive 3D effects.

## Features ✨

- **3D Interactive Interface**: Beautiful 3D effects with vibrant blue, sky blue, and red color scheme
- **Music Quality Analysis**: Comprehensive analysis of audio quality including:
  - Overall quality rating (1-10 stars)
  - Clarity assessment
  - Bass quality analysis
  - Treble quality evaluation
  - Dynamic range measurement
  - Bitrate estimation
- **Real-time Waveform Visualization**: Animated waveform display
- **Drag & Drop Support**: Easy file upload with drag and drop functionality
- **Responsive Design**: Works on desktop and mobile devices
- **The Majestica Face**: Animated creator signature at the bottom

## Technology Stack 🛠️

- **Frontend**: HTML5, CSS3 (3D transforms, animations), JavaScript (Web Audio API)
- **Backend**: Node.js, Express.js
- **File Handling**: Multer for file uploads
- **Styling**: Custom CSS with 3D effects and gradients

## Installation & Setup 🚀

1. **Clone or download the project files**

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

## Usage 🎯

1. **Upload Music**: Drag and drop an audio file onto the upload area or click "Choose File"
2. **Supported Formats**: MP3, WAV, FLAC, M4A, AAC, OGG
3. **Analysis**: The app will automatically analyze your music and display:
   - Quality metrics with animated progress bars
   - Star rating system
   - Detailed analysis results
   - Real-time waveform visualization
4. **3D Effects**: Move your mouse around to see interactive 3D effects

## File Structure 📁

```
beatbuddy/
├── index.html          # Main HTML structure
├── styles.css          # 3D CSS styling and animations
├── script.js           # Frontend JavaScript (Web Audio API)
├── server.js           # Node.js backend server
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## Features in Detail 🔍

### 3D Visual Effects
- Floating background circles with gradient colors
- Interactive mouse-following animations
- 3D card hover effects
- Parallax scrolling
- Glowing text effects

### Music Analysis
- **RMS Calculation**: Root Mean Square for volume analysis
- **Frequency Spectrum**: FFT-based frequency analysis
- **Dynamic Range**: Audio dynamic range in dB
- **Bass/Treble Quality**: Low and high frequency analysis
- **Clarity Assessment**: Signal-to-noise ratio approximation
- **Bitrate Estimation**: File quality estimation

### Interactive Elements
- Drag and drop file upload
- Animated progress bars
- Real-time waveform visualization
- Responsive 3D interface
- The Majestica animated face

## Browser Compatibility 🌐

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (responsive design)

## Requirements 📋

- Node.js 14.0.0 or higher
- Modern web browser with Web Audio API support
- Audio files in supported formats

## Created by The Majestica 👑

This project was created with love and attention to detail by The Majestica, featuring a unique animated face signature at the bottom of the page.

## License 📄

MIT License - Feel free to use and modify as needed.

---

**Enjoy analyzing your music with BeatBuddy! 🎶✨**
