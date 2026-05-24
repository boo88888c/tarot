export const TOPICS = [
  { id: "love", label: "感情" },
  { id: "marriage", label: "夫妻" },
  { id: "career", label: "工作" },
  { id: "money", label: "金錢" },
  { id: "relationship", label: "人際" },
  { id: "general", label: "一般" },
  { id: "custom", label: "空白" }
];

export const SPREADS = [
  {
    id: "single",
    label: "一張",
    cardCount: 1,
    promptMode: "single"
  },
  {
    id: "three",
    label: "三張",
    cardCount: 3,
    promptMode: "overview"
  },
  {
    id: "four-weeks",
    label: "四張",
    cardCount: 4,
    promptMode: "weeks",
    positions: ["第一週", "第二週", "第三週", "第四週"]
  },
  {
    id: "five",
    label: "五張",
    cardCount: 5,
    promptMode: "overview"
  }
];
