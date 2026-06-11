"use client";
import { forwardRef, useEffect, useState } from "react";
import Globe from "react-globe.gl";

export type GlobeRegion = {
  lat: number;
  lng: number;
  label: string;
  value: string;
  main?: boolean;
};

function makeLabel(r: GlobeRegion, onClick?: () => void): HTMLElement {
  const wrap = document.createElement("div");
  // pointer-events:none by default; enable when clickable so clicks reach the element
  wrap.style.cssText = `
    display:flex;flex-direction:column;align-items:center;
    user-select:none;transform:translateY(-100%);
    ${onClick ? "pointer-events:all;cursor:pointer;" : "pointer-events:none;"}
  `;

  const pill = document.createElement("div");
  pill.style.cssText = `
    background:${r.main ? "#F5C518" : "rgba(245,197,24,0.78)"};
    color:#0d1e35;border-radius:99px;
    padding:${r.main ? "5px 13px" : "3px 10px"};
    font-size:${r.main ? "13px" : "11px"};
    font-weight:700;font-family:system-ui,sans-serif;
    white-space:nowrap;line-height:1.2;
    box-shadow:0 2px 16px rgba(245,197,24,0.4);
    display:flex;align-items:center;gap:5px;
    ${onClick ? "transition:transform 0.12s;transform:scale(1);" : ""}
  `;
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
    wrap.addEventListener("click", (e) => {
      e.stopPropagation();
      onClick();
    });
  }

  return wrap;
}

interface Props {
  width: number;
  height: number;
  regions?: GlobeRegion[];
  highlightCountry?: string;
  onCountryClick?: (name: string) => void;
}

const GlobeViz = forwardRef<unknown, Props>(
  ({ width, height, regions = [], highlightCountry, onCountryClick }, ref) => {
    const [countries, setCountries] = useState<object[]>([]);

    useEffect(() => {
      fetch(
        "https://cdn.jsdelivr.net/gh/vasturiano/react-globe.gl@master/example/country-flag-polygons/ne_110m_admin_0_countries.geojson"
      )
        .then((r) => r.json())
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((d: any) => setCountries(d.features ?? []));
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getName = (feat: any): string => {
      const p = feat?.properties ?? {};
      return p.ADMIN ?? p.NAME ?? p.name ?? p.admin ?? "";
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isHighlighted = (feat: any): boolean => {
      const name = getName(feat).toLowerCase();
      const iso = (feat?.properties?.ISO_A3 ?? "").toUpperCase();
      return (
        name === (highlightCountry ?? "").toLowerCase() ||
        (highlightCountry === "Mongolia" && iso === "MNG")
      );
    };

    return (
      <Globe
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as any}
        width={width}
        height={height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundColor="rgba(0,0,0,0)"
        atmosphereColor="rgba(100,200,255,0.18)"
        atmosphereAltitude={0.22}
        polygonsData={countries}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        polygonCapColor={(d: any) =>
          isHighlighted(d) ? "rgba(245,197,24,0.72)" : "rgba(0,0,0,0)"
        }
        polygonSideColor={() => "rgba(0,0,0,0)"}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        polygonStrokeColor={(d: any) =>
          isHighlighted(d) ? "rgba(245,197,24,0.5)" : "rgba(0,0,0,0)"
        }
        // Small altitude for ALL countries so Three.js raycasting works
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        polygonAltitude={(d: any) => (isHighlighted(d) ? 0.025 : 0.002)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onPolygonClick={(feat: any) => {
          if (isHighlighted(feat)) onCountryClick?.(highlightCountry ?? getName(feat));
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onPolygonHover={(feat: any) => {
          document.body.style.cursor = isHighlighted(feat) ? "pointer" : "default";
        }}
        // Fallback: bounding-box click when GeoJSON hasn't loaded yet
        onGlobeClick={({ lat, lng }: { lat: number; lng: number }) => {
          // Mongolia bbox: ~41.5–52.1°N, 87.8–119.9°E
          if (lat >= 41.5 && lat <= 52.1 && lng >= 87.8 && lng <= 119.9) {
            onCountryClick?.("Mongolia");
          }
        }}
        htmlElementsData={regions}
        htmlLat={(d) => (d as GlobeRegion).lat}
        htmlLng={(d) => (d as GlobeRegion).lng}
        htmlAltitude={0.06}
        htmlElement={(d) => {
          const r = d as GlobeRegion;
          // Make the main pin clickable — most reliable click target
          const onClick =
            r.main && onCountryClick ? () => onCountryClick("Mongolia") : undefined;
          return makeLabel(r, onClick);
        }}
      />
    );
  }
);
GlobeViz.displayName = "GlobeViz";
export default GlobeViz;
