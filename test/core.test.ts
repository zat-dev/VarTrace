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

describe("var change log perf", () => {
    const outPath = path.join(rootPath, "httpie.db")
    test("httpie query from cache < 1s", async () => {
        const loader = new SqliteLogLoarder(outPath)
        const vt = new core.VarTrace(loader)
        await vt.getVarChangeLog({
            page: 1, pageSize: 10000,
        })
        const start = Date.now()
        await vt.getVarChangeLog({
            page: 1, pageSize: 10000
        })
        const end = Date.now()
        const sec = (end - start) / 1000
        console.log(`done in ${sec} sec`)
        expect(sec).toBeLessThan(1);
    })

    test("httpie query from cache with search < 1s", async () => {
        const loader = new SqliteLogLoarder(outPath)
        const vt = new core.VarTrace(loader)
        await vt.getVarChangeLog({
            page: 1, pageSize: 10000,
        })
        const start = Date.now()
        await vt.getVarChangeLog({
            page: 1, pageSize: 10000,
            valueFilter: "default"
        })
        const end = Date.now()
        const sec = (end - start) / 1000
        console.log(`done in ${sec} sec`)
        expect(sec).toBeLessThan(1);
    })
})

describe("step variables of func", () => {
    const outPath = path.join(rootPath, "func.py.db")
    const loader = new SqliteLogLoarder(outPath)
    const vt = new core.VarTrace(loader)
    test("step 4 variable a before is not exists", async () => {
        const stepVariables = await vt.getStepVars({ step: 4, varNameFilter: "", showIgnored: true })
        const local_a_before = stepVariables['local']
            .find(({ varName }) => varName[0]?.text === "a")
            ?.before
        expect(local_a_before).toEqual(undefined)
    })
    test("step 4 variable a after is 1", async () => {
        const stepVariables = await vt.getStepVars({ step: 4, varNameFilter: "", showIgnored: true })
        const local_a_after = stepVariables['local']
            .find(({ varName }) => varName[0]?.text === "a")
            ?.after
        let num = toPrimitive("1", "number")
        num.expression[0]!.isNew = true
        expect(local_a_after).toEqual(num)
    })
})

describe("step variables of data types", () => {
    const outPath = path.join(rootPath, "data_types.py.db")
    const loader = new SqliteLogLoarder(outPath)
    const vt = new core.VarTrace(loader)
    test("step 24 variable self before", async () => {
        const stepVariables = await vt.getStepVars({ step: 24, varNameFilter: "", showIgnored: true })
        const local_self_before = stepVariables['local']
            .find(({ varName }) => varName[0]?.text === "self")
            ?.before
        const expected = {
            children: {},
            expression: [
                { hit: [], text: 'TestClass(' },
                { hit: [], text: ')', }
            ],
            type: 'TestClass',
            hasHit: false
        }
        expect(local_self_before).toEqual(expected)
    })
})
describe("files", () => {
    const outPath = path.join(rootPath, "small_loop.py.db")
    const loader = new SqliteLogLoarder(outPath)
    const vt = new core.VarTrace(loader)
    test("file list first elem is small_loop.py", async () => {
        const file = (await vt.getFiles()).map(x => x.absPath)
        expect(file[0]).toMatch(/small_loop\.py$/)
    })
}
)
describe("line variables", () => {
    const outPath = path.join(rootPath, "small_loop.py.db")
    const loader = new SqliteLogLoarder(outPath)
    const vt = new core.VarTrace(loader)
    test("line 4 steps", async () => {
        const filePath = (await vt.getFiles()).map(x => x.absPath)
        const query = {
            fileAbsPath: filePath[0]!,
            line: 4,
        }
        const steps = await vt.getLineSteps(query)
        expect(steps).toEqual([4, 7, 10, 13, 16])
    })
})

describe('unnormal exit', () => {
    test('uncaught exception', async () => {
        const outPath = path.join(rootPath, "exception.py.db")
        const loader = new SqliteLogLoarder(outPath)
        const vt = new core.VarTrace(loader)
        const metadata = await vt.getMetadata()
        if (metadata === undefined) {
            throw new Error('undefined metadata')
        }
        const maxStep = metadata.maxStep
        const lastVars = await vt.getStepVars({ step: maxStep, varNameFilter: "", showIgnored: true })
        const target = lastVars.global.find(({ varName }) => varName[0]?.text === "y")
        expect(target?.before?.expression[0]?.text).toEqual('"should be caught"')

        const lastStepInfo = await vt.getStepInfo(maxStep)
        expect(lastStepInfo.line).toEqual(12)
    })
    test('assert', async () => {
        const outPath = path.join(rootPath, "assert.py.db")
        const loader = new SqliteLogLoarder(outPath)
        const vt = new core.VarTrace(loader)
        const metadata = await vt.getMetadata()
        if (metadata === undefined) {
            throw new Error('undefined metadata')
        }
        const maxStep = metadata.maxStep
        const lastStepInfo = await vt.getStepInfo(maxStep)
        expect(lastStepInfo.line).toEqual(4)
    })
    test('exit', async () => {
        const outPath = path.join(rootPath, "exit.py.db")
        const loader = new SqliteLogLoarder(outPath)
        const vt = new core.VarTrace(loader)
        const metadata = await vt.getMetadata()
        if (metadata === undefined) {
            throw new Error('undefined metadata')
        }
        const maxStep = metadata.maxStep
        const lastStepInfo = await vt.getStepInfo(maxStep)
        expect(lastStepInfo.line).toEqual(3)
    })
})