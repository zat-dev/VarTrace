import { python } from "./python"


export const getCodeLang = (lang: string) => {
    switch (lang) {
        case "python": return python
        default:
            throw new Error("unsupported language")
    }
}