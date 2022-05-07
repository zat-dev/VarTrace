import * as React from "react";
import { useId } from "react-id-generator";
import { Box, styled, Theme, useTheme } from "@mui/material";
import * as core from "../../../core"
import { SxProps } from "@mui/system";
import { TreeItem, TreeView } from "@mui/lab";
import { ExpandMore, ChevronRight } from "@mui/icons-material";
import { noReloadShowOptions, reloadShowOptions } from "../accessor";

type TextViewModel = {
    text: string,
    isHighlight: boolean,
    isBold: boolean,
}

const toViewModels = (valueText: core.ValueText): TextViewModel[] => {
    let cur = 0
    let result = []
    const isBold = Boolean(valueText.isNew || valueText.isChanged)
    for (const { start, end } of valueText.hit) {
        result.push({
            text: valueText.text.substring(cur, start),
            isBold,
            isHighlight: false
        })
        result.push({
            text: valueText.text.substring(start, end),
            isBold,
            isHighlight: true
        })
        cur = end
    }
    result.push({
        text: valueText.text.substring(cur),
        isBold,
        isHighlight: false
    })
    return result
}

const splitByChar = (viewModel: TextViewModel): TextViewModel[] => {
    return [...viewModel.text].map(char => ({
        text: char,
        isBold: viewModel.isBold,
        isHighlight: viewModel.isHighlight
    }))
}

const toStyle = (theme: Theme, viewModel: TextViewModel) => {
    let style: SxProps<Theme> = { hyphens: "none", whiteSpace: "nowrap" }
    if (viewModel.isBold) {
        style = {
            ...style,
            fontWeight: 'bold',
            color: theme.palette.primary.main,
        }
    }
    if (viewModel.isHighlight) {
        style = {
            ...style,
            backgroundColor: theme.palette.secondary.contrastText + "77" // add transparent
        }
    }
    // '\n' doesnt appear without restoreEscape called
    if (viewModel.text === '\n') {
        style = { ...style, flexBasis: "100%", height: "0" }
    }
    return style
}

const restoreEscape = (viewModel: TextViewModel) => {
    const escapes = {
        '\\n': '\n',
        '\\b': '\b',
        '\\t': '\t',
        '\\f': '\f',
        '\\r': '\r',
        '\\a': '\a',
        '\\"': '"',
        '\\/': '/',
    }
    let text = viewModel.text

    for (let [escape, restore] of Object.entries(escapes)) {
        text = text.replaceAll(escape, restore)
    }

    return {
        ...viewModel,
        text
    }
}

const convertAsText = (decoratedTexts: core.ValueText[]): TextViewModel[] => {
    let result = []
    for (let decoratedText of decoratedTexts) {
        let viewModels = toViewModels(decoratedText)
        viewModels = viewModels.map(restoreEscape)
        viewModels = viewModels.flatMap(splitByChar)
        result.push(...viewModels)
    }
    // replace first " and end "
    return result.slice(1, result.length - 1)
}

export const HighlightedSpans = (props: { valueTexts: core.ValueText[], asText: boolean }) => {
    const theme = useTheme()
    const chars = props.asText
        ? convertAsText(props.valueTexts)
        : props.valueTexts.flatMap(toViewModels)

    const content = <>
        {
            chars.map(
                (x) => <Box
                    sx={toStyle(theme, x)}
                >
                    {x.text.replaceAll(' ', '\u00A0') /* space(html will remove) -> nbsp */}
                </Box>
            )
        }
    </>
    return props.asText ? <Box display="flex" flexWrap="wrap"> {content} </Box> : content
}

const getDim = (value: core.Value) => {
    let maxDim = 0
    for (const child of Object.values(value.children)) {
        maxDim = Math.max(maxDim, getDim(child.value) + 1)
    }
    return maxDim
}

const TableRoot = styled('div')`
  table {
    border-collapse: collapse;
    width: 100%;
  }

  td, th {
    border: 1px solid ${props => props.theme.palette.action.disabled};
  }
  th {
    background-color: ${props => props.theme.palette.action.disabled};
  }
`;


