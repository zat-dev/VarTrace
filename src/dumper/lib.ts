
// helper functions to run dumper from nodejs(vscode)
import * as fs from "fs"
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
export const prepareLogPath = (outFile: string) => {
    const parentDir = path.dirname(outFile)
    if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true })
    }

    if (fs.existsSync(outFile)) {
        fs.unlinkSync(outFile)
    }
}

const makeDumpCommand = (dumperRootAbsPath: string, conf: DumpConfig, outPath: string) => {
    const execArgs = stringArgv(conf.execCommand)
    switch (conf.language) {
        case "python":
            // detect key positions
            const pythonIndex = execArgs.findIndex(arg => /^(python|py)([.0-9]*)?(exe)?$/.test(arg))
            const targetIndex = execArgs.findIndex((arg, i) => i > pythonIndex && !arg.startsWith("-"))
            const isModuleRun = execArgs[targetIndex - 1] === "-m"
            const insertDumperIndex = isModuleRun ? targetIndex - 1 : targetIndex

            const { optionArgs, stdin } = convertOptions(conf.options)
            const dumperPath = path.join(dumperRootAbsPath, 'python/main.py')
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
            return {
                command,
                prepare: (logPath: string) => {
                    prepareLogPath(logPath)
                    // pycache sometimes conflicts when multiple python versions are installed
                    // to avoid this, remove cache of vartrace
                    // __pycache__ path might be changed. but not support now.
                    const cachePath = path.join(dumperRootAbsPath, "python/__pycache__")
                    if (fs.existsSync(cachePath)) {
                        fs.rmSync(cachePath, { recursive: true })
                    }

                }
            }
        default:
            throw new NeverCaseError(conf.language)
    }
}



export const runDump = (
    dumperRootAbsPath: string,
    runner: (command: string) => void,
    conf: DumpConfig,
    logPath: string
) => {

    const { command, prepare } = makeDumpCommand(dumperRootAbsPath, conf, logPath)
    prepare(logPath)
    // to input stdin to user script, dumper runs on terminal(VSCode)
    runner(command)
}

