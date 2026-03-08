// script.js – VOICELAB with StreamElements TTS (Free, Reliable)

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

// ========== Voice Mapping for StreamElements ==========
// List of available voices: https://github.com/Gamer5001/Streamelements-TTS/blob/main/voices.md
const voiceMap = {
    // Hindi
    hi: {
        male: 'hi-IN-RaviNeural',
        female: 'hi-IN-SwaraNeural',   // Actually StreamElements uses Azure voices, but let's map correctly
        default: 'hi-IN-SwaraNeural'
    },
    // English (US)
    en: {
        male: 'en-US-JoeyNeural',
        female: 'en-US-JennyNeural',
        child: 'en-US-ChristopherNeural', // Christopher is a child-like voice
        old: 'en-US-GuyNeural',           // Guy is mature
        default: 'en-US-JennyNeural'
    },
    // English (UK)
    'en-gb': {
        male: 'en-GB-RyanNeural',
        female: 'en-GB-LibbyNeural',
        default: 'en-GB-LibbyNeural'
    }
};

// Function to get voice ID based on language and style
function getVoiceId(lang, style) {
    // If user selected a specific voice, use it directly
    if (specificVoice.value) return specificVoice.value;

    // Determine language code
    let langCode = lang;
    if (lang === 'auto') langCode = 'en'; // default to English if auto

    const langMap = voiceMap[langCode] || voiceMap.en; // fallback to English
    if (style === 'male' && langMap.male) return langMap.male;
    if (style === 'female' && langMap.female) return langMap.female;
    if (style === 'child' && langMap.child) return langMap.child;
    if (style === 'old' && langMap.old) return langMap.old;
    return langMap.default || 'en-US-JennyNeural';
}

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

// ========== Main TTS Generation Function (StreamElements) ==========
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
        // Get voice ID based on selected language and style
        const voiceId = getVoiceId(language.value, voiceStyle.value);
        const encodedText = encodeURIComponent(text);

        // StreamElements API endpoint
        const url = `https://api.streamelements.com/kappa/v2/speech?voice=${voiceId}&text=${encodedText}`;

        // Fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error (${response.status}): ${errorText.slice(0, 100)}`);
        }

        // Get audio blob
        const audioBlob = await response.blob();
        if (currentAudioUrl) URL.revokeObjectURL(currentAudioUrl);
        currentAudioUrl = URL.createObjectURL(audioBlob);

        if (action === 'play') {
            audioElement.src = currentAudioUrl;
            audioPlayer.style.display = 'block';

            // Handle audio errors
            audioElement.onerror = (e) => {
                console.error('Audio error:', e);
                showStatus('❌ ऑडियो चलाने में समस्या। दोबारा प्रयास करें।', true);
                audioPlayer.style.display = 'none';
            };

            audioElement.onloadeddata = () => {
                showStatus('✅ आवाज़ तैयार!');
                audioElement.play().catch(e => {
                    showStatus('⚠️ ऑटो-प्ले नहीं हो सका, प्ले बटन दबाएँ', false);
                });
            };
        } else {
            // Download
            const a = document.createElement('a');
            a.href = currentAudioUrl;
            a.download = `voicelab-${Date.now()}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showStatus('✅ डाउनलोड शुरू!');
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            showStatus('❌ टाइमआउट – सर्वर धीमा है। बाद में प्रयास करें।', true);
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

// ========== Voice Samples (Updated for StreamElements) ==========
function loadVoiceSamples() {
    const samples = [
        { name: 'Jenny (US Female)', voice: 'en-US-JennyNeural', lang: 'en', text: 'Hello, I am Jenny, your virtual assistant.' },
        { name: 'Joey (US Male)', voice: 'en-US-JoeyNeural', lang: 'en', text: 'Hi, this is Joey. I speak in a natural voice.' },
        { name: 'Ravi (Hindi Male)', voice: 'hi-IN-RaviNeural', lang: 'hi', text: 'नमस्ते, मैं रवि हूँ। मैं हिंदी में बोलता हूँ।' },
        { name: 'Swara (Hindi Female)', voice: 'hi-IN-SwaraNeural', lang: 'hi', text: 'नमस्ते, मैं स्वरा हूँ। आप कैसे हैं?' },
        { name: 'Ryan (UK Male)', voice: 'en-GB-RyanNeural', lang: 'en-gb', text: 'Good day, this is Ryan from London.' },
        { name: 'Libby (UK Female)', voice: 'en-GB-LibbyNeural', lang: 'en-gb', text: 'Hello, Libby here, with a British accent.' }
    ];

    voiceSamples.innerHTML = '';
    samples.forEach(s => {
        const card = document.createElement('div');
        card.className = 'sample-card';
        card.innerHTML = `
            <i class="fas fa-wave-square"></i>
            <div class="sample-info">
                <h4>${s.name}</h4>
                <p>${s.lang === 'hi' ? 'हिंदी' : s.lang === 'en-gb' ? 'English (UK)' : 'English (US)'}</p>
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