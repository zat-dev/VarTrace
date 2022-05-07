
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import * as React from "react";

type OneProps<T> = {
    label?: string,
    value: T,
    list: T[],
    onChange: (arg: T) => void
}

export const SelectOneList = <T extends string>(props: OneProps<T>) => {
    const { label, onChange, value, list } = props
    return <FormControl size="small" >
        {label && <InputLabel >{label}</InputLabel>}
        <Select
            label={label}
            value={value}
            onChange={({ target }) => {
                const value = target.value as T
                onChange(value)
            }}
            fullWidth
        >
            {list.map((name) => (
                <MenuItem key={name} value={name}>
                    {name}
                </MenuItem>
            ))}
        </Select>
    </FormControl>
}


type MultipleProps<T> = {
    label?: string,
    value: T[],
    list: T[],
    onChange: (arg: T[]) => void
}
export const SelectMultipleList = <T extends string>(props: MultipleProps<T>) => {
    const { onChange, value, list, label } = props
    return <FormControl size="small" >
        {label && <InputLabel >{label}</InputLabel>}
        <Select
            label={label}
            multiple
            value={value}
            onChange={({ target: { value } }) => {
                let choosed = typeof value === "string" ? value.split(",") : value
                onChange(choosed as T[])
            }}
            renderValue={() => undefined}
            fullWidth
        >
            {list.map((name) => (
                <MenuItem key={name} value={name}>
                    {name}
                </MenuItem>
            ))}
        </Select>
    </FormControl>
}