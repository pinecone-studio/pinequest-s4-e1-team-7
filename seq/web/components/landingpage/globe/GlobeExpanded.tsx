"use client";
import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { m, AnimatePresence, useSpring as fmSpring } from "framer-motion";
import * as THREE from "three";
import { ArrowLeftIcon, GlobeAltIcon, UserGroupIcon, BriefcaseIcon } from "@heroicons/react/24/outline";
import { EASE } from "../motion";

// ── lat/lng → 3D point on unit sphere (Three.js Y-up) ──────────────
function latLngToVec3(lat: number, lng: number, r = 2.05): [number, number, number] {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return [
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  ];
}

// ── Atmosphere fresnel sphere ────────────────────────────────────────
const atmosVert = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`;
const atmosFrag = `
  varying vec3 vNormal;
  void main() {
    float i = pow(0.68 - dot(vNormal, vec3(0,0,1)), 5.0);
    gl_FragColor = vec4(0.18, 0.55, 1.0, 1.0) * i;
  }
`;

const Atmosphere = () => (
  <mesh>
    <sphereGeometry args={[2.18, 64, 64]} />
    <shaderMaterial vertexShader={atmosVert} fragmentShader={atmosFrag}
      side={THREE.FrontSide} blending={THREE.AdditiveBlending} transparent depthWrite={false} />
  </mesh>
);

// ── Mongolia pin marker ──────────────────────────────────────────────
const Marker = ({ onHover }: { onHover: (h: boolean) => void }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const scaleSpring = fmSpring(1, { stiffness: 300, damping: 20 });
  const [pos] = useState(() => new THREE.Vector3(...latLngToVec3(47, 103)));

  return (
    <mesh ref={meshRef} position={pos}
      onPointerOver={() => { onHover(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { onHover(false); document.body.style.cursor = "default"; }}>
      <sphereGeometry args={[0.055, 16, 16]} />
      <meshStandardMaterial color="#f5c518" emissive="#f5c518" emissiveIntensity={0.6} />
    </mesh>
  );
};

// ── Earth sphere ─────────────────────────────────────────────────────
const Earth = ({ spinning }: { spinning: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { gl } = useThree();
  const texture = useTexture("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg");

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy  = gl.capabilities.getMaxAnisotropy();
    texture.needsUpdate = true;
  }, [texture, gl]);

  useFrame((_, dt) => {
    if (spinning && meshRef.current) meshRef.current.rotation.y += dt * 0.06;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 96, 96]} />
      <meshStandardMaterial map={texture} metalness={0.05} roughness={0.75} />
    </mesh>
  );
};

// ── Scene ────────────────────────────────────────────────────────────
const Scene = ({ spinning, onHover }: { spinning: boolean; onHover: (h: boolean) => void }) => (
  <>
    <ambientLight intensity={1.2} />
    <directionalLight position={[5, 3, 5]} intensity={1.6} />
    <Earth spinning={spinning} />
    <Atmosphere />
    <Marker onHover={onHover} />
    <OrbitControls enableDamping dampingFactor={0.06} enableZoom={false} enablePan={false}
      rotateSpeed={0.45} autoRotate={false} />
  </>
);

// ── Data ─────────────────────────────────────────────────────────────
const FILTERS = [
  { id: "overview", Icon: GlobeAltIcon,  label: "Ерөнхий" },
  { id: "people",   Icon: UserGroupIcon, label: "Иргэд" },
  { id: "jobs",     Icon: BriefcaseIcon, label: "Ажил" },
];

const STATS: Record<string, { title: string; big: string; bigLabel: string; rows: { label: string; value: string }[] }> = {
  overview: {
    title: "Монгол дахь нийгмийн нөлөөлөл",
    big: "25,000+", bigLabel: "Дохионы хэлний хэрэглэгч",
    rows: [{ label: "Ажилгүй иргэд (өмнө)", value: "2,400+" }, { label: "Ажилгүйдэл буурах", value: "−90%" }],
  },
  people: {
    title: "Сонсголын бэрхшээлтэй иргэд",
    big: "25,000+", bigLabel: "Монгол дахь хэрэглэгчид",
    rows: [{ label: "Хүн амын хувь", value: "0.8%" }, { label: "Хэрэглэгчдийн хүлээлт", value: "98%" }],
  },
  jobs: {
    title: "Хөдөлмөр эрхлэлт",
    big: "−90%", bigLabel: "Ажилгүйдэл буурах хэмжээ",
    rows: [{ label: "Хандалтын хязгаарлалт (өмнө)", value: "90%" }, { label: "Хөрвүүлэх тусламж", value: "24/7" }],
  },
};

// ── Main component ───────────────────────────────────────────────────
type Props = { onBack: () => void };

export const GlobeExpanded = ({ onBack }: Props) => {
  const [filter, setFilter]   = useState("overview");
  const [spinning, setSpinning] = useState(true);
  const [hovered, setHovered]   = useState(false);

  const handleHover = (h: boolean) => { setHovered(h); setSpinning(!h); };
  const stat = STATS[filter];

  return (
    <m.div className="fixed inset-0 z-50 bg-black"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: EASE }}>

      {/* 3D Canvas */}
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 6], fov: 42 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        className="absolute inset-0">
        <Suspense fallback={null}>
          <Scene spinning={spinning} onHover={handleHover} />
        </Suspense>
      </Canvas>

      {/* Back */}
      <div className="absolute left-8 top-8 z-10 flex items-center gap-3">
        <button onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
          style={{ border: "1px solid rgba(255,255,255,0.28)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
          <ArrowLeftIcon className="h-4 w-4 text-white" />
        </button>
        <button onClick={onBack}
          className="rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors"
          style={{ border: "1px solid rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.65)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
          Буцах
        </button>
      </div>

      {/* Left filter arc */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-4">
        {FILTERS.map(({ id, Icon }) => {
          const active = filter === id;
          return (
            <button key={id} onClick={() => setFilter(id)}
              className="flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200"
              style={{
                background: active ? "#f5c518" : "rgba(255,255,255,0.06)",
                border: `1px solid ${active ? "#f5c518" : "rgba(255,255,255,0.2)"}`,
              }}>
              <Icon className="h-5 w-5" style={{ color: active ? "#0d1e35" : "rgba(255,255,255,0.6)" }} />
            </button>
          );
        })}
      </div>

      {/* Right stats panel */}
      <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-center z-10 hidden lg:flex"
        style={{ width: "clamp(260px,24vw,360px)", paddingRight: "clamp(28px,4vw,52px)", paddingLeft: "1.5rem" }}>
        <AnimatePresence mode="wait">
          <m.div key={filter} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: EASE }}>
            <p className="mb-5 text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{stat.title}</p>
            <div className="mb-5 h-px" style={{ background: "rgba(255,255,255,0.14)" }} />
            <p className="mb-1 text-[11px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.32)" }}>{stat.bigLabel}</p>
            <p className="font-black leading-[0.9] mb-6" style={{ color: "#f5c518", fontSize: "clamp(42px,5.5vw,72px)", letterSpacing: "-2px" }}>{stat.big}</p>
            <div className="mb-5 h-px" style={{ background: "rgba(255,255,255,0.14)" }} />
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              {stat.rows.map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] leading-snug mb-2" style={{ color: "rgba(255,255,255,0.32)" }}>{label}</p>
                  <p className="font-black" style={{ color: "#f5c518", fontSize: "clamp(20px,2.4vw,32px)" }}>{value}</p>
                </div>
              ))}
            </div>
          </m.div>
        </AnimatePresence>
      </div>

      {/* Watermark */}
      <div className="pointer-events-none absolute bottom-6 left-8 select-none font-black text-white leading-none"
        style={{ fontSize: "clamp(48px,8vw,100px)", opacity: 0.07, letterSpacing: "-4px" }}>2026</div>

      {/* Mongolia hover hint */}
      <AnimatePresence>
        {hovered && (
          <m.div className="pointer-events-none absolute bottom-12 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
            <div className="rounded-full px-4 py-2 text-[12px] font-bold"
              style={{ background: "#f5c518", color: "#0d1e35" }}>Монгол Улс — 25,000+</div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
};
