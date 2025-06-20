import React from "react";
import { useMonitorContext } from "../context/MonitorContextProvider";

const LoadingState = () => {  

 const { loadedPercent, monitorsToLoad } =  useMonitorContext();
 return <div>
        Loading {monitorsToLoad} monitors... {loadedPercent}% complete
  </div>
};

export default LoadingState;