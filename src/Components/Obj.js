import * as CANNON from "cannon";
import React, { useMemo } from "react";
import * as THREE from "three";
import { useCannon } from "../Utils/useCannon";
import metal from "../Assets/metal.jpg";
//import { threeToCannon } from 'three-to-cannon';

export default function Obj({ position }) {
  const ref = useCannon({ mass: 1000 }, body => {
    body.addShape(new CANNON.Box(new CANNON.Vec3(1, 1, 1)));
    body.position.set(...position);
  });

  const metalTexture = useMemo(() => new THREE.TextureLoader().load(metal), []);

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry attach="geometry" args={[2, 2, 2]} />
      <meshStandardMaterial attach="material">
        <primitive attach="map" object={metalTexture} />
      </meshStandardMaterial>
    </mesh>
  );
}
