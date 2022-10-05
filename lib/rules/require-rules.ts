import {Rule} from "eslint";
import * as ESTree from "estree";
import {Expression, SpreadElement} from "estree";
import {dirname, extname, isAbsolute, resolve} from 'path';
import {readdirSync} from 'fs';
import RuleModule = Rule.RuleModule;

export default {
    meta: {
        type: "problem",
        fixable: 'code',
        docs: {
            description: 'Code style and fixes for "require" directive'
        },
        schema: {
            type: 'object',
            properties: {
                addExtToLocal: {
                    type: "boolean",
                    default: true
                },
                noAbsolute: {
                    type: "boolean",
                    default: true
                },
                topFileDef: {
                    type: "boolean",
                    default: true
                },
                fixNames: {
                    type: 'object',
                    properties: {
                        replacePatterns: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    restricted: {
                                        type: 'array',
                                        items: {type: 'string'}
                                    },
                                    startsWith: {
                                        type: 'array',
                                        items: {type: 'string'}
                                    },
                                    endsWith: {
                                        type: 'array',
                                        items: {type: 'string'}
                                    },
                                    to: {type: 'string'}
                                },
                            }
                        },
                        prefixes: {
                            type: "array",
                            items: {
                                type: 'object',
                                properties: {
                                    prefix: {type: "string"},
                                    folderMatch: {type: "string"}
                                }
                            }
                        },
                        specialNames: {
                            type: 'array',
                            items: {type: 'string'},
                        }
                    },
                    default: {
                        replacePatterns: [
                            {
                                startsWith: ['node-'],
                                endsWith: ['-js'],
                                to: ''
                            },
                            {
                                restricted: ['-', '/'],
                                to: '_'
                            }
                        ],
                        prefixes: [
                            {
                                prefix: 'z',
                                folderMatch: '/pkg/util',
                            }
                        ],
                        specialNames: ['jquery', '$', 'underscore', '_'],
                    }
                }
            }
        }
    },
    create
} as RuleModule

