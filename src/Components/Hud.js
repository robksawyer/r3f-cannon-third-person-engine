import React from "react";
import PropTypes from "prop-types";
import useStore from "./store";

//Reminder: even Zustand state changes rerender whole component; hence the discrete HUD component

function Hud(props) {
  const count = useStore(state => state.nested.stuff.is.here);
  const up = useStore(state => state.up);
  const upBy = useStore(state => state.upBy);
  return (
    <div className="hud">
      <h1>Zustand test</h1>
      <span>click the gold cube</span>
      <h2>{count}</h2>
      <button onClick={up}>+1</button>
      <button onClick={() => upBy(5)}>+5</button>
      <button onClick={() => upBy(10)}>+10</button>
    </div>
  );
}

Hud.propTypes = {};

export default Hud;
