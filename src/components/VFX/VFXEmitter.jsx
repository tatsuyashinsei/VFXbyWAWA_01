// /src/components/VFX/VFXEmitter.jsx

import { forwardRef, useImperativeHandle, useRef } from "react";
import { useVFX } from "./VFXStore";
import { useFrame } from "@react-three/fiber";

export const VFXEmitter = forwardRef(
  ({ emitter, settings = {}, ...props }, forwardedRef) => {
    const {
      duration = 1,
      nbParticles = 1000,
      spawnMode = "time", // time, burst
      loop = false,
      delay = 0,
      colorStart = ["white", "skyblue"],
      colorEnd = [],
      particlesLifetime = [0.1, 1],
      speed = [5, 20],
      size = [0.1, 1],
      startPositionMin = [-1, -1, -1],
      startPositionMax = [1, 1, 1],
      startRotationMin = [0, 0, 0],
      startRotationMax = [0, 0, 0],
      rotationSpeedMin = [0, 0, 0],
      rotationSpeedMax = [0, 0, 0],
      directionMin = [0, 0, 0],
      directionMax = [0, 0, 0],
    } = settings;

    const emit = useVFX((state) => state.emit);

    const ref = useRef();
    useImperativeHandle(forwardedRef, () => ref.current);

    const emitted = useRef(0);
    const elapsedTime = useRef(0);

    useFrame((_, delta) => {
      if (emitted.current < nbParticles || loop) {
        if (!ref) {
          return;
        }
        const particlesToEmit =
          spawnMode === "burst"
            ? nbParticles
            : Math.max(
                0,
                Math.floor(
                  ((elapsedTime.current - delay) / duration) * nbParticles
                )
              );

        const rate = particlesToEmit - emitted.current;
        if (rate > 0 && elapsedTime.current >= delay) {
          emit(emitter, rate);
          emitted.current += rate;
        }
      }
      elapsedTime.current += delta;
    });

    return (
      <>
        <object3D {...props} ref={ref} />
      </>
    );
  }
);