function create(context: Rule.RuleContext): Rule.RuleListener {
    const {addExtToLocal, noAbsolute, topFileDef, fixNames} = context.options[0];
    let sourceCode = context.getSourceCode();
    const filesMap = new Map<string, string[]>();

    return {
        CallExpression: checkCallExpression
    };

    function checkCallExpression(node: ESTree.CallExpression & Rule.NodeParentExtension) {
        if (node.callee.type !== 'Identifier' || node.callee.name !== 'require')
            return;

        // require at top
        if (topFileDef && node.parent?.type !== 'Program') {
            removeToTop(context, node);
        }

        if (node.arguments.length !== 1)
            return;

        // importing file name
        let pkgName = getVarString(context, node.arguments[0])?.trim();
        // currently checking the whole file
        let isAbsPathToLintFile = isAbsolute(context.getPhysicalFilename());
        let absLintFilePath = isAbsPathToLintFile && resolve(context.getPhysicalFilename());
        let isLocalPackage = !!pkgName?.startsWith('.');

        // localname should end with extension
        if (addExtToLocal && pkgName && isLocalPackage && !extname(pkgName) && isAbsPathToLintFile) {
            let err: Rule.ReportDescriptor = {
                node,
                message: 'Add file extension to local imports'
            };
            // @ts-ignore
            let dir = dirname(absLintFilePath);
            // @ts-ignore
            let file = absLintFilePath.replace(dir, "");
            let possibleFiles = readDir(dir).filter(x => x.startsWith(file));
            if (possibleFiles.length === 1) {
                err.fix = fixer => fixer.replaceText(node.arguments[0], pkgName + extname(possibleFiles[0]));
            }
            context.report(err);
        }

        // absolute package = only pkg name
        if (noAbsolute && pkgName && isAbsolute(pkgName) && process.env.NODE_PATH) {
            const reqPathResolved = resolve(pkgName);
            const nodePathResolved = resolve(process.env.NODE_PATH);

            // looking at global package
            if (reqPathResolved.startsWith(nodePathResolved)) {
                // remove dir path
                let pkgName = reqPathResolved.replace(nodePathResolved, '');
                let possibleExtension = extname(pkgName);
                // remove extension
                if (possibleExtension) {
                    pkgName = pkgName.replace(possibleExtension, "");
                }

                context.report({
                    node,
                    message: 'Global packages should be the package name only',
                    fix: fixer => fixer.replaceText(node.arguments[0], pkgName)
                });
            }
        }

        // name checking
        if (pkgName && fixNames) {
            const {specialNames, prefixes, replacePatterns} = fixNames;
            let opts = findRequireVarName(context, node);
            if (opts) {
                let [idNode, varName] = opts;
                const originalVarName = varName;
                let index = -1;
                let txt = '';

                // special name handling
                if (specialNames.length > 0 && (index = specialNames.indexOf(pkgName)) >= 0
                    && index + 1 < specialNames.length && varName !== specialNames[index + 1]) {
                    txt = specialNames[index + 1];
                } else {
                    let absLibName = resolve(absLintFilePath as string, pkgName);

                    if (prefixes.length > 0 && isAbsPathToLintFile && isLocalPackage) {
                        for (let {prefix, folderMatch} of prefixes) {
                            // adding prefix
                            if (absLibName.match(folderMatch)) {
                                txt = prefix + varName;
                                break;
                            }
                        }
                    }

                    if (replacePatterns.length > 0) {
                        for (let {startsWith, restricted, endsWith, to} of replacePatterns) {
                            if (startsWith?.length > 0) {
                                for (let startsWithElement of startsWith) {
                                    if (varName.startsWith(startsWithElement)){
                                        varName = to + varName.slice(startsWithElement.length);
                                    }
                                }

                                for (let endsWithElement of endsWith) {
                                    if (varName.endsWith(endsWithElement)){
                                        varName = varName.slice(0, -endsWithElement.length) + to;
                                    }
                                }

                                for (let str of restricted) {
                                    varName = varName.replace(str, to);
                                }
                            }
                        }
                    }
                }

                if (originalVarName !== varName) {
                    context.report({
                       node: idNode,
                       message: `Require variable name does not match code style ('${originalVarName}' ==> '${varName}')`,
                       fix: fixer => fixer.replaceText(idNode, varName)
                    });
                }
            }
        }
    }

    /**
     * safe file loading
     */
    function readDir(directory: string): string[] {
        directory = resolve(directory);

        if (!filesMap.has(directory)) {
            try {
                filesMap.set(directory, readdirSync(directory));
            } catch (e) {
                console.log(e);
                filesMap.set(directory, []);
            }
        }

        return filesMap.get(directory) as string[];
    }
}

/**
 * Replacing 'require' on file top
 */
function removeToTop(context: Rule.RuleContext, node: ESTree.CallExpression & Rule.NodeParentExtension) {

}

/**
 * Gets string value from node
 */
function getVarString(context: Rule.RuleContext, elem: Expression | SpreadElement): string | undefined {
    switch (elem.type) {
        case "Literal":
            return String(elem.value);

        case "Identifier":
            let variables = context.getDeclaredVariables(elem).filter(x => x.name === elem.name);
            if (variables.length < 1)
                return elem.name;

            let variable = variables[variables.length - 1];
            if (variable.defs.length < 1)
                return elem.name;

        default:
            return undefined;
    }
}

/**
 * Searches for 'require' varibale name
 * const A = require('123') --> [Identifier, 'A']
 * require('123') --> undefined
 */
function findRequireVarName(ctx: Rule.RuleContext, node: Rule.Node): [ESTree.Node, string] | undefined {
    if (node.type === 'VariableDeclarator') {
        return [node.id, ctx.getSourceCode().getText(node.id)];
    }

    if (node.type === 'AssignmentExpression') {
        return [node.left, ctx.getSourceCode().getText(node.left)];
    }

    if (node.parent) {
        return findRequireVarName(ctx, node.parent);
    }

    return undefined;
}
