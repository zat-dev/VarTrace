import * as React from "react";
import { AnyEditableStateId, StateDataOf } from "../extension/store/state";
import { ProcNameOf, StateIdOf } from "../extension/store/store";
import { encodeCallMessage, encodeSubscribeMessage, encodeUpdateMessage, tryDecodeDisplayMessage } from "../messaging";

interface VsCode {
    postMessage(message: any): void;
    getState(): any;
    setState(state: any): void;
};

declare global {
    var vscode: VsCode
}

export const makeAccessor = <
    Store,
    Data = StateDataOf<StateIdOf<Store>>,
    EditableData = StateIdOf<Store> extends AnyEditableStateId ? StateDataOf<StateIdOf<Store>> : never,
    >(
        stateId: StateIdOf<Store>
    ) => {
    const context = React.createContext<Data | undefined>(undefined)
    const subscribe = () => {
        const [state, setState] = React.useState<Data>()
        React.useEffect(() => {
            window.addEventListener("message", (event: MessageEvent<any>) => {
                const message = event.data
                console.log(stateId, "receive")
                try {
                    const data = tryDecodeDisplayMessage<any>(stateId, message)
                    setState(data as Data)
                } catch {
                    // no nothing when this message is not a target
                }
            })
            const subscribeMessage = encodeSubscribeMessage<any>(stateId)
            vscode.postMessage(subscribeMessage)
        }, [])
        return state
    }
    const Provider: React.FC<{}> = ({ children }) => {
        const state = subscribe()
        return <context.Provider value={state}>
            {children}
        </context.Provider>
    }
    const accessor = {
        callProc: (procName: ProcNameOf<Store>) => {
            const message = encodeCallMessage<Store>(stateId, procName)
            vscode.postMessage(message)
        },
        sendEdit: (data: Partial<EditableData>) => {
            const message = encodeUpdateMessage<any>(stateId, data)
            vscode.postMessage(message)
        },
        subscribe,
        Provider,
        useData: () => {
            return React.useContext(context)
        }
    }
    return accessor
}
