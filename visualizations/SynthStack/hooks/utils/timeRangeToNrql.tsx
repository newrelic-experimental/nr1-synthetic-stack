export const timeRangeToNrql = function (timeRange,endMoment) {
  // Check if timeRange is undefined or null
  if (typeof timeRange === "undefined" || timeRange === null) {
    return ""; // "SINCE 30 minutes ago"; could also be returned here
  }

  // Handle scenarios where both begin and end times are available
  if (timeRange.beginTime && timeRange.endTime) {
    return `SINCE ${timeRange.beginTime} UNTIL ${timeRange.endTime}`;
  } else if (timeRange.begin_time && timeRange.end_time) {
    return `SINCE ${timeRange.begin_time} UNTIL ${timeRange.end_time}`;
  }

  // Handle duration based scenarios (all queries need same time window)
  if (timeRange.duration) {
      let beginMoment = endMoment.clone().subtract(timeRange.duration, 'milliseconds');
      return `SINCE ${beginMoment.valueOf()} UNTIL ${endMoment.valueOf()}`;
  }

  return ""; // "SINCE 30 minutes ago"; could also be returned here
};

