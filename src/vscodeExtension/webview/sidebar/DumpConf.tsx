import * as React from "react";
import { Box, Button, FormControl, IconButton, InputLabel, Menu, MenuItem, Select, TextField, Typography } from "@mui/material"
import { Add, FileOpen, Remove, Save } from "@mui/icons-material";
import { dumpConf, logFile, panelOpen } from "../accessor";
import { DumpConfig } from "../../../dumper/lib";



const SelectLanguage = () => {
    const userInput = dumpConf.useData()
    if (userInput === undefined) {
        return <></>
    }
    return <FormControl size="small">
        <InputLabel>language</InputLabel>
        <Select
            size="small"
            value={userInput.language}
            onChange={e => {/** TODO: future work */ }}
            label="language"
        >
            <MenuItem value={"python"}>python</MenuItem>
        </Select>
    </FormControl>
}

const InputCommand = () => {
    const userInput = dumpConf.useData()
    const [execCommand, setExecCommand] = React.useState(userInput?.execCommand)
    React.useEffect(() => {
        setExecCommand(userInput?.execCommand)
    },
        [userInput?.execCommand])

    if (userInput === undefined) {
        return <></>
    }
    return <>
        <Box display="flex" alignItems="center" >
            <TextField
                size="small"
                value={execCommand}
                label={"execution command"}
                onChange={
                    (event) => {
                        // workaround of https://github.com/mui/material-ui/issues/4430
                        setExecCommand(event.target.value)
                        dumpConf.sendEdit({
                            execCommand: event.target.value
                        })
                    }
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
            />
        </Box>
    </>
}

type Options = DumpConfig["options"]
type OptionName = ElemOf<Options>["optionName"]

const AddOptions = () => {
    const userInput = dumpConf.useData()
    const currentOptions = userInput?.options ?? []

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const optionNameToDisplay = {
        "targetDir": "src directory",
        "targetModule": "analysis target module",
        "stdin": "stdin"
    } as const
    const optionNames: OptionName[] =
        ["targetDir", "targetModule", "stdin"]

    const isMultilineOption = (optionName: OptionName) => {
        return optionName === "stdin"
    }

    const addRow = (optionName: OptionName) => {
        const newOptions = [...currentOptions, { optionName, value: "" }]
        dumpConf.sendEdit({ options: newOptions })
        setAnchorEl(null)
    }

    const removeRow = (index: number) => {
        const newOptions = currentOptions.filter((_x, i) => i !== index)
        dumpConf.sendEdit({ options: newOptions })
    }

    const handleChange = (index: number, value: string) => {
        const newOptions = currentOptions.map((x, i) => i === index ? { ...x, value } : x)
        dumpConf.sendEdit({ options: newOptions })
    }
    if (userInput === undefined) {
        return <></>
    }
    return <Box marginTop={2}>
        <Box display={"flex"} justifyContent={"space-between"} >
            <Typography>options</Typography>
            <Box>
                <IconButton
                    color="primary"
                    size="small"
                    onClick={event => setAnchorEl(event.currentTarget)}>
                    <Add fontSize="small" />
                </IconButton>
            </Box>
        </Box>
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={() => setAnchorEl(null)}
        >{
                optionNames.map(optionName =>
                    <MenuItem onClick={() => addRow(optionName)}>
                        {optionNameToDisplay[optionName]}
                    </MenuItem>
                )
            }
        </Menu>
        <>
            {
                currentOptions.map((row, index) => <Box
                    display={"flex"}
                    justifyContent={"space-between"}
                    marginTop={1}
                >
                    <TextField
                        label={optionNameToDisplay[row.optionName]}
                        size="small"
                        onChange={e => handleChange(index, e.target.value)}
                        multiline={isMultilineOption(row.optionName)}
                        value={row.value}
                    />
                    <IconButton onClick={() => removeRow(index)}>
                        <Remove />
                    </IconButton>
                </Box>
                )
            }
        </>
    </Box>
}

const Actions = () => {
    const userInput = dumpConf.useData()
    return <Box marginTop={2} >
        <Button
            variant="outlined"
            onClick={() => {
                if (!userInput?.execCommand) {
                    dumpConf.callProc("complementExecCommand")
                }
                logFile.callProc("dump")
                panelOpen.callProc("openVarChangeLog")
                panelOpen.callProc("openStepDetail")
            }}
        >
            analyze
        </Button>
    </Box>
}

const Title = () => {
    return <Box display={"flex"} justifyContent={"space-between"} >
        <Typography >config</Typography>
        <Box>
            <IconButton
                color="primary"
                size="small"
                onClick={() => dumpConf.callProc("load")}>
                <FileOpen fontSize="small" />
            </IconButton>
            <IconButton
                color="primary"
                size="small"
                onClick={() => dumpConf.callProc("save")}>
                <Save fontSize="small" />
            </IconButton>
        </Box>
    </Box>
}

const Provider: React.FC<{}> = ({ children }) => {
    return <dumpConf.Provider>
        {children}
    </dumpConf.Provider>
}

export const DumpConfSection = () => {
    return <Provider>
        <Title></Title>
        <Box marginY={1}>
            <SelectLanguage />
        </Box>
        <Box marginY={2}>
            <InputCommand></InputCommand>
        </Box>
        <AddOptions></AddOptions>
        <Actions></Actions>
    </Provider>
}