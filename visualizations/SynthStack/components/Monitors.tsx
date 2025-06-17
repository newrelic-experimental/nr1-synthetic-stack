
import { useProps } from "../context/VizPropsProvider";
import { useMonitorContext } from "../context/MonitorContextProvider";
import { useState,useEffect } from "react";
import Monitor from "./Monitor";
type AttributesListProps = {
  data: any,
  groupName?: string
};

const Monitors = ({ data, groupName }: AttributesListProps) => {

  const vizProps = useProps();
  const { statuses } = vizProps;
  const monitorContext = useMonitorContext();
  const {  showAllDetails, toggleAllDetails } = monitorContext;

  const [showDetails, setShowDetails] = useState(showAllDetails === true ? true : false);

  useEffect(() => {
    setShowDetails(showAllDetails);
  }, [showAllDetails, toggleAllDetails]);


  let combinedMonitorData=[];
    const monitors = []; // Initialize with a combined monitor
    data.forEach(item => {
      if(item && item.result!=null ) {
        combinedMonitorData.push({...item}); // Add to combined monitor
        const monitorName = item.monitorName || "Monitor not named";
        const monitorGuid = item.entityGuid || null;
        const sortField = item.sortField || item.monitorName || ""; // Use sortField if available, otherwise monitorName
        let monitor = monitors.find(m => m.monitorName === monitorName); 
        if (!monitor) {
          monitors.push({ monitorName, sortField: sortField, monitorGuid:monitorGuid,  data: [item] });
        } else {
          monitor.data.push(item);
        }
      }
    });


    //squash the data for the combined monitor together as each bucket can only have one data point.
    type CombinedMonitorItem = {
      beginTimeSeconds: number;
      endTimeSeconds: number;
      totalAvgDuration: number;
      [key: string]: number; // allow dynamic status fields
    };
    const combinedMonitor: CombinedMonitorItem[] = []
    const combinedMonitorIds = [];
    combinedMonitorData.forEach(item => {

      if(!combinedMonitorIds.includes(item?.entityGuid)) {
        combinedMonitorIds.push(item?.entityGuid);
      }

      const combinedMonitorItem = combinedMonitor.find((combinedItem) => {
          if (combinedItem.beginTimeSeconds === item.beginTimeSeconds) { 
            return true;
          }
        return false; 
      });

      if(combinedMonitorItem) {
        statuses.forEach((status) => {
          combinedMonitorItem[status.statusField] += item[status.statusField] || 0;
        });
        combinedMonitorItem.totalAvgDuration += item.totalAvgDuration || 0;  

      } else {
        let newRecord={
          beginTimeSeconds: item.beginTimeSeconds,
          endTimeSeconds: item.endTimeSeconds,
          totalAvgDuration: item.totalAvgDuration || 0
        }
        statuses.forEach((status) => {
          newRecord[status.statusField] = item[status.statusField] || 0;
        });
        combinedMonitor.push(newRecord);
      }
    })

    //sort monitor by monitor name
    monitors.sort((a, b) => { 
      if (typeof a.sortField === "number" && typeof b.sortField === "number") {
        return a.sortField - b.sortField;
      }
    // If one is number and one is string, convert both to string for comparison
    return String(a.sortField).localeCompare(String(b.sortField));
});
    const allMonitors=[{monitorName: groupName, combined:true, monitorIds: combinedMonitorIds, data: combinedMonitor}, ...monitors]; // Combine the monitors with the combined monitor


  const monitorRows = allMonitors.map((monitor, index) => (  
    <Monitor key={index} name={monitor.monitorName} combined={monitor.combined} monitorGuid={monitor.monitorGuid} monitorIds={monitor.monitorIds} data={monitor.data}/>
  ));

  return (
   <>
  <div className="combinedMonitorGroup">
    {monitorRows[0]}
    <div
      className="hyperlink groupToggleLink"
      onClick={() => { setShowDetails((prev) => !prev);}
    }
    >
      {showDetails ? <span>Hide {monitorRows.length-1} monitors</span> : <span>Show {monitorRows.length-1} monitors</span>}
    </div>
   </div>
   {showDetails && ( <div className="combinedMonitorSubGroup">
      {monitorRows.slice(1)}
    </div>
   )}
   </>
  );

};

export default Monitors;