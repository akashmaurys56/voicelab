// script.js - VOICELAB PRO की एडवांस कार्यक्षमता

// DOM एलिमेंट्स
const speakBtn = document.getElementById('speakBtn');
const stopBtn = document.getElementById('stopBtn');
const downloadBtn = document.getElementById('downloadBtn');
const textInput = document.getElementById('textInput');
const languageSelect = document.getElementById('languageSelect');
const voiceSelect = document.getElementById('voiceSelect');
const speedRange = document.getElementById('speedRange');
const pitchRange = document.getElementById('pitchRange');
const speedValue = document.getElementById('speedValue');
const pitchValue = document.getElementById('pitchValue');
const statusDiv = document.getElementById('status');
const uploadBtn = document.getElementById('uploadBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');

// वेरिएबल्स
let voices = [];
let currentUtterance = null;

// स्टेटस दिखाने का फंक्शन
function showStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.style.color = isError ? '#e53e3e' : '#667eea';
}

// वॉयस लिस्ट लोड करें
function loadVoices() {
    voices = window.speechSynthesis.getVoices();
    
    // वॉयस सेलेक्ट को क्लियर करें
    voiceSelect.innerHTML = '<option value="">डिफ़ॉल्ट आवाज़ चुनें</option>';
    
    // सभी वॉयस को सेलेक्ट में ऐड करें
    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
    
    console.log('Voices loaded:', voices.length);
}

// बोलने का फंक्शन
function speak() {
    const text = textInput.value.trim();
    
    if (text === '') {
        showStatus('❌ कृपया कुछ टेक्स्ट लिखें!', true);
        return;
    }

    // पहले से चल रही आवाज़ रोकें
    window.speechSynthesis.cancel();
    
    showStatus('🔄 आवाज़ बन रही है...');

    // नया utterance बनाएँ
    currentUtterance = new SpeechSynthesisUtterance(text);
    
    // लैंग्वेज सेट करें
    currentUtterance.lang = languageSelect.value;
    
    // वॉयस सेट करें (अगर चुनी हो)
    const selectedVoiceIndex = voiceSelect.value;
    if (selectedVoiceIndex !== '' && voices[selectedVoiceIndex]) {
        currentUtterance.voice = voices[selectedVoiceIndex];
    }
    
    // स्पीड और पिच सेट करें
    currentUtterance.rate = parseFloat(speedRange.value);
    currentUtterance.pitch = parseFloat(pitchRange.value);

    // इवेंट हैंडलर
    currentUtterance.onstart = function() {
        showStatus('🔊 बोल रहा हूँ...');
    };

    currentUtterance.onend = function() {
        showStatus('✅ हो गया!');
        currentUtterance = null;
    };

    currentUtterance.onerror = function(event) {
        showStatus('❌ एरर: ' + event.error, true);
        currentUtterance = null;
    };

    // बोलना शुरू करें
    window.speechSynthesis.speak(currentUtterance);
}

// स्पीड और पिच वैल्यू अपडेट करें
speedRange.addEventListener('input', function() {
    speedValue.textContent = this.value;
});

pitchRange.addEventListener('input', function() {
    pitchValue.textContent = this.value;
});

// स्पीक बटन
speakBtn.addEventListener('click', speak);

// स्टॉप बटन
stopBtn.addEventListener('click', function() {
    window.speechSynthesis.cancel();
    showStatus('⏹️ रोक दिया गया');
    currentUtterance = null;
});

// डाउनलोड बटन (सिर्फ Chrome में काम करता है)
downloadBtn.addEventListener('click', function() {
    const text = textInput.value.trim();
    
    if (text === '') {
        showStatus('❌ डाउनलोड के लिए कुछ टेक्स्ट लिखें!', true);
        return;
    }
    
    showStatus('⚠️ MP3 डाउनलोड सिर्फ Chrome में काम करता है। अभी आप रिकॉर्डिंग सॉफ्टवेयर से रिकॉर्ड कर सकते हैं।');
    
    // यहाँ भविष्य में MP3 जनरेशन ऐड कर सकते हैं
});

// अपलोड बटन
uploadBtn.addEventListener('click', function() {
    // एक hidden file input बनाएँ
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt';
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                textInput.value = e.target.result;
                showStatus('✅ फाइल लोड हो गई!');
            };
            reader.readAsText(file);
        }
    });
    
    fileInput.click();
});

// क्लियर बटन
clearBtn.addEventListener('click', function() {
    textInput.value = '';
    showStatus('🗑️ टेक्स्ट क्लियर हो गया');
});

// कॉपी बटन
copyBtn.addEventListener('click', function() {
    const text = textInput.value.trim();
    
    if (text === '') {
        showStatus('❌ कॉपी करने के लिए कुछ टेक्स्ट लिखें!', true);
        return;
    }
    
    navigator.clipboard.writeText(text).then(function() {
        showStatus('✅ टेक्स्ट कॉपी हो गया!');
    }).catch(function() {
        showStatus('❌ कॉपी नहीं हो सका', true);
    });
});

// शॉर्टकट: Ctrl + Enter
textInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        speak();
    }
});

// ब्राउज़र में वॉयस लोड होने पर
if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
}

// पेज लोड होने पर वॉयस लोड करें
loadVoices();

// ब्राउज़र बंद होने पर स्पीच रोकें
window.addEventListener('beforeunload', function() {
    if (currentUtterance) {
        window.speechSynthesis.cancel();
    }
});