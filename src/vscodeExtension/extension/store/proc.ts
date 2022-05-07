import { AnyStateId, StateGetter, StateGetterOf, StateId } from "./state"

export type Proc<Data, S> = (get: StateGetterOf<S>, set: (data: Data) => void) => Promise<void>
export type ProcDef<Id> =
    Id extends StateId<infer Domain, infer Name, infer Data, infer Editable, infer Depends> ?
    {
        triggers?: Depends[],
        proc: Proc<Data, Id>
    }
    : never
export type ProcDefs<Id, ProcKeys extends string> =
    Record<ProcKeys, ProcDef<Id>>

export type ProcId<SId extends AnyStateId, Name extends string> =
    `${SId}/${Name}` & Partial<{ stateId: SId, name: Name }>

export type AnyProcId = ProcId<AnyStateId, string>

export const makeProcId = <SId extends AnyStateId, Name extends string>(
    stateId: SId,
    name: Name
) => {
    return `${stateId}/${name}` as ProcId<SId, Name>
}
