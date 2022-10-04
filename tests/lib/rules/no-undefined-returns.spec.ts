import {ModuleTest} from "./index";
import noUndefinedReturn from "../../../lib/rules/no-undefined-return";

export default [
    'no-undefined-return',
    noUndefinedReturn,
    {
        valid: [

        ],
        invalid: [
            {
                code: 'function a(){return undefined; return (undefined); return ((((((undefined))))));}',
                output: `function a(){return; return; return;}`,
                options: [],
                errors: 3
            }
        ]
    }
] as ModuleTest;