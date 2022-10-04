import {AST, Rule} from "eslint";
import * as ESTree from "estree";
import RuleModule = Rule.RuleModule;
import Node = Rule.Node;
import Token = AST.Token;
import RuleContext = Rule.RuleContext;
import RuleFixer = Rule.RuleFixer;
import NodeParentExtension = Rule.NodeParentExtension;

const binaries = [
    '=='
    , '!='
    , '==='
    , '!=='
    , '<'
    , '<='
    , '>'
    , '>='
    , '<<'
    , '>>'
    , '>>>'
    , '+'
    , '-'
    , '*'
    , '/'
    , '%'
    , '**'
    , ','
    , '^'
    , '&'
    , '='
    , '+='
    , '-='
    , '*='
    , '/='
    , '%='
    , '**='
    , '<<='
    , '>>='
    , '>>>='
    , '|='
    , '^='
    , '&='
    , '||'
    , '&&'
    , '??'
];

const unary = [
    '-', '+', '!', '~', '--', '++', 'typeof', 'void', 'delete'
];

const keywords = ["try", 'finally', 'if', 'else', 'catch', 'async', 'while', 'do', 'switch', 'case', 'function',
    'in', 'of', 'for'];

export default {
    meta: {
        type: 'problem',
        docs: {
            description: "Customizes needed spaces for keywords, nodes and operators"
        },
        fixable: 'code',
        schema: {
            type: 'array',
            items: {
                anyOf: [
                    {
                        enum: [...new Set([...binaries, ...unary, ...keywords])],
                    },
                    {
                        type: "object",
                        properties: {
                            before: {type: "boolean"},
                            after: {type: "boolean"}
                        }
                    }
                ]
            }
        }
    },

    create
} as RuleModule;

function create(context: Rule.RuleContext): Rule.RuleListener {
    const sourceCode = context.getSourceCode();
    const result = {} as Rule.RuleListener;

    const unaryRules: [string, boolean | undefined, boolean | undefined][] = [];
    const binaryRules: [string, boolean | undefined, boolean | undefined][] = [];
    const tryRules: [string, boolean | undefined, boolean | undefined][] = [];
    const forRules: [string, boolean | undefined, boolean | undefined][] = [];
    const ifRules: [string, boolean | undefined, boolean | undefined][] = [];
    const whileRules: [string, boolean | undefined, boolean | undefined][] = [];


    for (let i = 0; i < context.options.length - 1; i += 2) {
        const {before, after} = context.options[i + 1];
        if (before === undefined && after === undefined)
            continue;

        let key: string = context.options[i];

        switch (key) {
            // START
            case 'try':
            case 'finally':
                tryRules.push([key, before, after]);
                break;
            case 'if':
            case 'else':
                ifRules.push([key, before, after]);
                break;
            case 'catch':
                result["CatchClause"] = (n: Node) => checkSpaceNearFirstToken(context, n, before, after);
                break;
            case 'async':
                result['ArrowFunctionExpression[async=true]'] = (n: Node) => checkSpaceNearFirstToken(context, n, before, after);
                result['FunctionExpression[async=true]'] = (n: Node) => checkSpaceNearFirstToken(context, n, before, after);
                break;
            case 'while':
            case 'do':
                whileRules.push([key, before, after]);
                break;
            case 'switch':
                result['SwitchStatement'] = (n: Node) => checkSpaceNearFirstToken(context, n, before, after);
                break;
            case 'function':
                result['FunctionDeclaration'] = (n: Node) => checkSpaceNearFirstToken(context, n, before, after);
                break;
            case 'case':
                result['SwitchCase'] = (n: Node) => checkSpaceNearFirstToken(context, n, before, after);
                break;

            // INSIDE
            case 'in':
            case 'of':
            case 'for':
                forRules.push([key, before, after]);
                break;
            case '=':
                result['VariableDeclarator'] = (n: Node) => checkSpaceNearTokensInsideNode(context, n, key, before, after);
                break;

            // END
        }

        if (unary.includes(key)) {
            unaryRules.push([key, before, after]);
        }
        if (binaries.includes(key)) {
            binaryRules.push([key, before, after]);
        }
    }

    if (unaryRules.length > 0) {
        result['UnaryExpression'] = checkUnaries;
    }
    if (binaryRules.length > 0) {
        result['AssignmentExpression'] = checkBinary;
        // result['AssignmentPattern'] = checkBinary;
        result['BinaryExpression'] = checkBinary;
        result['LogicalExpression'] = checkBinary;
    }
    if (tryRules.length > 0) {
        result['TryStatement'] = checkTry;
    }
    if (ifRules.length > 0) {
        result['IfStatement'] = checkIf;
    }
    if (whileRules.length > 0) {
        let whileRule = whileRules.find(x => x[0] === 'while');
        if (whileRules) {
            // @ts-ignore
            result['WhileStatement'] = n => checkSpaceNearFirstToken(context, n, whileRules[1], whileRule[2]);
        }

        result['DoWhileStatement'] = n => {
            for (let [key, before, after] of whileRules) {
                if (key === 'do')
                    checkSpaceNearFirstToken(context, n, before, after);

                if (key === 'while')
                    checkSpaceNearLastToken(context, n, before, after);
            }
        }
    }
    if (forRules.length > 0) {
        result['ForStatement'] = checkFor;
        result['ForInStatement'] = checkFor;
        result['ForOfStatement'] = checkFor;
    }

    return result;

    function checkUnaries(node: ESTree.UnaryExpression & NodeParentExtension) {
        let rule = unaryRules.find(x => x[0] === node.operator);
        if (!rule)
            return;

        const [_, before, after] = rule;
        let operatorToken = sourceCode.getFirstToken(node);
        if (!operatorToken)
            return;

        checkSpaceNearFirstToken(context, node, before, after);
    }

    function checkBinary(node: Node) {
        // @ts-ignore
        let operator = node.operator as string;
        let opt = binaryRules.find(x => x[0] === operator);
        if (!opt)
            return;

        const [_, before, after] = opt;
        checkSpaceNearTokensInsideNode(context, node, operator, before, after);
    }

    function checkTry(node: Node) {
        for (let [key, before, after] of tryRules) {
            checkSpaceNearTokensInsideNode(context, node, key, before, after);
        }
    }

    function checkIf(node: Node) {
        for (let [key, before, after] of ifRules) {
            checkSpaceNearTokensInsideNode(context, node, key, before, after);
        }
    }

    function checkFor(node: Node) {
        for (let [key, before, after] of forRules) {
            checkSpaceNearTokensInsideNode(context, node, key, before, after);
        }
    }
}

