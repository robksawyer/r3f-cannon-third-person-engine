import * as CANNON from "cannon";
import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useCannon } from "../Utils/useCannon";
import gold from "../Assets/gold.jpg";
import useStore from "./store";

export default function Subject({ position, camera }) {
  const count = useStore(state => state.nested.stuff.is.here);
  const up = useStore(state => state.up);

  const geometryRef = useRef();

  const ref = useCannon({ mass: 1000 }, body => {
    body.addShape(new CANNON.Box(new CANNON.Vec3(1, 1, 1)));
    body.position.set(...position);

    document.addEventListener("keydown", onDocumentKeyDown, false);

    function onDocumentKeyDown(event) {
      var keyCode = event.which;
      if (keyCode == 38) {
        body.position.y++;
        camera.position.y++;
      } else if (keyCode == 40) {
        body.position.y--;
      } else if (keyCode == 37) {
        body.position.x--;
      } else if (keyCode == 39) {
        body.position.x++;
      } else if (keyCode == 32) {
        body.position.z = body.position.z + 4;
      }
    }
  });

  const goldTexture = useMemo(() => new THREE.TextureLoader().load(gold), []);

  return (
    <mesh ref={ref} castShadow receiveShadow onClick={() => up()}>
      <boxGeometry ref={geometryRef} attach="geometry" args={[2, 2, 2]} />
      <meshStandardMaterial attach="material">
        <primitive attach="map" object={goldTexture} />
      </meshStandardMaterial>
    </mesh>
  );
}
