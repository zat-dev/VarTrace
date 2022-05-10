import * as fs from "fs"
import * as childProcess from 'child_process'
import { SqliteLogLoarder } from "../src/logLoader/sqliteLogLoader"
import * as core from "../src/core"
import * as path from "path"
import { makeValueText } from "../src/core/entity/value"


const dumperPath = "src/dumper/python/main.py"
const rootPath = "./test/target_files/python/"

const toPrimitive = (value: string, typ: string): core.Value => {

    return { children: {}, type: typ, expression: [makeValueText(value)], hasHit: false }
}


const dump = (outFile: string, targetPath: string) => {

    const dumpCommand = `python3 ${dumperPath} -o ${outFile} -M __main__ ${targetPath} `
    if (fs.existsSync(outFile)) {
        fs.unlinkSync(outFile)
    }
    try {
        childProcess.execSync(dumpCommand)
    }
    catch (e) {
        // ignore error because some test target are fail cases
    }
}

describe("makeTargetDumps", () => {

    test("makeTargetDumps", () => {
        const targets = fs.readdirSync(rootPath)

        for (let target of targets) {
            if (!target.endsWith(".py")) {
                continue
            }

            const targetPath = path.join(rootPath, target)
            const outFile = targetPath + ".db"
            dump(outFile, targetPath)
            expect(fs.existsSync(outFile)).toBe(true);
        }
    })

    test("make httpie dump", () => {
        const start = Date.now()
        const outFile = rootPath + "httpie.db"
        if (fs.existsSync(outFile)) {
            fs.unlinkSync(outFile)
        }
        const dumpCommand = `python ${dumperPath} -o ${outFile} -M httpie -m httpie google.com`
        childProcess.execSync(dumpCommand)
        const end = Date.now()
        const sec = (end - start) / 1000
        console.log(`done in ${sec} sec`)
        expect(sec).toBeLessThan(20);
    })
})
