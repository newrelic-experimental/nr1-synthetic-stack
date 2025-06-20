import React from "react";
import {
  Card,
  CardBody,
  HeadingText
} from "nr1";

const EmptyState: React.FC = () => (
  <Card className="EmptyState">
    <CardBody className="EmptyState-cardBody">
      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.LARGE]}
        type={HeadingText.TYPE.HEADING_3}
      >
        Please provide a valid configuration!
      </HeadingText>
      <div>
                  <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.LARGE]}
        type={HeadingText.TYPE.HEADING_4}
      >
        For <em>Candidate Monitor Query</em> you need to return list of monitor entityGuids to display. e.g:
      </HeadingText>
        
        <pre>SELECT uniques(entityGuid,500) as entityGuids FROM SyntheticCheck WHERE  monitorName like '%production%'</pre>
      </div>
        <div>
          <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.LARGE]}
        type={HeadingText.TYPE.HEADING_4}
      >
            For <em>Monitor Query</em> you need to return the required fields. e.g:
      </HeadingText>

        <pre>{`WITH 
 if(typeLabel like '%Browser',10000,3000) as consideredSlow, 
 if(result='SUCCESS' and executionDuration < consideredSlow,'success',if(result='SUCCESS' and executionDuration >= consideredSlow,'slow','failed')) as monitorStatus 
FROM SyntheticCheck SELECT  
 latest(entityGuid) as entityGuid, 
 latest(monitorName) as monitorName, 
 latest(monitorName) as sortField, 
 latest(typeLabel) as groupName,
 latest(executionDuration) as latestDuration, 
 latest(monitorStatus) as latestStatus, 
 filter(count(*), where monitorStatus='success') as success, 
 filter(count(*), where monitorStatus='slow') as slow, 
 filter(count(*), where monitorStatus='failed') as failed,
 filter(average(executionDuration),where monitorStatus='success') as successDuration, 
 filter(average(executionDuration),where monitorStatus='slow') as slowDuration, 
 filter(average(executionDuration),where result='SUCCESS') as totalAvgDuration 
FACET entityGuid `}</pre>
      </div>
    </CardBody>
  </Card>
);

export default EmptyState;