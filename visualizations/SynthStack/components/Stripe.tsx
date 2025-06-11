
import { useProps } from "../context/VizPropsProvider";
import { useMonitorContext } from "../context/MonitorContextProvider";
import { Tooltip, navigation, Popover, PopoverTrigger, PopoverBody, Card, CardBody, BlockText, PopoverFooter, HeadingText, NrqlQuery, Spinner, Table, TableHeader, TableHeaderCell,TableRow,TableRowCell   } from 'nr1'
import moment, { min } from 'moment';


type AttributesListProps = {
  data: any,
  width: number
  combined?: boolean,
  monitorIds?: string[]
};

const Stripe = ({ data, width, combined, monitorIds }: AttributesListProps) => {

  const monitorContext = useMonitorContext();
  const {  numberOfBuckets } = monitorContext;
  
  const vizProps = useProps();
  const { statuses, accountId } = vizProps;

  const bucketWidth = Math.floor((width - numberOfBuckets) / numberOfBuckets);

  //work out the maximum duration across all the data blocks
  let maxTotalDurationAllBlocks=0;
  let minTotalDurationAllBlocks=null;
  data.forEach((checkData,index) => {
      if(checkData?.data?.totalAvgDuration) {
        if(checkData?.data?.totalAvgDuration > maxTotalDurationAllBlocks) {
          maxTotalDurationAllBlocks = checkData.data.totalAvgDuration;
        }
        if(minTotalDurationAllBlocks === null || checkData?.data?.totalAvgDuration < minTotalDurationAllBlocks) {
          minTotalDurationAllBlocks = checkData.data.totalAvgDuration;
        }
      }
  });
  if(minTotalDurationAllBlocks === null) { minTotalDurationAllBlocks = 0;}

  let stripe = data.map((checkData, index) => {

    let blockChart = [];
    let blockSummary = statuses.map((status) => {
      return {statusField: status.statusField, statusLabel: status.statusLabel, statusColor: status.statusColor, count:0, percent:0 };
    });
    
    if(checkData.data) {

      const blockDuration=checkData?.data?.totalAvgDuration || 0;
      const blockPercentDuration = ((blockDuration-minTotalDurationAllBlocks) / (maxTotalDurationAllBlocks-minTotalDurationAllBlocks)) * 100;


      let totalChecks=0;
 
      //determine how many checks there are in this block in total
      if(statuses && statuses.length > 0) {
        statuses.forEach((status) => {
          if(checkData?.data[status.statusField]) {
            totalChecks += checkData.data[status.statusField];
          }
        });
      }


    
      //render the chart accordingly
      blockChart = statuses.map((status) => {
        if(checkData?.data[status.statusField]) {
          const percentage = (checkData.data[status.statusField] / totalChecks) * 100;
          let summaryItem = blockSummary.find(item => item.statusField === status.statusField);
          if (summaryItem) {
            summaryItem.count = checkData.data[status.statusField];
            summaryItem.percent = percentage;
            summaryItem.execDuration=checkData.data[status.statusField+'Duration'];
          }
          return <div style={{width: bucketWidth+'px', height: `${percentage}%`, backgroundColor:status.statusColor}} className="stripeBlockInner"></div>;
        }
      });
    // }

   // let totalChecks = 0;
    let summaryItems = blockSummary.map((item, idx) => {
      //totalChecks+=item.count;
      return <div key={idx} className="keyContainer">
        <div className="keyBlock" style={{backgroundColor: item.statusColor}}></div>
        <div className="keyBlockDescription">{item.statusLabel}: {item.count} ({item.percent.toFixed(2)}%) {item.execDuration!==undefined ? `${item.execDuration.toFixed(0)}ms`: ''}</div>
      </div>;
    });


  const queryFilter = monitorIds && Array.isArray(monitorIds)
  ? `where entityGuid in (${monitorIds.map(id => `'${id}'`).join(', ')}) `
  : `where entityGuid = '${checkData.data.entityGuid}'`;

return <Tooltip text={`${checkData.beginMoment.format('MMMM Do YYYY, h:mm:ss')} - ${checkData.endMoment.format('h:mm:ss')} ,  ${totalChecks} checks`}>

  <Popover >
  <PopoverTrigger >
    <div className="stripeBlockContainer" style={{width: bucketWidth+'px'}} key={index}>
      <div  className="stripeDurationBlockOuter" >
        <div className="stripeDurationBlockInner" style={{ height: blockPercentDuration+'%' }}></div>
      </div>
      <div style={{width: '100%'}} className="stripeBlock" >
          {blockChart}
      </div>
    </div>
  </PopoverTrigger>
  <PopoverBody>
    <Card style={{ width: '500px' }}>
      <CardBody>
        <HeadingText>{checkData.beginMoment.format('MMMM Do YYYY, h:mm:ss')} - {checkData.endMoment.format('h:mm:ss')}</HeadingText>
        <BlockText>
          {summaryItems}
        </BlockText>
                <NrqlQuery
            accountIds={[accountId]}
            query={`SELECT toDateTime(timestamp,'h:m:s') as timestamp, locationLabel, result, entityGuid, executionDuration, id as checkId  from SyntheticCheck since ${checkData.beginMoment.valueOf()} until ${checkData.endMoment.valueOf()}  ${queryFilter} limit max`}
            pollInterval={0} 
            formatType={NrqlQuery.FORMAT_TYPE.RAW}
          >
            {({ data }) => {
              if (data) {
                const tableRows=data.results[0].events.map((item, idx) => {
                  return <tr>
                      <td>{item.timestamp}</td>
                      <td>{item.result}</td>
                      <td>{item.executionDuration}</td>
                      <td>{item.locationLabel}</td>
                      <td><div onClick={()=>{
                        navigation.openStackedNerdlet({
                            id: 'synthetics.monitor-result-details',
                            urlState: {
                              entityGuid: item.entityGuid,
                              checkId: item.checkId
                            }
                          });
                      }}><span className="hyperlink">More Info</span></div></td>
                    </tr>
                });

                return <><hr className="checkRuleDivider" />
                  <table className="checkTable">
                    <tr>
                      <th>Time</th>
                      <th>Result</th>
                      <th>Duration</th>
                      <th>Location</th>
                      <th>Detail</th>
                    </tr>
                  {tableRows}
                  
                  </table>
                </>;
                
      
              } else {
                return <div><Spinner inline /> Loading...</div>;
              }
            }}
</NrqlQuery>
      </CardBody> 
    </Card>
    <PopoverFooter style={{ textAlign: 'right' }}>{totalChecks} total checks</PopoverFooter>
  </PopoverBody>
</Popover>
  </Tooltip>

} else {
  return <div className="stripeBlockContainer" style={{width: bucketWidth+'px'}} key={index}>
       <div  className="stripeDurationBlockOuter" ></div>
      <div  className="stripeBlock" >
      </div>
    </div>
}
  });

  
  return (
   <div className="stripeRow">
   {stripe}
   </div>
  );

};

export default Stripe;