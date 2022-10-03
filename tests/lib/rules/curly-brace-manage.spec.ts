import {ModuleTest} from "./index";
import curlyBraceManage from "../../../lib/rules/curly-brace-manage";

export default [
    "curly-brace-manage",
    curlyBraceManage,
    {
        valid: [
            {
                code:`if (1 == true) { }`,
                options: ["IfStatement", {start: 'same_line', end: 'same_line'}]
            },
            {
                code:`if (1 == true)
{ }`,
                options: ["IfStatement", {start: 'new_line', end: 'same_line'}]
            },
            {
                code:`if (1 == true)
{
}`,
                options: ["IfStatement", {start: 'new_line', end: 'new_line'}]
            },
            {
                code: 'if (1==2){};for(;;){};while(true){};try{}catch{}finally{}',
                options: [
                    "IfStatement", {start: 'same_line', end: 'same_line'},
                    "WhileStatement", {start: 'same_line', end: 'same_line'},
                    "ForStatement", {start: 'same_line', end: 'same_line'},
                    "TryStatement", {start: 'same_line', end: 'same_line'},
                    "CatchClause", {start: 'same_line', end: 'same_line'},
                ]
            }
        ],
        invalid: [
            {
                code:`if (1 == true){ }`,
                options: ["IfStatement", {start: 'new_line'}],
                errors: [{message: getMsg("IfStatement", true)}],
                output: `if (1 == true)
{ }`
            },
            {
                code:`if (1 == true){ }`,
                options: ["IfStatement", {end: 'new_line'}],
                errors: [{message: getMsg("IfStatement", true)}],
                output: `if (1 == true){ 
}`
            },
            {
                code: `if (1==2){};for(;;){};while(true){};try{}catch{}finally{}`,
                options: [
                    "IfStatement", {end: 'new_line', },
                    "ForStatement", {end: 'new_line', },
                    "WhileStatement", {end: 'new_line', },
                    "TryStatement", {end: 'new_line', },
                    "CatchClause", {end: 'new_line', },
                    "FinalStatement", {end: 'new_line', },
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
                    "IfStatement", {start: "new_line", end: 'new_line', },
                    "ForStatement", {start: "new_line", end: 'new_line', },
                    "WhileStatement", {start: "new_line", end: 'new_line', },
                    "TryStatement", {start: "new_line", end: 'new_line', },
                    "CatchClause", {start: "new_line", end: 'new_line', },
                    "FinalStatement", {start: "new_line", end: 'new_line', },
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
                options: ["ObjectExpression", {start: "new_line", end: "new_line"}],
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
            }
        ]
    }

] as ModuleTest;

function getMsg(txt: string, newLine: boolean): string {
    return txt + " " +(newLine ? 'requires' : 'do not need') + ' a new line for brace';
}