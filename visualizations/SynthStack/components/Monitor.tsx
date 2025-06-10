
import { useProps } from "../context/VizPropsProvider";
import { useMonitorContext } from "../context/MonitorContextProvider";
import { AutoSizer, HeadingText, Icon } from "nr1";
import Stripe from "./Stripe";
import moment from 'moment';


type AttributesListProps = {
  name: string,
  data: any
};

const Monitor = ({ data, name }: AttributesListProps) => {

  const monitorContext = useMonitorContext();
  const { bucketSize, beginMoment, endMoment, numberOfBuckets } = monitorContext;

  // console.log("bucketSize:", bucketSize);
  // console.log("beginMoment:", beginMoment);
  // console.log("endMoment:", endMoment);
  // console.log("numberOfBuckets:", numberOfBuckets);

  let checks = new Array(numberOfBuckets); // Initialize an array with the number of buckets
  for (let index = 0; index < numberOfBuckets; index++) {
    let bucketBeginMoment = beginMoment.clone().add(index * bucketSize, 'minutes');
    let bucketEndMoment = bucketBeginMoment.clone().add(bucketSize, 'minutes');
    checks[index] = { beginMoment : bucketBeginMoment, endMoment: bucketEndMoment};

    data.find((item) => {
        const itemMoment = moment(item.beginTimeSeconds * 1000 );
        if (itemMoment.isSame(bucketBeginMoment)) { 
          checks[index].data=item;
          return true; // Stop searching once we find a match
        }
      return false; // Continue searching
    });

  }

 
  //console.log("Checks:", checks);
    

  return (
   <div>
    <HeadingText className="monitorHeader" type={HeadingText.TYPE.HEADING_5}>
      <Icon type={Icon.TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__SYNTHETICS_MONITOR} /> {name}
    </HeadingText>
    <div>
        <AutoSizer>
      {({ width, height }) => {
        return (
          <Stripe data={checks} width={width} />
        );
      }}
    </AutoSizer>
    </div>
   </div>
  );

};

export default Monitor;