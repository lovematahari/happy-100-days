let blowCount = 0; // Menghitung jumlah tiupan
let isCoolingDown = false; // Biar nggak kedeteksi beruntun dalam 1 detik

const startBtn = document.getElementById('start-btn');
const instructionText = document.getElementById('instruction-text');
const candleWrapper = document.getElementById('candle-wrapper');
const surpriseMessage = document.getElementById('surprise-message');
const flame = document.getElementById('flame');

startBtn.addEventListener('click', startMicrophone);

function startMicrophone() {
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        startBtn.style.display = 'none';
        instructionText.innerText = "Blow it once! 😙💨";
        
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

        analyser.fftSize = 1024;
        microphone.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);

        javascriptNode.onaudioprocess = () => {
            let array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            let average = array.reduce((a, b) => a + b) / array.length;

            // Jika suara tiupan terdeteksi (Threshold 50)
            if (average > 50 && !isCoolingDown) {
                handleBlow();
            }
        };
    });
}

function handleBlow() {
    blowCount++;
    isCoolingDown = true;

    if (blowCount === 1) {
        // Efek tiupan pertama: Api redup sebentar lalu balik lagi
        flame.style.opacity = "0.2";
        instructionText.innerText = "One more time! Stronger! 🔥";
        
        setTimeout(() => {
            flame.style.opacity = "1";
            isCoolingDown = false; // Bisa ditiup lagi setelah 1 detik
        }, 1000);

    } else if (blowCount === 2) {
        // Tiupan kedua: Mati total
        candleWrapper.classList.add('blown-out');
        instructionText.style.display = 'none';
        setTimeout(() => {
            surpriseMessage.classList.remove('hidden');
        }, 1000);
    }
}
