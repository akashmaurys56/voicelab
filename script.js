// script.js - VOICELAB की सारी कार्यक्षमता

// DOM एलिमेंट्स को वेरिएबल में स्टोर करें
const speakBtn = document.getElementById('speakBtn');
const textInput = document.getElementById('textInput');
const languageSelect = document.getElementById('languageSelect');
const statusDiv = document.getElementById('status');

// स्टेटस मैसेज दिखाने का फंक्शन
function showStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.style.color = isError ? '#e53e3e' : '#667eea';
}

// स्पीक बटन पर क्लिक इवेंट
speakBtn.addEventListener('click', function() {
    const text = textInput.value.trim();
    const lang = languageSelect.value;

    // अगर टेक्स्ट खाली है
    if (text === '') {
        showStatus('❌ कृपया कुछ टेक्स्ट लिखें!', true);
        return;
    }

    showStatus('🔄 आवाज़ बन रही है...');

    // Web Speech API का इस्तेमाल
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1;      // स्पीड नॉर्मल
    utterance.pitch = 1;     // पिच नॉर्मल

    // जब बोलना शुरू हो
    utterance.onstart = function() {
        showStatus('🔊 बोल रहा हूँ...');
    };

    // जब बोलना खत्म हो
    utterance.onend = function() {
        showStatus('✅ हो गया!');
    };

    // अगर कोई एरर हो
    utterance.onerror = function(event) {
        showStatus('❌ एरर: ' + event.error, true);
    };

    // पहले से चल रही किसी भी आवाज़ को रोकें
    window.speechSynthesis.cancel();
    
    // बोलना शुरू करें
    window.speechSynthesis.speak(utterance);
});

// ब्राउज़र में वॉयसेस लोड होने पर (डीबगिंग के लिए)
window.speechSynthesis.onvoiceschanged = function() {
    const voices = window.speechSynthesis.getVoices();
    console.log('Available voices:', voices.length);
};

// शॉर्टकट: Ctrl + Enter दबाने पर बोलें
textInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        speakBtn.click();
    }
});