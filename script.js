// script.js – VOICELAB with RapidAPI (Complete Working Version)

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

// ========== RapidAPI Configuration ==========
/*
const RAPIDAPI_KEY = 'd0458b1b03msh1ca0ad5522cff6dp17804fjsnd7653add816c';
const RAPIDAPI_HOST = 'open-ai-text-to-speech1.p.rapidapi.com';
const RAPIDAPI_URL = 'https://open-ai-text-to-speech1.p.rapidapi.com/'; // ✅ Ye sahi URL hai */




/*
  npm i bytez.js || yarn add bytez.js
*/

import Bytez from "bytez.js"

const key = "a4b823696d0fd4b78527d12f0618d764"
const sdk = new Bytez(key)

// choose TTS
const model = sdk.model("kisaa/TTS")

// send input to model
const { error, output } = await model.run("https://huggingface.co/datasets/huggingfacejs/tasks/resolve/main/audio-classification/audio.wav")

console.log({ error, output });







// ========== Utility Functions ==========
function showStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.style.color = isError ? '#ef4444' : 'var(--text-secondary)';
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

// ========== Voice Mapping ==========
function getVoiceId() {
    if (specificVoice.value) return specificVoice.value;
    
    const style = voiceStyle.value;
    if (style === 'male') return 'onyx';
    if (style === 'female') return 'nova';
    if (style === 'child') return 'shimmer';
    if (style === 'old') return 'echo';
    return 'alloy'; // default
}

// ========== Main TTS Function ==========
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
        const payload = {
            model: "tts-1",
            input: text,
            voice: getVoiceId()
        };

        // Language agar specific ho to instructions mein dal sakte hain
        if (language.value === 'hi') {
            payload.instructions = "Speak in Hindi language with clear pronunciation.";
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(RAPIDAPI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-host': RAPIDAPI_HOST,
                'x-rapidapi-key': RAPIDAPI_KEY
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error (${response.status}): ${errorText.slice(0, 100)}`);
        }

        // ✅ RapidAPI se audio blob milega
        const audioBlob = await response.blob();
        
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
        console.error('Full error:', error);
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
        { name: 'Alloy (Neutral)', voice: 'alloy', lang: 'en', text: 'Hello, I am Alloy, a neutral voice.' },
        { name: 'Nova (Female)', voice: 'nova', lang: 'en', text: 'Hi, this is Nova, an energetic female voice.' },
        { name: 'Onyx (Male)', voice: 'onyx', lang: 'en', text: 'Hello, I am Onyx, a deep male voice.' },
        { name: 'Shimmer (Child-like)', voice: 'shimmer', lang: 'en', text: 'Hey there! I am Shimmer, light and playful.' },
        { name: 'Echo (Mature)', voice: 'echo', lang: 'en', text: 'Greetings, I am Echo, a resonant voice.' },
        { name: 'Hindi Test', voice: 'alloy', lang: 'hi', text: 'नमस्ते, मैं हिंदी में बोल रहा हूँ।' }
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
            specificVoice.value = s.voice;
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

// Console mein message aayega ki script load ho gayi
console.log('✅ VOICELAB script loaded successfully!');

// ========== Sidebar Navigation ==========
const navItems = document.querySelectorAll('.nav-item');
const sections = {
    'dashboard': document.getElementById('dashboardSection'),
    'voiceLab': document.getElementById('voiceLabSection'),
    'history': document.getElementById('historySection'),
    'settings': document.getElementById('settingsSection')
};

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Sabse pehle saare nav items se active class hatao
        navItems.forEach(nav => nav.classList.remove('active'));
        
        // Current item ko active karo
        item.classList.add('active');
        
        // Saari sections ko hide karo
        Object.values(sections).forEach(section => {
            if (section) section.style.display = 'none';
        });
        
        // Click ke according section dikhao
        const linkText = item.querySelector('span').textContent.toLowerCase();
        if (linkText.includes('डैशबोर्ड') || linkText.includes('dashboard')) {
            if (sections.dashboard) sections.dashboard.style.display = 'block';
        } else if (linkText.includes('वॉयस') || linkText.includes('voice')) {
            if (sections.voiceLab) sections.voiceLab.style.display = 'block';
        } else if (linkText.includes('हिस्ट्री') || linkText.includes('history')) {
            if (sections.history) sections.history.style.display = 'block';
        } else if (linkText.includes('सेटिंग्स') || linkText.includes('settings')) {
            if (sections.settings) sections.settings.style.display = 'block';
        }
    });
});

// ========== Voice Samples (Language-wise) ==========
function loadVoiceSamples() {
    const samples = {
        en: [
            { name: 'Alloy (Neutral)', voice: 'alloy', text: 'Hello, I am Alloy, a neutral voice.' },
            { name: 'Nova (Female)', voice: 'nova', text: 'Hi, this is Nova, an energetic female voice.' },
            { name: 'Onyx (Male)', voice: 'onyx', text: 'Hello, I am Onyx, a deep male voice.' },
            { name: 'Shimmer (Child)', voice: 'shimmer', text: 'Hey there! I am Shimmer, light and playful.' },
            { name: 'Echo (Mature)', voice: 'echo', text: 'Greetings, I am Echo, a resonant voice.' }
        ],
        hi: [
            { name: 'हिंदी (पुरुष)', voice: 'onyx', text: 'नमस्ते, मैं पुरुष आवाज़ में बोल रहा हूँ।' },
            { name: 'हिंदी (महिला)', voice: 'nova', text: 'नमस्ते, मैं महिला आवाज़ में बोल रही हूँ।' },
            { name: 'हिंदी (बच्चा)', voice: 'shimmer', text: 'नमस्ते, मैं बच्चे जैसी आवाज़ में बोल रहा हूँ।' }
        ]
    };

    function updateSamples() {
        const currentLang = language.value;
        const langSamples = samples[currentLang] || samples.en;
        
        voiceSamples.innerHTML = '';
        langSamples.forEach(s => {
            const card = document.createElement('div');
            card.className = 'sample-card';
            card.innerHTML = `
                <i class="fas fa-wave-square"></i>
                <div class="sample-info">
                    <h4>${s.name}</h4>
                    <p>${currentLang === 'hi' ? 'हिंदी' : 'English'}</p>
                </div>
            `;
            card.addEventListener('click', () => {
                textInput.value = s.text;
                specificVoice.value = s.voice;
                generateSpeech('play');
            });
            voiceSamples.appendChild(card);
        });
    }

    // Pehli baar load karo
    updateSamples();
    
    // Jab language change ho, tab samples update karo
    language.addEventListener('change', updateSamples);
}