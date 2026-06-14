import {
  GlobeAltIcon,
  HandRaisedIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import type { GlobeRegion } from "./GlobeViz";

export const SPLIT = 67;

export const GLOBE_ITEMS = [
  {
    mode: "before" as const,
    label: "Асуудал",
    accent: "#ef4444",
    tag: "Одоогийн байдал",
    stats: [
      { label: "Ажилгүйдэлтэй иргэд", value: "2,400+" },
      { label: "Дохионы хэлээр ярьдаг иргэд", value: "25,000+" },
      { label: "Хөдөлмөр эрхлэх бэрхшээл", value: "90%" },
      { label: "Дохионы хэлмэрч", value: "Шаардлагатай" },
    ],
  },
  {
    mode: "after" as const,
    label: "Шийдэл",
    accent: "#f5c518",
    tag: "SignBridge-тэй",
    stats: [
      { label: "Ажилгүйдэл буурах", value: "−90%" },
      { label: "Эдгээр иргэдийн нийгмийн харилцаа", value: "25,000+" },
      { label: "Хэрэглэгчдийн хүлээлт", value: "98%" },
      { label: "Хөрвүүлэх тусламж", value: "24/7" },
    ],
  },
];

export const STARS = Array.from({ length: 180 }, (_, i) => ({
  x: ((i * 137.5) % 100).toFixed(2),
  y: ((i * 97.3 + 13) % 100).toFixed(2),
  r: (((i * 31) % 14) / 10 + 0.3).toFixed(1),
  o: (((i * 73) % 55) / 100 + 0.12).toFixed(2),
}));

export const MONGOLIA_PIN: GlobeRegion[] = [
  { lat: 47.92, lng: 106.91, label: "Монгол Улс", value: "25,000+", main: true },
];

export const DETAIL_STATS = [
  { Icon: GlobeAltIcon,            value: "25,000+", label: "Дохионы хэлээр ярьдаг иргэд" },
  { Icon: HandRaisedIcon,          value: "2,400+",  label: "18+ насны ажлын байргүй иргэд" },
  { Icon: UserGroupIcon,           value: "98%",     label: "Хэрэглэгчдийн хүлээлт" },
  { Icon: ChatBubbleLeftRightIcon, value: "24/7",    label: "Хөрвүүлэх тусламж" },
];

export type FilterId = "global" | "sign" | "users" | "comms";

export const FILTERS: { id: FilterId; Icon: React.ElementType; label: string }[] = [
  { id: "global", Icon: GlobeAltIcon,            label: "Буцах"    },
  { id: "sign",   Icon: HandRaisedIcon,           label: "Монгол дохионы хэл"     },
  { id: "users",  Icon: UserGroupIcon,            label: "Хэрэглэгч" },
  { id: "comms",  Icon: ChatBubbleLeftRightIcon,  label: "Харилцаа"  },
];
