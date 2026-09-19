// --- Roboflow Configuration ---
const PROJECT_ID = "encephalon";
const MODEL_VERSION = 5;
const PUBLISHABLE_KEY = "Mu2Ff5Qb5ViaP2jjvWpk"; // Your Mu2F... or working private key

const video = document.getElementById("camera-feed");
const canvas = document.getElementById("detection-canvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("btn-start");
const loaderMsg = document.getElementById("loader-msg");
const sysStatus = document.getElementById("sys-status");

const offscreenCanvas = document.createElement("canvas");
const offscreenCtx = offscreenCanvas.getContext("2d");

let isRunning = false;
let isProcessingFrame = false;

// --- Local Voice Audio Files ---
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

    Object.values(sounds).forEach(s => {
        s.pause();
        s.currentTime = 0;
    });

    sound.play().then(() => {
        console.log("🔊 Track playing:", id);
    }).catch((err) => {
        console.warn("Audio feedback:", err);
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
        loaderMsg.innerHTML = "<p>CAMERA ACCESS RESTRICTED. VERIFY SSL/HTTPS CONNECTION.</p>";
        return;
    }

    playVoice("wake");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
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
        sysStatus.innerText = "online";
        sysStatus.classList.add("active");
        isRunning = true;

        startInferenceLoop();
    } catch (err) {
        console.error(err);
        loaderMsg.innerHTML = "<p>PERMISSION DENIED. CHECK PERMISSIONS.</p>";
    }
});

function startInferenceLoop() {
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
            console.error("Inference poll failed:", err);
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

        // Precise Bounding Box Calculations
        const x = p.x - p.width / 2;
        const y = p.y - p.height / 2;

        ctx.strokeStyle = "#00b341";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(x, y, p.width, p.height);

        // Modern Monospaced Tactical HUD Tag
        const tag = `${p.class.toUpperCase()} // ${Math.round(p.confidence * 100)}%`;
        ctx.font = "bold 12px monospace";
        const textWidth = ctx.measureText(tag).width;

        ctx.fillStyle = "#000000";
        ctx.fillRect(x, y - 24, textWidth + 12, 24);

        ctx.fillStyle = "#00ff55";
        ctx.fillText(tag, x + 6, y - 8);
    });

    // Update Inventory Cards Below
    ["item-remote", "item-music", "item-powerbank"].forEach((elId) => {
        const targetCard = document.getElementById(elId);
        if (!targetCard) return;

        const badge = targetCard.querySelector(".target-badge");
        const isPresent = foundElementIds.has(elId);

        if (isPresent) {
            badge.textContent = "In Sight";
            badge.className = "target-badge present";
            targetCard.classList.add("active-target");
        } else {
            badge.textContent = "Not in sight.";
            badge.className = "target-badge missing";
            targetCard.classList.remove("active-target");
        }
    });
}