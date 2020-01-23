import React, { useEffect } from "react";
//import PropTypes from 'prop-types'
import {
  EventDispatcher,
  MOUSE,
  Quaternion,
  Spherical,
  TOUCH,
  Vector2,
  Vector3
} from "three/build/three.module.js";
import Subject from "./Subject";

function ReactOrbitControls({ camera, glDomElement }) {
  useEffect(() => {
    OrbitControls(camera, glDomElement);
  });

  const OrbitControls = (camera, glDomElement) => {
    //JC: object is camera
    const object = camera;
    //JC: domElement is gl.domElement which is evidently Canvas
    const domElement = glDomElement;

    if (domElement === undefined)
      console.warn(
        'THREE.OrbitControls: The second parameter "domElement" is now mandatory.'
      );
    if (domElement === document)
      console.error(
        'THREE.OrbitControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.'
      );

    // Set to false to disable this control
    let enabled = true;

    // "target" sets the location of focus, where the object orbits around
    let target = new Vector3();

    // How far you can dolly in and out ( PerspectiveCamera only )
    let minDistance = 0;
    let maxDistance = Infinity;

    // How far you can zoom in and out ( OrthographicCamera only )
    let minZoom = 0;
    let maxZoom = Infinity;

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    let minPolarAngle = 0; // radians
    let maxPolarAngle = Math.PI; // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    let minAzimuthAngle = -Infinity; // radians
    let maxAzimuthAngle = Infinity; // radians

    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    let enableDamping = false;
    let dampingFactor = 0.05;

    // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
    // Set to false to disable zooming
    let enableZoom = true;
    let zoomSpeed = 1.0;

    // Set to false to disable rotating
    let enableRotate = true;
    let rotateSpeed = 1.0;

    // Set to false to disable panning
    let enablePan = true;
    let panSpeed = 1.0;
    let screenSpacePanning = false; // if true, pan in screen-space
    let keyPanSpeed = 7.0; // pixels moved per arrow key push

    // Set to true to automatically rotate around the target
    // If auto-rotate is enabled, you must call controls.update() in your animation loop
    let autoRotate = false;
    let autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

    // Set to false to disable use of the keys
    let enableKeys = true;

    // The four arrow keys
    let keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

    // Mouse buttons
    let mouseButtons = {
      LEFT: MOUSE.ROTATE,
      MIDDLE: MOUSE.DOLLY,
      RIGHT: MOUSE.PAN
    };

    // Touch fingers
    let touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };

    // for reset
    let target0 = target.clone();
    let position0 = object.position.clone();
    let zoom0 = object.zoom;

    //
    // public methods
    //

    const getPolarAngle = function() {
      return spherical.phi;
    };

    const getAzimuthalAngle = function() {
      return spherical.theta;
    };

    const saveState = function() {
      target0.copy(target);
      position0.copy(object.position);
      zoom0 = object.zoom;
    };

    const reset = function() {
      target.copy(target0);
      object.position.copy(position0);
      object.zoom = zoom0;

      object.updateProjectionMatrix();
      //JC: I commented out all dispatchEvents; not sure if we need them ¯\_(ツ)_/¯
      //dispatchEvent(changeEvent);

      update();

      state = STATE.NONE;
    };

    // this method is exposed, but perhaps it would be better if we can make it private...
    const update = (function() {
      var offset = new Vector3();

      // so camera.up is the orbit axis
      var quat = new Quaternion().setFromUnitVectors(
        object.up,
        new Vector3(0, 1, 0)
      );
      var quatInverse = quat.clone().inverse();

      var lastPosition = new Vector3();
      var lastQuaternion = new Quaternion();

      return function update() {
        var position = object.position;

        offset.copy(position).sub(target);

        // rotate offset to "y-axis-is-up" space
        offset.applyQuaternion(quat);

        // angle from z-axis around y-axis
        spherical.setFromVector3(offset);

        if (autoRotate && state === STATE.NONE) {
          rotateLeft(getAutoRotationAngle());
        }

        if (enableDamping) {
          spherical.theta += sphericalDelta.theta * dampingFactor;
          spherical.phi += sphericalDelta.phi * dampingFactor;
        } else {
          spherical.theta += sphericalDelta.theta;
          spherical.phi += sphericalDelta.phi;
        }

        // restrict theta to be between desired limits
        spherical.theta = Math.max(
          minAzimuthAngle,
          Math.min(maxAzimuthAngle, spherical.theta)
        );

        // restrict phi to be between desired limits
        spherical.phi = Math.max(
          minPolarAngle,
          Math.min(maxPolarAngle, spherical.phi)
        );

        spherical.makeSafe();

        spherical.radius *= scale;

        // restrict radius to be between desired limits
        spherical.radius = Math.max(
          minDistance,
          Math.min(maxDistance, spherical.radius)
        );

        // move target to panned location

        if (enableDamping === true) {
          target.addScaledVector(panOffset, dampingFactor);
        } else {
          target.add(panOffset);
        }

        offset.setFromSpherical(spherical);

        // rotate offset back to "camera-up-vector-is-up" space
        offset.applyQuaternion(quatInverse);

        position.copy(target).add(offset);

        object.lookAt(target);

        if (enableDamping === true) {
          sphericalDelta.theta *= 1 - dampingFactor;
          sphericalDelta.phi *= 1 - dampingFactor;

          panOffset.multiplyScalar(1 - dampingFactor);
        } else {
          sphericalDelta.set(0, 0, 0);

          panOffset.set(0, 0, 0);
        }

        scale = 1;

        // update condition is:
        // min(camera displacement, camera rotation in radians)^2 > EPS
        // using small-angle approximation cos(x/2) = 1 - x^2 / 8

        if (
          zoomChanged ||
          lastPosition.distanceToSquared(object.position) > EPS ||
          8 * (1 - lastQuaternion.dot(object.quaternion)) > EPS
        ) {
          //JC: I commented out all dispatchEvents; not sure if we need them ¯\_(ツ)_/¯
          //dispatchEvent(changeEvent);

          lastPosition.copy(object.position);
          lastQuaternion.copy(object.quaternion);
          zoomChanged = false;

          return true;
        }

        return false;
      };
    })();

    const dispose = function() {
      domElement.removeEventListener("contextmenu", onContextMenu, false);
      domElement.removeEventListener("mousedown", onMouseDown, false);
      domElement.removeEventListener("wheel", onMouseWheel, false);

      domElement.removeEventListener("touchstart", onTouchStart, false);
      domElement.removeEventListener("touchend", onTouchEnd, false);
      domElement.removeEventListener("touchmove", onTouchMove, false);

      document.removeEventListener("mousemove", onMouseMove, false);
      document.removeEventListener("mouseup", onMouseUp, false);

      domElement.removeEventListener("keydown", onKeyDown, false);

      //scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?
    };

    //
    // internals
    //

    //var scope = this;

    var changeEvent = { type: "change" };
    var startEvent = { type: "start" };
    var endEvent = { type: "end" };

    var STATE = {
      NONE: -1,
      ROTATE: 0,
      DOLLY: 1,
      PAN: 2,
      TOUCH_ROTATE: 3,
      TOUCH_PAN: 4,
      TOUCH_DOLLY_PAN: 5,
      TOUCH_DOLLY_ROTATE: 6
    };

    var state = STATE.NONE;

    var EPS = 0.000001;

    // current position in spherical coordinates
    var spherical = new Spherical();
    var sphericalDelta = new Spherical();

    var scale = 1;
    var panOffset = new Vector3();
    var zoomChanged = false;

    var rotateStart = new Vector2();
    var rotateEnd = new Vector2();
    var rotateDelta = new Vector2();

    var panStart = new Vector2();
    var panEnd = new Vector2();
    var panDelta = new Vector2();

    var dollyStart = new Vector2();
    var dollyEnd = new Vector2();
    var dollyDelta = new Vector2();

    function getAutoRotationAngle() {
      return ((2 * Math.PI) / 60 / 60) * autoRotateSpeed;
    }

    function getZoomScale() {
      return Math.pow(0.95, zoomSpeed);
    }

    function rotateLeft(angle) {
      sphericalDelta.theta -= angle;
    }

    function rotateUp(angle) {
      sphericalDelta.phi -= angle;
    }

    var panLeft = (function() {
      var v = new Vector3();

      return function panLeft(distance, objectMatrix) {
        v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
        v.multiplyScalar(-distance);

        panOffset.add(v);
      };
    })();

    var panUp = (function() {
      var v = new Vector3();

      return function panUp(distance, objectMatrix) {
        if (screenSpacePanning === true) {
          v.setFromMatrixColumn(objectMatrix, 1);
        } else {
          v.setFromMatrixColumn(objectMatrix, 0);
          v.crossVectors(object.up, v);
        }

        v.multiplyScalar(distance);

        panOffset.add(v);
      };
    })();

    // deltaX and deltaY are in pixels; right and down are positive
    var pan = (function() {
      var offset = new Vector3();

      return function pan(deltaX, deltaY) {
        var element = domElement;

        if (object.isPerspectiveCamera) {
          // perspective
          var position = object.position;
          offset.copy(position).sub(target);
          var targetDistance = offset.length();

          // half of the fov is center to top of screen
          targetDistance *= Math.tan(((object.fov / 2) * Math.PI) / 180.0);

          // we use only clientHeight here so aspect ratio does not distort speed
          panLeft(
            (2 * deltaX * targetDistance) / element.clientHeight,
            object.matrix
          );
          panUp(
            (2 * deltaY * targetDistance) / element.clientHeight,
            object.matrix
          );
        } else if (object.isOrthographicCamera) {
          // orthographic
          panLeft(
            (deltaX * (object.right - object.left)) /
              object.zoom /
              element.clientWidth,
            object.matrix
          );
          panUp(
            (deltaY * (object.top - object.bottom)) /
              object.zoom /
              element.clientHeight,
            object.matrix
          );
        } else {
          // camera neither orthographic nor perspective
          console.warn(
            "WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."
          );
          enablePan = false;
        }
      };
    })();

    function dollyIn(dollyScale) {
      if (object.isPerspectiveCamera) {
        scale /= dollyScale;
      } else if (object.isOrthographicCamera) {
        object.zoom = Math.max(
          minZoom,
          Math.min(maxZoom, object.zoom * dollyScale)
        );
        object.updateProjectionMatrix();
        zoomChanged = true;
      } else {
        console.warn(
          "WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."
        );
        enableZoom = false;
      }
    }

    function dollyOut(dollyScale) {
      if (object.isPerspectiveCamera) {
        scale *= dollyScale;
      } else if (object.isOrthographicCamera) {
        object.zoom = Math.max(
          minZoom,
          Math.min(maxZoom, object.zoom / dollyScale)
        );
        object.updateProjectionMatrix();
        zoomChanged = true;
      } else {
        console.warn(
          "WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."
        );
        enableZoom = false;
      }
    }

    //
    // event callbacks - update the object state
    //

    function handleMouseDownRotate(event) {
      rotateStart.set(event.clientX, event.clientY);
    }

    function handleMouseDownDolly(event) {
      dollyStart.set(event.clientX, event.clientY);
    }

    function handleMouseDownPan(event) {
      panStart.set(event.clientX, event.clientY);
    }

    function handleMouseMoveRotate(event) {
      rotateEnd.set(event.clientX, event.clientY);

      rotateDelta
        .subVectors(rotateEnd, rotateStart)
        .multiplyScalar(rotateSpeed);

      var element = domElement;

      rotateLeft((2 * Math.PI * rotateDelta.x) / element.clientHeight); // yes, height

      rotateUp((2 * Math.PI * rotateDelta.y) / element.clientHeight);

      rotateStart.copy(rotateEnd);

      update();
    }

    function handleMouseMoveDolly(event) {
      dollyEnd.set(event.clientX, event.clientY);

      dollyDelta.subVectors(dollyEnd, dollyStart);

      if (dollyDelta.y > 0) {
        dollyIn(getZoomScale());
      } else if (dollyDelta.y < 0) {
        dollyOut(getZoomScale());
      }

      dollyStart.copy(dollyEnd);

      update();
    }

    function handleMouseMovePan(event) {
      panEnd.set(event.clientX, event.clientY);

      panDelta.subVectors(panEnd, panStart).multiplyScalar(panSpeed);

      pan(panDelta.x, panDelta.y);

      panStart.copy(panEnd);

      update();
    }

    function handleMouseUp(/*event*/) {
      // no-op
    }

    function handleMouseWheel(event) {
      if (event.deltaY < 0) {
        dollyOut(getZoomScale());
      } else if (event.deltaY > 0) {
        dollyIn(getZoomScale());
      }

      update();
    }

    function handleKeyDown(event) {
      var needsUpdate = false;

      switch (event.keyCode) {
        case keys.UP:
          pan(0, keyPanSpeed);
          needsUpdate = true;
          break;

        case keys.BOTTOM:
          pan(0, -keyPanSpeed);
          needsUpdate = true;
          break;

        case keys.LEFT:
          pan(keyPanSpeed, 0);
          needsUpdate = true;
          break;

        case keys.RIGHT:
          pan(-keyPanSpeed, 0);
          needsUpdate = true;
          break;
      }

      if (needsUpdate) {
        // prevent the browser from scrolling on cursor keys
        event.preventDefault();

        update();
      }
    }

    function handleTouchStartRotate(event) {
      if (event.touches.length == 1) {
        rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
      } else {
        var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
        var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

        rotateStart.set(x, y);
      }
    }

    function handleTouchStartPan(event) {
      if (event.touches.length == 1) {
        panStart.set(event.touches[0].pageX, event.touches[0].pageY);
      } else {
        var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
        var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

        panStart.set(x, y);
      }
    }

    function handleTouchStartDolly(event) {
      var dx = event.touches[0].pageX - event.touches[1].pageX;
      var dy = event.touches[0].pageY - event.touches[1].pageY;

      var distance = Math.sqrt(dx * dx + dy * dy);

      dollyStart.set(0, distance);
    }

    function handleTouchStartDollyPan(event) {
      if (enableZoom) handleTouchStartDolly(event);

      if (enablePan) handleTouchStartPan(event);
    }

    function handleTouchStartDollyRotate(event) {
      if (enableZoom) handleTouchStartDolly(event);

      if (enableRotate) handleTouchStartRotate(event);
    }

    function handleTouchMoveRotate(event) {
      if (event.touches.length == 1) {
        rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
      } else {
        var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
        var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

        rotateEnd.set(x, y);
      }

      rotateDelta
        .subVectors(rotateEnd, rotateStart)
        .multiplyScalar(rotateSpeed);

      var element = domElement;

      rotateLeft((2 * Math.PI * rotateDelta.x) / element.clientHeight); // yes, height

      rotateUp((2 * Math.PI * rotateDelta.y) / element.clientHeight);

      rotateStart.copy(rotateEnd);
    }

    function handleTouchMovePan(event) {
      if (event.touches.length == 1) {
        panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
      } else {
        var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
        var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

        panEnd.set(x, y);
      }

      panDelta.subVectors(panEnd, panStart).multiplyScalar(panSpeed);

      pan(panDelta.x, panDelta.y);

      panStart.copy(panEnd);
    }

    function handleTouchMoveDolly(event) {
      var dx = event.touches[0].pageX - event.touches[1].pageX;
      var dy = event.touches[0].pageY - event.touches[1].pageY;

      var distance = Math.sqrt(dx * dx + dy * dy);

      dollyEnd.set(0, distance);

      dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, zoomSpeed));

      dollyIn(dollyDelta.y);

      dollyStart.copy(dollyEnd);
    }

    function handleTouchMoveDollyPan(event) {
      if (enableZoom) handleTouchMoveDolly(event);

      if (enablePan) handleTouchMovePan(event);
    }

    function handleTouchMoveDollyRotate(event) {
      if (enableZoom) handleTouchMoveDolly(event);

      if (enableRotate) handleTouchMoveRotate(event);
    }

    function handleTouchEnd(/*event*/) {
      // no-op
    }

    //
    // event handlers - FSM: listen for events and reset state
    //

    function onMouseDown(event) {
      if (enabled === false) return;

      // Prevent the browser from scrolling.

      event.preventDefault();

      // Manually set the focus since calling preventDefault above
      // prevents the browser from setting it automatically.

      domElement.focus ? domElement.focus() : window.focus();

      switch (event.button) {
        case 0:
          switch (mouseButtons.LEFT) {
            case MOUSE.ROTATE:
              if (event.ctrlKey || event.metaKey || event.shiftKey) {
                if (enablePan === false) return;

                handleMouseDownPan(event);

                state = STATE.PAN;
              } else {
                if (enableRotate === false) return;

                handleMouseDownRotate(event);

                state = STATE.ROTATE;
              }

              break;

            case MOUSE.PAN:
              if (event.ctrlKey || event.metaKey || event.shiftKey) {
                if (enableRotate === false) return;

                handleMouseDownRotate(event);

                state = STATE.ROTATE;
              } else {
                if (enablePan === false) return;

                handleMouseDownPan(event);

                state = STATE.PAN;
              }

              break;

            default:
              state = STATE.NONE;
          }

          break;

        case 1:
          switch (mouseButtons.MIDDLE) {
            case MOUSE.DOLLY:
              if (enableZoom === false) return;

              handleMouseDownDolly(event);

              state = STATE.DOLLY;

              break;

            default:
              state = STATE.NONE;
          }

          break;

        case 2:
          switch (mouseButtons.RIGHT) {
            case MOUSE.ROTATE:
              if (enableRotate === false) return;

              handleMouseDownRotate(event);

              state = STATE.ROTATE;

              break;

            case MOUSE.PAN:
              if (enablePan === false) return;

              handleMouseDownPan(event);

              state = STATE.PAN;

              break;

            default:
              state = STATE.NONE;
          }

          break;
      }

      if (state !== STATE.NONE) {
        document.addEventListener("mousemove", onMouseMove, false);
        document.addEventListener("mouseup", onMouseUp, false);
        //JC: I commented out all dispatchEvents; not sure if we need them ¯\_(ツ)_/¯
        //dispatchEvent(startEvent);
      }
    }

    function onMouseMove(event) {
      if (enabled === false) return;

      event.preventDefault();

      switch (state) {
        case STATE.ROTATE:
          if (enableRotate === false) return;

          handleMouseMoveRotate(event);

          break;

        case STATE.DOLLY:
          if (enableZoom === false) return;

          handleMouseMoveDolly(event);

          break;

        case STATE.PAN:
          if (enablePan === false) return;

          handleMouseMovePan(event);

          break;
      }
    }

    function onMouseUp(event) {
      if (enabled === false) return;

      handleMouseUp(event);

      document.removeEventListener("mousemove", onMouseMove, false);
      document.removeEventListener("mouseup", onMouseUp, false);

      //JC: I commented out all dispatchEvents; not sure if we need them ¯\_(ツ)_/¯
      //dispatchEvent(endEvent);

      state = STATE.NONE;
    }

    function onMouseWheel(event) {
      if (
        enabled === false ||
        enableZoom === false ||
        (state !== STATE.NONE && state !== STATE.ROTATE)
      )
        return;

      event.preventDefault();
      event.stopPropagation();

      //JC: I commented out all dispatchEvents; not sure if we need them ¯\_(ツ)_/¯
      //dispatchEvent(startEvent);

      handleMouseWheel(event);
      //JC: I commented out all dispatchEvents; not sure if we need them ¯\_(ツ)_/¯
      //dispatchEvent(endEvent);
    }

    function onKeyDown(event) {
      if (enabled === false || enableKeys === false || enablePan === false)
        return;

      handleKeyDown(event);
    }

    function onTouchStart(event) {
      if (enabled === false) return;

      event.preventDefault();

      switch (event.touches.length) {
        case 1:
          switch (touches.ONE) {
            case TOUCH.ROTATE:
              if (enableRotate === false) return;

              handleTouchStartRotate(event);

              state = STATE.TOUCH_ROTATE;

              break;

            case TOUCH.PAN:
              if (enablePan === false) return;

              handleTouchStartPan(event);

              state = STATE.TOUCH_PAN;

              break;

            default:
              state = STATE.NONE;
          }

          break;

        case 2:
          switch (touches.TWO) {
            case TOUCH.DOLLY_PAN:
              if (enableZoom === false && enablePan === false) return;

              handleTouchStartDollyPan(event);

              state = STATE.TOUCH_DOLLY_PAN;

              break;

            case TOUCH.DOLLY_ROTATE:
              if (enableZoom === false && enableRotate === false) return;

              handleTouchStartDollyRotate(event);

              state = STATE.TOUCH_DOLLY_ROTATE;

              break;

            default:
              state = STATE.NONE;
          }

          break;

        default:
          state = STATE.NONE;
      }

      if (state !== STATE.NONE) {
        //JC: I commented out all dispatchEvents; not sure if we need them ¯\_(ツ)_/¯
        //dispatchEvent(startEvent);
      }
    }

    function onTouchMove(event) {
      if (enabled === false) return;

      event.preventDefault();
      event.stopPropagation();

      switch (state) {
        case STATE.TOUCH_ROTATE:
          if (enableRotate === false) return;

          handleTouchMoveRotate(event);

          update();

          break;

        case STATE.TOUCH_PAN:
          if (enablePan === false) return;

          handleTouchMovePan(event);

          update();

          break;

        case STATE.TOUCH_DOLLY_PAN:
          if (enableZoom === false && enablePan === false) return;

          handleTouchMoveDollyPan(event);

          update();

          break;

        case STATE.TOUCH_DOLLY_ROTATE:
          if (enableZoom === false && enableRotate === false) return;

          handleTouchMoveDollyRotate(event);

          update();

          break;

        default:
          state = STATE.NONE;
      }
    }

    function onTouchEnd(event) {
      if (enabled === false) return;

      handleTouchEnd(event);

      //JC: I commented out all dispatchEvents; not sure if we need them ¯\_(ツ)_/¯
      //dispatchEvent(endEvent);

      state = STATE.NONE;
    }

    function onContextMenu(event) {
      if (enabled === false) return;

      event.preventDefault();
    }

    //

    domElement.addEventListener("contextmenu", onContextMenu, false);

    domElement.addEventListener("mousedown", onMouseDown, false);
    domElement.addEventListener("wheel", onMouseWheel, false);

    domElement.addEventListener("touchstart", onTouchStart, false);
    domElement.addEventListener("touchend", onTouchEnd, false);
    domElement.addEventListener("touchmove", onTouchMove, false);

    domElement.addEventListener("keydown", onKeyDown, false);

    // make sure element can receive keys.

    if (domElement.tabIndex === -1) {
      domElement.tabIndex = 0;
    }

    // force an update at start

    update();

    //END ORBITCONTROLS
  };

  return <Subject camera={camera} position={[0, 0, 1]} />;
}

// ReactOrbitControls.propTypes = {

// }

export default ReactOrbitControls;
