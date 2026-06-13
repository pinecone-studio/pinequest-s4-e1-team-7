import type { GlobeRegion } from "./GlobeViz";

export const makeLabel = (r: GlobeRegion, onClick?: () => void): HTMLElement => {
  const wrap = document.createElement("div");
  wrap.style.cssText = `display:flex;flex-direction:column;align-items:center;user-select:none;transform:translateY(-100%);${onClick ? "pointer-events:all;cursor:pointer;" : "pointer-events:none;"}`;

  const pill = document.createElement("div");
  pill.style.cssText = `background:${r.main ? "#F5C518" : "rgba(245,197,24,0.78)"};color:#0d1e35;border-radius:99px;padding:${r.main ? "5px 13px" : "3px 10px"};font-size:${r.main ? "13px" : "11px"};font-weight:700;font-family:system-ui,sans-serif;white-space:nowrap;line-height:1.2;box-shadow:0 2px 16px rgba(245,197,24,0.4);display:flex;align-items:center;gap:5px;${onClick ? "transition:transform 0.12s;transform:scale(1);" : ""}`;
  pill.innerHTML = `<span>${r.label}</span><span style="font-size:${r.main ? "15px" : "12px"};font-weight:900">${r.value}</span>`;

  if (onClick) {
    pill.addEventListener("mouseenter", () => { pill.style.transform = "scale(1.08)"; });
    pill.addEventListener("mouseleave", () => { pill.style.transform = "scale(1)"; });
  }

  const line = document.createElement("div");
  line.style.cssText = `width:1px;height:${r.main ? "18px" : "12px"};background:rgba(245,197,24,0.6);pointer-events:none;`;

  wrap.appendChild(pill);
  wrap.appendChild(line);

  if (onClick) {
    wrap.addEventListener("click", (e) => { e.stopPropagation(); onClick(); });
  }

  return wrap;
};
