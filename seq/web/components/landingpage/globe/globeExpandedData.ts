import { GlobeAltIcon, UserGroupIcon, BriefcaseIcon } from "@heroicons/react/24/outline";

export const LEFT = 42;
export const GLOB_RATIO = 0.42;

export const ARC_ITEMS = [
  { id: "overview", Icon: GlobeAltIcon,  label: "Монгол дохионы хэлний тархалтын судалгаа", angle: 220 },
  { id: "people",   Icon: UserGroupIcon, label: "Дохионы хэлээр ярьдаг хүн амын дата",      angle: 180 },
  { id: "jobs",     Icon: BriefcaseIcon, label: "Дохионы хэлээр ярьдаг иргэдийн хөдөлмөр эрхлэлт",       angle: 140 },
];

export const STATS: Record<string, { title: string; big: string; bigLabel: string; rows: { label: string; value: string }[] }> = {
  overview: {
    title: "Нийгэмд нөлөөлөх нь",
    big: "16,000+", bigLabel: "Дохионы хэлээр ярьдаг иргэд",
    rows: [{ label: "Сонсголын бэрхшээлтэй иргэд", value: "7,800+" }, { label: "Улсын хэмжээнд хэлмэрч", value: "<20" }],
  },
  people: {
    title: "Сонсголын бэрхшээлтэй иргэд",
    big: "7,800+", bigLabel: "Дохионы хэлээр ярьдаг иргэд",
    rows: [{ label: "Нийт хүн амд эзлэх хувь", value: "0.8%" }, { label: "Хэрэглэгчдийн хүлээлт", value: "98%" }],
  },
  jobs: {
    title: "Хөдөлмөр эрхлэлт",
    big: "18%", bigLabel: "Ажил эрхэлж буй иргэд",
    rows: [{ label: "Ажил эрхлээгүй иргэд", value: "82%" }, { label: "Хүртээмжтэй ажлын байрны хэрэгцээ", value: "Өндөр" }],
  },
};
