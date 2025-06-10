
import { useProps } from "../context/VizPropsProvider";
import { useMonitorContext } from "../context/MonitorContextProvider";
import Monitor from "./Monitor";
type AttributesListProps = {
  data: any
};

const Monitors = ({ data }: AttributesListProps) => {

    const monitorContext = useMonitorContext();
    const { bucketSize, beginMoment, endMoment } = monitorContext;

    console.log("bucketSize:", bucketSize);
    console.log("beginMoment:", beginMoment);
    console.log("endMoment:", endMoment);

    const monitors = [];
    data.forEach(item => {
      if(item && item.result!=null ) {
        const monitorName = item.monitorName || "Monitor not named";
        let monitor = monitors.find(m => m.monitorName === monitorName); 
        if (!monitor) {
          monitors.push({ monitorName, data: [item] });
        } else {
          monitor.data.push(item);
        }
      }
    });

  const monitorRows = monitors.map((monitor, index) => (  
    <Monitor key={index} name={monitor.monitorName} data={monitor.data}/>
  ));

  return (
   <>
   {monitorRows}
   </>
  );

};

export default Monitors;