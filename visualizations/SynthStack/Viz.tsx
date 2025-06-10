import React from "react";
import { AutoSizer } from "nr1";

import EmptyState from "./components/EmptyState";
import SynthStack from "./components/SynthStack";

const Viz = ({ greeting }) => {
  // return empty state if no config  
  if (!greeting) {
    return <EmptyState />;
  }

  return (
    <AutoSizer>
      {({ width, height }) => {
        return (
          <SynthStack/>
        );
      }}
    </AutoSizer>
  );
};

export default Viz;