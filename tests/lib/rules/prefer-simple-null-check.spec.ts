import {ModuleTest} from "./index";
import preferSimpleNullCheck from "../../../lib/rules/prefer-simple-null-check";

const defaultOpts = [{
        zeroEq: true,
        strictZeroEq: true,

        nullEq: true,
        strictNullEq: true,

        undefEq: true,
        strictUndefEq: true,
}];
const message = "Use '!' instead for null checks";

export default [
    'prefer-simple-null-check',
    preferSimpleNullCheck,
    {
        valid: [
            {
                code: 'const a = !log; if(!a){}; const b = a; if(a){};',
                options: defaultOpts
            }
        ],
        invalid: [
            {
                code: `let a = log != undefined`,
                output: `let a = log`,
                options: defaultOpts,
                errors: [{message}]
            },
            {
                code: `let a = log != null`,
                output: `let a = log`,
                options: defaultOpts,
                errors: [{message}]
            },
            {
                code: `let a = log != 0`,
                output: `let a = log`,
                options: defaultOpts,
                errors: [{message}]
            },
            {
                code: `let a = log!=0 && log!= 0.0 && log!==0 && log!==0.0 && log!=null && log!==null && log!=undefined && log !== undefined`,
                output: `let a = log && log && log && log && log && log && log && log`,
                options: defaultOpts,
                errors: Array(8).fill({message})
            },
            {
                code: `let a = log==0 && log== 0.0 && log===0 && log===0.0 && log==null && log===null && log==undefined && log === undefined`,
                output: `let a = !log && !log && !log && !log && !log && !log && !log && !log`,
                options: defaultOpts,
                errors: Array(8).fill({message})
            },
        ]
    }

] as ModuleTest;