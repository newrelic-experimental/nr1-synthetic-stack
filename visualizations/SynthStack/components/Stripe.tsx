
import { useProps } from "../context/VizPropsProvider";
import { useMonitorContext } from "../context/MonitorContextProvider";
import { Tooltip, navigation, Popover, PopoverTrigger, PopoverBody, Card, CardBody, BlockText, PopoverFooter, HeadingText, NrqlQuery, Spinner, Table, TableHeader, TableHeaderCell,TableRow,TableRowCell   } from 'nr1'
import moment from 'moment';


type AttributesListProps = {
  data: any,
  width: number
};

const Stripe = ({ data, width }: AttributesListProps) => {

  const monitorContext = useMonitorContext();
  const {  numberOfBuckets } = monitorContext;
  
  const vizProps = useProps();
  const { statuses, accountId } = vizProps;

  const bucketWidth = Math.floor((width - numberOfBuckets) / numberOfBuckets);

  let stripe = data.map((checkData, index) => {
    let blockChart = [];
    
    let blockSummary = statuses.map((status) => {
      return {statusField: status.statusField, statusLabel: status.statusLabel, statusColor: status.statusColor, count:0, percent:0 };
    });
    
    if(checkData.data) {
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
    }

    let totalChecks = 0;
    let summaryItems = blockSummary.map((item, idx) => {
      totalChecks+=item.count;
      return <div key={idx} className="keyContainer">
        <div className="keyBlock" style={{backgroundColor: item.statusColor}}></div>
        <div className="keyBlockDescription">{item.statusLabel}: {item.count} ({item.percent.toFixed(2)}%) {item.execDuration!==undefined ? `${item.execDuration.toFixed(0)}ms`: ''}</div>
      </div>;
    });


if(checkData.data) {



return <Tooltip text={`${checkData.beginMoment.format('MMMM Do YYYY, h:mm:ss')} - ${checkData.endMoment.format('h:mm:ss')} ,  ${totalChecks} checks`}>

  <Popover >
  <PopoverTrigger >
    <div style={{width: bucketWidth+'px'}} className="stripeBlock" key={index}>
        {blockChart}
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
            query={`SELECT toDateTime(timestamp,'h:m:s') as timestamp, locationLabel, result, entityGuid, executionDuration, id as checkId  from SyntheticCheck since ${checkData.beginMoment.valueOf()} until ${checkData.endMoment.valueOf()}  where entityGuid = '${checkData.data.entityGuid}' limit max`}
            pollInterval={0} 
            formatType={NrqlQuery.FORMAT_TYPE.RAW}
          >
            {({ data }) => {
              if (data) {
                console.log(  "Query data:", data);
                // return <Table spacing={Table.SPACING_TYPE.SMALL} items={data.results[0].events} className="checkTable">
                //   <TableHeader>
                //     <TableHeaderCell>Timestamp</TableHeaderCell>
                //     <TableHeaderCell>Result</TableHeaderCell>
                //     <TableHeaderCell>Duration</TableHeaderCell>
                //     <TableHeaderCell>Location</TableHeaderCell>
                  
                //   </TableHeader>


                //   {({ item }) => (
                //     <TableRow >
                //       <TableRowCell >{item.timestamp}</TableRowCell>
                //       <TableRowCell>{item.result}</TableRowCell>
                //       <TableRowCell>{item.executionDuration}</TableRowCell>
                //       <TableRowCell>{item.locationLabel}</TableRowCell>
                //     </TableRow>
                //   )}
                // </Table>;

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
                      }}>More Info</div></td>
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
  return <div style={{width: bucketWidth+'px'}} className="stripeBlock" key={index}></div>
}
  });

  console.log("statuses:", statuses);

  //console.log("stripe",stripe);


  return (
   <div className="stripeRow">
   {stripe}
   </div>
  );

};

export default Stripe;