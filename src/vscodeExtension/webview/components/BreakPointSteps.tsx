import * as React from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material"
import { breakPointSteps } from "../accessor";
import { StepLink } from "../components/StepLink";
import { ExpandMore } from "@mui/icons-material";

const TableHeader = () => {
    return <TableHead>
        <TableRow>
            <TableCell align="left">line</TableCell>
            <TableCell align="left">steps</TableCell>
        </TableRow>
    </TableHead>
}

const Row = (props: { steps: number[], line: string }) => {
    const { steps, line } = props
    return <TableRow >
        <TableCell align="left" >
            <Box maxWidth={"4em"} display="flex" overflow="auto">
                {line}
            </Box>
        </TableCell>
        <TableCell align="left">
            <Box display="flex" overflow="auto" maxWidth={"70vw"}>{
                steps.map(step =>
                    <Box marginLeft={1}>
                        <StepLink step={step} />
                    </Box>
                )}
            </Box>
        </TableCell>
    </TableRow>
}

const FilePath = (props: { path: string }) => {
    const separator = /[\\,\/]/
    const path = props.path.split(separator)
    const fileName = path[path.length - 1]
    return <Box
        display="flex"
        maxWidth="80vw"
        overflow={"auto"}
        style={{ whiteSpace: "nowrap", hyphens: "none" }}
    >
        {fileName}
    </Box>
}


export const BreakPointSteps = () => {
    const breaks = breakPointSteps.useData()?.breakPointSteps

    if (!breaks) {
        return <></>
    }

    return <>
        <Accordion disableGutters>
            <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{ minHeight: "36px" }}
            >
                <Typography >breakpoint steps</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ marginTop: 0, paddingTop: 0 }}>
                {
                    Object.entries(breaks).map(([fileAbsPath, lineSteps]) =>
                        <Box marginBottom={2}>
                            <Box marginY={1}>
                                <FilePath path={fileAbsPath} />
                            </Box>
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHeader />
                                    <TableBody>
                                        {Object.entries(lineSteps).map(([line, steps]) =>
                                            <Row {...{ line, steps }} />
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                        </Box>)
                }
            </AccordionDetails>
        </Accordion>

    </>
}
