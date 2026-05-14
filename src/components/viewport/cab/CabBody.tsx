import { Edges } from "@react-three/drei";
import type { CabDimensions } from "./CabTypes";
import { cabColors, ignoreCabRaycast } from "./CabTypes";

interface Props {
  cab: CabDimensions;
}

export function CabBody({ cab }: Props) {
  const colors = cabColors(cab.sketch);
  const mainLength = cab.length * 0.78;
  const rearLength = cab.length * 0.2;
  return (
    <group>
      <mesh position={[cab.length * 0.06, 0, 0]} castShadow receiveShadow raycast={ignoreCabRaycast}>
        <boxGeometry args={[mainLength, cab.height * 0.88, cab.width * 0.92]} />
        <meshStandardMaterial color={colors.body} roughness={0.84} metalness={cab.sketch ? 0 : 0.06} transparent opacity={cab.opacity} />
        <Edges color={cab.mode === "solid" && !cab.sketch ? "#161a20" : colors.edge} />
      </mesh>
      <mesh position={[cab.length * 0.43, -cab.height * 0.04, 0]} castShadow receiveShadow raycast={ignoreCabRaycast}>
        <boxGeometry args={[rearLength, cab.height * 0.72, cab.width * 0.9]} />
        <meshStandardMaterial color={colors.bodyDark} roughness={0.86} transparent opacity={cab.opacity} />
        <Edges color={colors.edge} />
      </mesh>
      <mesh position={[-cab.length * 0.36, -cab.height * 0.45, 0]} raycast={ignoreCabRaycast}>
        <boxGeometry args={[cab.length * 0.62, cab.height * 0.12, cab.width * 0.98]} />
        <meshStandardMaterial color={colors.trim} roughness={0.82} transparent opacity={cab.opacity} />
      </mesh>
      <mesh position={[cab.length * 0.02, cab.height * 0.46, 0]} raycast={ignoreCabRaycast}>
        <boxGeometry args={[cab.length * 0.58, cab.height * 0.08, cab.width * 0.78]} />
        <meshStandardMaterial color={colors.detail} roughness={0.8} transparent opacity={cab.mode === "xray" ? 0.18 : 0.72} />
        <Edges color={colors.edge} />
      </mesh>
    </group>
  );
}
