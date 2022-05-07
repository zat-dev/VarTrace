
export type StateDef<Data, UserEditable, Depends> =
    Data extends Array<any> ? never
    :
    UserEditable extends boolean ?
    {
        init: Data,
        userEditable: UserEditable,
        depends: Depends[]
    } : never

export type StateId<Domain extends string, Name extends string, Data, UserEditable, Depends> =
    Domain extends `${infer _Prefix}/${infer _Suffix}` ? never :
    Name extends `${infer _Prefix}/${infer _Suffix}` ? never :
    `${Domain}/${Name}` & Partial<{
        domain: Domain,
        name: Name,
        data: Data,
        userEditable: UserEditable,
        stateKey: true,
        depends: Depends
    }>

export type StateGetter<Depends> = <StateId extends Depends>(key: StateId) =>
    StateDataOf<StateId>

export type StateGetterOf<S> =
    S extends StateId<infer _D, infer _N, infer _Da, infer _E, infer Depends> ?
    StateGetter<Depends | S> : never

export type StateDataOf<S> =
    S extends StateId<infer _D, infer _N, infer Data, infer _E, infer _De> ?
    Data : never

export type AnyEditableStateId = StateId<string, string, any, true, any>

export type AnyStateId = StateId<string, string, any, any, any>

export const makeStateId = <Domain extends string, Name extends string, Data, UserEditable, Depends>(
    domain: Domain, name: Name, def: StateDef<Data, UserEditable, Depends>) => {
    return `${domain}/${name}` as StateId<Domain, Name, Data, UserEditable, Depends>
}
