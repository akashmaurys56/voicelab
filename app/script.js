document.getElementById('speakBtn').addEventListener('click', function() {
    const text = document.getElementById('textInput').value;
    const lang = document.getElementById('languageSelect').value;

    if (text.trim() === '') {
        alert('कृपया कुछ टेक्स्ट लिखें!');
        return;
    }

    // Web Speech API का इस्तेमाल
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    // वॉयस सेलेक्शन (ऑप्शनल)
    const voices = speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.lang === lang);
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    speechSynthesis.speak(utterance);
});