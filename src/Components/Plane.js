import * as CANNON from "cannon";
import React, { useMemo } from "react";
import * as THREE from "three";
import { useCannon } from "../Utils/useCannon";
import metal from "../Assets/metal.jpg";
import grass from "../Assets/grasses/GrassGreenTexture0002.jpg";

export default function Plane({ position }) {
  const ref = useCannon({ mass: 0 }, body => {
    body.addShape(new CANNON.Plane());
    body.position.set(...position);
    //var rot = new CANNON.Vec3(-1, 0, 0);
    //body.quaternion.setFromAxisAngle(rot, Math.PI / 2);
  });

  const texture = useMemo(() => new THREE.TextureLoader().load(grass), []);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.offset.set(0, 0);
  texture.repeat.set(300, 300);

  return (
    <mesh ref={ref} receiveShadow>
      <planeBufferGeometry attach="geometry" args={[1000, 1000]} />
      <meshStandardMaterial attach="material">
        <primitive attach="map" object={texture} />
      </meshStandardMaterial>
    </mesh>
  );
}
