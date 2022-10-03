import exportsAlias from "../../../lib/rules/exports-alias";
import {ModuleTest} from "./index";

const default_msg = "Use should use 'E' alias for 'exports' directive";

export default [
    'export-alias',
    exportsAlias,
    {
        valid: [
            {
                code: `const E = exports`,
                options: ["E"]
            },
            {
                code: `const F = exports;`,
                options: ["F"]
            },
            {
                code: `const Long = exports;`,
                options: ["Long"],
            },
            {
                code: `const E = exports;            
E.number = 4;
E.str = '123';
E.func = function () { };
E.obj = {};
E.b = true;`,
                options: ["E"]
            },
        ],

        invalid: [
            {
                code: `const A = exports;`,
                options: ["E"],
                errors: [{message: default_msg}],
                output: "const E = exports;"
            },
            {
                code: `exports = { a: 1, b: true, c: function() { }, d: '123', e: {}}`,
                options: ["E"],
                errors: [{message: default_msg}],
                output: `E.a = 1;
E.b = true;
E.c = function() { };
E.d = '123';
E.e = {};`
            },
            {
                code: `const num = 1;
const b = true;
const f = function() { };
const o = {};
export {num, b, f, o }`,
                options: ["E"],
                errors: [{message: default_msg}],
                output: `const num = 1;
const b = true;
const f = function() { };
const o = {};
E.num = num;
E.b = b;
E.f = f;
E.o = o;`
            },
        ],
    }
] as ModuleTest;