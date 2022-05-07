import { LogLoader } from "../entity/logLoader"

export const getFiles = async (logLoader: LogLoader) => {
    return await logLoader.getFiles()
}

// windows is case insensitive but linux is sensitive.
// currently fallback case insensitive if no case sensitive match
// TODO: save platform info into dump log and desice by it.  
export const normalizePathByLog = async (targetAbsPath: string, logLoader: LogLoader): Promise<string | undefined> => {
    const files = await (await logLoader.getFiles()).map(x => x.absPath)
    if (files.includes(targetAbsPath)) {
        return targetAbsPath
    }
    const lowerTarget = targetAbsPath.toLowerCase()
    for (const file of files) {
        if (file.toLowerCase() === lowerTarget) {
            return file
        }
    }
    return undefined
}