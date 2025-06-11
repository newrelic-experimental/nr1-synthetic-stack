
import { useProps } from "../context/VizPropsProvider";
import { useMonitorContext } from "../context/MonitorContextProvider";
import Monitor from "./Monitor";
type AttributesListProps = {
  data: any
};

const Monitors = ({ data }: AttributesListProps) => {

    const monitorContext = useMonitorContext();
    const { bucketSize, beginMoment, endMoment } = monitorContext;
  
    const vizProps = useProps();
    const { statuses, accountId } = vizProps;
  
  let combinedMonitorData=[];
    const monitors = []; // Initialize with a combined monitor
    data.forEach(item => {
      if(item && item.result!=null ) {
        combinedMonitorData.push({...item}); // Add to combined monitor
        const monitorName = item.monitorName || "Monitor not named";
        const monitorGuid = item.entityGuid || null;
        let monitor = monitors.find(m => m.monitorName === monitorName); 
        if (!monitor) {
          monitors.push({ monitorName, monitorGuid:item.entityGuid,  data: [item] });
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
    const allMonitors=[{monitorName: "Combined", combined:true, monitorIds: combinedMonitorIds, data: combinedMonitor}, ...monitors]; // Combine the monitors with the combined monitor

  const monitorRows = allMonitors.map((monitor, index) => (  
    <Monitor key={index} name={monitor.monitorName} combined={monitor.combined} monitorGuid={monitor.monitorGuid} monitorIds={monitor.monitorIds} data={monitor.data}/>
  ));

  return (
   <>
   {monitorRows}
   </>
  );

};

export default Monitors;