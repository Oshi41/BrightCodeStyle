import {ModuleTest} from "./index";
import spacingManage from "../../../lib/rules/spacing-manage";

const spaceMsg = 'Need space here';
const noSpaceMsg = 'Do not need space here';

export default [
    "spacing-manage",
    spacingManage,
    {
        valid: [
            {
                code: `const a=1; const b=4;`,
                options: ['=', {before: false, after: false}]
            },
            {
                code: `const a =1; const b =4;`,
                options: ['=', {before: true, after: false}]
            },
            {
                code: `const a = 1; const b = 4;`,
                options: ['=', {before: true, after: true}]
            }
        ],
        invalid: [
            {
                code: 'const a=1; const b=4;',
                options: ['=', {before: true, after: true}],
                errors: 4,
                output: 'const a = 1; const b = 4;'
            },
            {
                code: 'const a=1; const b=4;',
                options: ['=', {after: true}],
                errors: 2,
                output: 'const a= 1; const b= 4;'
            },
            {
                code: 'const a=1; const b=4;',
                options: ['=', {before: true}],
                errors: 2,
                output: 'const a =1; const b =4;'
            },
            {
                code: 'const a = 1; const b = 4;',
                options: ['=', {after: false, before: false}],
                errors: 4,
                output: 'const a=1; const b=4;'
            },
            {
                code: 'const a = 1; const b = 4;',
                options: ['=', {before: false}],
                errors: 2,
                output: 'const a= 1; const b= 4;'
            },
            {
                code: 'const a = 1; const b = 4;',
                options: ['=', {after: false}],
                errors: 2,
                output: 'const a =1; const b =4;'
            },
            {
                code: "if (true && false && 1 != 2) {}",
                options: ['&&', {before: false, after: false}],
                errors: 6,
                output: 'if (true&&false&&1 != 2) {}'
            },
            {
                code: "if ('1' < 2 || '1' > 2 && 5 == 4 || 5 === 5 && 5 !== 8 || 6 != {}) {}",
                options: [
                    '<', {before: false, after: false},
                    '>', {before: false, after: false},
                    '||', {before: false, after: false},
                    '&&', {before: false, after: false},
                    '==', {before: false, after: false},
                    '===', {before: false, after: false},
                    '!==', {before: false, after: false},
                    '!=', {before: false, after: false},
                ],
                errors: 28,
                output: "if ('1'<2||'1'>2&&5==4||5===5&&5!==8||6!={}) {}"
            },
            {
                code: `try{}catch{}finally{}`,
                options: [
                    'try', {before: true, after: true},
                    'catch', {before: true, after: true},
                    'finally', {before: true, after: true},
                ],
                errors: 5,
                output: 'try {} catch {} finally {}'
            },
            {
                code: "const t=typeof(12);delete(t.log);try{}catch{}finally{}; void[];",
                options: [
                    'typeof', {before: true, after: true},
                    'delete', {before: true, after: true},
                    'try', {before: true, after: true},
                    'catch', {before: true, after: true},
                    'finally', {before: true, after: true},
                    'void', {before: true, after: true},
                ],
                errors: 11,
                output: "const t= typeof (12); delete (t.log); try {} catch {} finally {}; void [];"
            },
            {
                code: `const a=2;if(a===2){}else if(false){}`,
                output: `const a=2; if (a===2){} else if (false){}`,
                options: [
                    "if", {before: true, after: true},
                    "else", {before: true, after: true},
                ],
                errors: 5
            },

            {
                code: `async function a(){}; const b =async()=>{};`,
                output: `async function a(){}; const b = async ()=>{};`,
                options: [
                    "async", {before: true, after: true}
                ],
                errors: 2
            },
            {
                code: `switch('123'){case '123':}`,
                output: `switch ('123'){ case '123':}`,
                options: [
                    "switch", {before: true, after: true},
                    "case", {before: true, after: true},
                ],
                errors: 2
            },
            {
                code: `for(let a in(array)){};for(let a of(array)){}`,
                output: `for (let a in (array)){}; for (let a of (array)){}`,
                options: [
                    'for', {before: true, after: true},
                    'in', {before: true, after: true},
                    'of', {before: true, after: true},
                ],
                errors: 5
            },
        ]
    }
] as ModuleTest;