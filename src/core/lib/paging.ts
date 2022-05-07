export type Paging<T> = {
    page: number,
    maxPage: number,
    contents: T[]
}

export const paging = <T>(array: T[], page: number, pageSize: number): Paging<T> => {
    const maxLen = array.length
    const maxPage = Math.ceil(maxLen / pageSize)
    return {
        maxPage,
        page,
        contents: array.slice(pageSize * (page - 1), pageSize * page)
    }
}