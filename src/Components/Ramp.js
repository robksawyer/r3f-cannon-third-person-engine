import * as THREE from "three";
import * as CANNON from "cannon";
import React, { useEffect, useRef, useMemo } from "react";
import { useLoader, useFrame } from "react-three-fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useCannon } from "../Utils/useCannon";
import stars from "../Assets/stars.jpg";

export default function Model({ position }) {
  const gltf = useLoader(GLTFLoader, "/ramp.gltf");

  const texture = useMemo(() => new THREE.TextureLoader().load(stars), []);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.offset.set(0, 0);
  texture.repeat.set(2, 2);

  const group = useCannon({ mass: 1000 }, body => {
    body.addShape(new CANNON.Box(new CANNON.Vec3(1, 1, 1)));
    body.position.set(...position);
  });

  return (
    <group rotation-x={Math.PI / 2} ref={group}>
      <mesh name="Cube">
        <bufferGeometry attach="geometry" {...gltf.__$[3].geometry} />
        <meshStandardMaterial
          attach="material"
          {...gltf.__$[3].material}
          name="Material"
          map={texture}
        />
      </mesh>
    </group>
  );
}
