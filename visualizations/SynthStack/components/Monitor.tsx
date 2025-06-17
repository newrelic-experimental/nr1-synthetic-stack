
import { useProps } from "../context/VizPropsProvider";
import { useMonitorContext } from "../context/MonitorContextProvider";
import { AutoSizer, HeadingText, Icon, navigation, Grid, GridItem} from "nr1";
import Stripe from "./Stripe";
import moment from 'moment';


type AttributesListProps = {
  name: string,
  data: any[],
  combined?: boolean,
  monitorIds?: string[],
  monitorGuid?: string

};

const Monitor = ({ data, name, combined, monitorGuid, monitorIds }: AttributesListProps) => {

  const monitorContext = useMonitorContext();
  const { bucketSize, beginMoment, endMoment, numberOfBuckets } = monitorContext;

  let checks = new Array(numberOfBuckets); // Initialize an array with the number of buckets
  for (let index = 0; index < numberOfBuckets; index++) {
    let bucketBeginMoment = beginMoment.clone().add(index * bucketSize, 'minutes');
    let bucketEndMoment = bucketBeginMoment.clone().add(bucketSize, 'minutes');
    checks[index] = { beginMoment : bucketBeginMoment, endMoment: bucketEndMoment};

    //put the data in for each bucket.
    data.find((item) => {
        const itemMoment = moment(item.beginTimeSeconds * 1000 );
        if (itemMoment.isSame(bucketBeginMoment)) { 
          checks[index].data=item;
          return true; // Stop searching once we find a match
        }
      return false; // Continue searching
    });
  }

  return (
   <div className={combined!== true ? "monitorContainer" : "monitorContainer monitorContainerCombined"}>
    <HeadingText className="monitorHeader" type={HeadingText.TYPE.HEADING_5} >
      <Icon type={combined? Icon.TYPE.DOCUMENTS__DOCUMENTS__FOLDER : Icon.TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__SYNTHETICS_MONITOR} /> <span className={combined ? "" : "hyperlink"} onClick={()=>{
          if(monitorGuid) {
            navigation.openStackedNerdlet({
              id: 'synthetics.monitor-overview',
              urlState: {
                entityGuid: monitorGuid ,
              }
            });
          }                 
    }}>{name}</span>
      
    </HeadingText>

    <div>
      <Grid>
        <GridItem columnSpan={12}>
            <AutoSizer>
            {({ width }) => {
              return (
                <>
                <Stripe data={checks} width={width} combined={combined} monitorIds={monitorIds}/>
                </>
              );
            }}
          </AutoSizer>
        </GridItem>

      </Grid>

    </div>
   </div>
  );

};

export default Monitor;