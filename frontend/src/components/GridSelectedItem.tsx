// @flow
import * as React from 'react';
import {Grid, GridProps, IconButton} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";

interface GridSelectedItemProps extends GridProps{
    onClick: () => void
}

export const GridSelectedItem : React.FC<GridSelectedItemProps> = (props) => {
    const {onClick, children, ...other} = props;

    return  <Grid item {...other}>
                <Grid container alignItems={"center"} spacing={3}>
                    <Grid item xs={1}>
                        <IconButton size={"small"} color={"inherit"} onClick={onClick}>
                            <DeleteIcon/>
                        </IconButton>
                    </Grid>
                    <Grid item xs={10} md={11}>
                        {children}
                    </Grid>
                </Grid>
            </Grid>
};

export default GridSelectedItem;