import * as React from "react";
import { Box, Divider } from "@mui/material"
import { DumpConfSection } from "./DumpConf";
import { Status } from "./Status";
import { PanelControlls } from "./PanelControlls";

export const Sidebar = () => {

    return <>
        <DumpConfSection />
        <Box marginY={2}>
            <Divider />
        </Box>
        <Status />

        <Box marginY={2}>
            <Divider />
        </Box>
        <Box marginY={2}>
            <PanelControlls />
        </Box>
    </>
}

