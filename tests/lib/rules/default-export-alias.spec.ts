import {ModuleTest} from "./index";
import defaultExportsAlias from "../../../lib/rules/default-exports-alias";

const message = "Default alias for 'exports' directive";

export default [
    "default-exports-alias",
    defaultExportsAlias,
    {
        valid: [
            {
                code: 'const E = exports;',
                options: ["E"]
            },
            {
                code: 'const E = exports',
                options: ["E"]
            },
            {
                code: 'const E=exports;;',
                options: ["E"]
            },
            {
                code: 'const AAA=exports;;',
                options: ["AAA"]
            },
            {
                code: 'var a = 0',
                options: ["E"]
            },
            {
                code: `const E = exports;
                E.a = '123'`,
                options: ["E"]
            },
        ],

        invalid: [
            {
                code: 'E.c = "125";',
                options: ["E"],
                errors: [{message}],
                output: `const E = exports;
E.c = "125";`
            },

            {
                code: `
function main() {
    const E = exports;
    E.a = 1;
}`,
                options: ["E"],
                errors: [{message}],
                output: `
const E = exports;
function main() {
    const E = exports;
    E.a = 1;
}`
            },

            {
                code:
`
const A = exports;
A.num = 1;
A.b = true;
A.f = function() { };
A.o = { };
A.s = '123';
`,
                errors: [{message},{message},{message},{message},{message},{message}],
                options: ["E"],
                output:
`
const E = exports;
E.num = 1;
E.b = true;
E.f = function() { };
E.o = { };
E.s = '123';
`
            },

            {
                code:
                    `
E.num = 1;
E.b = true;
E.f = function() { };
E.o = { };
E.s = '123';
`,
                errors: [{message}],
                options: ["E"],
                output:
                    `
const E = exports;
E.num = 1;
E.b = true;
E.f = function() { };
E.o = { };
E.s = '123';
`
            },
        ]
    }
] as ModuleTest