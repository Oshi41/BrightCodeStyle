import {AST, Rule} from "eslint";
import RuleModule = Rule.RuleModule;
import * as ESTree from "estree";

export default {
    meta: {
        type: 'problem',
        fixable: 'code',
        docs: {
            description: 'Checks for null, undefined and 0 by only one method',
        },
        schema: [{
            type: 'object',
            properties: {
                zeroEq: {type: "boolean", default: true},
                strictZeroEq: {type: "boolean", default: true},

                nullEq: {type: "boolean", default: false},
                strictNullEq: {type: "boolean", default: false},

                undefEq: {type: "boolean", default: false},
                strictUndefEq: {type: "boolean", default: false},
            }
        }],

    },
    create
} as RuleModule;

function create(context: Rule.RuleContext): Rule.RuleListener {
    const {
        zeroEq,
        strictZeroEq,

        nullEq,
        strictNullEq,

        undefEq,
        strictUndefEq,
    } = context.options[0];

    return {
        BinaryExpression: checkLogical
    };

    function checkLogical(node: ESTree.BinaryExpression) {
        if (!['==', '===', '!=', '!=='].includes(node.operator))
            return;

        let left = node.left;
        let right = node.right;
        let strict = node.operator.length === 3;
        let literal = (left.type === "Literal" && left) || (right.type === "Literal" && right);
        let undef = left.type === "Identifier" && left.name == 'undefined' && left
            || right.type === "Identifier" && right.name == 'undefined' && right;

        let expressionToShow = null;

        if ((strict && strictUndefEq && undef)
            || (!strict && undefEq && undef)) {
            expressionToShow = undef === right ? left : right;
        }

        if ((strict && strictZeroEq && literal && literal.value === 0)
            || (!strict && zeroEq && literal && literal.value === 0)
            || (strict && strictNullEq && literal && literal.value === null)
            || (!strict && nullEq && literal && literal.value === null)) {
            expressionToShow = literal === right ? left : right;
        }

        if (!expressionToShow)
            return;

        let text = `${node.operator.includes('!') ? '': '!'}${context.getSourceCode().getText(expressionToShow)}`;
        context.report({
            node,
            message: "Use '!' instead for null checks",
            fix: fixer => fixer.replaceText(node, text)
        });
    }
}