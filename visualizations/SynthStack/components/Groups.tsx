import React from "react";
import Group from "./Group";
import { useMonitorContext } from "../context/MonitorContextProvider";

type AttributesListProps = {
  data: any
};

const Groups = ({ data }: AttributesListProps) => {

  const monitorContext = useMonitorContext();
  const { setShowAllDetails, setToggleAllDetails } = monitorContext;

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

  

  return (
    <div>
      <div className="topLinksContainer">
        <span className="hyperlink toggleLink" onClick={() => { setShowAllDetails(true); setToggleAllDetails((prev) => !prev); }} >Show all monitors</span>
        <span className="hyperlink toggleLink" onClick={() => { setShowAllDetails(false); setToggleAllDetails((prev) => !prev); }} >Hide all monitors</span>
      </div>
      {Object.keys(groups).map((groupName, index) => (
        <Group key={index} groupName={groupName} data={groups[groupName]}/>
      ))}
    </div>
  );

};

export default Groups;