
import {useContext } from "react";
import { useProps } from "../context/VizPropsProvider";
import { useNerdGraphQuery } from "../hooks/useNerdGraphQuery";
import Groups from "./Groups";
import moment from 'moment';
import { MonitorContextProvider } from "../context/MonitorContextProvider";
import {  PlatformStateContext } from "nr1";
import { timeRangeBuckets } from "./utils/timeRangeBuckets";

const SynthStack = () => {
  const vizProps = useProps();
  const { accountId, query, bucketSize, fetchInterval, ignoreTimePicker, candidateQuery } = vizProps;
  const { timeRange } = useContext(PlatformStateContext);

  let bucketSizeSelected, endMoment, beginMoment, numberOfBuckets;
  const fetchIntervalSec = (parseInt(fetchInterval) || 5) * 60;

  
  let data;
  let monitorGuidData;
  let monitorGuids = [];
  if(query && query!="" && accountId && accountId!=""){ 

  
    if(timeRange === undefined || ignoreTimePicker === true) {


      //default time range, uses settings in config and anchors to beginning of block
      bucketSizeSelected = parseInt(bucketSize) || 5; // Default to 15 minutes if not specified
      endMoment = moment().startOf('minute').subtract(moment().minute() % bucketSizeSelected, 'minutes');
      endMoment.add(bucketSizeSelected, 'minute'); // Ensure we include the latest (incomplete) data
      beginMoment = moment(endMoment).subtract(1, 'day');
      numberOfBuckets = endMoment.diff(beginMoment, 'minutes') / bucketSizeSelected;
      
      
      //gather monitor guids
      let queryGuidsWithTimeWindow =  candidateQuery + ` since ${beginMoment.valueOf()} until ${endMoment.valueOf()}`;
      ({ data: monitorGuidData  } = useNerdGraphQuery(accountId, [queryGuidsWithTimeWindow], true, fetchIntervalSec));
      monitorGuids=monitorGuidData[0]?.entityGuids || []; //get the guids from the first item in the array


      console.log("Monitor Guids:", monitorGuids);
      //gather data for monitors
      let queries = monitorGuids.map((monitorGuid) => {
        return query.replace(/ENTITY-GUID/g, monitorGuid) + ` since ${beginMoment.valueOf()} until ${endMoment.valueOf()} timeseries ${bucketSizeSelected} minutes WHERE entityGuid='${monitorGuid}'`;
      });
      ({ data } = useNerdGraphQuery(accountId, queries, true, fetchIntervalSec));
      
    } else {
      //gather data for monitors
      
      let queryGuidsWithTimeWindow =  candidateQuery;
      ({ data: monitorGuidData  } = useNerdGraphQuery(accountId, [queryGuidsWithTimeWindow], false, fetchIntervalSec));
      monitorGuids=monitorGuidData[0]?.entityGuids || []; //get the guids from the first item in the array
 
      const timeseriesBuckets = timeRangeBuckets(timeRange); //get best sized buckets for chosen duration
      //gather data
      let queries = monitorGuids.map((monitorGuid) => {
        return query.replace(/ENTITY-GUID/g, monitorGuid)+` timeseries ${timeseriesBuckets} WHERE entityGuid='${monitorGuid}'`;
      });

       ({ data } =  useNerdGraphQuery(accountId, queries, false, fetchIntervalSec));
       
       //find start and end buckets and number of buckets and their duration
       let earliest=0;
       let latest=0;
       let bucketCounter = 0;
       let entityGuid = null;
       let bucketSizeDetected=0;
       data.forEach((item) => {
        if (item.entityGuid && entityGuid === null) {
          entityGuid = item.entityGuid; // Store the first entityGuid found
          bucketSizeDetected = (item.endTimeSeconds - item.beginTimeSeconds) / 60; // Calculate bucket size from the first item
        }
        if (item.entityGuid && entityGuid !== item.entityGuid) {
         return false; //go no further if we have more than one entityGuid
        }
        if(item.beginTimeSeconds < earliest || earliest === 0) {
          earliest = item.beginTimeSeconds;
        }
        if(item.endTimeSeconds > latest || latest === 0) {
          latest = item.endTimeSeconds;
        }
        bucketCounter++;
       })
       beginMoment=moment(earliest*1000);
       endMoment=moment(latest*1000);
       numberOfBuckets=bucketCounter;
       bucketSizeSelected= bucketSizeDetected;
    }

    return (
        <>
        <div className="vizContainer">
          <MonitorContextProvider bucketSize={bucketSizeSelected}  beginMoment={beginMoment} endMoment={endMoment} numberOfBuckets={numberOfBuckets}>
              {data ? <Groups data={data} /> : <div>Loading...</div>}
          </MonitorContextProvider>
        </div>
        </>
  );

  } else {
    return <div>Loading...</div>
  }

  
};

export default SynthStack;