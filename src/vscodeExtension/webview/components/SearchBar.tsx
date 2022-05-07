import { Search } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import * as React from "react";

type Props = {
    label?: string,
    onConfirm?: () => void,
    onChange: (text: string) => void,
    placeholder: string,
    value: string
}

export const SearchBar: React.FC<Props> = (props) => {
    const { onConfirm, placeholder, value, onChange, label } = props
    const [input, setInput] = React.useState(value)
    React.useEffect(() => {
        setInput(value)
    }, [value])
    return <>{
        <TextField
            label={label}
            variant="outlined"
            placeholder={placeholder}
            value={input}
            size="small"
            fullWidth
            onChange={event => {
                // workaround of https://github.com/mui/material-ui/issues/4430
                setInput(event.target.value)
                onChange(event.target.value)
            }}
            onKeyDown={event => {
                // note: https://qiita.com/ledsun/items/31e43a97413dd3c8e38e
                if (event.keyCode === 13) {
                    onConfirm && onConfirm()
                }
            }}
            InputProps={{
                endAdornment: (
                    onConfirm && <InputAdornment position="end" >
                        <IconButton
                            size="small"
                            onClick={() => {
                                onConfirm()
                            }}>
                            {<Search fontSize="inherit" />}
                        </IconButton>
                    </InputAdornment>
                ),
                style: { paddingRight: 0 }
            }}
        />}</>
}