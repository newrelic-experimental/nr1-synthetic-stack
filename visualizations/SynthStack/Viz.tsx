import React from "react";
import { AutoSizer } from "nr1";

import EmptyState from "./components/EmptyState";
import SynthStack from "./components/SynthStack";

const Viz = ({ query }) => {
  // return empty state if no config  
  if (!query) {
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