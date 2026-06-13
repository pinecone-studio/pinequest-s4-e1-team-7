"use client";
import { forwardRef, useEffect, useState } from "react";
import Globe from "react-globe.gl";
import { makeLabel } from "./makeGlobeLabel";

export type GlobeRegion = { lat: number; lng: number; label: string; value: string; main?: boolean };

interface Props {
  width: number;
  height: number;
  regions?: GlobeRegion[];
  highlightCountry?: string;
  onCountryClick?: (name: string) => void;
}

const GlobeViz = forwardRef<unknown, Props>(({ width, height, regions = [], highlightCountry, onCountryClick }, ref) => {
  const [countries, setCountries] = useState<object[]>([]);

  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/gh/vasturiano/react-globe.gl@master/example/country-flag-polygons/ne_110m_admin_0_countries.geojson")
      .then((r) => r.json())
      .then((d: { features?: object[] }) => setCountries(d.features ?? []));
  }, []);

  const getName = (feat: { properties?: { ADMIN?: string; NAME?: string; name?: string; admin?: string } }): string => {
    const p = feat?.properties ?? {};
    return p.ADMIN ?? p.NAME ?? p.name ?? p.admin ?? "";
  };

  const isHighlighted = (feat: { properties?: { ADMIN?: string; NAME?: string; name?: string; admin?: string; ISO_A3?: string } }): boolean => {
    const name = getName(feat).toLowerCase();
    const iso = (feat?.properties?.ISO_A3 ?? "").toUpperCase();
    return name === (highlightCountry ?? "").toLowerCase() || (highlightCountry === "Mongolia" && iso === "MNG");
  };

  return (
    <Globe
      ref={ref as never}
      width={width}
      height={height}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      backgroundColor="rgba(0,0,0,0)"
      atmosphereColor="rgba(100,200,255,0.18)"
      atmosphereAltitude={0.22}
      polygonsData={countries}
      polygonCapColor={(d) => (isHighlighted(d as Parameters<typeof isHighlighted>[0]) ? "rgba(245,197,24,0.72)" : "rgba(0,0,0,0)")}
      polygonSideColor={() => "rgba(0,0,0,0)"}
      polygonStrokeColor={(d) => (isHighlighted(d as Parameters<typeof isHighlighted>[0]) ? "rgba(245,197,24,0.5)" : "rgba(0,0,0,0)")}
      polygonAltitude={(d) => (isHighlighted(d as Parameters<typeof isHighlighted>[0]) ? 0.025 : 0.002)}
      onPolygonClick={(feat) => {
        if (isHighlighted(feat as Parameters<typeof isHighlighted>[0])) onCountryClick?.(highlightCountry ?? getName(feat as Parameters<typeof getName>[0]));
      }}
      onPolygonHover={(feat) => {
        document.body.style.cursor = feat && isHighlighted(feat as Parameters<typeof isHighlighted>[0]) ? "pointer" : "default";
      }}
      onGlobeClick={({ lat, lng }: { lat: number; lng: number }) => {
        if (lat >= 41.5 && lat <= 52.1 && lng >= 87.8 && lng <= 119.9) onCountryClick?.("Mongolia");
      }}
      htmlElementsData={regions}
      htmlLat={(d) => (d as GlobeRegion).lat}
      htmlLng={(d) => (d as GlobeRegion).lng}
      htmlAltitude={0.06}
      htmlElement={(d) => {
        const r = d as GlobeRegion;
        const onClick = r.main && onCountryClick ? () => onCountryClick("Mongolia") : undefined;
        return makeLabel(r, onClick);
      }}
    />
  );
});

GlobeViz.displayName = "GlobeViz";
export default GlobeViz;
