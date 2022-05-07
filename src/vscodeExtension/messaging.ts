import { AnyEditableStateId, AnyStateId, StateDataOf } from "./extension/store/state"
import { ExposeToWebview, ProcNameOf, StateIdOf } from "./extension/store/store"

type SubscribeMessage = {
    type: "subscribe",
    stateId: AnyStateId,
}

type UpdateMessage<StateId extends AnyStateId> = {
    type: "update",
    stateId: StateId,
    data: Partial<StateDataOf<StateId>>
}
type CallMessage<Store> = {
    type: "call",
    stateId: StateIdOf<Store>,
    procName: ProcNameOf<Store>,
}

type AnyCallMessage = {
    type: "call",
    stateId: AnyStateId,
    procName: string,
}

type DisplayMessage<StateId extends AnyStateId> = {
    type: "display",
    stateId: StateId,
    data: StateDataOf<StateId>
}

export const encodeSubscribeMessage = <StateId extends AnyStateId>
    (stateId: StateId): SubscribeMessage => {
    return { type: "subscribe", stateId }
}

export const encodeUpdateMessage = <StateId extends AnyEditableStateId>
    (stateId: StateId, data: StateDataOf<StateId>)
    : UpdateMessage<StateId> => {
    return { type: "update", stateId, data }
}

export const encodeCallMessage = <Store>(stateId: StateIdOf<Store>, procName: ProcNameOf<Store>)
    : CallMessage<Store> => {
    return { type: "call", stateId, procName }
}

export const isCallMessage = (message: any): message is AnyCallMessage => {
    const assumed: Partial<CallMessage<any>> = message
    return assumed.type === "call"
        && typeof assumed.stateId === "string"
        && typeof assumed.procName === "string"
}

export const isSubscribeMessage = (message: any): message is SubscribeMessage => {
    const assumed: Partial<SubscribeMessage> = message
    return assumed.type === "subscribe"
        && typeof assumed.stateId === "string"
}

export const isUpdateMessage = (message: any): message is UpdateMessage<AnyStateId> => {
    const assumed: Partial<UpdateMessage<AnyStateId>> = message
    return assumed.type === "update"
        && typeof assumed.stateId === "string"
        && typeof assumed.data === "object"
}

export const encodeDisplayMessage = <SId extends AnyStateId>(
    stateId: SId, data: StateDataOf<SId>): DisplayMessage<SId> => {
    return { type: "display", stateId, data }
}

export const tryDecodeDisplayMessage = <SId extends AnyStateId>
    (stateId: SId, message: any): StateDataOf<SId> => {
    const assumed: Partial<DisplayMessage<SId>> = message
    const bad_conditions = [
        typeof assumed !== "object",
        assumed.type !== "display",
        assumed.stateId !== stateId,
        message.data === undefined
    ]
    if (bad_conditions.some(x => x)) {
        throw new Error(`failed to decode as ${stateId}`)
    }
    return message.data
}