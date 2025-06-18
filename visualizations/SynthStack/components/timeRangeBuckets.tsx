const MINUTE = 60000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const timeRangeBuckets = function (timeRange) {
  // Check if timeRange is undefined or null
  if (typeof timeRange === "undefined" || timeRange === null) {
    return "auto"; // "SINCE 30 minutes ago"; could also be returned here
  }

  // Handle scenarios where both begin and end times are available
  let windowSize=0;
  if (timeRange.beginTime && timeRange.endTime) {
    windowSize = timeRange.endTime - timeRange.beginTime
  } else if (timeRange.begin_time && timeRange.end_time) {
    windowSize = timeRange.end_time - timeRange.begin_time;
  }

  if (timeRange.duration) {
    windowSize = timeRange.duration;
  }

  // Handle duration based scenarios
  if (windowSize) {
    if (windowSize <= HOUR) {
      return `1 minutes`;
    } else if (windowSize <= HOUR * 3) { // 3 hours, 2 minutes
      return `2 minutes`;
    } else if (windowSize <= HOUR * 6) { // 6 hours, 5 minutes
      return `5 minutes`;
    } else if (windowSize <= HOUR * 12) { // 12 hours, 5 minutes
      return `5 minutes`;
    } else if (windowSize <= DAY) { //24 hours 10 minutes
      return `10 minutes`;
    } else if (windowSize <= DAY*3) { // 3 days hours 30 minutes
      return `30 minutes`;
    } else if (windowSize <= DAY*7) { // 1 week hours 30 minutes
      return `60 minutes`;
    } else if (windowSize <= DAY*14) { // 2 week hours 1 hour
      return `1 hour`; 
    }  else if (windowSize <= DAY*31) { // 1 month  hours 4hour
      return `4 hour`; 
    } else {
      return `auto`;
    }
  }

  // Default case if none of the above conditions are met
  return "auto"; 
};