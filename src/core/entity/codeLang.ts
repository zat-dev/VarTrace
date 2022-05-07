import { Value } from "./value";

export interface CodeLang {
    deserialize: (raw: string) => Value
}