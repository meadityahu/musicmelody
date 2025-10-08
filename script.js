class BeatBuddyAnalyzer {
    constructor() {
        this.audioContext = null;
        this.audioBuffer = null;
        this.analyser = null;
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupCanvas();
        this.initializeAudioContext();
    }

    setupEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const uploadBox = document.getElementById('uploadBox');

        fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        
        uploadBox.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadBox.style.transform = 'rotateY(15deg) rotateX(10deg) translateZ(30px)';
            uploadBox.style.boxShadow = '0 40px 80px rgba(0, 212, 255, 0.4)';
        });

        uploadBox.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadBox.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(0px)';
            uploadBox.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
        });

        uploadBox.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadBox.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(0px)';
            uploadBox.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.processFile(files[0]);
            }
        });
    }

    setupCanvas() {
        this.canvas = document.getElementById('waveformCanvas');
        this.ctx = this.canvas.getContext('2d');
    }

    async initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('Audio context not supported:', error);
        }
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    async processFile(file) {
        if (!this.audioContext) {
            await this.initializeAudioContext();
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.showAnalysisSection();
            this.analyzeMusic();
            this.startWaveformVisualization();
            
        } catch (error) {
            console.error('Error processing file:', error);
            this.showError('Error processing audio file. Please try a different format.');
        }
    }

    showAnalysisSection() {
        const analysisSection = document.getElementById('analysisSection');
        analysisSection.style.display = 'block';
        analysisSection.scrollIntoView({ behavior: 'smooth' });
    }

    analyzeMusic() {
        if (!this.audioBuffer) return;

        const audioData = this.audioBuffer.getChannelData(0);
        const sampleRate = this.audioBuffer.sampleRate;
        const duration = this.audioBuffer.duration;
        
        // Calculate various quality metrics
        const metrics = this.calculateQualityMetrics(audioData, sampleRate, duration);
        
        // Update UI with results
        this.updateQualityMetrics(metrics);
        this.updateResultsText(metrics, file);
    }

    calculateQualityMetrics(audioData, sampleRate, duration) {
        // Calculate RMS (Root Mean Square) for overall volume
        const rms = this.calculateRMS(audioData);
        
        // Calculate frequency spectrum
        const spectrum = this.calculateSpectrum(audioData);
        
        // Calculate dynamic range
        const dynamicRange = this.calculateDynamicRange(audioData);
        
        // Calculate bass quality (low frequencies)
        const bassQuality = this.calculateBassQuality(spectrum, sampleRate);
        
        // Calculate treble quality (high frequencies)
        const trebleQuality = this.calculateTrebleQuality(spectrum, sampleRate);
        
        // Calculate clarity (signal-to-noise ratio approximation)
        const clarity = this.calculateClarity(audioData);
        
        // Estimate bitrate (rough calculation)
        const bitrate = this.estimateBitrate(audioData, duration);
        
        // Overall quality score
        const overallQuality = this.calculateOverallQuality({
            rms, bassQuality, trebleQuality, clarity, dynamicRange
        });

        return {
            overallQuality,
            clarity,
            bassQuality,
            trebleQuality,
            dynamicRange,
            bitrate,
            rms,
            duration
        };
    }

    calculateRMS(data) {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i] * data[i];
        }
        return Math.sqrt(sum / data.length);
    }

    calculateSpectrum(data) {
        // Simple FFT approximation for visualization
        const fftSize = 1024;
        const spectrum = new Array(fftSize / 2).fill(0);
        
        for (let i = 0; i < data.length - fftSize; i += fftSize) {
            const chunk = data.slice(i, i + fftSize);
            for (let j = 0; j < fftSize / 2; j++) {
                spectrum[j] += Math.abs(chunk[j * 2]);
            }
        }
        
        return spectrum.map(x => x / (data.length / fftSize));
    }

    calculateDynamicRange(data) {
        const chunkSize = 1024;
        let min = Infinity;
        let max = -Infinity;
        
        for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            const chunkMin = Math.min(...chunk);
            const chunkMax = Math.max(...chunk);
            
            min = Math.min(min, chunkMin);
            max = Math.max(max, chunkMax);
        }
        
        return 20 * Math.log10((max - min) / 0.1); // Convert to dB
    }

    calculateBassQuality(spectrum, sampleRate) {
        const bassFreq = Math.floor(spectrum.length * 200 / (sampleRate / 2)); // 200Hz
        let bassEnergy = 0;
        for (let i = 0; i < bassFreq; i++) {
            bassEnergy += spectrum[i];
        }
        return Math.min(100, (bassEnergy / bassFreq) * 1000);
    }

    calculateTrebleQuality(spectrum, sampleRate) {
        const trebleStart = Math.floor(spectrum.length * 2000 / (sampleRate / 2)); // 2kHz
        let trebleEnergy = 0;
        for (let i = trebleStart; i < spectrum.length; i++) {
            trebleEnergy += spectrum[i];
        }
        return Math.min(100, (trebleEnergy / (spectrum.length - trebleStart)) * 1000);
    }

    calculateClarity(data) {
        // Simple clarity calculation based on signal variance
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
        return Math.min(100, Math.sqrt(variance) * 100);
    }

    estimateBitrate(data, duration) {
        // Rough bitrate estimation
        const bytesPerSecond = (data.length * 4) / duration; // 32-bit float
        return Math.round(bytesPerSecond * 8 / 1000); // Convert to kbps
    }

    calculateOverallQuality(metrics) {
        const weights = {
            clarity: 0.25,
            bassQuality: 0.2,
            trebleQuality: 0.2,
            dynamicRange: 0.2,
            rms: 0.15
        };
        
        let score = 0;
        score += (metrics.clarity / 100) * weights.clarity;
        score += (metrics.bassQuality / 100) * weights.bassQuality;
        score += (metrics.trebleQuality / 100) * weights.trebleQuality;
        score += Math.min(1, metrics.dynamicRange / 60) * weights.dynamicRange;
        score += Math.min(1, metrics.rms * 10) * weights.rms;
        
        return Math.min(10, Math.max(0, score * 10));
    }

    updateQualityMetrics(metrics) {
        // Update overall rating
        this.updateStars(Math.round(metrics.overallQuality));
        document.querySelector('#overallRating .score').textContent = 
            `${metrics.overallQuality.toFixed(1)}/10`;

        // Update progress bars with animation
        this.animateProgressBar('clarityProgress', 'clarityScore', metrics.clarity);
        this.animateProgressBar('bassProgress', 'bassScore', metrics.bassQuality);
        this.animateProgressBar('trebleProgress', 'trebleScore', metrics.trebleQuality);
        this.animateProgressBar('dynamicProgress', 'dynamicScore', 
            Math.min(100, (metrics.dynamicRange / 60) * 100));

        // Update bitrate
        document.getElementById('bitrateInfo').textContent = `${metrics.bitrate} kbps`;
    }

    updateStars(rating) {
        const starsContainer = document.querySelector('.stars');
        starsContainer.innerHTML = '';
        
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            if (i < Math.floor(rating / 2)) {
                star.classList.add('filled');
            }
            starsContainer.appendChild(star);
        }
    }

    animateProgressBar(progressId, scoreId, value) {
        const progressBar = document.getElementById(progressId);
        const scoreElement = document.getElementById(scoreId);
        
        let currentValue = 0;
        const targetValue = Math.min(100, Math.max(0, value));
        const increment = targetValue / 50; // 50 steps for smooth animation
        
        const animate = () => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                currentValue = targetValue;
            }
            
            progressBar.style.width = `${currentValue}%`;
            scoreElement.textContent = `${Math.round(currentValue)}%`;
            
            if (currentValue < targetValue) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    updateResultsText(metrics, file) {
        const resultsText = document.getElementById('resultsText');
        
        let analysis = `🎵 <strong>File Analysis Complete!</strong><br><br>`;
        analysis += `📁 <strong>File:</strong> ${file ? file.name : 'Unknown'}<br>`;
        analysis += `⏱️ <strong>Duration:</strong> ${metrics.duration.toFixed(2)} seconds<br>`;
        analysis += `📊 <strong>Bitrate:</strong> ${metrics.bitrate} kbps<br><br>`;
        
        analysis += `🎯 <strong>Quality Assessment:</strong><br>`;
        
        if (metrics.overallQuality >= 8) {
            analysis += `✨ <strong>Excellent quality!</strong> This track has outstanding audio characteristics.<br>`;
        } else if (metrics.overallQuality >= 6) {
            analysis += `👍 <strong>Good quality!</strong> This track has solid audio characteristics.<br>`;
        } else if (metrics.overallQuality >= 4) {
            analysis += `⚠️ <strong>Average quality.</strong> This track could benefit from better encoding.<br>`;
        } else {
            analysis += `❌ <strong>Poor quality.</strong> This track has significant audio issues.<br>`;
        }
        
        analysis += `<br>🔍 <strong>Detailed Analysis:</strong><br>`;
        analysis += `• Clarity: ${metrics.clarity.toFixed(1)}% - ${this.getQualityDescription(metrics.clarity)}<br>`;
        analysis += `• Bass Quality: ${metrics.bassQuality.toFixed(1)}% - ${this.getQualityDescription(metrics.bassQuality)}<br>`;
        analysis += `• Treble Quality: ${metrics.trebleQuality.toFixed(1)}% - ${this.getQualityDescription(metrics.trebleQuality)}<br>`;
        analysis += `• Dynamic Range: ${metrics.dynamicRange.toFixed(1)} dB - ${this.getDynamicRangeDescription(metrics.dynamicRange)}<br>`;
        
        resultsText.innerHTML = analysis;
    }

    getQualityDescription(value) {
        if (value >= 80) return 'Excellent';
        if (value >= 60) return 'Good';
        if (value >= 40) return 'Fair';
        return 'Poor';
    }

    getDynamicRangeDescription(value) {
        if (value >= 50) return 'Excellent';
        if (value >= 30) return 'Good';
        if (value >= 20) return 'Fair';
        return 'Poor';
    }

    startWaveformVisualization() {
        if (!this.audioBuffer) return;

        const audioData = this.audioBuffer.getChannelData(0);
        this.drawWaveform(audioData);
    }

    drawWaveform(data) {
        const canvas = this.canvas;
        const ctx = this.ctx;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 0, 102, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw waveform
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        
        const step = data.length / width;
        for (let i = 0; i < width; i++) {
            const dataIndex = Math.floor(i * step);
            const x = i;
            const y = height / 2 + (data[dataIndex] * height / 2);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        
        // Add animated overlay
        this.animateWaveform();
    }

    animateWaveform() {
        const canvas = this.canvas;
        const ctx = this.ctx;
        const width = canvas.width;
        const height = canvas.height;

        let offset = 0;
        
        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            
            // Redraw waveform with animation
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, 'rgba(0, 212, 255, 0.1)');
            gradient.addColorStop(1, 'rgba(255, 0, 102, 0.1)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#00d4ff';
            ctx.shadowBlur = 10;
            
            ctx.beginPath();
            
            const audioData = this.audioBuffer.getChannelData(0);
            const step = audioData.length / width;
            
            for (let i = 0; i < width; i++) {
                const dataIndex = Math.floor(i * step);
                const x = i;
                const y = height / 2 + (audioData[dataIndex] * height / 2 * Math.sin((i + offset) * 0.01));
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            
            offset += 2;
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }

    showError(message) {
        const resultsText = document.getElementById('resultsText');
        resultsText.innerHTML = `❌ <strong>Error:</strong> ${message}`;
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BeatBuddyAnalyzer();
});

// Add some interactive 3D effects
document.addEventListener('mousemove', (e) => {
    const circles = document.querySelectorAll('.circle');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    circles.forEach((circle, index) => {
        const speed = (index + 1) * 0.5;
        const xPos = (x - 0.5) * speed * 50;
        const yPos = (y - 0.5) * speed * 50;
        
        circle.style.transform = `translate(${xPos}px, ${yPos}px) rotate(${x * 360}deg)`;
    });
});

// Add parallax effect to the header
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const header = document.querySelector('.header');
    const rate = scrolled * -0.5;
    
    header.style.transform = `translateY(${rate}px) translateZ(50px)`;
});
