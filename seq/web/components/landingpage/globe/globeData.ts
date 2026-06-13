export const STARS = Array.from({ length: 180 }, (_, i) => ({
  x: ((i * 137.5) % 100).toFixed(2),
  y: ((i * 97.3 + 13) % 100).toFixed(2),
  r: (((i * 31) % 14) / 10 + 0.3).toFixed(1),
  o: (((i * 73) % 55) / 100 + 0.12).toFixed(2),
}));

export const SPLIT = 67;

export const GLOBE_ITEMS = [
  {
    mode: "before" as const,
    label: "Асуудал",
    accent: "#ef4444",
    tag: "Одоогийн байдал",
    stats: [
      { label: "18 насны ажлын байргүй иргэд", value: "2,400+" },
      { label: "Дохионы хэлээр ярьдаг иргэд", value: "25,000+" },
      { label: "Хөдөлмөр эрхлэх бэрхшээл", value: "90%" },
      { label: "Дохионы хэлмэрч", value: "Шаардлагатай" },
    ],
  },
  {
    mode: "after" as const,
    label: "Шийдэл",
    accent: "#f5c518",
    tag: "SignBridge платформ нь",
    stats: [
      { label: "Ажлын байрны харилцааны бэрхшээлийг багасгах", value: "−90%" },
      { label: "Иргэдийн нийгмийн харилцааг сайжруулах", value: "25,000+" },
      { label: "Хэрэглэгчдийн хүлээлт", value: "98%" },
      { label: "Хөрвүүлэх тусламж", value: "24/7" },
    ],
  },
];
