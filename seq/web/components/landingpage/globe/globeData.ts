export const STARS = Array.from({ length: 180 }, (_, i) => ({
  x: ((i * 137.5) % 100).toFixed(2),
  y: ((i * 97.3 + 13) % 100).toFixed(2),
  r: (((i * 31) % 14) / 10 + 0.3).toFixed(1),
  o: (((i * 73) % 55) / 100 + 0.12).toFixed(2),
}));

export const SPLIT = 50;

export const GLOBE_ITEMS = [
  {
    mode: "before" as const,
    label: "Асуудал",
    accent: "#ef4444",
    tag: "Одоогийн байдал",
    stats: [
      { label: "18+ насны ажлын байр хайж буй иргэд", value: "6,400+" },
      { label: "Дохионы хэлээр ярьдаг иргэд", value: "7,800–16,000+" },
      { label: "Хөдөлмөр эрхлэх бэрхшээл", value: "82%" },
      { label: "Дохионы хэлмэрч", value: "<20" },
    ],
  },
  {
    mode: "after" as const,
    label: "Шийдэл",
    accent: "#f5c518",  
    tag: "SignBridge платформын онцлог",
    stats: [
      { label: "Харилцааны бэрхшээлийг бууруулах", value: "+90%" },
      { label: "Хүртээмжтэй орчныг бүрдүүлэх", value: "16,000+" },
      { label: "Дохиог таних нарийвчлал", value: "90%-с дээш" },
      { label: "Тасралтгүй үйлчилгээ", value: "24/7" },
    ],
  },
];
