// Mengambil elemen-elemen yang dibutuhkan
const startBtn = document.getElementById('start-btn');
const instructionText = document.getElementById('instruction-text');
const candleWrapper = document.getElementById('candle-wrapper');
const surpriseMessage = document.getElementById('surprise-message');

// Variabel untuk Audio Processing
let audioContext;
let analyser;
let microphone;
let javascriptNode;

// Threshold (Ambang Batas) suara tiupan. 
// Jika suara mic melebihi ini, lilin dianggap ditiup.
// Kecilkan angka ini (misal ke 30) jika mic kurang sensitif.
const BLOW_THRESHOLD = 50; 

// Menambahkan event listener ke tombol "Ready"
startBtn.addEventListener('click', startMicrophone);

function startMicrophone() {
    // 1. Meminta izin pengguna untuk mengakses mikrofon
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then(function(stream) {
        // Izin diberikan, ubah UI
        startBtn.style.display = 'none'; // Sembunyikan tombol
        instructionText.innerText = "Okay, now blow the candle hard! 😙💨";
        instructionText.style.color = "#333";

        // 2. Setup Audio Context dan Analyser
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;

        // Menghubungkan node-node audio
        microphone.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);

        // 3. Memproses input suara secara terus-menerus
        javascriptNode.onaudioprocess = function() {
            let array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            let values = 0;

            let length = array.length;
            for (let i = 0; i < length; i++) {
                values += (array[i]);
            }

            // Menghitung rata-rata volume (rms)
            let average = values / length;

            console.log("Volume:", average); // Cek volume di console untuk debugging

            // 4. Cek apakah volume melebihi ambang batas (tiupan)
            if (average > BLOW_THRESHOLD) {
                blowOutCandle();
            }
        };
    })
    .catch(function(err) {
        // Jika izin ditolak atau ada error
        console.error("The following gUM error occured: " + err);
        instructionText.innerText = "Ops! Mic permission is needed. Please allow it.";
        instructionText.style.color = "red";
    });
}

function blowOutCandle() {
    // Menambahkan class CSS untuk mematikan lilin (animasi asap)
    candleWrapper.classList.add('blown-out');
    instructionText.style.display = 'none'; // Sembunyikan petunjuk

    // Menghentikan pemrosesan audio agar tidak deteksi tiupan lagi
    if (javascriptNode) {
        javascriptNode.onaudioprocess = null; 
        microphone.disconnect();
        analyser.disconnect();
    }

    // Menampilkan pesan kejutan setelah delay singkat (biar estetik)
    setTimeout(() => {
        surpriseMessage.classList.remove('hidden');
        
        // Opsional: Bisa tambahkan suara 'Tadaa!' di sini kalau mau
        // let audio = new Audio('tada.mp3'); audio.play();
    }, 1500); // Muncul setelah 1.5 detik lilin mati
}