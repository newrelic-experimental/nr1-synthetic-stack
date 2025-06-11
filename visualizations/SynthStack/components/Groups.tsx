import React from "react";
import Group from "./Group";

type AttributesListProps = {
  data: any
};

const Groups = ({ data }: AttributesListProps) => {
  const groups = {};
  data.forEach(item => {
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
      {Object.keys(groups).map((groupName, index) => (
        <Group key={index} groupName={groupName} data={groups[groupName]}/>
      ))}
    </div>
  );

};

export default Groups;