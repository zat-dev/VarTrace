import * as React from "react";
import { Box, IconButton, Typography } from "@mui/material"

import { FileOpen, Save } from "@mui/icons-material";
import { logMetadata, logFile } from "../accessor";

export const Status = () => {
    const state = logMetadata.subscribe()
    if (state === undefined) {
        return <></>
    }
    return <>
        <Box display={"flex"} justifyContent={"space-between"} >
            <Typography>status</Typography>
            <Box>
                <IconButton
                    color="primary"
                    size="small"
                    onClick={() => logFile.callProc("open")}>
                    <FileOpen fontSize="small" />
                </IconButton>
                <IconButton
                    disabled={state.status !== "completed"}
                    color="primary"
                    size="small"
                    onClick={() => logFile.callProc("save")}>
                    <Save fontSize="small" />
                </IconButton>
            </Box>
        </Box>
        <Typography>analysis: {state.status}</Typography>
        <Typography>max step: {state.maxStep}</Typography>
    </>
}