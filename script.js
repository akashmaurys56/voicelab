// script.js - VOICELAB PRO Phase 1

// DOM एलिमेंट्स
const speakBtn = document.getElementById('speakBtn');
const stopBtn = document.getElementById('stopBtn');
const downloadBtn = document.getElementById('downloadBtn');
const textInput = document.getElementById('textInput');
const ttsEngine = document.getElementById('ttsEngine');
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
let allVoices = [];
let currentUtterance = null;

// स्टेटस दिखाने का फंक्शन
function showStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.style.color = isError ? '#ff6b6b' : 'white';
}

// वॉयस लिस्ट लोड करें
function loadVoices() {
    allVoices = window.speechSynthesis.getVoices();
    
    if (allVoices.length === 0) {
        setTimeout(loadVoices, 100);
        return;
    }
    
    updateVoiceSelect();
    showStatus(`✅ ${allVoices.length} आवाज़ें लोड हुईं`);
}

// वॉयस सेलेक्ट को अपडेट करें (बिना कैटेगरी के - असली नाम दिखाएँ)
function updateVoiceSelect() {
    const selectedLang = languageSelect.value;
    
    voiceSelect.innerHTML = ''; // खाली करें
    
    // भाषा के हिसाब से वॉयस फिल्टर करें
    let filteredVoices = allVoices.filter(voice => voice.lang === selectedLang);
    
    // हिंदी के लिए: अगर कोई हिंदी वॉयस नहीं मिली, तो सारी दिखाएँ
    if (filteredVoices.length === 0 && selectedLang === 'hi-IN') {
        filteredVoices = allVoices.filter(voice => voice.lang.startsWith('en'));
        showStatus('⚠️ हिंदी आवाज़ नहीं मिली, इंग्लिश आवाज़ें दिखा रहे हैं', false);
    }
    
    // हर वॉयस के लिए एक ऑप्शन बनाएँ
    filteredVoices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = allVoices.indexOf(voice); // original index स्टोर करें
        
        // वॉयस के नाम में ही लिंग का पता चल जाता है (जैसे "Microsoft Zira - Female")
        option.textContent = `${voice.name} (${voice.lang})`;
        
        voiceSelect.appendChild(option);
    });
    
    if (filteredVoices.length === 0) {
        voiceSelect.innerHTML = '<option value="">कोई आवाज़ नहीं मिली</option>';
    }
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
    
    const engine = ttsEngine.value;
    
    if (engine === 'kokoro' && languageSelect.value.startsWith('en')) {
        // Kokoro TTS (सिर्फ इंग्लिश के लिए) - Phase 2 में implement होगा
        showStatus('⚠️ Kokoro TTS Phase 2 में आएगा। अभी Web Speech API इस्तेमाल करें।', false);
        return;
    } else {
        // Web Speech API (डिफ़ॉल्ट)
        showStatus('🔄 आवाज़ बन रही है...');

        // नया utterance बनाएँ
        currentUtterance = new SpeechSynthesisUtterance(text);
        
        // लैंग्वेज सेट करें
        currentUtterance.lang = languageSelect.value;
        
        // वॉयस सेट करें (अगर चुनी हो)
        const selectedVoiceIndex = voiceSelect.value;
        if (selectedVoiceIndex !== '' && allVoices[selectedVoiceIndex]) {
            currentUtterance.voice = allVoices[selectedVoiceIndex];
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
            let errorMsg = '❌ एरर: ';
            if (event.error === 'synthesis-failed') {
                errorMsg += 'आवाज़ नहीं मिल पाई। कोई दूसरी आवाज़ चुनें।';
            } else {
                errorMsg += event.error;
            }
            showStatus(errorMsg, true);
            currentUtterance = null;
        };

        // बोलना शुरू करें
        try {
            window.speechSynthesis.speak(currentUtterance);
        } catch (e) {
            showStatus('❌ बोल नहीं सकता: ' + e.message, true);
        }
    }
}

// इवेंट लिसनर्स

// स्पीड और पिच वैल्यू अपडेट करें
speedRange.addEventListener('input', function() {
    speedValue.textContent = this.value;
});

pitchRange.addEventListener('input', function() {
    pitchValue.textContent = this.value;
});

// भाषा बदलने पर वॉयस लिस्ट अपडेट करें
languageSelect.addEventListener('change', updateVoiceSelect);

// TTS इंजन बदलने पर स्टेटस दिखाएँ
ttsEngine.addEventListener('change', function() {
    if (this.value === 'kokoro') {
        showStatus('⚠️ Kokoro TTS Phase 2 में आएगा। अभी Web Speech API चुने।', false);
    }
});

// स्पीक बटन
speakBtn.addEventListener('click', speak);

// स्टॉप बटन
stopBtn.addEventListener('click', function() {
    window.speechSynthesis.cancel();
    showStatus('⏹️ रोक दिया गया');
    currentUtterance = null;
});

// डाउनलोड बटन (अस्थायी निर्देश)
downloadBtn.addEventListener('click', function() {
    const text = textInput.value.trim();
    
    if (text === '') {
        showStatus('❌ डाउनलोड के लिए कुछ टेक्स्ट लिखें!', true);
        return;
    }
    
    // निर्देश वाला अलर्ट
    const instructions = `
🎙️ MP3 डाउनलोड करने के लिए:

1. अपने सिस्टम का साउंड रिकॉर्डर खोलें:
   - Windows: Voice Recorder ऐप
   - Mac: QuickTime Player (File → New Audio Recording)
   - Android: कोई भी रिकॉर्डिंग ऐप
   - iPhone: Voice Memos

2. इस वेबसाइट पर "बोलें" बटन दबाएँ

3. रिकॉर्डिंग शुरू करें और आवाज़ रिकॉर्ड करें

4. रिकॉर्डिंग को MP3 में बदलें (online converter से)

⚡ जल्द ही हम डायरेक्ट MP3 डाउनलोड फीचर लाएँगे (Kokoro TTS के साथ)!
    `;
    
    alert(instructions);
    showStatus('📝 ऊपर दिए गए निर्देश देखें', false);
});

// अपलोड बटन
uploadBtn.addEventListener('click', function() {
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

// कुछ ब्राउज़र में वॉयस लोड होने में टाइम लगता है, इसलिए बैकअप
setTimeout(() => {
    if (allVoices.length === 0) {
        loadVoices();
    }
}, 500);

// ब्राउज़र बंद होने पर स्पीच रोकें
window.addEventListener('beforeunload', function() {
    if (currentUtterance) {
        window.speechSynthesis.cancel();
    }
});