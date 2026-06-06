import Link from "next/link";
import { Logo } from "../Logo";

export const Footer = () => {
  return (
    <footer className="lfooter" style={{ padding: "50px 32px 32px", alignItems: "stretch", textAlign: "left" }}>
      <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "32px",
          paddingBottom: "32px",
          borderBottom: "1px solid var(--border)"
        }}>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "160px" }}>
            <div className="lnav-logo">
              <div className="m"><Logo /></div>
              ДОХИО
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.6, maxWidth: "220px" }}>
              Дохионы хэлийг монгол дуу хоолой болгож, хүн бүрийг ойлголцоход тусалдаг хиймэл оюун ухаанд суурилсан хэлмэрч.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <Link href="https://www.facebook.com/munkhjin.batbold.717535" className="dbic">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </Link>
              <Link href="https://www.instagram.com/code3g.dev" className="dbic">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </Link>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="ltag" style={{ marginBottom: "4px" }}>Бүтээгдэхүүн</div>
            {["Боломжууд", "Хэрхэн ажилладаг"].map((item) => (
              <a key={item} href="#" style={{ fontSize: "14px", color: "var(--text-2)", display: "block" }}>
                {item}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="ltag" style={{ marginBottom: "4px" }}>Дэмжлэг</div>
            {["Холбоо барих", "Нийтлэг асуулт"].map((item) => (
              <a key={item} href="#" style={{ fontSize: "14px", color: "var(--text-2)", display: "block" }}>
                {item}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="ltag" style={{ marginBottom: "4px" }}>Байгууллага</div>
            {["Бидний тухай", "Нууцлал", "Үйлчилгээний нөхцөл"].map((item) => (
              <a key={item} href="#" style={{ fontSize: "14px", color: "var(--text-2)", display: "block" }}>
                {item}
              </a>
            ))}
          </div>
        </div>

        <div style={{ paddingTop: "24px", textAlign: "center" }}>
          <p className="lfoot-bot">© 2026 ХЭЛМЭРЧ. Бүх эрх хуулиар хамгаалагдсан.</p>
        </div>
      </div>
    </footer>
  );
};