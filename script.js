// script.js - VOICELAB PRO with XTTS-v2 API

// API Configuration (अपने Hugging Face Space का URL डालें)
const API_BASE_URL = 'https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space';
const API_KEY = 'YOUR_API_KEY'; // ऊपर जनरेट किया हुआ FRIEND_1_TOKEN

// DOM Elements
const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const language = document.getElementById('language');
const voiceStyle = document.getElementById('voiceStyle');
const speed = document.getElementById('speed');
const pitch = document.getElementById('pitch');
const stability = document.getElementById('stability');
const clarity = document.getElementById('clarity');
const speedValue = document.getElementById('speedValue');
const pitchValue = document.getElementById('pitchValue');
const stabilityValue = document.getElementById('stabilityValue');
const clarityValue = document.getElementById('clarityValue');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const stopBtn = document.getElementById('stopBtn');
const audioPlayer = document.getElementById('audioPlayer');
const audioElement = document.getElementById('audioElement');
const statusDiv = document.getElementById('status');
const voiceSamples = document.getElementById('voiceSamples');
const themeToggle = document.getElementById('themeToggle');

// State
let currentAudioUrl = null;
let isGenerating = false;

// Character Counter
textInput.addEventListener('input', () => {
    const count = textInput.value.length;
    charCount.textContent = count;
    
    // Warning at 4500 characters
    if (count > 4500) {
        charCount.style.color = 'var(--warning)';
    } else {
        charCount.style.color = 'var(--accent-primary)';
    }
});

// Slider Values
speed.addEventListener('input', () => {
    speedValue.textContent = speed.value + 'x';
});

pitch.addEventListener('input', () => {
    pitchValue.textContent = pitch.value;
});

stability.addEventListener('input', () => {
    stabilityValue.textContent = Math.round(stability.value * 100) + '%';
});

clarity.addEventListener('input', () => {
    clarityValue.textContent = Math.round(clarity.value * 100) + '%';
});

// Theme Toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const icon = themeToggle.querySelector('i');
    if (document.body.classList.contains('light-theme')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
});

// Show Status
function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.style.color = type === 'error' ? 'var(--error)' : 
                           type === 'success' ? 'var(--success)' : 
                           'var(--text-secondary)';
}

// Load Voice Samples
async function loadVoiceSamples() {
    try {
        const response = await fetch(`${API_BASE_URL}/voices`, {
            headers: {
                'key': API_KEY
            }
        });
        
        const data = await response.json();
        
        voiceSamples.innerHTML = '';
        data.voices.forEach(voice => {
            const card = document.createElement('div');
            card.className = 'sample-card';
            card.innerHTML = `
                <i class="fas fa-wave-square"></i>
                <div class="sample-info">
                    <h4>${voice.voice_id}</h4>
                    <p>${voice.description || 'Default voice'}</p>
                </div>
            `;
            card.addEventListener('click', () => playSample(voice.voice_id));
            voiceSamples.appendChild(card);
        });
    } catch (error) {
        console.error('Failed to load voices:', error);
    }
}

// Play Voice Sample
function playSample(voiceId) {
    textInput.value = `This is a sample of the ${voiceId} voice. यह ${voiceId} आवाज़ का नमूना है।`;
    generateSpeech();
}

// Generate Speech
async function generateSpeech() {
    if (!textInput.value.trim()) {
        showStatus('❌ Please enter some text!', 'error');
        return;
    }
    
    isGenerating = true;
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    
    showStatus('🔄 Generating speech...');
    
    try {
        // Voice mapping based on style
        let voiceId = 'default';
        if (voiceStyle.value === 'male') voiceId = 'male_1';
        else if (voiceStyle.value === 'female') voiceId = 'female_1';
        else if (voiceStyle.value === 'child') voiceId = 'child_1';
        else if (voiceStyle.value === 'old') voiceId = 'old_1';
        
        const response = await fetch(`${API_BASE_URL}/tts`, {
            method: 'POST',
            headers: {
                'key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: textInput.value,
                voice: voiceId,
                language: language.value,
                format: 'mp3',
                speed: parseFloat(speed.value),
                pitch: parseFloat(pitch.value)
            })
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        // Get audio blob
        const audioBlob = await response.blob();
        currentAudioUrl = URL.createObjectURL(audioBlob);
        
        // Update audio player
        audioElement.src = currentAudioUrl;
        audioPlayer.style.display = 'block';
        
        // Auto-play
        await audioElement.play();
        
        showStatus('✅ Speech generated successfully!', 'success');
        
    } catch (error) {
        showStatus('❌ Error: ' + error.message, 'error');
        console.error(error);
    } finally {
        isGenerating = false;
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-play"></i> Generate Speech';
    }
}

// Download MP3
function downloadMP3() {
    if (!currentAudioUrl) {
        showStatus('❌ No audio to download! Generate first.', 'error');
        return;
    }
    
    const a = document.createElement('a');
    a.href = currentAudioUrl;
    a.download = `voice-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showStatus('✅ Download started!', 'success');
}

// Stop playback
function stopPlayback() {
    audioElement.pause();
    audioElement.currentTime = 0;
}

// Event Listeners
generateBtn.addEventListener('click', generateSpeech);
downloadBtn.addEventListener('click', downloadMP3);
stopBtn.addEventListener('click', stopPlayback);

// Initialize
loadVoiceSamples();

// Clean up object URLs
window.addEventListener('beforeunload', () => {
    if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
    }
});