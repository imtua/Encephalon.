// --- Roboflow Configuration ---
const PROJECT_ID = "encephalon";
const MODEL_VERSION = 5;
const PUBLISHABLE_KEY = "Mu2Ff5Qb5ViaP2jjvWpk"; // Put your Mu2F... key here

const video = document.getElementById("camera-feed");
const canvas = document.getElementById("detection-canvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("btn-start");
const loaderMsg = document.getElementById("loader-msg");

const offscreenCanvas = document.createElement("canvas");
const offscreenCtx = offscreenCanvas.getContext("2d");

let isRunning = false;
let isProcessingFrame = false;

// --- Preloaded Audio Clips ---
const sounds = {
    wake: new Audio("audio/wake.mp3"),
    "item-remote": new Audio("audio/remote.mp3"),
    "item-music": new Audio("audio/music.mp3"),
    "item-powerbank": new Audio("audio/powerbank.mp3")
};

let lastSpokenTime = {};
const SPEECH_COOLDOWN_MS = 6000;

function playVoice(id) {
    const sound = sounds[id];
    if (!sound) return;

    // Stop any currently playing track and start fresh
    Object.values(sounds).forEach(s => {
        s.pause();
        s.currentTime = 0;
    });

    sound.play().then(() => {
        console.log("🔊 Playing audio track:", id);
    }).catch((err) => {
        console.error("Audio play error:", err);
    });
}

function normalizeName(str) {
    return str.toLowerCase().replace(/[-_]/g, " ").trim();
}

function getItemElementId(normalized) {
    if (normalized.includes("remote")) return "item-remote";
    if (normalized.includes("music") || normalized.includes("player")) return "item-music";
    if (normalized.includes("power") || normalized.includes("bank")) return "item-powerbank";
    return null;
}

startBtn.addEventListener("click", async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
        loaderMsg.innerText = "Webcam not supported in this browser.";
        return;
    }

    // Plays instantly on user interaction, passing browser autoplay security
    playVoice("wake");

    try {
        loaderMsg.innerText = "Accessing camera...";
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false
        });

        video.srcObject = stream;
        await video.play();

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        offscreenCanvas.width = video.videoWidth;
        offscreenCanvas.height = video.videoHeight;

        loaderMsg.style.display = "none";
        startBtn.style.display = "none";
        isRunning = true;

        startLoop();
    } catch (err) {
        console.error(err);
        loaderMsg.innerText = "Camera access denied.";
    }
});

function startLoop() {
    setInterval(async () => {
        if (!isRunning || isProcessingFrame || video.readyState < 2) return;
        isProcessingFrame = true;

        try {
            offscreenCtx.drawImage(video, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
            const base64Data = offscreenCanvas.toDataURL("image/jpeg", 0.65).split(",")[1];

            const endpoint = `https://detect.roboflow.com/${PROJECT_ID}/${MODEL_VERSION}?api_key=${PUBLISHABLE_KEY}&confidence=25`;

            const response = await fetch(endpoint, {
                method: "POST",
                body: base64Data,
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            });

            const data = await response.json();
            renderDetections(data.predictions || []);
        } catch (err) {
            console.error("Detection error:", err);
        } finally {
            isProcessingFrame = false;
        }
    }, 400);
}

function renderDetections(predictions) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const foundElementIds = new Set();
    const now = Date.now();

    predictions.forEach((p) => {
        const rawClass = p.class;
        const normalized = normalizeName(rawClass);

        const elementId = getItemElementId(normalized);
        if (elementId) {
            foundElementIds.add(elementId);

            const lastSpoken = lastSpokenTime[elementId] || 0;
            if (now - lastSpoken > SPEECH_COOLDOWN_MS) {
                playVoice(elementId);
                lastSpokenTime[elementId] = now;
            }
        }

        // Draw box
        const x = p.x - p.width / 2;
        const y = p.y - p.height / 2;

        ctx.strokeStyle = "#0f8b44";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, p.width, p.height);

        // Draw tag
        const tag = `${p.class} (${Math.round(p.confidence * 100)}%)`;
        ctx.fillStyle = "#0f8b44";
        ctx.font = "bold 13px sans-serif";
        const textWidth = ctx.measureText(tag).width;

        ctx.fillRect(x, y - 22, textWidth + 8, 22);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(tag, x + 4, y - 6);
    });

    // Update item badges
    ["item-remote", "item-music", "item-powerbank"].forEach((elId) => {
        const targetEl = document.getElementById(elId);
        if (!targetEl) return;

        const badge = targetEl.querySelector(".badge");
        if (!badge) return;

        if (foundElementIds.has(elId)) {
            badge.textContent = "on table";
            badge.className = "badge present";
        } else {
            badge.textContent = "missing";
            badge.className = "badge missing";
        }
    });
}