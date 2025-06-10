import React from "react";
import { useProps } from "../context/VizPropsProvider";
import { useNerdGraphQuery } from "../hooks/useNerdGraphQuery";
import Groups from "./Groups";
import moment from 'moment';
import { MonitorContextProvider } from "../context/MonitorContextProvider";

const SynthStack = () => {
  const vizProps = useProps();
  const { greeting, accountId, query, bucketSize } = vizProps;
  
  let bucketSizeSelected = parseInt(bucketSize) || 5; // Default to 15 minutes if not specified
  let endMoment = moment().startOf('minute').subtract(moment().minute() % bucketSizeSelected, 'minutes');
  let beginMoment = moment(endMoment).subtract(1, 'day');

  let numberOfBuckets = endMoment.diff(beginMoment, 'minutes') / bucketSizeSelected;

  console.log("Start: ",beginMoment);
  console.log("End: ",endMoment);
  
  let data;
  if(query && query!="" && accountId && accountId!=""){ 
    let queryWithTimeWindow =  query + ` since ${beginMoment.valueOf()} until ${endMoment.valueOf()} timeseries ${bucketSizeSelected} minutes`;
    console.log("Query with time window: ", queryWithTimeWindow);
    ({ data } = useNerdGraphQuery(accountId, queryWithTimeWindow, true));
    console.log("Query data:", data);
  }

  return (
        <>
        <div className="vizContainer">
          <MonitorContextProvider bucketSize={bucketSize}  beginMoment={beginMoment} endMoment={endMoment} numberOfBuckets={numberOfBuckets}>
              {data ? <Groups data={data} /> : <div>Loading...</div>}
          </MonitorContextProvider>
        </div>
        </>
  );
};

export default SynthStack;