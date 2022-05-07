// https://github.com/type-challenges/type-challenges
type LookUp<U, K> = U extends K ? U : never

type DeepReadonly<T> = {
    readonly [P in keyof T]: (keyof T[P]) extends never ? T[P] : DeepReadonly<T[P]>
}

type Entries<T, K = keyof T> = K extends keyof T ? [K, Required<T>[K]] : never

type TupleToUnion<T extends any[]> = T[number]
type RequiredByKeys<T extends {}, K = keyof T> = Omit<Required<Pick<T, K & keyof T>> & Omit<T, K & keyof T>, never>

type Exact<T, U = T> = T extends U ? U extends T ? T : never : never

// https://stackoverflow.com/questions/41253310/typescript-retrieve-element-type-information-from-array-type
type ElemOf<ArrayType extends readonly unknown[]> =
    ArrayType extends readonly (infer Elem)[] ? Elem : never;

/* 
https://stackoverflow.com/questions/39419170/how-do-i-check-that-a-switch-block-is-exhaustive-in-typescript/52913382

exhaustive check by type. add the below code at the end of switch statement
   default:
      throw new UnreachableCaseError(message)
*/
class NeverCaseError extends Error {
    constructor(val: never) {
        super(`never case: ${JSON.stringify(val)}`);
    }
}