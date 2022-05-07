
// helper functions to run dumper from nodejs(vscode)
import * as path from "path"
import stringArgv from 'string-argv'

type DumpOption = {
    optionName: "targetDir" | "targetModule" | "stdin",
    value: string
}

export type DumpConfig = {
    language: "python",
    execCommand: string,
    options: DumpOption[]
}

export const getDefaultDumpConfig = (lang: SupportLang) => {
    const defaults: { [key in SupportLang]: DumpConfig } = {
        "python": {
            language: "python",
            execCommand: "",
            options: [{
                optionName: "targetModule",
                value: "__main__"
            }]
        }
    }
    return defaults[lang]
}

type SupportLang = "python"

const getDumperPath = (extensionPath: string, language: SupportLang) => {
    const dumperRelPathDic: { [key in SupportLang]: string } = {
        "python": 'dist/dumper/python/main.py'
    }
    return path.join(extensionPath, dumperRelPathDic[language])
}

const convertOptions = (options: DumpOption[]) => {
    let optionArgs = ""
    let stdin = ""
    for (const { optionName, value } of options) {
        switch (optionName) {
            case "stdin":
                stdin += value
                stdin += "\n"
                break
            case "targetDir":
                optionArgs += ` -d ${value}`
                break
            case "targetModule":
                optionArgs += ` -M ${value}`
                break
            default:
                throw new NeverCaseError(optionName)
        }
    }
    return { stdin, optionArgs }
}

export const makeDumpCommand = (extensionPath: string, conf: DumpConfig, outPath: string) => {
    const dumperPath = getDumperPath(extensionPath, conf.language)
    // TODO: consider the nessesity about command injection protection
    // all variables here seem to be valid path given by vscode. right?
    const execArgs = stringArgv(conf.execCommand)
    switch (conf.language) {
        case "python":
            // detect key positions
            const pythonIndex = execArgs.findIndex(arg => /^(python|py)([.0-9]*)?(exe)?$/.test(arg))
            const targetIndex = execArgs.findIndex((arg, i) => i > pythonIndex && !arg.startsWith("-"))
            const isModuleRun = execArgs[targetIndex - 1] === "-m"
            const insertDumperIndex = isModuleRun ? targetIndex - 1 : targetIndex

            const { optionArgs, stdin } = convertOptions(conf.options)
            const dumperOptions = [
                dumperPath,
                ` -o ${outPath} `,
                optionArgs
            ].join(" ")
            // construct modified command by inserting args
            execArgs.splice(insertDumperIndex, 0, dumperOptions)
            let command = execArgs.join(" ")

            if (stdin) {
                command += "\n"
                command += stdin
            }
            return command
        default:
            throw new NeverCaseError(conf.language)
    }
}



