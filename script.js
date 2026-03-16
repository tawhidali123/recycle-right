const originalItems = [
  {
    emoji: "🥤",
    name: "Plastic Bottle",
    type: "recycle",
    fact: "Plastic bottles can be recycled into new products like clothing and containers."
  },
  {
    emoji: "🍌",
    name: "Banana Peel",
    type: "compost",
    fact: "Banana peels break down and add nutrients to the soil."
  },
  {
    emoji: "📄",
    name: "Paper",
    type: "recycle",
    fact: "Paper can be recycled several times before the fibers get too short."
  },
  {
    emoji: "🍎",
    name: "Apple Core",
    type: "compost",
    fact: "Food scraps can turn into compost instead of going to the landfill."
  },
  {
    emoji: "🥫",
    name: "Aluminum Can",
    type: "recycle",
    fact: "Aluminum cans can be recycled again and again."
  },
  {
    emoji: "🍕",
    name: "Greasy Pizza Box",
    type: "trash",
    fact: "A greasy pizza box is usually trash because the oil contaminates the cardboard."
  },
  {
    emoji: "🛍️",
    name: "Plastic Bag",
    type: "trash",
    fact: "Plastic bags can jam recycling machines, so they usually should not go in the recycle bin."
  },
  {
    emoji: "☕",
    name: "Styrofoam Cup",
    type: "trash",
    fact: "Styrofoam is hard to recycle in most places, so it is usually trash."
  },
  {
    emoji: "🍟",
    name: "Chip Bag",
    type: "trash",
    fact: "Chip bags are made of mixed materials, which makes them hard to recycle."
  }
];

let items = [];
let correctCount = 0;
let wrongCount = 0;
let selectedItemIndex = null;

const totalItems = originalItems.length;

const itemsDiv = document.getElementById("items");
const factDiv = document.getElementById("fact");
const correctScoreEl = document.getElementById("correct-score");
const wrongScoreEl = document.getElementById("wrong-score");
const progressTextEl = document.getElementById("progress-text");
const progressFillEl = document.getElementById("progress-fill");
const gameOverEl = document.getElementById("game-over");
const playAgainBtn = document.getElementById("play-again-btn");

function copyItems() {
  return originalItems.map(item => ({ ...item }));
}

function isMobileLike() {
  return window.innerWidth <= 768 || "ontouchstart" in window;
}

function renderItems() {
  itemsDiv.innerHTML = "";

  items.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "item";
    div.draggable = !isMobileLike();
    div.dataset.index = index;

    if (selectedItemIndex === index) {
      div.classList.add("selected");
    }

    div.innerHTML = `
      <div class="item-emoji">${item.emoji}</div>
      <div class="item-name">${item.name}</div>
    `;

    div.addEventListener("dragstart", (e) => {
      div.classList.add("dragging");
      e.dataTransfer.setData("text/plain", index);
    });

    div.addEventListener("dragend", () => {
      div.classList.remove("dragging");
    });

    div.addEventListener("click", () => {
      if (!isMobileLike()) return;

      if (selectedItemIndex === index) {
        selectedItemIndex = null;
        factDiv.textContent = "Item unselected. Tap an item, then tap a bin.";
      } else {
        selectedItemIndex = index;
        factDiv.textContent = `Selected: ${item.name}. Now tap a bin.`;
      }

      renderItems();
    });

    itemsDiv.appendChild(div);
  });
}

function updateScoreboard() {
  correctScoreEl.textContent = correctCount;
  wrongScoreEl.textContent = wrongCount;
  progressTextEl.textContent = `${correctCount} / ${totalItems}`;

  const percent = (correctCount / totalItems) * 100;
  progressFillEl.style.width = `${percent}%`;

  if (items.length === 0) {
    factDiv.textContent = `🎉 Great job! You sorted all ${totalItems} items.`;
    gameOverEl.classList.remove("hidden");
  } else {
    gameOverEl.classList.add("hidden");
  }
}

function removeItem(index) {
  items.splice(index, 1);

  if (selectedItemIndex === index) {
    selectedItemIndex = null;
  } else if (selectedItemIndex !== null && selectedItemIndex > index) {
    selectedItemIndex--;
  }

  renderItems();
}

function flashBin(bin, className) {
  bin.classList.add(className);
  setTimeout(() => {
    bin.classList.remove(className);
  }, 350);
}

function handleDropOrTap(binType, binElement, itemIndex) {
  const item = items[itemIndex];
  if (!item) return;

  if (item.type === binType) {
    correctCount++;
    factDiv.textContent = `✅ Correct! ${item.name}: ${item.fact}`;
    flashBin(binElement, "correct-flash");
    confetti();
    removeItem(itemIndex);
  } else {
    wrongCount++;
    factDiv.textContent = `❌ Not quite. ${item.name} does not go in the ${binType} bin.`;
    flashBin(binElement, "wrong-flash");
  }

  updateScoreboard();
}

document.querySelectorAll(".bin").forEach((bin) => {
  bin.addEventListener("dragover", (e) => {
    if (isMobileLike()) return;
    e.preventDefault();
    bin.classList.add("hovered");
  });

  bin.addEventListener("dragleave", () => {
    bin.classList.remove("hovered");
  });

  bin.addEventListener("drop", (e) => {
    if (isMobileLike()) return;
    e.preventDefault();
    bin.classList.remove("hovered");

    const index = Number(e.dataTransfer.getData("text/plain"));
    handleDropOrTap(bin.dataset.type, bin, index);
  });

  bin.addEventListener("click", () => {
    if (!isMobileLike()) return;
    if (selectedItemIndex === null) {
      factDiv.textContent = "Tap an item first, then tap a bin.";
      return;
    }

    handleDropOrTap(bin.dataset.type, bin, selectedItemIndex);
  });
});

playAgainBtn.addEventListener("click", resetGame);

function resetGame() {
  items = copyItems();
  correctCount = 0;
  wrongCount = 0;
  selectedItemIndex = null;
  factDiv.textContent = isMobileLike()
    ? "Tap an item, then tap the correct bin."
    : "Match the items to the correct bins.";
  progressFillEl.style.width = "0%";
  gameOverEl.classList.add("hidden");
  renderItems();
  updateScoreboard();
}

const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");
let confettiPieces = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  renderItems();
});

function createConfetti() {
  for (let i = 0; i < 120; i++) {
    confettiPieces.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.3,
      size: Math.random() * 8 + 4,
      speed: Math.random() * 3 + 2,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      drift: Math.random() * 2 - 1,
      rotation: Math.random() * Math.PI * 2,
      spin: Math.random() * 0.2 - 0.1
    });
  }
}

function drawConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  confettiPieces.forEach((piece) => {
    piece.y += piece.speed;
    piece.x += piece.drift;
    piece.rotation += piece.spin;

    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.rotation);
    ctx.fillStyle = piece.color;
    ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
    ctx.restore();
  });

  confettiPieces = confettiPieces.filter((piece) => piece.y < canvas.height + 20);

  requestAnimationFrame(drawConfetti);
}

function confetti() {
  createConfetti();
}

drawConfetti();
resetGame();