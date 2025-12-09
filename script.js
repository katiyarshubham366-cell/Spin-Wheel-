  // Telegram Init
const tg = window.Telegram.WebApp;
tg.expand();

// USER DATA
const usernameEl = document.getElementById("username");
const pointsEl = document.getElementById("points");
const spinsLeftEl = document.getElementById("spinsLeft");

let points = Number(localStorage.getItem("points")) || 0;
let spinsLeft = Number(localStorage.getItem("spinsLeft")) || 5;

// Load username
usernameEl.innerHTML = tg.initDataUnsafe?.user?.first_name || "Guest";

// Update UI
pointsEl.innerHTML = points;
spinsLeftEl.innerHTML = spinsLeft;

// SOUND EFFECTS
const spinSound = new Audio("assets/spin.mp3");
const winSound = new Audio("assets/win.mp3");
const clickSound = new Audio("assets/click.mp3");

// REWARDS (weighted)
const sectors = [
    { label: "10", weight: 30 },
    { label: "15", weight: 25 },
    { label: "20", weight: 25 },
    { label: "30", weight: 15 },
    { label: "50", weight: 10 },
    { label: "55", weight: 10 },
    { label: "80", weight: 6 },
    { label: "100", weight: 4 },
    { label: "150", weight: 3 },
    { label: "200", weight: 2 }
];

// Create spinning wheel
const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const size = canvas.width;
const center = size / 2;
const arc = (2 * Math.PI) / sectors.length;

// Draw Wheel
function drawWheel() {
    sectors.forEach((sector, i) => {
        ctx.beginPath();
        ctx.fillStyle = i % 2 === 0 ? "#ffcc00" : "#ffaa00";
        ctx.moveTo(center, center);
        ctx.arc(center, center, center, i * arc, (i + 1) * arc);
        ctx.fill();

        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(i * arc + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.fillText(sector.label, center - 20, 10);
        ctx.restore();
    });
}
drawWheel();

// Weighted random reward
function getReward() {
    let total = sectors.reduce((a, b) => a + b.weight, 0);
    let rand = Math.random() * total;

    for (let s of sectors) {
        if (rand < s.weight) return s.label;
        rand -= s.weight;
    }
}

// Spin Logic
document.getElementById("spinBtn").onclick = () => {
    clickSound.play();

    if (spinsLeft <= 0) {
        alert("No spins left today!");
        return;
    }

    spinsLeft--;
    spinsLeftEl.innerHTML = spinsLeft;
    localStorage.setItem("spinsLeft", spinsLeft);

    spinSound.play();

    let reward = getReward();
    let finalAngle = (Math.random() * 360) + (360 * 5);
    
    canvas.style.transition = "transform 5s ease-out";
    canvas.style.transform = `rotate(${finalAngle}deg)`;

    setTimeout(() => {
        winSound.play();
        points += Number(reward);
        pointsEl.innerHTML = points;
        localStorage.setItem("points", points);
        alert(`🎉 You won ${reward} points!`);
    }, 5200);
};
