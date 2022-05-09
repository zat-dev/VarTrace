import { Metadata, StepInfo, StepVariables, LogLoader, VarChangeLog, ScopeKind, SrcFile } from "../core/entity/logLoader"

import {
    Kysely,
    SqliteDialect,
} from 'kysely'
import { CodeLang } from "../core/entity/codeLang"
import { getCodeLang } from "../codeLang"
import { makeValueText } from "../core/entity/value"

/**
 * ref. DB schema: dumper/create_tracelog_table.sql
 */

interface Database {
    metadata: {
        version: string,
        language: string,
        status: "running" | "completed",
        max_step: number,
        base_path: string
    }
    files: {
        file_id: number,
        mod_timestamp: Date,
        file_abs_path: string
    }
    functions: {
        function_id: number,
        function_name: string
    }
    steps: {
        step: number,
        step_kind: string, /* ex: line(statement), exception, return, call */
        file_id: number,
        line: number,
        function_id: number,
        local_scope_id: number,
        global_scope_id: number,
        return_snap: string | null, /* retrun value of function or throwed exception value */
    }
    scopes: {
        scope_id: number,
        scope_name: string,
        scope_kind: ScopeKind,
        start: number,
        end: number
    }
    variables: {
        var_id: number,
        var_name: string,
        defined_step: number,
        scope_id: number,
    }
    variable_values: {
        step: number,
        var_id: number,
        value: string,
        prevValue: string | null,
    }
}

export class SqliteLogLoarder implements LogLoader {
    db
    constructor(databasePath: string) {
        this.db = new Kysely<Database>({
            dialect: new SqliteDialect({
                databasePath
            })
        })
    }
    getCodeLang = async (): Promise<CodeLang | undefined> => {
        const metadata = await this.getMetadata()
        if (metadata === undefined) {
            return
        }
        return getCodeLang(metadata.language)
    }
    validate(rawLog: unknown): boolean {
        return true
    }
    getDecodeLogVal = async () => {
        const codeLang = await this.getCodeLang()
        if (!codeLang) {
            return undefined
        }
        return (target: string | null) => {
            if (target === null) return undefined
            return codeLang.deserialize(target)
        }
    }
    getStepInfo = async (step: number): Promise<StepInfo> => {
        const result = await this.db.selectFrom('steps')
            .innerJoin('files', 'files.file_id', 'steps.file_id')
            .innerJoin('functions', 'functions.function_id', 'steps.function_id')
            .select([
                'step',
                'step_kind as stepKind',
                'file_abs_path as fileAbsPath',
                'line',
                'function_name as functionName',
                'return_snap as returnSnap'
            ])
            .where('step', '=', step)
            .executeTakeFirstOrThrow()
        const decode = await this.getDecodeLogVal()
        const returnVal = decode ? decode(result.returnSnap) : undefined
        return (({ returnSnap, ...rest }) => ({ ...rest, returnVal }))(result)
    }
    getMetadata = async (): Promise<Metadata | undefined> => {
        const result = await this.db.selectFrom('metadata')
            .select([
                'language',
                'version',
                'max_step as maxStep',
                'status',
                'base_path as basePath'
            ])
            .executeTakeFirst()
        if (!result) return undefined
        return { ...result, format: "sqlite" }
    }
    getFiles = async (): Promise<SrcFile[]> => {
        const result = await this.db.selectFrom('files')
            .select([
                'file_abs_path as absPath',
                'mod_timestamp as modTimestamp'
            ])
            .execute()
        if (!result) return []
        return result
    }
    getLineSteps = async (fileAbsPath: string, line: number): Promise<number[]> => {
        const result = await this.db
            .with('file_ids', db => db.selectFrom('files')
                .select('file_id').where('file_abs_path', '=', fileAbsPath))
            .selectFrom('file_ids')
            .innerJoin('steps', 'file_ids.file_id', 'steps.file_id')
            .select('step')
            .where('line', '=', line)
            .execute()
        if (!result) return []
        return result.map(({ step }) => step)
    }
    getStepVariables = async (step: number): Promise<StepVariables> => {
        const queryResults = await this.db
            .selectFrom('variable_values')
            .innerJoin('variables', 'variable_values.var_id', 'variables.var_id')
            .innerJoin('scopes', 'scopes.scope_id', 'variables.scope_id')
            .select([
                "scope_name as scopeName",
                "scope_kind as scopeKind",
                "var_name as varName",
                "variable_values.var_id as varId",
                "value"
            ])
            .where("step", "=", step)
            .execute()
        let result: StepVariables = {}
        const decode = await this.getDecodeLogVal()
        if (!decode) {
            return result
        }
        for (const { value, varId, varName, ...rest } of queryResults) {
            result[varId.toString()] = {
                ...rest,
                varName: [makeValueText(varName)],
                val: decode(value)!
            }
        }

        return result
    }
    getVarChangeLog = async (): Promise<VarChangeLog> => {

        const queryResults = await this.db
            .selectFrom('variable_values')
            .innerJoin('variables', 'variable_values.var_id', 'variables.var_id')
            .innerJoin('scopes', 'variables.scope_id', 'scopes.scope_id')
            .select([
                'variable_values.step',
                'scope_name as scopeName',
                'scope_kind as scopeKind',
                'var_name as varName',
                'variable_values.var_id as varId',
                'value',
                'prevValue'])
            .whereRef('value', '!=', 'prevValue')
            .orWhere('prevValue', 'is', null)
            .execute()

        const decode = await this.getDecodeLogVal()
        if (!decode) {
            return []
        }
        const results = []
        for (const result of queryResults) {
            const val = decode(result.value)
            if (val === undefined) {
                throw Error("unexpected undefined val")
            }
            // recoeded step is before line execution.
            // so step when prev != current, it means the change made before step
            const changedStep = Math.max(result.step - 1, 0)
            results.push({
                step: changedStep,
                val: val,
                prevVal: decode(result.prevValue),
                scopeKind: result.scopeKind,
                scopeName: result.scopeName,
                varName: [makeValueText(result.varName)],
                varId: result.varId
            })
        }

        return results

    }
    close = async (): Promise<void> => {
        await this.db.destroy()
    }

}