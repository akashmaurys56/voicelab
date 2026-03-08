// script.js – VOICELAB with Pollinations API (Free, No Key)

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
let currentAudioUrl = null;      // Store blob URL for download
let isGenerating = false;        // Prevent double clicks

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
        // Optional: define light theme variables
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
});

// ========== Voice Style Mapping to Pollinations Voice ==========
function mapStyleToVoice(style, lang) {
    if (specificVoice.value) return specificVoice.value; // if user selected specific

    switch (style) {
        case 'male': return 'onyx';      // deep male
        case 'female': return 'nova';     // energetic female
        case 'child': return 'shimmer';   // light, child-like
        case 'old': return 'echo';        // resonant, mature
        default: return 'alloy';           // neutral
    }
}

// ========== Main TTS Generation Function (Pollinations API) ==========
async function generateSpeech(action = 'play') {
    const text = textInput.value.trim();
    if (!text) {
        showStatus('❌ कृपया कुछ टेक्स्ट लिखें!', true);
        return;
    }

    // Prevent multiple clicks
    if (isGenerating) return;
    isGenerating = true;
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> जनरेट हो रहा...';
    showStatus('🔄 आवाज़ बन रही है...');

    try {
        // Prepare API parameters
        const voice = mapStyleToVoice(voiceStyle.value, language.value);
        const lang = language.value === 'auto' ? '' : language.value;

        // Construct URL – Pollinations API expects text in URL path
        const encodedText = encodeURIComponent(text);
        const url = `https://text.pollinations.ai/${encodedText}?voice=${voice}${lang ? '&lang=' + lang : ''}`;

        // Fetch audio
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const audioBlob = await response.blob();
        if (currentAudioUrl) URL.revokeObjectURL(currentAudioUrl); // cleanup old
        currentAudioUrl = URL.createObjectURL(audioBlob);

        if (action === 'play') {
            audioElement.src = currentAudioUrl;
            audioPlayer.style.display = 'block';
            await audioElement.play();
            showStatus('✅ आवाज़ तैयार!');
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
        showStatus('❌ एरर: ' + error.message, true);
    } finally {
        isGenerating = false;
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-play"></i> जनरेट करें';
    }
}

// ========== Event Listeners for Buttons ==========
generateBtn.addEventListener('click', () => generateSpeech('play'));
downloadBtn.addEventListener('click', () => generateSpeech('download'));

stopBtn.addEventListener('click', () => {
    audioElement.pause();
    audioElement.currentTime = 0;
    showStatus('⏹️ रोक दिया गया');
});

// ========== Voice Samples (Predefined) ==========
function loadVoiceSamples() {
    const samples = [
        { name: 'Alloy (संतुलित)', voice: 'alloy', lang: 'en', text: 'Hello, this is Alloy speaking.' },
        { name: 'Echo (गूंजदार)', voice: 'echo', lang: 'en', text: 'Greetings from Echo, your resonant voice.' },
        { name: 'Nova (महिला)', voice: 'nova', lang: 'en', text: 'Hi there, Nova here with energy.' },
        { name: 'Onyx (पुरुष)', voice: 'onyx', lang: 'en', text: 'This is Onyx, a deep male voice.' },
        { name: 'Shimmer (बच्चा)', voice: 'shimmer', lang: 'en', text: 'Hey, I am Shimmer, light and playful.' },
        { name: 'हिंदी नमूना', voice: 'alloy', lang: 'hi', text: 'नमस्ते, मैं हिंदी में बोल रहा हूँ।' }
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

// ========== Clean up on page unload ==========
window.addEventListener('beforeunload', () => {
    if (currentAudioUrl) URL.revokeObjectURL(currentAudioUrl);
});

// ========== NOTE: भविष्य में दूसरा API लगाने के लिए ==========
/* 
   बस generateSpeech() फंक्शन के अंदर API URL और पैरामीटर बदल दें।
   उदाहरण: अगर आपको ElevenLabs जैसा API मिल जाए, तो fetch का URL बदलें
   और जरूरत के हिसाब से headers और body सेट करें।
   बाकी सारा UI और कंट्रोल वैसे ही रहेगा।
*/