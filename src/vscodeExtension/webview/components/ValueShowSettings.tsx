
import * as React from "react";
import { Settings } from "@mui/icons-material";
import { Box, Checkbox, FormControlLabel, IconButton, Menu, styled } from "@mui/material";
import { noReloadShowOptions, reloadShowOptions } from "../accessor";

const OutlinedIconButton = styled(IconButton)`
border: 1px solid ${props => props.theme.palette.action.disabled};
border-radius: 5px;
`;

export const ValueShowSettings = () => {
    const reloadOptions = reloadShowOptions.useData()
    const noReloadOptions = noReloadShowOptions.useData()
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    if (reloadOptions === undefined || noReloadOptions === undefined) {
        return <></>
    }
    return <>
        <Menu
            id="scope-filter-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
        >

            <Box display="flex" flexDirection={"column"}>
                <FormControlLabel
                    label={"filter only highlight"}
                    control={<Checkbox
                        checked={reloadOptions.filterOnlyHighlight}
                        onChange={() => reloadShowOptions.sendEdit({
                            filterOnlyHighlight: !reloadOptions.filterOnlyHighlight
                        })}
                    />}
                />
                <FormControlLabel
                    label={"show ignored variables"}
                    control={<Checkbox
                        checked={reloadOptions.showIgnored}
                        onChange={() => reloadShowOptions.sendEdit({
                            showIgnored: !reloadOptions.showIgnored
                        })}
                    />} />

                <FormControlLabel
                    label={"show nest as table"}
                    control={<Checkbox
                        checked={noReloadOptions.showNestAsTable}
                        onChange={() => noReloadShowOptions.sendEdit({
                            showNestAsTable: !noReloadOptions.showNestAsTable
                        })}
                    />}
                />
                <FormControlLabel
                    label={"show string as multi line text"}
                    control={<Checkbox
                        checked={noReloadOptions.multiLineText}
                        onChange={() => noReloadShowOptions.sendEdit({
                            multiLineText: !noReloadOptions.multiLineText
                        })}
                    />}
                />
            </Box>
        </Menu>


        <OutlinedIconButton
            size="small"
            onClick={event => setAnchorEl(event.currentTarget)}>
            <Settings fontSize="inherit" />
        </OutlinedIconButton>
    </>
}