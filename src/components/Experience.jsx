// /src/components/Experience.jsx

import { Environment, OrbitControls, Stats } from "@react-three/drei";
import { VFXParticles } from "./VFX/VFXParticles";
import { VFXEmitter } from "./VFX/VFXEmitter";

export const Experience = () => {
  return (
    <>
      <Stats />
      <OrbitControls enablePan={false} />
      <Environment preset="sunset" />
      <VFXParticles name="sparks" />
      <VFXEmitter emitter="sparks" />
    </>
  );
};
