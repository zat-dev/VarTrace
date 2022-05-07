import * as React from "react";
import * as ReactDOM from "react-dom";

import { ThemeProvider } from "@mui/material/styles";
import { StepDetailPanel } from "./panel/StepDetailPanel";
import { useGeneratedTheme } from "./webviewTheme";
import { VarChangeLogPanel } from "./panel/VarChangeLogPanel";

import { Sidebar } from "./sidebar/Sidebar";
import { CssBaseline } from "@mui/material";
import { WebviewPanelContent } from "../extension/uiWrapper/webviewPanel";
import { WebviewViewContent } from "../extension/uiWrapper/webviewView";


declare global {
    var content: WebviewPanelContent | WebviewViewContent
}

const Webview = () => {
    switch (content) {
        case "step detail": return <StepDetailPanel></StepDetailPanel>
        case "variable change log": return <VarChangeLogPanel></ VarChangeLogPanel>
        case "sidebar": return <Sidebar></Sidebar>
        // dummy to treat non exhausive switch-case as an error
        // https://stackoverflow.com/questions/39419170/how-do-i-check-that-a-switch-block-is-exhaustive-in-typescript
        default: return ((never: never) => <></>)(content)
    }
}

const getThemeName = () => {
    if (content === "sidebar") return "sideBar" as const
    return "panel" as const
}

const Main = () => {
    const themeName = getThemeName()
    const theme = useGeneratedTheme(themeName)
    return <ThemeProvider theme={theme}>
        <CssBaseline />
        <Webview ></Webview>
    </ThemeProvider>
}

ReactDOM.render(
    <Main></Main>,
    document.getElementById("root")
);