/**
 * ___FIRST-TOKEN___REST-OF-THE-NODE
 */
function checkSpaceNearFirstToken(context: RuleContext, node: Node, before: boolean | undefined, after: boolean | undefined) {
    if (before !== undefined) {
        checkNode(
            context,
            node,
            null,
            context.getSourceCode().getFirstToken(node),
            !before);
    }

    if (after !== undefined) {
        checkNode(
            context,
            node,
            context.getSourceCode().getFirstToken(node),
            null,
            !after);
    }
}

/**
 * NODE-START___TOKEN___NODE_END
 */
function checkSpaceNearTokensInsideNode(context: RuleContext, node: Node, tokenName: string, before: boolean | undefined, after: boolean | undefined) {
    let source = context.getSourceCode();
    let first = source.getFirstToken(node);
    if (first) {
        let last = source.getLastToken(node);
        if (last) {
            let tokens = source.getTokensBetween(first as Token, last as Token, token => token.value == tokenName);
            if (first.value === tokenName) {
                tokens.push(first);
            }
            if (first !== last && last.value === tokenName) {
                tokens.push(last)
            }
            if (tokens?.length > 0) {
                for (let token of tokens) {
                    if (before !== undefined) {
                        checkNode(
                            context,
                            node,
                            null,
                            token,
                            !before
                        );
                    }
                    if (after !== undefined) {
                        checkNode(
                            context,
                            node,
                            token,
                            null,
                            !after
                        );
                    }
                }

                return;
            }
        }
    }
}

/**
 * NODE-START___TOKEN___
 */
function checkSpaceNearLastToken(context: RuleContext, node: Node, before: boolean | undefined, after: boolean | undefined) {
    if (before !== undefined) {
        checkNode(
            context,
            node,
            context.getSourceCode().getLastToken(node),
            null,
            !before);
    }

    if (after !== undefined) {
        checkNode(
            context,
            node,
            context.getSourceCode().getLastToken(node),
            null,
            !after);
    }
}

function checkNode(context: RuleContext, node: Node, first: Token | null, second: Token | null, together: boolean) {
    if (!first && !second)
        return;

    let before = false;

    if (!first) {
        first = context.getSourceCode().getTokenBefore(second as Token);
    }
    if (!second) {
        second = context.getSourceCode().getTokenAfter(first as Token);
        before = false;
    }

    // did not find border tokens
    if (!first || !second)
        return;

    let fix = fixSpace(first as Token, second as Token, together);
    if (!fix)
        return;

    const message = `${together ? "Do not need" : "Need"} space ${before ? 'before' : 'after'} ` +
        (before && context.getSourceCode().getTokenBefore(first) || context.getSourceCode().getTokenAfter(second))
            ?.value;

    context.report({ node, message, fix });
    return node;
}

function fixSpace(left: Node | Token, right: Node | Token, shouldBeTogether: boolean): Rule.ReportFixer | null {
    let actuallyTogether = !spaceBetween(left, right);
    if (actuallyTogether === shouldBeTogether)
        return null;

    // can't delete space there
    if (shouldBeTogether && !canRemoveSpace(left, right))
        return null;

    return (fixer: RuleFixer) => shouldBeTogether
        // @ts-ignore
        ? fixer.removeRange([left.range[1], right.range[0]])
        // @ts-ignore
        : fixer.insertTextAfterRange(left.range, " ");
}

function spaceBetween(left: Node | Token, right: Node | Token): boolean {
    if (left.range && right.range) {
        return left.range[1] < right.range[0];
    }

    return false;
}

function canRemoveSpace(left: Node | Token, right: Node | Token): boolean {
    if (left.type === right.type) {
        if (left.type === "Keyword" || left.type === "Identifier")
            return false;
    }

    // already do not have space
    if (left.range && right.range && left.range[1] === right.range[1])
        return false;

    return true;
}
