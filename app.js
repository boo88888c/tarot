import { TAROT_CARDS } from "./cards.js?v=20260522-1";
import { SPREADS } from "./spreads.js?v=20260522-1";

const questionInput = document.querySelector("#questionInput");
const topicInput = document.querySelector("#topicInput");
const interpretationInput = document.querySelector("#interpretationInput");
const spreadSelect = document.querySelector("#spreadSelect");
const drawButton = document.querySelector("#drawButton");
const drawHint = document.querySelector("#drawHint");
const charCount = document.querySelector("#charCount");
const drawingState = document.querySelector("#drawingState");
const resultSection = document.querySelector("#resultSection");
const selectedCards = document.querySelector("#selectedCards");
const promptOutput = document.querySelector("#promptOutput");
const copyPromptButton = document.querySelector("#copyPromptButton");
const copyStatus = document.querySelector("#copyStatus");

let selected = [];

function cryptoInt(maxExclusive) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error("maxExclusive must be a positive integer");
  }
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.getRandomValues) {
    throw new Error("這個瀏覽器不支援 crypto.getRandomValues()");
  }
  const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive;
  const bucket = new Uint32Array(1);
  do {
    cryptoApi.getRandomValues(bucket);
  } while (bucket[0] >= limit);
  return bucket[0] % maxExclusive;
}

function secureShuffle(cards) {
  const copy = cards.map((card) => ({ ...card }));
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = cryptoInt(index + 1);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function randomOrientation() {
  return cryptoInt(2) === 0 ? "正位" : "逆位";
}

function currentSpread() {
  return SPREADS.find((spread) => spread.id === spreadSelect.value) || SPREADS[0];
}

function populateControls() {
  spreadSelect.innerHTML = SPREADS.map((spread) => `<option value="${spread.id}">${spread.label}</option>`).join("");
}

function renderSelectedCards() {
  const spread = currentSpread();
  selectedCards.innerHTML = selected
    .map((card, index) => {
      const position = spread.positions?.[index];
      return `
        <article class="drawn-card ${card.orientation === "逆位" ? "is-reversed" : ""}">
          <p class="card-position">${position || `第 ${index + 1} 張`}</p>
          <h3>${card.name}</h3>
          <p class="orientation">${card.orientation}</p>
        </article>
      `;
    })
    .join("");
}

function buildPrompt() {
  const spread = currentSpread();
  const question = questionInput.value.trim() || "使用者未填寫問題，請以一般狀態指引解讀。";
  const topic = topicInput.value.trim() || "未指定";
  const interpretation = interpretationInput.value.trim();
  const cardLines = selected
    .map((card, index) => {
      const position = spread.positions?.[index];
      const prefix = position ? `${position}：` : `${index + 1}. `;
      return `${prefix}${card.name}・${card.orientation}`;
    })
    .join("\n");

  return `問題：${question}
問題類型：${topic}
占卜方式：${spread.label}
解牌方式：${interpretation}

抽牌結果：
${cardLines}`;
}


function finishDraw() {
  renderSelectedCards();
  promptOutput.value = buildPrompt();
  resultSection.hidden = false;
  drawHint.textContent = "可以複製下方提示詞，再開啟 GPT 繼續解讀。";
}

function drawCards() {
  const spread = currentSpread();
  const shuffledDeck = secureShuffle(TAROT_CARDS);
  selected = shuffledDeck.slice(0, spread.cardCount).map((card) => ({
    ...card,
    orientation: randomOrientation()
  }));
  copyStatus.textContent = "";

  // 顯示抽牌動畫
  resultSection.hidden = true;
  drawingState.hidden = false;
  drawButton.disabled = true;

  setTimeout(() => {
    drawingState.hidden = true;
    drawButton.disabled = false;
    finishDraw();
  }, 2000);
}

async function copyPrompt() {
  if (!promptOutput.value) return;
  try {
    await navigator.clipboard.writeText(promptOutput.value);
    copyStatus.textContent = "已複製，可以貼到 GPT。";
  } catch {
    promptOutput.select();
    document.execCommand("copy");
    copyStatus.textContent = "已選取提示詞，若沒有自動複製請手動複製。";
  }
}

drawButton.addEventListener("click", drawCards);
copyPromptButton.addEventListener("click", copyPrompt);

questionInput.addEventListener("input", () => {
  charCount.textContent = `${questionInput.value.length}/300`;
  if (selected.length) promptOutput.value = buildPrompt();
});

topicInput.addEventListener("input", () => {
  if (selected.length) promptOutput.value = buildPrompt();
});

interpretationInput.addEventListener("input", () => {
  if (selected.length) promptOutput.value = buildPrompt();
});

spreadSelect.addEventListener("change", () => {
  resultSection.hidden = true;
  drawingState.hidden = true;
  selected = [];
  selectedCards.innerHTML = "";
  promptOutput.value = "";
  copyStatus.textContent = "";
  drawHint.textContent = "選擇適合的牌陣，一鍵抽牌，系統會用瀏覽器高品質亂數自動抽出不重複的牌。";
});


populateControls();
