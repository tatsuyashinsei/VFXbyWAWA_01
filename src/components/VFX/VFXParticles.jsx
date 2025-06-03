// /src/components/VFX/VFXParticles.jsx

import { useMemo, useRef, useEffect, useState } from "react";
import { extend, useFrame } from "@react-three/fiber";
import {
  Color,
  Euler,
  Matrix4,
  PlaneGeometry,
  Quaternion,
  Vector3,
  DynamicDrawUsage, // ✅ これが今回の未定義エラーの原因
  InstancedBufferAttribute, // 下で `extend()` に必要
} from "three";
import { randFloat, randFloatSpread } from "three/src/math/MathUtils.js";
import { shaderMaterial } from "@react-three/drei";
import { useVFX } from "./VFXStore";

const tmpPosition = new Vector3();
const tmpRotationEuler = new Euler();
const tmpRotation = new Quaternion();
const tmpScale = new Vector3(1, 1, 1);
const tmpMatrix = new Matrix4();

const tmpColor = new Color();

export const VFXParticles = ({ name, settings = {} }) => {
  const { nbParticles = 1000 } = settings;
  const mesh = useRef();
  const defaultGeometry = useMemo(() => new PlaneGeometry(0.5, 0.5), []);

  const cursor = useRef(0);

  const emit = (count, setup) => {

    const instanceColor = mesh.current.geometry.getAttribute("instanceColor");
    const instanceColorEnd =
      mesh.current.geometry.getAttribute("instanceColorEnd");
    const instanceDirection =
      mesh.current.geometry.getAttribute("instanceDirection");
    const instanceLifetime =
      mesh.current.geometry.getAttribute("instanceLifetime");
    const instanceSpeed = mesh.current.geometry.getAttribute("instanceSpeed");
    const instanceRotationSpeed = mesh.current.geometry.getAttribute(
      "instanceRotationSpeed"
    );

    for (let i = 0; i < count; i++) {
      if (cursor.current >= nbParticles) {
        cursor.current = 0;
      }

      const {
        scale,
        rotation,
        rotationSpeed,
        position,
        direction,
        lifetime,
        colorStart,
        colorEnd,
        speed,
      } = setup();

      // const position = [
      //   randFloatSpread(0.1),
      //   randFloatSpread(0.1),
      //   randFloatSpread(0.1),
      // ];
      // const scale = [
      //   randFloatSpread(1),
      //   randFloatSpread(1),
      //   randFloatSpread(1),
      // ];
      // const rotation = [
      //   randFloatSpread(Math.PI),
      //   randFloatSpread(Math.PI),
      //   randFloatSpread(Math.PI),
      // ];
      
      tmpPosition.set(...position);
      tmpRotationEuler.set(...rotation);
      tmpRotation.setFromEuler(tmpRotationEuler);
      tmpScale.set(...scale);
      tmpMatrix.compose(tmpPosition, tmpRotation, tmpScale);
      mesh.current.setMatrixAt(cursor.current, tmpMatrix);

      // tmpColor.setRGB(Math.random(), Math.random(), Math.random());
      tmpColor.setRGB(1, 1, 1);
      instanceColor.set(
        [tmpColor.r, tmpColor.g, tmpColor.b],
        cursor.current * 3
      );

      // tmpColor.setRGB(Math.random(), Math.random(), Math.random());
      tmpColor.setRGB(0, 0, 0);
      instanceColorEnd.set(
        [tmpColor.r, tmpColor.g, tmpColor.b],
        cursor.current * 3
      );

      cursor.current++;
      cursor.current = cursor.current % nbParticles;

      const direction = [
        randFloatSpread(0.5),
        1,
        randFloatSpread(0.5),
      ];
      instanceDirection.set(direction, cursor.current * 3);

      const lifetime = [randFloat(0, 5), randFloat(0.1, 5)];
      instanceLifetime.set(lifetime, cursor.current * 2);

      const speed = randFloat(1, 2);
      instanceSpeed.set([speed], cursor.current);

      const rotationSpeed = [
        randFloatSpread(3),
        randFloatSpread(3),
        randFloatSpread(3),
      ];
      instanceRotationSpeed.set(rotationSpeed, cursor.current * 3);
    }

    mesh.current.instanceMatrix.needsUpdate = true;
    instanceColor.needsUpdate = true;
    instanceColorEnd.needsUpdate = true;
    instanceDirection.needsUpdate = true;
    instanceLifetime.needsUpdate = true;
    instanceSpeed.needsUpdate = true;
    instanceRotationSpeed.needsUpdate = true;
  };


  const registerEmitter = useVFX((state) => state.registerEmitter);
  const unregisterEmitter = useVFX((state) => state.unregisterEmitter);

  useEffect(() => {
    // emit(nbParticles);
    registerEmitter(name, emit);
    return () => {
      unregisterEmitter(name);
    }
  }, []);

  const [attributeArrays] = useState({
    instanceColor: new Float32Array(nbParticles * 3),
    instanceColorEnd: new Float32Array(nbParticles * 3),
    instanceDirection: new Float32Array(nbParticles * 3),
    instanceLifetime: new Float32Array(nbParticles * 2),
    instanceSpeed: new Float32Array(nbParticles * 1),
    instanceRotationSpeed: new Float32Array(nbParticles * 3),
  });

  useFrame(({ clock }) => {
    if (!mesh.current) {
      return;
    }
    mesh.current.material.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <>
      <instancedMesh args={[defaultGeometry, null, nbParticles]} ref={mesh}>
        <particlesMaterial color="orange" />
        <instancedBufferAttribute
          attach={"geometry-attributes-instanceColor"}
          args={[attributeArrays.instanceColor]}
          itemSize={3}
          count={nbParticles}
          usage={DynamicDrawUsage}
        />
        <instancedBufferAttribute
          attach={"geometry-attributes-instanceColorEnd"}
          args={[attributeArrays.instanceColorEnd]}
          itemSize={3}
          count={nbParticles}
          usage={DynamicDrawUsage}
        />
        <instancedBufferAttribute
          attach={"geometry-attributes-instanceDirection"}
          args={[attributeArrays.instanceDirection]}
          itemSize={3}
          count={nbParticles}
          usage={DynamicDrawUsage}
        />
        <instancedBufferAttribute
          attach={"geometry-attributes-instanceLifetime"}
          args={[attributeArrays.instanceLifetime]}
          itemSize={2}
          count={nbParticles}
          usage={DynamicDrawUsage}
        />
        <instancedBufferAttribute
          attach={"geometry-attributes-instanceSpeed"}
          args={[attributeArrays.instanceSpeed]}
          itemSize={1}
          count={nbParticles}
          usage={DynamicDrawUsage}
        />
        <instancedBufferAttribute
          attach={"geometry-attributes-instanceRotationSpeed"}
          args={[attributeArrays.instanceRotationSpeed]}
          itemSize={3}
          count={nbParticles}
          usage={DynamicDrawUsage}
        />
      </instancedMesh>
    </>
  );
};

const ParticlesMaterial = shaderMaterial(
  {
    uTime: 0,
  },
  /* glsl */ `

  mat4 rotationX(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat4(
        1,  0,  0,  0,
        0,  c, -s,  0,
        0,  s,  c,  0,
        0,  0,  0,  1
    );
  }

  mat4 rotationY(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat4(
        c,  0,  s,  0,
        0,  1,  0,  0,
        -s,  0,  c,  0,
        0,  0,  0,  1
    );
  }

  mat4 rotationZ(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat4(
        c, -s,  0,  0,
        s,  c,  0,  0,
        0,  0,  1,  0,
        0,  0,  0,  1
    );
  }

  uniform float uTime;
  varying vec3 vColor;
  varying vec3 vColorEnd;
  varying float vProgress;
  varying vec2 vUv;

  attribute float instanceSpeed;
  attribute vec3 instanceRotationSpeed;
  attribute vec3 instanceDirection;
  attribute vec3 instanceColor;
  attribute vec3 instanceColorEnd;
  attribute vec2 instanceLifetime; // x: startTime, y: duration

  void main() {
    float startTime = instanceLifetime.x;
    float duration = instanceLifetime.y;
    float age = uTime - startTime;
    vProgress = age / duration;

    vec3 normalizedDirection = length(instanceDirection) > 0.0 ? normalize(instanceDirection) : vec3(0.0);
    vec3 offset = normalizedDirection * age * instanceSpeed;

    vec3 rotationSpeed = instanceRotationSpeed * age;
    mat4 rotX = rotationX(rotationSpeed.x);
    mat4 rotY = rotationY(rotationSpeed.y);
    mat4 rotZ = rotationZ(rotationSpeed.z);
    mat4 rotationMatrix = rotZ * rotY * rotX;

    vec4 startPosition = modelMatrix * instanceMatrix * rotationMatrix * vec4(position, 1.0);

    vec3 instancePosition = startPosition.xyz;

    vec3 finalPosition = instancePosition + offset;

    vec4 mvPosition = modelViewMatrix * vec4(finalPosition, 1.0);


    gl_Position = projectionMatrix * mvPosition;


    vUv = uv;
    vColor = instanceColor;
    vColorEnd = instanceColorEnd;
  }
  `,
  /* glsl */ `
  varying vec3 vColor;
  varying vec3 vColorEnd;
  varying float vProgress;
  varying vec2 vUv;

  void main() {
    if (vProgress < 0.0 || vProgress > 1.0) {
      discard;
    }
    vec3 finalColor = mix(vColor, vColorEnd, vProgress);
    gl_FragColor = vec4(finalColor, 1.0);
  }
  `
);

extend({ ParticlesMaterial });
