import { timeRangeToNrql } from "./timeRangeToNrql";

const nrqlQuery = (query, timeRange, defaultSince, ignorePicker,endMoment) => {
  if (ignorePicker === true) {
    return (
      query.replace(/(\r\n|\n|\r)/gm, " ").replace(/\\/g, "\\\\") + defaultSince
    );
  } else {
    // Generate the time range part of the NRQL query
    const timeRangePart = timeRangeToNrql(timeRange,endMoment);

    // Construct the full NRQL query, remove line breaks
    let q = `${query
      .replace(/(\r\n|\n|\r)/gm, " ")
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')} ${
      timeRangePart === "" ? defaultSince || "" : timeRangePart
    }`;
    return q;
  }
};

const gqlQuery = (query, timeRange, defaultSince, ignorePicker,endMoment) => {
  return `nrql( query: "${nrqlQuery(
    query,
    timeRange,
    defaultSince,
    ignorePicker,
    endMoment
  )}" ) { results }`;
};

export const nerdGraphQuery = (
  query,
  timeRange,
  defaultSince,
  ignorePicker,
  endMoment
) => {
  return `
  query($id: Int!) {
    actor {
      account(id: $id) {
        result: ${gqlQuery(query, timeRange, defaultSince, ignorePicker,endMoment)}
      }
    }
  }
`;
};


export const nerdGraphQueryBatched = (
  queries,
  timeRange,
  defaultSince,
  ignorePicker,
  endMoment
) => {
  const queryRows = queries.map((query,idx) => {
    return `result_${idx}: ${gqlQuery(query, timeRange, defaultSince, ignorePicker,endMoment)}
    `
  });

  return `
  query($id: Int!) {
    actor {
      account(id: $id) {
        ${queryRows.join("\n")}
      }
    }
  }
`;
};