/* 
This context provided makes the visualiazation props provided by the user available to all components in the visualization easily.
*/

import React, { createContext, use, useContext, useEffect, useState } from "react";
import { useProps } from "../context/VizPropsProvider";
// Create the context for the props with a default value of null
const MonitorContext = createContext(null);



// Create a provider component that accepts props and children
export const MonitorContextProvider = ({ children, ...props }) => {
  const vizProps = useProps();
  const {  collapseByDefault } = vizProps;

  // Initialize state for showAllDetails and toggleAllDetails
  const [showAllDetails, setShowAllDetails] = useState(collapseByDefault === true ? false : true);
  const [toggleAllDetails, setToggleAllDetails] = useState(true);
  const [statusFilterList, setStatusFilterList] = useState([]); // Initialize with initialFilters from props or an empty array

  useEffect(() => {  
      setStatusFilterList(props.initialFilters);
  },[props.initialFilters]);

  const value = {
    ...props,
    showAllDetails,
    setShowAllDetails,
    toggleAllDetails,
    setToggleAllDetails,
    statusFilterList,
    setStatusFilterList
  };
  return (
    
<MonitorContext.Provider value={value}>
      {children}
    </MonitorContext.Provider>
  );
};

// Create a custom hook to use the context
export const useMonitorContext = () => {
  const context = useContext(MonitorContext);
  if (context === undefined) {
    throw new Error("useProps must be used within a PropsProvider");
  }
  return context;
};

// You can also export the PropsContext if you need direct access to the context itself
export default MonitorContext;