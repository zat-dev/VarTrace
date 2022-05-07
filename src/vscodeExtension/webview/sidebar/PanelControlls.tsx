import * as React from "react";
import { Box, Button, Typography } from "@mui/material"
import { panelOpen } from "../accessor";


export const PanelControlls = () => {

    return <>
        <Typography >panels</Typography>
        <Box marginY={1}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"space-between"}>
            <Typography >step detail</Typography>
            <Button
                size="small"
                variant="outlined"
                onClick={() => panelOpen.callProc("openStepDetail")}
            >
                open
            </Button>
        </Box>
        <Box marginY={1}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"space-between"}>
            <Typography >variable change log</Typography>
            <Button
                size="small"
                variant="outlined"
                onClick={() => panelOpen.callProc("openVarChangeLog")}
            >
                open
            </Button>
        </Box>
    </>
}