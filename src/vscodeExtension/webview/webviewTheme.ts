import { createTheme } from "@mui/material"
import * as React from "react";


// color is #XXXXXX format string 
const calcLuminance = (color: string) => {
    const red = parseInt(color.substring(1, 3), 16)
    const green = parseInt(color.substring(3, 5), 16)
    const blue = parseInt(color.substring(5, 7), 16)
    // https://stackoverflow.com/questions/596216/formula-to-determine-perceived-brightness-of-rgb-color
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

const whiteLuminance = calcLuminance("#FFFFFF")
const blackLuminance = calcLuminance("#000000")

const isDark = (color: string) => {
    const luminance = calcLuminance(color)
    const distFromWhite = Math.abs(whiteLuminance - luminance)
    const distFromBlack = Math.abs(blackLuminance - luminance)

    return (distFromBlack < distFromWhite)
}

const useCssValue = (propName: string) => {
    const vscodeStyles = getComputedStyle(document.body)
    const [cssValue, setCssValue] = React.useState(vscodeStyles.getPropertyValue(propName))
    React.useEffect(() => {
        const observer = new MutationObserver(() =>
            setCssValue(vscodeStyles.getPropertyValue(propName))
        );

        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }, [])

    return cssValue
}


export const useGeneratedTheme = (from: "panel" | "sideBar") => {
    const bgColor = useCssValue(`--vscode-${from}-background`)
    const fontSize = useCssValue(`--vscode-font-size`)

    const paletteType: "dark" | "light" = isDark(bgColor) ? "dark" : "light"

    const theme = createTheme({
        palette: {
            mode: paletteType,
            background: {
                default: bgColor
            }
        },
        typography: {
            fontSize: parseInt(fontSize, 10)
        }
    })

    return createTheme(theme, {
        palette: {
            primary: {
                contrastText: theme.palette.primary[paletteType]
            },
            secondary: {
                contrastText: theme.palette.secondary[paletteType]
            },
            warning: {
                contrastText: theme.palette.warning[paletteType]
            }
        }
    })

}