export const Table2d = (props: { value: core.Value }) => {
    const { value } = props
    const dict: { [key: string]: { [key: string]: core.ValueText[] } } = {}
    const colKeySet = new Set<string>()
    for (const [childKey, child] of Object.entries(value.children)) {
        dict[childKey] = {}
        for (const [grandChildKey, grandChild] of Object.entries(child.value.children)) {
            dict[childKey] = {
                ...dict[childKey],
                [grandChildKey]: grandChild.value.expression
            }
            colKeySet.add(grandChildKey)
        }
    }
    // sort func return NaN if a or b is not number string
    const rowKeys = Object.keys(dict).sort((a: any, b: any) => a - b)
    const colKeys = [...colKeySet].sort((a: any, b: any) => a - b)

    return <TableRoot>
        <table>
            <tr>
                <th></th>
                {colKeys.map(colKey => <th>{colKey}</th>)}
            </tr>
            {
                rowKeys.map(rowKey => <tr>
                    <th>{rowKey}</th>
                    {colKeys.map(colKey => <td>
                        <HighlightedSpans valueTexts={(dict[rowKey]!)[colKey] ?? []} asText={false} />
                    </td>)}
                </tr>)
            }
        </table>
    </TableRoot>
}
export const Table1d = (props: { value: core.Value }) => {
    const { value } = props
    const colKeySet = new Set<string>()
    for (const [key, child] of Object.entries(value.children)) {
        colKeySet.add(key)
    }
    // note: sort func return NaN if a or b is not number string
    // this doesnt cause any matter now. but in the future might cause
    const colKeys = [...colKeySet].sort((a: any, b: any) => a - b)

    return <TableRoot>
        <table>
            <tr>
                {colKeys.map(colKey => <th>{colKey}</th>)}
            </tr>
            <tr>
                {
                    Object.values(value.children).map(child =>
                        <td>
                            <HighlightedSpans valueTexts={child.value.expression} asText={false} />
                        </td>
                    )
                }
            </tr>
        </table>
    </TableRoot>
}
type ShowType = "none" | "string" | "table2d" | "table1d"

const getShowType = (value: core.Value) => {
    const noReloadOptions = noReloadShowOptions.useData()
    const reloadOptions = reloadShowOptions.useData()
    const options = noReloadOptions && reloadOptions &&
        { ...reloadOptions, ...noReloadOptions }
    let showType: ShowType = "none"
    if (!options) {
        return showType
    }
    if (value.type === "string" && options.multiLineText) {
        showType = "string"
    }
    if (options.showNestAsTable) {
        const dim = getDim(value)
        if (dim == 2) {
            showType = "table2d"
        }
        else if (dim == 1) {
            showType = "table1d"
        }
    }

    return showType
}

export const HighlightedTreeLabel = (props: { keyExpression: core.ValueText[], value: core.Value, showType: ShowType }) => {
    const { value, showType, keyExpression } = props

    return <Box display="flex" overflow={"auto"}>
        <HighlightedSpans valueTexts={keyExpression} asText={false} />
        {(keyExpression.length ?? 0) > 0 && <Box>: </Box>}

        {showType === "string" &&
            <HighlightedSpans valueTexts={value.expression} asText={true} />
        }
        {showType === "none" &&
            <HighlightedSpans valueTexts={value.expression} asText={false} />
        }
        {
            showType === "table2d" &&
            <Table2d value={value}></Table2d>
        }
        {
            showType === "table1d" &&
            <Table1d value={value}></Table1d>
        }
    </Box>
}

export const HighlightedTreeItem = (props: { value: core.Value, keyExpression: core.ValueText[] }) => {
    const { value, keyExpression } = props
    const showType = getShowType(value)

    const theme = useTheme()
    const [id] = useId()
    const hasHitStyle = {
        fill: theme.palette.secondary.main,
        color: theme.palette.secondary.main,
    }
    const style = value.hasHit ? hasHitStyle : {}
    return <TreeItem
        nodeId={id ?? ""}
        label={<HighlightedTreeLabel {...{ showType, value, keyExpression }} />}
        endIcon={value.hasHit ? <Box sx={style}>&bull;</Box> : <div></div>}
        collapseIcon={<Box sx={style}><ExpandMore /></Box>}
        expandIcon={<Box sx={style}><ChevronRight /></Box>}
    >
        {(!["table2d", "table1d"].includes(showType)) && Object.entries(value.children).map(
            ([key, { value, keyExpression }]) =>
                <HighlightedTreeItem {...{ value, keyExpression }}></HighlightedTreeItem>
        )}
    </TreeItem >
}

export const HighlightedTree = (props: { value: core.Value }) => {

    return <TreeView
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRight />}
        disableSelection
    >
        <HighlightedTreeItem value={props.value} keyExpression={[]}></HighlightedTreeItem>
    </TreeView>
}
