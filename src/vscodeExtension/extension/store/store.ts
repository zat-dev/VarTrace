import { AnyProcId, makeProcId, Proc, ProcDefs, ProcId } from "./proc"
import { AnyStateId, makeStateId, StateDataOf, StateDef, StateGetter, StateId } from "./state"

export type ExposeToWebview<SId, Procs> =
    SId extends AnyStateId ?
    Procs extends (ProcId<SId, infer Names>)[] ?
    {
        procs: Names
        stateId: SId
    }
    : never
    : never

export type StateIdOf<Store> =
    Store extends { procs: infer Names, stateId: infer SId } ?
    SId : never

export type ProcNameOf<Store> =
    Store extends { procs: infer Names, stateId: infer SId } ?
    Names : never

type ProcEntry = { stateId: string, proc: Proc<any, any> }
const stateData: { [stateId in AnyStateId]: any } = {}
const processors: { [procId in AnyProcId]: ProcEntry } = {}
const triggerCalls: { [triggerStateId in AnyStateId]: ProcEntry[] } = {}
const subscribers: {
    [stateId: AnyStateId]: {
        [subscriberName: string]: (data: any) => void
    }
} = {}

export const addState = <Domain extends string, Name extends string, Data, UserEditable, Depends>(
    domain: Domain, name: Name, def: StateDef<Data, UserEditable, Depends>)
    : StateId<Domain, Name, Data, UserEditable, Depends> => {
    const stateId = makeStateId(domain, name, def)
    stateData[stateId] = def.init
    triggerCalls[stateId] = []
    publish(stateId)
    return stateId
}

export const addProc = <SId extends AnyStateId, ProcKeys extends string>(
    stateId: SId,
    procs: ProcDefs<SId, ProcKeys>
)
    : ProcId<SId, ProcKeys>[] => {

    let result: ProcId<SId, ProcKeys>[] = []
    for (const procName in procs) {
        if (procs[procName] === undefined) {
            continue
        }
        const { proc, triggers } = procs[procName]
        const procId = makeProcId(stateId, procName as ProcKeys)
        processors[procId] = {
            stateId,
            proc
        }
        for (const triggerStateId of triggers ?? []) {
            triggerCalls[triggerStateId]!.push({
                stateId,
                proc
            })
        }
        result.push(procId)
    }
    return result
}


export const addSubscriber = (
    stateId: AnyStateId,
    subscriberName: string,
    subscriber: (get: StateGetter<any>) => void) => {
    const newSubscription = {
        ...subscribers[stateId],
        [subscriberName]: subscriber
    }
    subscribers[stateId] = newSubscription
    publish(stateId)
}

const publish = (stateId: AnyStateId) => {
    const data = stateData[stateId]
    for (const subscriber of Object.values(subscribers[stateId] ?? {})) {
        subscriber(data)
    }
}

const fireTrigger = (stateId: AnyStateId) => {
    for (const processor of triggerCalls[stateId] ?? []) {
        processor.proc(
            (stateId: any) => stateData[stateId],
            (data: any) => updateState<any>(processor.stateId, data)
        )
    }
}

export const updateState = <SId extends AnyStateId>(stateId: SId, data: Partial<StateDataOf<SId>>) => {
    stateData[stateId] = { ...stateData[stateId], ...data }
    fireTrigger(stateId)
    publish(stateId)
}

export const callProc = async <Store>(stateId: StateIdOf<Store>, procName: ProcNameOf<Store>) => {
    const procId = makeProcId(stateId as AnyStateId, procName as string)
    const processor = processors[procId]
    if (processor === undefined) {
        throw new Error("unregisterd proc call")
    }

    await processor.proc(
        (key: any) => stateData[key],
        (data: any) => updateState<any>(processor.stateId, data)
    )
}

