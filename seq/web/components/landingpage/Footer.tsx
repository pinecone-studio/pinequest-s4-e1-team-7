export const Footer = () => (
  <footer className="fixed bottom-0 left-0 right-0 z-0 flex h-screen flex-col items-center justify-center bg-black">
    <div className="text-center leading-none">
      <p
        className="block select-none font-black uppercase"
        style={{ fontSize: "clamp(5rem, 15vw, 18rem)", letterSpacing: "-0.04em", color: "#fff" }}
      >
        Sign
      </p>
      <p
        className="block select-none font-black uppercase"
        style={{ fontSize: "clamp(5rem, 15vw, 18rem)", letterSpacing: "-0.04em", color: "var(--olive)" }}
      >
        Bridge
      </p>
    </div>
    <p className="absolute bottom-8 text-[13px]" style={{ color: "rgba(255,255,255,0.3)" }}>
      © 2026 Sign Bridge.
    </p>
  </footer>
);
