import { useState, useEffect, useContext } from "react";
import { NerdGraphQuery, PlatformStateContext } from "nr1";

import { nerdGraphQuery, nerdGraphQueryBatched } from "./utils/queries";

const FETCH_INTERVAL_DEFAULT = 300; // fetch interval in s - 5 minutes

export const useNerdGraphQuery = ( accountId: string, candidateQuery, queries, ignorePicker : boolean = false , fetchInterval: number = FETCH_INTERVAL_DEFAULT, defaultSince: string = "") => {
  const { timeRange } = useContext(PlatformStateContext);
  const [data, setData] = useState([]);
  const [guids, setGuids] = useState([]);
  const [error, setError] = useState(null);
  const [lastUpdateStamp, setLastUpdateStamp] = useState(0);

  useEffect(() => {
    if (!queries || queries.length === 0) {
      console.log("Query is required to fetch data.");
      setData([]);
      return;
    }

    const fetchData = async () => {

      const variables = { id: parseInt(accountId, 10) };

      //get Guids first
      let guidQuery = nerdGraphQuery(candidateQuery,timeRange, defaultSince, ignorePicker)
      // const response = await NerdGraphQuery.query({ query: guidQuery, variables });
      // console.log("Response:", response?.data?.actor?.account?.result.results);

      setData(Date.now());
      setLastUpdateStamp(Date.now());
      // const batchSize = 2;
      // const batches = Math.ceil(queries.length / batchSize);
      // // Split queries into batches
      // const queryBatches = Array.from({ length: batches }, (_, i) =>
      //   queries.slice(i * batchSize, i * batchSize + batchSize)
      // );

      // console.log("Query Batches:", queryBatches);

    

      const aggregateData=[]; //all the data from all the queries will end up here
      for (const queryBatch of []) {
        const nrqlQueriesGQL = nerdGraphQueryBatched(queryBatch, timeRange, defaultSince, ignorePicker);  
        try {
          console.log("Executing NRQL Queries");
          const response = await NerdGraphQuery.query({ query: nrqlQueriesGQL, variables });
          queryBatch.forEach((query, idx) => {
            const resultKey = `result_${idx}`;
            if (response?.data?.actor?.account?.[resultKey]?.results) {
              const results = response.data.actor.account[resultKey].results;
              if (Array.isArray(results)) {
                aggregateData.push(...results);
                console.log("Added data",aggregateData.length)
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
      console.log("Aggregate Data:", aggregateData);

      setData(aggregateData);
      setLastUpdateStamp(Date.now());
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
  }, [queries[0], accountId, timeRange, fetchInterval, ignorePicker, defaultSince]);

  return { data, error, lastUpdateStamp };
};