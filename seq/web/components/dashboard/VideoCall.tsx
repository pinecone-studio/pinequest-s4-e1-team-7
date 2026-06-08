import { randomBytes } from "crypto";
import Link from "next/link";
import { VideoCameraIcon } from "@heroicons/react/24/solid";

export const dynamic = "force-dynamic";

export function VideoCall() {
  const sessionId = randomBytes(8).toString("hex");

  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col" style={{ background: "var(--bg)" }}>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">

        <div className="flex items-center px-5 pb-2 pt-5">
          <div className="h-10 w-10" />
          <h1 className="flex-1 text-center text-[17px] font-bold md:text-[20px]" style={{ color: "var(--text)" }}>
            Видео дуудлага
          </h1>
          <div className="h-10 w-10" />
        </div>

        <div className="flex items-end justify-center gap-5 py-4">
          {/* Character mascot beside the button */}
          <img
            src="/images/video.png"
            alt=""
            aria-hidden
            className="h-28 w-auto object-contain md:h-32"
          />

          {/* Call button + label */}
          <div className="flex flex-col items-center gap-3 pb-1">
            <Link
              href={`/call/${sessionId}`}
              className="flex h-[100px] w-[100px] items-center justify-center rounded-full transition-all duration-300 active:scale-95 md:h-[120px] md:w-[120px]"
              style={{ background: "var(--olive)", boxShadow: "0 8px 28px rgba(0,0,0,0.15)" }}
            >
              <VideoCameraIcon className="h-12 w-12 text-black md:h-14 md:w-14" />
            </Link>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--text-3)" }}>
              Дарж эхлүүлнэ үү
            </p>
          </div>
        </div>

        <div
          className="mx-4 mb-3 flex-1 overflow-y-auto rounded-[22px] p-5 md:rounded-[24px] md:p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}
        >
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--text-3)" }}>
            Дуудлага
          </p>
          <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-2)" }}>
            Шинэ дуудлага үүсгэж холбоосыг хамтрагчдаа илгэнэ үү. Хамтрагч нь холбоосоор орсны дараа шууд дохионы хэлмэрчлэл ажиллана.
          </p>
        </div>

      </div>
    </div>
  );
}
