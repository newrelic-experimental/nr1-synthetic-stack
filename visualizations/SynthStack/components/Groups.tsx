import {useState} from "react";
import Group from "./Group";
import { useMonitorContext } from "../context/MonitorContextProvider";
import { useProps } from "../context/VizPropsProvider";

type AttributesListProps = {
  data: any
};

const Groups = ({ data }: AttributesListProps) => {

  const monitorContext = useMonitorContext();
  const { setShowAllDetails, setToggleAllDetails, statusFilterList, setStatusFilterList } = monitorContext;
  const { statuses } = useProps();
 
  const addToFilterList = (status) => {
    if (!statusFilterList.includes(status)) {
      setStatusFilterList([...statusFilterList, status]);
    }
  };

  const removeFromFilterList = (status) => {
    console.log("removing from filter list", status);
    setStatusFilterList(statusFilterList.filter((item) => item !== status));
  };

  //Sort the data alphabetically by item.groupName
const sortedData = data.sort((a, b) => {
  const groupA = a.groupName || "Default Group";
  const groupB = b.groupName || "Default Group";
  return groupA.localeCompare(groupB);
});

  const groups = {};
  sortedData.forEach(item => {
    if(item && item.result!=null ) { //remove null values
    const groupName = item.groupName || "Default Group";
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(item);
  }
});

  const statusLinks = statuses.map((status) => {
    const isActive = !statusFilterList.includes(status.statusField);
    return (
    <div key={status} className="topkeyBlock" onClick={() => {
      console.log("statusFilterList at button click", statusFilterList);
      if (statusFilterList.includes(status.statusField)) {
        removeFromFilterList(status.statusField);
      } else {
        addToFilterList(status.statusField);
      }
     }} >
      <div className="topkeyStatusKey" style={{backgroundColor:  status.statusColor || 'grey', opacity: isActive ? "1" : "0.4"}}></div> 
      <div className="topkeyStatusText">
         <span  style={{textDecoration: isActive ? '': 'line-through'  }} className="topkeyStatus">{status.statusLabel}</span>
         <br />
         <span className="topkeyStatusLine2">{status.statusProblem===true ? "PROBLEM" : "NOMINAL"}</span>
      </div>
    </div>
    );
  }); 


  

  return (
    <div>
      <div className="topLinksContainer">
        <span className="hyperlink toggleLink" onClick={() => { setShowAllDetails(true); setToggleAllDetails((prev) => !prev); }} >Show all monitors</span>
        <span className="hyperlink toggleLink" onClick={() => { setShowAllDetails(false); setToggleAllDetails((prev) => !prev); }} >Hide all monitors</span>
      </div>
      <div>
        {statusLinks}
      </div>
      {Object.keys(groups).map((groupName, index) => (
        <Group key={index} groupName={groupName} data={groups[groupName]}/>
      ))}
    </div>
  );

};

export default Groups;