import * as React from "react";
import * as core from "../../../core"
import { Box, TableContainer, Paper, Table, TableHead, TableRow, TableBody, TableCell } from "@mui/material";
import { HighlightedSpans, HighlightedTree } from "../components/HighlightedTree";
import { ValueShowSettings } from "../components/ValueShowSettings";
import { StepLink } from "../components/StepLink";
import { SearchBar } from "../components/SearchBar";
import { SelectMultipleList, SelectOneList } from "../components/SelectList";
import { varChangeLogResult, varChangeLogUserInput, reloadShowOptions, noReloadShowOptions } from "../accessor";

import { CircularBackdrop } from "../components/CircularBackdrop";


const VarTableHeader = () => {
    return <TableHead>
        <TableRow>
            <TableCell align="center" width={"2em"} style={{ padding: 0 }}>step</TableCell>
            <TableCell align="left" width={"3em"} style={{ padding: 0, paddingLeft: "3px", }}>scope</TableCell>
            <TableCell align="left" width={"10em"} style={{ padding: 0, paddingLeft: "3px", }}>variable</TableCell>
            <TableCell align="left" style={{ padding: 0, paddingLeft: "3px", }}>value</TableCell>
        </TableRow>
    </TableHead>
}
const maxValueWidth = "calc(70vw - 17em)"

const SearchValue = () => {
    const userInput = varChangeLogUserInput.useData()

    return <SearchBar
        placeholder="filter"
        value={userInput?.valueFilter ?? ""}
        onConfirm={() => {
            varChangeLogUserInput.sendEdit({ page: 1 })
            varChangeLogResult.callProc("load")
        }}
        onChange={text => varChangeLogUserInput.sendEdit({
            valueFilter: text
        })} />
}

const SearchVarName = () => {
    const userInput = varChangeLogUserInput.useData()
    return <SearchBar
        placeholder="filter"
        value={userInput?.varNameFilter ?? ""}
        onConfirm={() => {
            varChangeLogUserInput.sendEdit({ page: 1 })
            varChangeLogResult.callProc("load")
        }}
        onChange={text => varChangeLogUserInput.sendEdit({
            varNameFilter: text
        })} />
}

const VarTableSearchRow = () => {
    return <TableRow key={`search`} >
        <TableCell component="th" scope="row" >

        </TableCell>
        <TableCell align="center" style={{ padding: 0, paddingRight: "3em" }}>

        </TableCell>
        <TableCell align="center" style={{ padding: 0 }} >
            <Box width={"10em"}>
                <SearchVarName />
            </Box>
        </TableCell>
        <TableCell align="center" style={{ padding: 0, maxWidth: maxValueWidth }} >
            <SearchValue />
        </TableCell>
    </TableRow>
}

const VarTableRow = ({ entry }: { entry: ElemOf<core.VarChangeLog["contents"]> }) => {

    return <TableRow
        key={`${entry.step} ${entry.varId}`}
    >
        <TableCell align="center" component="th" scope="row" width={"2em"}>
            <StepLink step={entry.step} />
        </TableCell>
        <TableCell align="left" style={{ padding: 0, paddingLeft: "5px" }}>
            <Box width={"4em"}>
                {entry.scopeKind}
            </Box>
        </TableCell>
        <TableCell align="left" style={{ padding: "6px" }}>
            <Box width={"10em"} overflow={"auto"} display={"flex"}>
                <HighlightedSpans valueTexts={entry.varName} asText={false}></HighlightedSpans>
            </Box>
        </TableCell>
        <TableCell align="left" style={{ padding: 0, maxWidth: maxValueWidth }}>
            <Box width="100%">
                <HighlightedTree value={entry.val} />
            </Box>
        </TableCell>
    </TableRow>
}

const VarTable = () => {
    const varChangeLog = varChangeLogResult.useData()
    if (varChangeLog === undefined) {
        return <></>
    }
    return <TableContainer component={Paper}>
        <Table size="small">
            <VarTableHeader />
            <TableBody>
                <VarTableSearchRow />
                {varChangeLog.contents.map((entry) => <VarTableRow entry={entry} />)}
            </TableBody>
        </Table>
    </TableContainer >

}





const PanelHeader = () => {
    const userInputData = varChangeLogUserInput.useData()
    const varChangeLog = varChangeLogResult.useData()

    return <>{varChangeLog && <Box display="flex" justifyContent={"flex-end"} margin={"3px"} >
        <Box marginRight={"5px"}>
            <SelectOneList
                label="page"
                value={`${userInputData?.page ?? 0}`}
                list={[...Array(varChangeLog.maxPage)].map((_, i) => `${i + 1}`)}
                onChange={(page) => {
                    varChangeLogUserInput.sendEdit({ page: parseInt(page) })
                    varChangeLogResult.callProc("load")
                }}
            />

        </Box>
        <ValueShowSettings />
    </Box>
    }</>
}

const Provider: React.FC<{}> = ({ children }) => {
    return <noReloadShowOptions.Provider>
        <reloadShowOptions.Provider>
            <varChangeLogUserInput.Provider>
                <varChangeLogResult.Provider>
                    {children}
                </varChangeLogResult.Provider>
            </varChangeLogUserInput.Provider>
        </reloadShowOptions.Provider>
    </noReloadShowOptions.Provider>
}

const Main = () => {
    const varChangeLog = varChangeLogResult.useData()
    const [loading, setLoading] = React.useState(true)
    React.useEffect(() => {
        if (varChangeLog?.loading === false) {
            setLoading(false)
        } else {
            setLoading(true)
        }
    }, [varChangeLog?.loading])

    return <>
        <PanelHeader />
        <VarTable />
        {loading && <CircularBackdrop open={loading} />}
    </>
}

export const VarChangeLogPanel = () => {
    return <Provider>
        <Main></Main>
    </Provider>
}
