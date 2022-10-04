import { Rule} from "eslint";
import RuleModule = Rule.RuleModule;
import * as ESTree from "estree";

export default {
    meta: {
        type: 'problem',
        fixable: 'code',
        docs: {
            description: 'Do not return undefined!'
        },
    },
    create,
} as RuleModule;

function create(context: Rule.RuleContext): Rule.RuleListener {


    return {
        ReturnStatement: checkReturn
    }


    function checkReturn(node: ESTree.ReturnStatement) {
        if (node.argument?.type === 'Identifier'
            && node.argument.name === 'undefined') {
            context.report({
                node,
                message: 'Do not return "undefined" statement',
                fix: fixer => fixer.replaceText(node, 'return;')
            })
        }
    }
}