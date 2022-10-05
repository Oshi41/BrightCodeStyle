import {AST, Rule} from "eslint";
import RuleModule = Rule.RuleModule;
import RuleContext = Rule.RuleContext;
import RuleListener = Rule.RuleListener;
import CodePathSegment = Rule.CodePathSegment;
import Node = Rule.Node;
import Token = AST.Token;
import SourceLocation = AST.SourceLocation;
import Range = AST.Range;

const LogicsString = ['new', 'same', 'new_for_long_declaration'];
type Logics = typeof LogicsString[number];

export default {
    meta: {
        type: "problem",
        fixable: 'code',
        docs: {
            description: "Managing brackets style for different nodes"
        },
        schema: {
            type: 'array',
            items: {
                anyOf: [
                    {type: 'string'},
                    {
                        type: 'object',
                        properties: {
                            start: {
                                oneOf: [{enum: LogicsString}],
                            },
                            end: {
                                oneOf: [{enum: LogicsString.slice(0, 2)}],
                            },

                        }
                    }
                ]
            }
        },
    },
    create
} as RuleModule;


function create(context: RuleContext): RuleListener {
    const sourceCode = context.getSourceCode();
    let options = context.options;

    return {
        ClassBody: visitNode,
        BlockStatement: visitNode,
        ObjectExpression: visitNode,
        ExportNamedDeclaration: visitNode,
    };

    function visitNode(node: Node): void {
        if (!isCurly(node))
            return;

        const {node: actualNode, start, end} = findOption(node, options) ?? {};
        if (!actualNode)
            return;

        if (start) {
            let curlyStart = sourceCode.getFirstToken(actualNode, isCurlyBraces);
            if (curlyStart) {
                checkBraces(actualNode,
                    sourceCode.getTokenBefore(curlyStart),
                    curlyStart,
                    start,
                    context);
            }
        }

        if (end) {
            let curlyEnd = sourceCode.getLastToken(actualNode, isCurlyBraces);
            if (curlyEnd) {
                checkBraces(actualNode,
                    sourceCode.getTokenBefore(curlyEnd),
                    curlyEnd,
                    end,
                    context);
            }
        }
    }
}

/**
 * this node type may contain curly brace
 */
export function isCurly(node: Node): boolean {
    switch (node.type) {
        case "ClassBody":
        case "BlockStatement":
        case "ObjectExpression":
        case "ExportNamedDeclaration":
            return true;

        default:
            return false;
    }
}

function isCurlyBraces(token: Token): boolean {
    let v = token.value;
    return v === '{' || v === '}';
}

function checkBraces(node: Node, start: Token | null, end: Token | null, sameLine: Logics, context: RuleContext): void {
    if (!node || !start || !end)
        return;

    let actuallySameLine = start.loc.start.line === end.loc.start.line;
    switch (sameLine) {
        case 'new_for_long_declaration':
            // obtaining very first token of node declaration
            let firstsNodeToken = context.getSourceCode().getFirstToken(node);
            if (!firstsNodeToken)
                return;

            // single line declaration
            if (firstsNodeToken.loc.start.line === start.loc.start.line) {
                // should be on the same line
                if (actuallySameLine)
                    return;
            } else {
                //should be on new line
                if (!actuallySameLine)
                    return;
            }

            break;

        case 'new':
            if (!actuallySameLine)
                return;

            break;

        case 'same':
            if (actuallySameLine)
                return;

            break;
    }

    context.report({
        node,
        message: `${node.type} ${sameLine === 'same' ? 'do not need' : 'requires'} a new line for brace`,
        fix: fixer => sameLine === 'same'
            ? fixer.replaceTextRange([start.range[1], end.range[0]], " ")
            : fixer.insertTextBeforeRange(end.range, "\n")
    });
}

/**
 * Selecting correct node for rule checking
 */
function findOption(node: Node, opts: any[]): {node: Node, start: Logics | null, end: Logics | null} | null {
    if (!node)
        return null;

    let nodeType = node.type;
    const parent = node.parent;

    // special case - block used by many statements
    if (nodeType === "BlockStatement") {
        // special case - finalizer
        if (parent.type === "TryStatement") {
            // @ts-ignore
            nodeType = parent.finalizer === node
                ? "FinalStatement"
                : parent.type;
        } else {
            let findForParent = findOption(node.parent, opts);
            if (findForParent)
                return findForParent;
        }
    }

    let index = opts.indexOf(nodeType);
    if (index < 0 || index + 1 >= opts.length)
        return  null;

    return {
        ... opts[index + 1],
        node,
    };
}