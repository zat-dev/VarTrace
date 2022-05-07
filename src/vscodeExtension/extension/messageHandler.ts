import { encodeDisplayMessage, isCallMessage, isSubscribeMessage, isUpdateMessage } from "../messaging"
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
        inform(`unhandled exception occured: ${e}`)
    }
}