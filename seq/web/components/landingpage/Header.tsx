"use client";

import { Logo } from "../Logo";
import TranslateWidget from "./Translator";

export const Header = () => {
  return (
    <header className="w-full flex justify-between items-center px-8 md:px-16 py-4 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="flex items-center gap-2">
        <div className="bg-green-500 text-black flex justify-center items-center rounded-xl">
          <Logo className="p-2" />
        </div>
        <span className="text-xl font-bold tracking-wide text-white">ДОХИО</span>
      </div>

      <nav className="hidden md:flex items-center gap-8">
        {["Боломжууд", "Хэрхэн ажилладаг", "Нөлөө", "Татах"].map((item) => (
          <a
            key={item}
            href="#"
            className="text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            {item}
          </a>
        ))}
       </nav>


      <div className="flex items-center gap-3">
        {/* Light/dark toggle - now visible on dark bg */}
        <TranslateWidget/>
        <button className="w-9 h-9 rounded-full bg-white/15 border border-white/30 flex items-center justify-center hover:bg-white/25 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
          </svg>
        </button>

        {/* Register button */}
        <button className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold text-sm px-5 py-2.5 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Бүртгүүлэх
        </button>
      </div>
    </header>
  );
};