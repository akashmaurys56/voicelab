// script.js - VOICELAB NATURAL के लिए एडवांस वॉयस कंट्रोल

// DOM एलिमेंट्स
const speakBtn = document.getElementById('speakBtn');
const stopBtn = document.getElementById('stopBtn');
const downloadBtn = document.getElementById('downloadBtn');
const textInput = document.getElementById('textInput');
const languageSelect = document.getElementById('languageSelect');
const voiceCategory = document.getElementById('voiceCategory');
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
    statusDiv.style.color = isError ? '#e53e3e' : '#667eea';
}

// वॉयस को कैटेगरी में बांटें (Male, Female, Child, Old)
function categorizeVoice(voice) {
    const name = voice.name.toLowerCase();
    const lang = voice.lang;
    
    // हिंदी के लिए खास पहचान
    if (lang.includes('hi')) {
        if (name.includes('female') || name.includes('woman') || name.includes('girl') || name.includes('महिला')) {
            return 'female';
        } else if (name.includes('male') || name.includes('man') || name.includes('boy') || name.includes('पुरुष')) {
            return 'male';
        } else if (name.includes('child') || name.includes('kid') || name.includes('बच्चा')) {
            return 'child';
        } else if (name.includes('old') || name.includes('aged') || name.includes('बुजुर्ग')) {
            return 'old';
        }
    }
    
    // इंग्लिश के लिए पहचान
    if (name.includes('female') || name.includes('woman') || name.includes('girl')) {
        return 'female';
    } else if (name.includes('male') || name.includes('man') || name.includes('boy')) {
        return 'male';
    } else if (name.includes('child') || name.includes('kid')) {
        return 'child';
    } else if (name.includes('old') || name.includes('aged') || name.includes('elder')) {
        return 'old';
    }
    
    // पिच के आधार पर अनुमान (ज्यादा पिच = female/child, कम पिच = male/old)
    // यह सटीक नहीं है, लेकिन काम चल जाएगा
    if (voice.default) {
        return 'male'; // default usually male
    }
    
    return 'all'; // अगर कुछ पता न चले
}

// वॉयस लिस्ट लोड करें और अपडेट करें
function loadVoices() {
    allVoices = window.speechSynthesis.getVoices();
    
    if (allVoices.length === 0) {
        setTimeout(loadVoices, 100);
        return;
    }
    
    updateVoiceSelect();
    showStatus(`✅ ${allVoices.length} आवाज़ें लोड हुईं`);
}

// वॉयस सेलेक्ट को अपडेट करें (भाषा और कैटेगरी के हिसाब से)
function updateVoiceSelect() {
    const selectedLang = languageSelect.value;
    const selectedCategory = voiceCategory.value;
    
    // पहले सेलेक्ट को खाली करें
    voiceSelect.innerHTML = '<option value="">कोई खास आवाज़ चुनें</option>';
    
    // भाषा के हिसाब से वॉयस फिल्टर करें
    let filteredVoices = allVoices.filter(voice => voice.lang === selectedLang);
    
    // हिंदी के लिए: अगर कोई हिंदी वॉयस नहीं मिली, तो इंग्लिश वाली भी दिखाएँ
    if (filteredVoices.length === 0 && selectedLang === 'hi-IN') {
        filteredVoices = allVoices.filter(voice => voice.lang.includes('en'));
        showStatus('⚠️ हिंदी आवाज़ नहीं मिली, इंग्लिश आवाज़ें दिखा रहे हैं', false);
    }
    
    // कैटेगरी के हिसाब से फिल्टर करें
    if (selectedCategory !== 'all') {
        filteredVoices = filteredVoices.filter(voice => {
            const category = categorizeVoice(voice);
            return category === selectedCategory;
        });
    }
    
    // फिल्टर की गई वॉयस को सेलेक्ट में ऐड करें
    filteredVoices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = allVoices.indexOf(voice); // original index स्टोर करें
        const category = categorizeVoice(voice);
        let emoji = '🔊';
        if (category === 'male') emoji = '👨';
        if (category === 'female') emoji = '👩';
        if (category === 'child') emoji = '🧒';
        if (category === 'old') emoji = '👴';
        
        option.textContent = `${emoji} ${voice.name} (${voice.lang})`;
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

    // नेचुरल साउंड के लिए थोड़ा वॉल्यूम एडजस्ट करें
    currentUtterance.volume = 1;

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
voiceCategory.addEventListener('change', updateVoiceSelect);

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
    
    showStatus('⚠️ MP3 डाउनलोड के लिए Chrome का इस्तेमाल करें। अभी आप स्क्रीन रिकॉर्ड कर सकते हैं।');
    
    // भविष्य में MP3 जनरेशन के लिए
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