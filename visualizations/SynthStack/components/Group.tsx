import React from "react";
import {HeadingText, Icon, Grid, GridItem, AutoSizer} from "nr1";
import Monitors from "./Monitors";
import { useMonitorContext } from "../context/MonitorContextProvider";
import moment from 'moment';
type AttributesListProps = {
  groupName: string;
  data?: any[]; 
};

const Group = ({ groupName, data}: AttributesListProps) => {

    const monitorContext = useMonitorContext();
    const {  beginMoment, endMoment, numberOfBuckets } = monitorContext;

    const timeWindow = endMoment.valueOf() - beginMoment.valueOf();
    const windowBlocks= timeWindow / 4



    return <>
    
        <HeadingText className="groupHeader" type={HeadingText.TYPE.HEADING_3}>
            <Icon type={Icon.TYPE.DOCUMENTS__DOCUMENTS__FOLDER} /> {groupName}
        </HeadingText>


        <Grid>
        <GridItem columnSpan={12}>
        <AutoSizer>
            {({ width, height }) => {
                const totalWidth = (Math.floor((width - 120 -numberOfBuckets) / numberOfBuckets) * numberOfBuckets) + numberOfBuckets;
                return <div style={{ width: totalWidth + 'px' }}>
                <Grid className="groupGrid" spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]} >
                    <GridItem columnSpan={3}>
                    {beginMoment.format('DD/MM/YYYY HH:mm')}
                    </GridItem>
                    <GridItem columnSpan={3}>
                    {moment(beginMoment.valueOf()+(1*windowBlocks)).format('DD/MM/YYYY HH:mm')}
                    </GridItem>
                    <GridItem columnSpan={3}>
                    {moment(beginMoment.valueOf()+(2*windowBlocks)).format('DD/MM/YYYY HH:mm')}
                    </GridItem>
                    <GridItem columnSpan={3}>
                    <Grid>
                        <GridItem columnSpan={6}>
                            {moment(beginMoment.valueOf()+(3*windowBlocks)).format('DD/MM/YYYY HH:mm')}
                        </GridItem>
                        <GridItem columnSpan={6} style={{ textAlign: 'right' }}>
                            {endMoment.format('DD/MM/YYYY HH:mm')}
                        </GridItem>
                    </Grid>
                    </GridItem>
                </Grid>
                </div>

            }}
        </AutoSizer>
        </GridItem>
      </Grid>

        

        <Monitors data={data} />
    </>
};

export default Group;


