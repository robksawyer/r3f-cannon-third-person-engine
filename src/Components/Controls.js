import React, { Fragment } from "react";
//import PropTypes from "prop-types";
import { extend, useThree } from "react-three-fiber";
//import { OrbitControls } from "./OrbitControlsFork";
//import Subject from "./Subject";
import ReactOrbitControls from "./ReactOrbitControls";

//extend({ OrbitControls });

function Controls(props) {
  const { camera, gl } = useThree();
  camera.position.x = 0;
  camera.position.y = -3;
  camera.position.z = 3;
  camera.up.set(0, 0, 1);

  return (
    <Fragment>
      {/* <orbitControls
        enabled={true}
        noPan={true}
        maxPolarAngle={Math.PI / 2.1}
        args={[camera, gl.domElement]}
      /> */}
      <ReactOrbitControls
        // enabled={true}
        // noPan={true}
        // maxPolarAngle={Math.PI / 2.1}
        camera={camera}
        glDomElement={gl.domElement}
        //args={[camera, gl.domElement]}
      />
    </Fragment>
  );
}

// Controls.propTypes = {};

export default Controls;
