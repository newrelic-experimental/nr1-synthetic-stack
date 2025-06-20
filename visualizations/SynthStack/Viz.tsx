import EmptyState from "./components/EmptyState";
import SynthStack from "./components/SynthStack";

const Viz = ({ candidateQuery, query }) => {
  // return empty state if no config  
  if (!query || query=="" || !candidateQuery || candidateQuery === "" || !candidateQuery.includes("entityGuids")) {
    return <EmptyState />;
  }
  return (
   <SynthStack/>
  );
};

export default Viz;