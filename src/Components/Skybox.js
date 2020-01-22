import React, { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import siege_ft from "../Assets/skyboxes/siege/siege_ft.png";
import siege_bk from "../Assets/skyboxes/siege/siege_bk.png";
import siege_up from "../Assets/skyboxes/siege/siege_up.png";
import siege_dn from "../Assets/skyboxes/siege/siege_dn.png";
import siege_rt from "../Assets/skyboxes/siege/siege_rt.png";
import siege_lf from "../Assets/skyboxes/siege/siege_lf.png";

export default function Skybox(props) {
  const [textures] = useState(() =>
    [siege_ft, siege_bk, siege_up, siege_dn, siege_rt, siege_lf].map(path =>
      new THREE.TextureLoader().load(`${path}`)
    )
  );

  return (
    <mesh {...props} rotation-x={Math.PI / 2}>
      <boxBufferGeometry attach="geometry" args={[1200, 1200, 1200]} />
      {textures.map(texture => (
        <meshLambertMaterial
          attachArray="material"
          side={THREE.BackSide}
          map={texture}
          fog={false}
        />
      ))}
    </mesh>
  );
}
