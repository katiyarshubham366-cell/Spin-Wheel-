// Client-side prototype logic for spin wheel with weighted probabilities.
// Slots (clockwise starting at top): [100,100,200,300,400,500]
// Weights: 100 -> 50% (split across the two 100 slots), 200 -> 20%, 300 -> 15%, 400 -> 10%, 500 -> 5%

const spinBtn = document.getElementById('spinBtn');
const adBtn = document.getElementById('adBtn');
const resetBtn = document.getElementById('resetBtn');
const spinsEl = document.getElementById('spins');
const pointsEl = document.getElementById('points');
const resultEl = document.getElementById('result');
const wheel = document.getElementById('wheel');

let spins = 1;
let points = 0;
let isSpinning = false;

// sector angle ranges (degrees). Each sector is 60deg (360/6).
// We'll map prize -> sector indices
const sectors = [
  { prize:100, index:0 },
  { prize:100, index:1 },
  { prize:200, index:2 },
  { prize:300, index:3 },
  { prize:400, index:4 },
  { prize:500, index:5 },
];

// probabilities per prize (total across sectors):
// 100 -> 50% (split into two sectors 25% each), 200 -> 20%, 300 -> 15%, 400 -> 10%, 500 -> 5%
const weightedPrizes = [
  { prize: 100, weight: 25 }, // sector 0
  { prize: 100, weight: 25 }, // sector 1
  { prize: 200, weight: 20 },
  { prize: 300, weight: 15 },
  { prize: 400, weight: 10 },
  { prize: 500, weight: 5 },
];

function updateUI(){
  spinsEl.textContent = spins;
  pointsEl.textContent = points;
}

function pickPrizeByWeight(){
  const total = weightedPrizes.reduce((s,p)=>s+p.weight,0);
  const r = Math.random()*total;
  let acc = 0;
  for(const p of weightedPrizes){
    acc += p.weight;
    if(r <= acc) return p.prize;
  }
  return weightedPrizes[weightedPrizes.length-1].prize;
}

function sectorIndexForPrize(prize){
  // choose one of the sectors that has that prize (for duplicates -> pick randomly among them)
  const idxs = sectors.map((s,i)=> s.prize===prize ? i : -1).filter(i=>i>=0);
  return idxs[Math.floor(Math.random()*idxs.length)];
}

function spin(){
  if(isSpinning) return;
  if(spins <= 0){
    resultEl.textContent = "No spins left. Watch an ad to earn spins.";
    return;
  }
  isSpinning = true;
  spinBtn.disabled = true;
  adBtn.disabled = true;
  resetBtn.disabled = true;

  // pick prize according to weights
  const prize = pickPrizeByWeight();
  const sectorIdx = sectorIndexForPrize(prize);

  // calculate target rotation so that marker points to center of that sector.
  // Each sector is 60deg. top sector (index 0) spans -30deg..30deg around 0.
  // We'll compute a random angle inside the sector to look natural.
  const sectorSize = 360 / sectors.length;
  const sectorStart = sectorIdx * sectorSize;
  const minAngle = sectorStart;
  const maxAngle = sectorStart + sectorSize;
  // center of sector:
  const targetWithinSector = minAngle + Math.random()*(sectorSize);
  // We want the wheel rotated so that that sector aligns with the marker at top (0deg).
  // Because wheel rotation moves sectors clockwise, we rotate by (360 - targetWithinSector) plus extra spins.
  const extraSpins = 5 + Math.floor(Math.random()*3); // 5-7 extra full rotations
  const finalRotation = extraSpins*360 + (360 - targetWithinSector);

  // animate
  wheel.style.transition = 'transform 5s cubic-bezier(.2,.9,.2,1)';
  wheel.style.transform = `rotate(${finalRotation}deg)`;

  // after animation ends
  setTimeout(()=>{
    // decrease spin, add points
    spins -= 1;
    points += prize;
    updateUI();
    resultEl.textContent = `You won ${prize} points!`;
    isSpinning = false;
    spinBtn.disabled = false;
    adBtn.disabled = false;
    resetBtn.disabled = false;

    // Normalize rotation to avoid huge transform values (mod 360)
    const normalized = finalRotation % 360;
    wheel.style.transition = 'none';
    wheel.style.transform = `rotate(${normalized}deg)`;
  }, 5200);
}

spinBtn.addEventListener('click', spin);

// Simulate watching ad (in prototype) -> grant +1 spin
adBtn.addEventListener('click', ()=>{
  spins += 1;
  resultEl.textContent = 'Ad watched (simulated). +1 spin granted.';
  updateUI();
});

// Reset
resetBtn.addEventListener('click', ()=>{
  spins = 1;
  points = 0;
  resultEl.textContent = '';
  // reset rotation
  wheel.style.transition = 'none';
  wheel.style.transform = 'rotate(0deg)';
  updateUI();
});

updateUI();
