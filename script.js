// script.js – VOICELAB with Google TTS + CORS Proxy

// ========== DOM Elements ==========
const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const language = document.getElementById('language');
const voiceStyle = document.getElementById('voiceStyle');
const specificVoice = document.getElementById('specificVoice');
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

// ========== Global Variables ==========
let currentAudioUrl = null;
let isGenerating = false;

// ========== Language to Google TTS Code Mapping ==========
const langMap = {
    'hi': 'hi',
    'en': 'en-US',
    'en-gb': 'en-GB',
    'auto': 'en-US'
};

// ========== Utility Functions ==========
function showStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.style.color = isError ? 'var(--error)' : 'var(--text-secondary)';
}

function updateCharCount() {
    const count = textInput.value.length;
    charCount.textContent = count;
    charCount.style.color = count > 4500 ? 'var(--warning)' : 'var(--accent-primary)';
}

// ========== Slider Updates ==========
speed.addEventListener('input', () => speedValue.textContent = speed.value + 'x');
pitch.addEventListener('input', () => pitchValue.textContent = pitch.value);
stability.addEventListener('input', () => stabilityValue.textContent = Math.round(stability.value * 100) + '%');
clarity.addEventListener('input', () => clarityValue.textContent = Math.round(clarity.value * 100) + '%');
textInput.addEventListener('input', updateCharCount);

// ========== Theme Toggle ==========
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

// ========== Main TTS Generation Function (Google TTS + CORS Proxy) ==========
async function generateSpeech(action = 'play') {
    const text = textInput.value.trim();
    if (!text) {
        showStatus('❌ कृपया कुछ टेक्स्ट लिखें!', true);
        return;
    }

    if (isGenerating) return;
    isGenerating = true;
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> जनरेट हो रहा...';
    showStatus('🔄 आवाज़ बन रही है...');

    try {
        let langCode = language.value;
        if (langCode === 'auto') langCode = 'en';
        const ttsLang = langMap[langCode] || 'en-US';
        
        const encodedText = encodeURIComponent(text);
        
        // Google TTS URL
        const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${ttsLang}&client=tw-ob&prev=input`;
        
        // CORS Proxy URL (allorigins)
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(googleUrl)}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 sec timeout

        const response = await fetch(proxyUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const audioBlob = await response.blob();
        
        // Check if blob is actually audio
        if (audioBlob.type && !audioBlob.type.includes('audio') && audioBlob.type.includes('text')) {
            const text = await audioBlob.text();
            throw new Error(`Proxy returned text: ${text.slice(0, 100)}`);
        }

        if (currentAudioUrl) URL.revokeObjectURL(currentAudioUrl);
        currentAudioUrl = URL.createObjectURL(audioBlob);

        if (action === 'play') {
            audioElement.src = currentAudioUrl;
            audioPlayer.style.display = 'block';

            audioElement.onerror = (e) => {
                console.error('Audio error:', e);
                showStatus('❌ ऑडियो चलाने में समस्या।', true);
                audioPlayer.style.display = 'none';
            };

            audioElement.onloadeddata = () => {
                showStatus('✅ आवाज़ तैयार!');
                audioElement.play().catch(() => {
                    showStatus('⚠️ प्ले बटन दबाएँ', false);
                });
            };
        } else {
            const a = document.createElement('a');
            a.href = currentAudioUrl;
            a.download = `voicelab-${Date.now()}.mp3`;
            a.click();
            showStatus('✅ डाउनलोड शुरू!');
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            showStatus('❌ टाइमआउट – सर्वर धीमा है।', true);
        } else {
            showStatus('❌ एरर: ' + error.message, true);
        }
        console.error(error);
    } finally {
        isGenerating = false;
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-play"></i> जनरेट करें';
    }
}

// ========== Event Listeners ==========
generateBtn.addEventListener('click', () => generateSpeech('play'));
downloadBtn.addEventListener('click', () => generateSpeech('download'));

stopBtn.addEventListener('click', () => {
    audioElement.pause();
    audioElement.currentTime = 0;
    showStatus('⏹️ रोक दिया गया');
});

// ========== Voice Samples ==========
function loadVoiceSamples() {
    const samples = [
        { name: 'English US', lang: 'en', text: 'Hello, this is an English voice.' },
        { name: 'English UK', lang: 'en-gb', text: 'Hello, this is a British English voice.' },
        { name: 'हिंदी', lang: 'hi', text: 'नमस्ते, मैं हिंदी में बोल रहा हूँ।' }
    ];

    voiceSamples.innerHTML = '';
    samples.forEach(s => {
        const card = document.createElement('div');
        card.className = 'sample-card';
        card.innerHTML = `
            <i class="fas fa-wave-square"></i>
            <div class="sample-info">
                <h4>${s.name}</h4>
                <p>${s.lang === 'hi' ? 'हिंदी' : 'English'}</p>
            </div>
        `;
        card.addEventListener('click', () => {
            textInput.value = s.text;
            language.value = s.lang;
            generateSpeech('play');
        });
        voiceSamples.appendChild(card);
    });
}

// ========== Initialize ==========
updateCharCount();
loadVoiceSamples();

// ========== Cleanup ==========
window.addEventListener('beforeunload', () => {
    if (currentAudioUrl) URL.revokeObjectURL(currentAudioUrl);
});