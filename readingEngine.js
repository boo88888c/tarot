const TOPIC_LABELS = {
  love: "感情",
  career: "工作",
  money: "金錢",
  relationship: "人際",
  general: "一般"
};

const DIRECTION_WORDS = {
  active: ["權杖", "魔術師", "戰車", "太陽", "審判"],
  emotional: ["聖杯", "女祭司", "皇后", "戀人", "月亮", "星星"],
  mental: ["寶劍", "正義", "隱者"],
  practical: ["錢幣", "皇帝", "教皇", "世界"],
  release: ["吊人", "死神", "節制", "惡魔", "高塔", "命運之輪"]
};

function orientationText(card) {
  return card.orientation === "upright" ? "正位" : "逆位";
}

function keywords(card) {
  return card.orientation === "upright" ? card.uprightKeywords : card.reversedKeywords;
}

function contextText(card, topic) {
  return card[topic] || card.general;
}

function classify(cards) {
  const scores = { active: 0, emotional: 0, mental: 0, practical: 0, release: 0 };
  for (const draw of cards) {
    for (const [type, marks] of Object.entries(DIRECTION_WORDS)) {
      if (marks.includes(draw.suit) || marks.includes(draw.name)) scores[type] += 1;
    }
    if (draw.orientation === "reversed") scores.release += 0.4;
  }
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

function trendLabel(type) {
  return {
    active: "偏向主動推進",
    emotional: "偏向整理感受與確認真心",
    mental: "偏向釐清想法、溝通與判斷",
    practical: "偏向務實安排、穩定累積",
    release: "偏向停下來調整、放下或轉向"
  }[type];
}

function questionLead(question, topic) {
  const trimmed = question.trim();
  if (!trimmed) return `以${TOPIC_LABELS[topic]}來看，`;
  return `針對「${trimmed}」，以${TOPIC_LABELS[topic]}的角度來看，`;
}

function supportAndWarning(cards) {
  const upright = cards.filter((card) => card.orientation === "upright");
  const reversed = cards.filter((card) => card.orientation === "reversed");
  const support = upright.length ? upright.slice(0, 2).map((card) => card.name).join("、") : cards[0].name;
  const warning = reversed.length ? reversed.slice(0, 2).map((card) => card.name).join("、") : cards[cards.length - 1].name;
  return { support, warning, reversedCount: reversed.length };
}

function renderParagraphs(paragraphs) {
  return paragraphs.map((text) => `<p>${text}</p>`).join("");
}

export function generateReading({ question, topic, spread, cards }) {
  if (spread.mode === "single") return singleReading(question, topic, cards[0]);
  if (spread.mode === "months") return timelineReading(question, topic, spread, cards, "三個月");
  if (spread.mode === "weeks") return timelineReading(question, topic, spread, cards, "一個月");
  return overviewReading(question, topic, cards, spread.cardCount);
}

function singleReading(question, topic, card) {
  const cardKeywords = keywords(card);
  const lead = questionLead(question, topic);
  const paragraphs = [
    `${lead}${card.name}${orientationText(card)}給出的答案是：現在最重要的不是急著求一個結果，而是先看清「${card.coreTheme}」。這張牌的語氣偏向${cardKeywords.slice(0, 2).join("、")}，所以它比較像是在把你拉回問題的核心。`,
    `${contextText(card, topic)} ${card.spokenLines[0]}`,
    `建議你可以先做兩件事：第一，把眼前最能掌握的一步寫下來；第二，留意自己是不是正在${card.orientation === "upright" ? "把直覺變成行動" : `落入${cardKeywords[0]}的狀態`}。${card.advice}`
  ];
  return renderParagraphs(paragraphs);
}

function overviewReading(question, topic, cards, count) {
  const trend = trendLabel(classify(cards));
  const { support, warning, reversedCount } = supportAndWarning(cards);
  const names = cards.map((card) => `${card.name}${orientationText(card)}`).join("、");
  const strongest = cards[0];
  const last = cards[cards.length - 1];
  const paragraphs = [
    `${questionLead(question, topic)}這組牌的整體氛圍是「${trend}」。牌面是 ${names}，它們合在一起不像是在給單一答案，而是在描述一個正在形成的局面。`,
    `${support}比較像是在支持你往前看的力量；它們提醒你，事情裡仍然有可運用的資源。${warning}則比較像是提醒牌，表示真正卡住的地方可能不是事件本身，而是你的節奏、期待或溝通方式。`,
    `核心矛盾落在「${strongest.coreTheme}」和「${last.coreTheme}」之間。前者說的是目前最明顯的主題，後者則像後續會浮出的結果或提醒。${reversedCount ? `逆位牌有 ${reversedCount} 張，所以這件事還有一些未整理完的情緒、阻力或延遲。` : "整組牌正位較多，代表事情比較容易順著清楚的方向推進。"}`,
    count === 5
      ? `更深入看，這五張牌把主題、阻礙和潛在發展都攤開了：主題不是單純好或壞，而是你需要一邊辨認真實需求，一邊調整做法。${contextText(strongest, topic)}`
      : `三張牌給的訊息相對集中：先看整體氣氛，再找出最需要調整的一個點。${contextText(strongest, topic)}`,
    `整體建議是：不要讓問題只停在腦中反覆推演。先選一個你能控制的小行動，再觀察對方、環境或金錢流向怎麼回應。${last.warning}`
  ];
  return renderParagraphs(paragraphs);
}

function timelineReading(question, topic, spread, cards, label) {
  const lead = questionLead(question, topic);
  const stageLines = cards.map((card, index) => {
    const stage = spread.positions[index];
    const mood = keywords(card).slice(0, 2).join("、");
    return `<li><strong>${stage}</strong>：${card.name}${orientationText(card)}，主題比較像是「${card.coreTheme}」。這段時間可能偏向${mood}，${contextText(card, topic)}</li>`;
  });
  const trend = trendLabel(classify(cards));
  const last = cards[cards.length - 1];
  return [
    `<p>${lead}接下來${label}不是絕對預言，比較像是一條可能發展出的節奏線。你可以把它當成提醒，用來調整選擇。</p>`,
    `<ul>${stageLines.join("")}</ul>`,
    `<p>整體來看，這段時間的走向${trend}。前面的牌在鋪陳情緒或現實條件，後面的${last.name}則像是在提醒你最後會回到「${last.coreTheme}」。建議保持彈性，看到訊號就調整，不需要把任何一週或一個月當成無法改變的結局。</p>`
  ].join("");
}
