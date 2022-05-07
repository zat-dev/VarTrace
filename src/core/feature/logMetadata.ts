import { LogLoader, Metadata } from "../entity/logLoader"

export type Result = Metadata | undefined

export const getMetadata = async (logLoader: LogLoader): Promise<Result> => {
    return await logLoader.getMetadata()
}