export class Cache {
    cache: { [key: string]: any } = {}

    add = (key: string, data: any) => {
        this.cache[key] = data
    }
    get = (key: string) => {
        return this.cache[key]
    }
    has = (key: string) => {
        return key in this.cache
    }
}