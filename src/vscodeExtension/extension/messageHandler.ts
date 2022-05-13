import { encodeDisplayMessage, isCallMessage, isSubscribeMessage, isUpdateMessage } from "../messaging"
import { CancelByFailure, CancelByUser } from "./processors/common"
import { addSubscriber, callProc, updateState } from "./store/store"
import { inform } from "./uiWrapper/notification"

// message sender should have post method to receive reply
type MessageSender = {
    key: string,
    post: (message: any) => void,
}

export const handleMessage = (message: any, sender: MessageSender) => {
    try {
        if (isSubscribeMessage(message)) {
            const stateId = message.stateId
            const subscriber = (data: any) => {
                const message = encodeDisplayMessage<any>(stateId, data)
                sender.post(message)
            }
            addSubscriber(stateId, sender.key, subscriber)
        }
        else if (isCallMessage(message)) {
            const { stateId, procName } = message
            callProc<any>(stateId, procName)
        }
        else if (isUpdateMessage(message)) {
            const { stateId, data } = message
            updateState<any>(stateId, data)
        }
    } catch (e) {
        if (e instanceof CancelByFailure) {
            inform(`${e}`)
        }
        else if (e instanceof CancelByUser) {
            // user cancel shows nothing
        }
        else {
            inform(`unhandled exception occured: ${e}`)
        }
    }
}