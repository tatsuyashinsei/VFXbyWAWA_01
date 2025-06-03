// /src/components/Experience.jsx

import { Environment, OrbitControls, Stats } from "@react-three/drei";
import { VFXParticles } from "./VFX/VFXParticles";
import { VFXEmitter } from "./VFX/VFXEmitter";
import { useRef, useEffect } from "react";             // React から
import { useFrame } from "@react-three/fiber";         // R3F から
import { Bloom, EffectComposer } from "@react-three/postprocessing";


export const Experience = () => {

  const emitterRed = useRef();
  const emitterBlue = useRef();

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    emitterRed.current.position.x = Math.sin(time * 6) * 1.5;
    emitterRed.current.position.y = Math.cos(time * 3) * 1.5;
    emitterRed.current.position.z = Math.sin(time * 4) * 1.5;

    emitterBlue.current.position.x = Math.cos(time * 6) * 1.5;
    emitterBlue.current.position.y = Math.sin(time * 3) * 1.5;
    emitterBlue.current.position.z = Math.cos(time * 4) * 1.5;

    // emitterBlue.current.rotation.y += 0.01;
  });

  return (
    <>
      <Stats />
      <OrbitControls enablePan={false} />
      <Environment preset="sunset" />
      <VFXParticles name="sparks" settings={{ nbParticles: 1000000 }} />
      <VFXEmitter
        ref={emitterRed}
        emitter="sparks"
        settings={{
          nbParticles: 50000,
          colorStart: ["red", "white"],
          size: [0.01, 0.1],
          startPositionMin: [0, 0, 0],
          startPositionMax: [0, 0, 0],
          directionMin: [-0.5, 0, -0.5],
          directionMax: [0.5, 1, 0.5],
          speed: [1, 5],
          loop: true,
        }}
      />
      <VFXEmitter
        ref={emitterBlue}
        emitter="sparks"
        settings={{
          colorStart: ["blue", "white"],
          size: [0.01, 0.1],
          startPositionMin: [0, 0, 0],
          startPositionMax: [0, 0, 0],
          directionMin: [-0.5, 0, -0.5],
          directionMax: [0.5, 1, 0.5],
          speed: [1, 5],
          loop: true,
        }}
      />
      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={1} mipmapBlur />
      </EffectComposer>
    </>
  );
};
