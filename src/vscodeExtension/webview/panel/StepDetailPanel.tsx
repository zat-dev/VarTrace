import * as React from "react";
import * as core from "../../../core"
import { HighlightedSpans, HighlightedTree } from "../components/HighlightedTree";
import { Box, Divider, Grid, IconButton, Paper, Slider, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import { ArrowLeft, ArrowRight } from "@mui/icons-material";
import { ValueShowSettings } from "../components/ValueShowSettings";
import { step, stepDetail, logMetadata, breakPointSteps, stepVarFilter, noReloadShowOptions, reloadShowOptions } from "../accessor";
import { SearchBar } from "../components/SearchBar";
import { BreakPointSteps } from "../components/BreakPointSteps";

type Variables = {
    varName: core.ValueText[],
    before: core.Value | undefined,
    after: core.Value | undefined
}[]

const OutlinedIconButton = styled(IconButton)`
border: 1px solid ${props => props.theme.palette.action.disabled};
border-radius: 5px;
`;



const StepControllButtons = () => {
    return <Box marginY={"3px"} display={"flex"}>
        <OutlinedIconButton
            size="small"
            onClick={() => step.callProc("prev")}>
            <ArrowLeft fontSize="small" />
        </OutlinedIconButton>
        <OutlinedIconButton
            size="small"
            onClick={() => step.callProc("next")}>
            <ArrowRight fontSize="small" />
        </OutlinedIconButton>
    </Box>
}


const StepControllBar = () => {
    const logFile = logMetadata.useData()

    const userInput = step.useData()
    const [inputStep, setInputStep] = React.useState(userInput?.step)

    React.useEffect(() => setInputStep(userInput?.step), [userInput?.step])
    return <Slider
        value={inputStep ?? 0}
        step={1}
        marks
        min={0}
        max={logFile?.maxStep}
        onChange={(_e, v) => setInputStep(v as number)}
        onChangeCommitted={(_e, v) => step.sendEdit({ step: v as number })}
        valueLabelDisplay="auto"
    />
}

const StepControll = () => {
    const userInput = step.useData()
    const detail = stepDetail.useData()
    return <>
        <Grid container spacing={2} alignItems="center">
            <Grid item>
                <Typography variant="h6" component="div">step control</Typography>
            </Grid>
            <Grid item>step: {userInput?.step}  line: {detail?.line}</Grid>
        </Grid>
        <Grid container spacing={2} alignItems="center">
            <Grid item>
                <StepControllButtons />
            </Grid>

            <Grid item xs>
                <StepControllBar />
            </Grid>
        </Grid>
    </>
}


const VarTableHeader = () => {
    return <TableHead>
        <TableRow>
            <TableCell align="left">variable</TableCell>
            <TableCell align="left">before</TableCell>
            <TableCell align="left">after</TableCell>
        </TableRow>
    </TableHead>
}

const SearchVarName = () => {
    const filter = stepVarFilter.useData()
    return <Box width={"15em"}>
        <SearchBar
            placeholder="filter"
            label="variable name filter"
            value={filter?.varNameFilter ?? ""}
            onChange={text => stepVarFilter.sendEdit({
                varNameFilter: text
            })} />
    </Box>
}
const maxWidth = "30vw"

type RowProps = {
    varName: core.ValueText[],
    before: core.Value | undefined,
    after: core.Value | undefined
}

const VarTableRow = (props: RowProps) => {

    const { varName, before, after } = props
    return <TableRow>
        <TableCell align="left" >
            <Box maxWidth={"6em"} display="flex" overflow="auto">
                <HighlightedSpans valueTexts={varName} asText={false} />
            </Box>
        </TableCell>
        <TableCell align="left"  >
            <Box maxWidth={maxWidth} display="flex" overflow="auto">
                {before && <HighlightedTree value={before} />}
            </Box>
        </TableCell>
        <TableCell align="left" >
            <Box maxWidth={maxWidth} display="flex" overflow="auto">
                {after && <HighlightedTree value={after} />}
            </Box>
        </TableCell>
    </TableRow>
}

const ScopeVariables = ({ variables }: { variables: Variables }) => {
    return <TableContainer component={Paper}>
        <Table size="small">
            <VarTableHeader />
            <TableBody>
                {variables.map(({ varName, before, after }) =>
                    <VarTableRow {...{ varName, before, after }} />)}
            </TableBody>
        </Table>

    </TableContainer>
}

export const StepVariables = () => {
    const stepDetailData = stepDetail.useData()

    if (stepDetailData === undefined) {
        return <></>
    }
    const vars = Object.entries(stepDetailData.variables)

    return <>
        <Box display={"flex"} justifyContent={"space-between"} marginTop={1}>
            <Typography variant="h6" component="div">step variables</Typography>
            <Box display={"flex"} justifyContent={"space-between"}>
                <Box marginRight={1}>
                    <SearchVarName></SearchVarName>
                </Box>
                <ValueShowSettings />
            </Box>
        </Box>

        {
            vars.map(([scopeName, variables]) =>
                <Box marginTop="1em" key={scopeName}>
                    <Typography >{scopeName}</Typography>
                    <ScopeVariables {...{ variables }} />
                </Box>
            )
        }

    </>
}

const Provider: React.FC<{}> = ({ children }) => {
    return <noReloadShowOptions.Provider>
        <reloadShowOptions.Provider>
            <logMetadata.Provider>
                <stepVarFilter.Provider>
                    <stepDetail.Provider>
                        <step.Provider>
                            <breakPointSteps.Provider>
                                {children}
                            </breakPointSteps.Provider>
                        </step.Provider>
                    </stepDetail.Provider>
                </stepVarFilter.Provider>
            </logMetadata.Provider>
        </reloadShowOptions.Provider>
    </noReloadShowOptions.Provider>
}

export const StepDetailPanel = () => {

    return <Provider>
        <Box marginTop={"5px"} display="flex" flexDirection={"column"}>
            <Box maxWidth="90vw">
                <StepControll />
            </Box>
            <Box maxHeight={"30vh"} sx={{ overflowY: "scroll" }}>

                <BreakPointSteps />

            </Box>
            <Divider />
            <Box maxHeight={"50vh"} sx={{ overflowY: "scroll" }}>
                <Box marginY={1} style={{ overflowY: "auto", flexGrow: 1 }} >
                    {stepDetail && <StepVariables></StepVariables>}
                </Box>
            </Box>
        </ Box>
    </Provider >
}
