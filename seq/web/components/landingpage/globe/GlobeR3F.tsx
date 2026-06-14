"use client";
import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";

const TEX = "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";

function latLngToVec3(lat: number, lng: number, r = 2.05): [number, number, number] {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return [-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)];
}

const atmosVert = `varying vec3 vNormal;
void main(){vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const atmosFrag = `varying vec3 vNormal;
void main(){float i=pow(0.68-dot(vNormal,vec3(0,0,1)),5.0);gl_FragColor=vec4(0.18,0.55,1.0,1.0)*i;}`;

const Atmosphere = () => (
  <mesh>
    <sphereGeometry args={[2.18, 64, 64]} />
    <shaderMaterial vertexShader={atmosVert} fragmentShader={atmosFrag}
      side={THREE.FrontSide} blending={THREE.AdditiveBlending} transparent depthWrite={false} />
  </mesh>
);

const Earth = ({ spinning }: { spinning: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { gl } = useThree();
  const texture = useTexture(TEX);
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = gl.capabilities.getMaxAnisotropy();
    texture.needsUpdate = true;
  }, [texture, gl]);
  useFrame((_, dt) => { if (spinning && meshRef.current) meshRef.current.rotation.y += dt * 0.06; });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 96, 96]} />
      <meshStandardMaterial map={texture} metalness={0.05} roughness={0.75} />
    </mesh>
  );
};

const Marker = ({ onHover, onClick }: { onHover?: (h: boolean) => void; onClick?: () => void }) => {
  const [pos] = useState(() => new THREE.Vector3(...latLngToVec3(47, 103)));
  return (
    <mesh position={pos}
      onPointerOver={() => { onHover?.(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { onHover?.(false); document.body.style.cursor = "default"; }}
      onClick={() => onClick?.()}>
      <sphereGeometry args={[0.055, 16, 16]} />
      <meshStandardMaterial color="#f5c518" emissive="#f5c518" emissiveIntensity={0.6} />
    </mesh>
  );
};

const Scene = ({
  spinning, onHover, onExpand,
}: { spinning: boolean; onHover?: (h: boolean) => void; onExpand?: () => void }) => (
  <>
    <ambientLight intensity={1.2} />
    <directionalLight position={[5, 3, 5]} intensity={1.6} />
    <Earth spinning={spinning} />
    <Atmosphere />
    <Marker onHover={onHover} onClick={onExpand} />
    <OrbitControls enableDamping dampingFactor={0.06} enableZoom={false} enablePan={false} rotateSpeed={0.45} />
  </>
);

interface GlobeR3FProps {
  spinning?: boolean;
  onMarkerHover?: (h: boolean) => void;
  onExpand?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

const GlobeR3F = ({ spinning = true, onMarkerHover, onExpand, style, className }: GlobeR3FProps) => (
  <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 6], fov: 42 }}
    gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
    style={style} className={className}>
    <Suspense fallback={null}>
      <Scene spinning={spinning} onHover={onMarkerHover} onExpand={onExpand} />
    </Suspense>
  </Canvas>
);

export default GlobeR3F;
