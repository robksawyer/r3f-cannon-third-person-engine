import React, { useRef, useState, Suspense } from "react";
import * as THREE from "three";
import { Canvas, extend, useThree } from "react-three-fiber";
import Controls from "./Controls";
import Subject from "./Subject";
import Obj from "./Obj";
import Skybox from "./Skybox";
import Plane from "./Plane";
import Ramp from "./Ramp";
import Hud from "./Hud";
import { Provider } from "../Utils/useCannon";
import "../App.css";

function App() {
  return (
    <div className="canvasTainer">
      <Canvas
        camera={{ fov: 75, near: 0.1, far: 1000 }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <ambientLight intensity={1} position={[0, 0, 0]} />
        {/* <pointLight intensity={0.5} position={[4, 8, 4]} />
        <pointLight intensity={0.5} position={[0, 0, 0]} /> */}
        <spotLight
          castShadow
          penumbra={1}
          intensity={1}
          angle={Math.PI / 8}
          position={[150, -250, 300]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        <fog attach="fog" args={["#66bd28", 50, 200]} />
        <Provider>
          <Controls />
          <Obj position={[-3, 4, 1]} />
          <Obj position={[0, 4, 1]} />
          <Obj position={[3, 4, 1]} />
          {/* <Subject position={[0, 0, 1]} /> */}
          <Skybox position={[0, 0, -1]} />

          <Plane position={[0, 0, 0]} />
          <Suspense fallback={<Obj position={[1, 10, 1]} />}>
            <Ramp position={[1, 10, 1]} />
          </Suspense>
        </Provider>
      </Canvas>
      <Hud />
    </div>
  );
}

export default App;
