import * as React from 'react';
import {makeStyles, Theme} from "@material-ui/core/styles";
import {Page} from "../../components/Page";
import {
    Card,
    CardContent, Divider,
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary, Grid, List,
    Typography
} from "@material-ui/core";
import UploadItem from "./UploadItem";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles((theme: Theme) => {
    return ({
        panelSummary:{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
        },
        expandedIcon:{
            color: theme.palette.primary.contrastText,
        },
    })
})

const Uploads = () => {

    const classes = useStyles();
    return (
        <Page title={'Uploads'}>
            <Card elevation={5}>
                <CardContent>
                    <UploadItem>
                        Video - E o vento levou
                    </UploadItem>
                    <ExpansionPanel style={{margin: 0}}>
                        <ExpansionPanelSummary
                            className={classes.panelSummary}
                            expandIcon={<ExpandMoreIcon className={classes.expandedIcon} />}>
                            <Typography>Ver detalhes</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails style={{padding: '0px'}}>
                            <Grid item xs={12}>
                                <List dense={true} style={{padding: '0px'}}>
                                    <Divider/>
                                    <UploadItem>
                                        Principal - nomedoarquivo.mp4
                                    </UploadItem>
                                </List>
                            </Grid>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                </CardContent>
            </Card>
        </Page>
    );
};

export default Uploads;