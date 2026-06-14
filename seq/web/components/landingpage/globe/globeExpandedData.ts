import { GlobeAltIcon, UserGroupIcon, BriefcaseIcon } from "@heroicons/react/24/outline";

export const LEFT = 42;
export const GLOB_RATIO = 0.42;

export const ARC_ITEMS = [
  { id: "overview", Icon: GlobeAltIcon,  label: "Дохионы хэлний хэрэглээний судалгаа", angle: 220 },
  { id: "people",   Icon: UserGroupIcon, label: "Хүн амын дата",      angle: 180 },
  { id: "jobs",     Icon: BriefcaseIcon, label: "Дохионы хэлээр ярьдаг иргэдийн бүтээмжийг нэмэгдүүлэх",       angle: 140 },
];

export const STATS: Record<string, { title: string; big: string; bigLabel: string; rows: { label: string; value: string }[] }> = {
  overview: {
    title: "Нийгэмд нөлөөлөх нь",
    big: "25,000+", bigLabel: "Дохионы хэлээр ярьдаг иргэд",
    rows: [{ label: "Ажлын байргүй иргэд (өмнө)", value: "2,400+" }, { label: "Ажилгүйдэл буурах", value: "−90%" }],
  },
  people: {
    title: "Сонсголын бэрхшээлтэй иргэд",
    big: "25,000+", bigLabel: "Дохионы хэлээр ярьдаг иргэд",
    rows: [{ label: "Хүн амын хувь", value: "0.8%" }, { label: "Хэрэглэгчдийн хүлээлт", value: "98%" }],
  },
  jobs: {
    title: "Хөдөлмөр эрхлэлт",
    big: "−90%", bigLabel: "Ажилгүйдэл буурах хэмжээ",
    rows: [{ label: "Дохионы хэлмэрч шаардлагатай (өмнө)", value: "90%" }, { label: "Хөрвүүлэх тусламж", value: "24/7" }],
  },
};
