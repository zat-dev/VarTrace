import { Tooltip, Link } from "@mui/material"
import * as React from "react"
import { step } from "../accessor"


export const StepLink = (props: { step: number }) => {
    return <Tooltip title={`jump to step ${props.step}`}>
        <Link
            component="button"
            variant="body2"
            underline="always"
            onClick={
                () => step.sendEdit({ step: props.step })
            }
        >
            {props.step}
        </Link>
    </Tooltip>
}
