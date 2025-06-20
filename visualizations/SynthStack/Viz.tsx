import EmptyState from "./components/EmptyState";
import SynthStack from "./components/SynthStack";

const Viz = ({ query }) => {
  // return empty state if no config  
  if (!query) {
    return <EmptyState />;
  }

  return (
   <SynthStack/>
  );
};

export default Viz;