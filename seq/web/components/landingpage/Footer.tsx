import Link from "next/link";
import { Logo } from "../Logo";

export const Footer = () => {
  return (
    <footer className="w-full bg-[#ededed] px-8 md:px-16 pt-16 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-200">
        
        {/* Brand column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-green-500 text-black flex justify-center items-center rounded-xl">
              <Logo className="p-3" />
            </div>
            <span className="text-xl font-bold tracking-wide text-black">ДОХИО</span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed max-w-[220px]">
            Дохионы хэлийг монгол дуу хоолой болгож, хүн бүрийг ойлголцоход тусалдаг хиймэл оюун ухаанд суурилсан хэлмэрч.
          </p>
        </div>

        {/* Бүтээгдэхүүн */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">Бүтээгдэхүүн</h3>
          {["Боломжууд", "Хэрхэн ажилладаг", "Дэлгэц", "Татах"].map((item) => (
            <a key={item} href="#" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
              {item}
            </a>
          ))}
        </div>

        {/* Дэмжлэг */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">Дэмжлэг</h3>
          {["Тусламж", "Холбоо барих", "Нийтлэг асуулт", "Хүртээмж"].map((item) => (
            <a key={item} href="#" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
              {item}
            </a>
          ))}
        </div>

        {/* Байгууллага */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">Байгууллага</h3>
          {["Бидний тухай", "Нууцлал", "Үйлчилгээний нөхцөл"].map((item) => (
            <a key={item} href="#" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
              {item}
            </a>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col md:flex-row justify-between items-center pt-6 gap-4">
        <p className="text-sm text-gray-400">© 2026 ДОХИО. Бүх эрх хуулиар хамгаалагдсан.</p>
        <div className="flex items-center gap-3">
          {/* Facebook */}
          <Link href={"https://www.facebook.com/munkhjin.batbold.717535"} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-green-500 hover:text-green-600 transition-colors text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </Link>
          {/* Instagram */}
          <Link  href={
                "https://www.instagram.com/code3g.dev?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              } className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-green-500 hover:text-green-600 transition-colors text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  );
};