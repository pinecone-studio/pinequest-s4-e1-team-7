import React from "react";
import {
  CameraIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";

const steps = [
  {
    icon: CameraIcon,
    iconBg: "linear-gradient(150deg, var(--teal), #0b2840)",
    tag: "Алхам 01",
    title: "Камер нээх",
    desc: "Камер нээгдснээр дохиог бодит цагт таньж бичвэрт хөрвүүлж яриаг сонсно.",
  },
  {
    icon: MicrophoneIcon,
    iconBg: "linear-gradient(150deg, var(--olive), var(--olive-deep))",
    tag: "Алхам 02",
    title: "Яриаг бичих",
    desc: "Микрофон асааж ярьсан үгийг бичвэрт хөрвүүлж дохионы хэл рүү орчуулна.",
  },
  {
    icon: VideoCameraIcon,
    iconBg: "linear-gradient(150deg, var(--teal-2), var(--teal))",
    tag: "Алхам 03",
    title: "Шууд дуудлага",
    desc: "Холбоосоор дамжуулан видео дуудлага хийж дохионы хэлийг бодит цагт хөрвүүлнэ.",
  },
];

export const ThreeSteps = () => (
  <section
    className="w-full px-4 py-20 md:px-8"
    style={{
      background: "var(--surface-2)",
      borderTop: "1px solid var(--border-c)",
      borderBottom: "1px solid var(--border-c)",
    }}
    id="how"
  >
    <div className="mx-auto max-w-4xl">
      {/* Section header */}
      <div className="mb-14 text-center">
        <h2
          className="font-display mt-3 text-[28px] font-bold tracking-tight md:text-[38px]"
          style={{ color: "var(--text)" }}
        >
          Хэрхэн ажилладаг вэ?
        </h2>
      </div>

      {/* Steps + connectors */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-0">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={i}>
              <div
                className="relative flex flex-1 flex-col rounded-[24px] p-7 transition-all duration-200 hover:-translate-y-1"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-c)",
                }}
              >
                {/* Step number — faint background */}
                <span
                  className="font-display pointer-events-none absolute right-5 top-4 select-none text-[42px] font-black"
                  style={{ color: "var(--olive-faint)" }}
                >
                  0{i + 1}
                </span>

                {/* Icon */}
                <div
                  className="mb-5 flex h-[56px] w-[56px] items-center justify-center rounded-[16px]"
                  style={{ background: step.iconBg }}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>

                {/* Tag */}
                <span
                  className="mb-2 text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--olive)" }}
                >
                  {step.tag}
                </span>

                {/* Title */}
                <h4
                  className="font-display mb-2 text-[18px] font-semibold leading-snug"
                  style={{ color: "var(--text)" }}
                >
                  {step.title}
                </h4>

                {/* Description */}
                <p
                  className="text-[14px] leading-relaxed"
                  style={{ color: "var(--text-2)" }}
                >
                  {step.desc}
                </p>
              </div>

              {/* Connector arrow between steps */}
              {i < steps.length - 1 && (
                <div
                  className="hidden items-center justify-center sm:flex"
                  style={{ width: "36px", flexShrink: 0 }}
                >
                  <ChevronRightIcon
                    className="h-5 w-5"
                    style={{ color: "var(--border-c)" }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  </section>
);
