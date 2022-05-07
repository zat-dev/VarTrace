export type Annotation = "new" | "changed"


export type Container<T, D> = {
    dataType: T,
    id: number
    typeName: string
    data: D,
    annotation: Annotation[]  // used by analysis before/after dump
}

export type ListContainer = Container<"list", Val[]>
export type SetContainer = Container<"set", Val[]>
export type DictContainer = Container<"dict", { [key: string]: Val }>

export type ContainerVal =
    | ListContainer
    | SetContainer
    | DictContainer

export type Primitive = null | number | string | boolean

export type Val =
    | Primitive
    | ContainerVal
    | Reference
    | Ignored
    | Escaped

export type Ignored = {
    dataType: "ignored"
    typeName: string,
    reason: string,
    annotation: Annotation[]  // used by analysis before/after dump
}
export type Reference = {
    dataType: "reference"
    id: number,
    annotation: Annotation[]  // used by analysis before/after dump
}

export type EscapedData = "inf" | "-inf" | "nan" | "undef" | string

export type Escaped = {
    dataType: "escaped"
    typeName: string
    data: EscapedData,
    annotation: Annotation[]  // used by analysis before/after dump
}



export const isPrimitive = (val: Val): val is Primitive => {
    if (val === null) {
        return true
    }
    return ["number", "boolean", "string"].includes(typeof val)
}

export const isContainer = (val: Val): val is ContainerVal => {
    if (isPrimitive(val)) {
        return false
    }
    return ["list", "dict", "set"].includes(val.dataType)
}
export const isIgnored = (val: Val): val is Ignored => {
    if (isPrimitive(val)) {
        return false
    }
    if (isContainer(val)) {
        return false
    }
    return val.dataType === "ignored"
}