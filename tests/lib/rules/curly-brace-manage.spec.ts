import {ModuleTest} from "./index";
import curlyBraceManage from "../../../lib/rules/curly-brace-manage";

export default [
    "curly-brace-manage",
    curlyBraceManage,
    {
        valid: [
            {
                code:`if (1 == true) { }`,
                options: ["IfStatement", {start: 'same', end: 'same'}]
            },
            {
                code:`if (1 == true)
{ }`,
                options: ["IfStatement", {start: 'new', end: 'same'}]
            },
            {
                code:`if (1 == true)
{
}`,
                options: ["IfStatement", {start: 'new', end: 'new'}]
            },
            {
                code: 'if (1==2){};for(;;){};while(true){};try{}catch{}finally{}',
                options: [
                    "IfStatement", {start: 'same', end: 'same'},
                    "WhileStatement", {start: 'same', end: 'same'},
                    "ForStatement", {start: 'same', end: 'same'},
                    "TryStatement", {start: 'same', end: 'same'},
                    "CatchClause", {start: 'same', end: 'same'},
                ]
            },
            {
                code: `function a(first, second,
                third)
{
                    foo();
                }`,
                options: ['FunctionDeclaration', {start: 'new_for_long_declaration'}],
            },
        ],
        invalid: [
            {
                code:`if (1 == true){ }`,
                options: ["IfStatement", {start: 'new'}],
                errors: [{message: getMsg("IfStatement", true)}],
                output: `if (1 == true)
{ }`
            },
            {
                code:`if (1 == true){ }`,
                options: ["IfStatement", {end: 'new'}],
                errors: [{message: getMsg("IfStatement", true)}],
                output: `if (1 == true){ 
}`
            },
            {
                code: `if (1==2){};for(;;){};while(true){};try{}catch{}finally{}`,
                options: [
                    "IfStatement", {end: 'new', },
                    "ForStatement", {end: 'new', },
                    "WhileStatement", {end: 'new', },
                    "TryStatement", {end: 'new', },
                    "CatchClause", {end: 'new', },
                    "FinalStatement", {end: 'new', },
                ],
                errors: [
                    {message: getMsg("IfStatement", true)},
                    {message: getMsg("ForStatement", true)},
                    {message: getMsg("WhileStatement", true)},
                    {message: getMsg("BlockStatement", true)},
                    {message: getMsg("CatchClause", true)},
                    {message: getMsg("BlockStatement", true)},
                ],
                output: `if (1==2){
};for(;;){
};while(true){
};try{
}catch{
}finally{
}`
            },
            {
                code: `if (1==2){};for(;;){};while(true){};try{}catch{}finally{}`,
                options: [
                    "IfStatement", {start: "new", end: 'new', },
                    "ForStatement", {start: "new", end: 'new', },
                    "WhileStatement", {start: "new", end: 'new', },
                    "TryStatement", {start: "new", end: 'new', },
                    "CatchClause", {start: "new", end: 'new', },
                    "FinalStatement", {start: "new", end: 'new', },
                ],
                errors: [
                    {message: getMsg("IfStatement", true)},
                    {message: getMsg("IfStatement", true)},
                    {message: getMsg("ForStatement", true)},
                    {message: getMsg("ForStatement", true)},
                    {message: getMsg("WhileStatement", true)},
                    {message: getMsg("WhileStatement", true)},
                    {message: getMsg("BlockStatement", true)},
                    {message: getMsg("BlockStatement", true)},
                    {message: getMsg("CatchClause", true)},
                    {message: getMsg("CatchClause", true)},
                    {message: getMsg("BlockStatement", true)},
                    {message: getMsg("BlockStatement", true)},
                ],
                output: `if (1==2)
{
};for(;;)
{
};while(true)
{
};try
{
}catch
{
}finally
{
}`
            },
            {
                code: `const obj = {prop1: 1, prop2: true, prop3: '123', prop4: function(){}, prop5: {}}`,
                options: ["ObjectExpression", {start: "new", end: "new"}],
                errors: [
                    {message: getMsg("ObjectExpression", true)},
                    {message: getMsg("ObjectExpression", true)},
                    {message: getMsg("ObjectExpression", true)},
                    {message: getMsg("ObjectExpression", true)},
                ],
                output: `const obj = 
{prop1: 1, prop2: true, prop3: '123', prop4: function(){}, prop5: 
{
}
}`,
            },
            {
                code: `function a(first, second,
                third){
                    foo();
                }`,
                output: `function a(first, second,
                third)
{
                    foo();
                }`,
                errors: 1,
                options: ['FunctionDeclaration', {start: 'new_for_long_declaration'}],
            }
        ]
    }

] as ModuleTest;

function getMsg(txt: string, newLine: boolean): string {
    return txt + " " +(newLine ? 'requires' : 'do not need') + ' a new line for brace';
}