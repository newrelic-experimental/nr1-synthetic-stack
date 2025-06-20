import { useState, useEffect, useContext, useRef, use } from "react";
import { NerdGraphQuery, PlatformStateContext } from "nr1";
import moment from 'moment';
import {  nerdGraphQueryBatched } from "./utils/queries";
import { useMonitorContext } from "../context/MonitorContextProvider";


const FETCH_INTERVAL_DEFAULT = 300; // fetch interval in s - 5 minutes

export const useNerdGraphQuery = ( accountId: string, queries: [], ignorePicker : boolean = false , fetchInterval: number = FETCH_INTERVAL_DEFAULT, defaultSince: string = "",setMonitorsToLoad, setloadedPercent) => {
  
  const { timeRange } = useContext(PlatformStateContext);
  const [data, setData] = useState([])
  const [error, setError] = useState(null);
  const [lastUpdateStamp, setLastUpdateStamp] = useState(0);


  const prevTimeRangeRef = useRef();
  useEffect(() => {
    if (prevTimeRangeRef.current && JSON.stringify(prevTimeRangeRef.current) !== JSON.stringify(timeRange)) {
      setData([]);
      if(setMonitorsToLoad) {setMonitorsToLoad(0)};
    }
    prevTimeRangeRef.current = timeRange;
  }, [JSON.stringify(timeRange)]);


  useEffect(() => {
    if (!queries || queries.length === 0) {
      if(setMonitorsToLoad) {
        setMonitorsToLoad(0);
      }
      setData([]);
      return;
    }

    const fetchData = async () => {
      if(setMonitorsToLoad) {
        setMonitorsToLoad(queries.length);
      }
      const batchSize = 20; //reduce this if you hit nrql query problems
      const batches = Math.ceil(queries.length / batchSize);
      // Split queries into batches
      const queryBatches = Array.from({ length: batches }, (_, i) =>
        queries.slice(i * batchSize, i * batchSize + batchSize)
      );

      const variables = { id: parseInt(accountId, 10) };

      const aggregateData=[]; //all the data from all the queries will end up here

      let endMoment = moment(); //ensure all queries query the same time block
      let batchIdx=0;

      for (const queryBatch of queryBatches) {
        if(setloadedPercent) {
          let queriesLoaded=((batchSize*(batchIdx++))/queries.length)* 100;
          setloadedPercent(Math.floor(queriesLoaded));
        }
        const nrqlQueriesGQL = nerdGraphQueryBatched(queryBatch, timeRange, defaultSince, ignorePicker,endMoment);  
        try {
          const response = await NerdGraphQuery.query({ query: nrqlQueriesGQL, variables });
          queryBatch.forEach((query, idx) => {
            const resultKey = `result_${idx}`;
            if (response?.data?.actor?.account?.[resultKey]?.results) {
              const results = response.data.actor.account[resultKey].results;
              if (Array.isArray(results)) {
                aggregateData.push(...results);
              } else {
                console.warn(`No results found for query ${idx}`);
              }
            } else {
              console.warn(`No data found for result key: ${resultKey}`);
            }
          });
        } catch (error) {
          console.error("Error fetching data:", error);
          setError(error);
        }
      }
      // all data loaded by this point
      setData(aggregateData);
      setLastUpdateStamp(Date.now());
      if(setMonitorsToLoad) {
        setMonitorsToLoad(0);
      }
    };

    fetchData();

    if (fetchInterval < 1) {
      console.log(
        `Fetch interval less than 1 second is not allowed. Setting to default: ${FETCH_INTERVAL_DEFAULT}s.`,
      );
      return;
    }

    const fetchIntervalms = (fetchInterval || FETCH_INTERVAL_DEFAULT) * 1000;
    const intervalId = setInterval(fetchData, fetchIntervalms);


    return () => clearInterval(intervalId);
  }, [ JSON.stringify(queries), accountId, JSON.stringify(timeRange), fetchInterval, ignorePicker, defaultSince]);

  return { data, error, lastUpdateStamp };
};