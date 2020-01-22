import React from "react";
//import PropTypes from "prop-types";
import { extend, useThree } from "react-three-fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";

extend({ OrbitControls });
extend({ TrackballControls });

function Controls(props) {
  const { camera, gl } = useThree();
  camera.position.x = 0;
  camera.position.y = -3;
  camera.position.z = 3;
  camera.up.set(0, 0, 1);

  return (
    <orbitControls
      enabled={true}
      noPan={true}
      maxPolarAngle={Math.PI / 2.1}
      args={[camera, gl.domElement]}
    />
  );
}

// Controls.propTypes = {};

export default Controls;
