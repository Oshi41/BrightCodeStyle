import {Rule} from "eslint";
import RuleModule = Rule.RuleModule;
import RuleListener = Rule.RuleListener;
import RuleContext = Rule.RuleContext;
import NodeParentExtension = Rule.NodeParentExtension;
import * as ESTree from "estree";
import CodePath = Rule.CodePath;
import Node = Rule.Node;

export default {
    meta: {
        type: "problem",
        fixable: "code",
        docs: {
            description: "Creates alias for 'exports' directive on top of the file"
        },
        schema: [{
            type: "string",
            default: "E"
        }]
    },
    create: checkRule
} as RuleModule;

function checkRule(context: RuleContext): RuleListener {
    let anyExport = false;
    let alreadyExisted = false;
    const alias = context.options[0] as string ?? "E";
    const exportsName = "exports";
    let message = `Default alias for '${exportsName}' directive`;

    return {
        AssignmentExpression: checkAssigment,
        VariableDeclaration: checkVariableDeclaration,
        ExportNamedDeclaration: node =>  anyExport = true,
        onCodePathEnd
    }

    /**
     * Checking wherever we export something like
     * E.Smth = smth
     * @param node
     */
    function checkAssigment(node: ESTree.AssignmentExpression & NodeParentExtension) {
        if (node.left.type === "MemberExpression" && node.left.object.type === "Identifier"
            && node.left.object.name === alias){
            anyExport = true;
        }
    }

    /**
     * Checks if we already have correct import
     * @param node
     */
    function checkVariableDeclaration(node: ESTree.VariableDeclaration & NodeParentExtension) {
        if (node.parent.type !== "Program")
            return;

        if (node.kind !== "const" || node.declarations.length !== 1)
            return;

        let first = node.declarations[0];
        if (first.init?.type !== "Identifier" || first.init.name !== exportsName || first.id.type !== "Identifier")
            return;

        if (first.id.name !== alias) {
            let oldName = first.id.name;
            // need to refractor other alias to needed one
            context.report({
                node: first.id,
                message,
                fix: fixer => fixer.replaceText(first.id, alias)
            });

            context.getSourceCode().ast.body
                .filter(x => x.type == "ExpressionStatement"
                    && x.expression.type === 'AssignmentExpression'
                    && x.expression.left.type === "MemberExpression"
                    && x.expression.left.object.type === "Identifier"
                    && x.expression.left.object.name === oldName)
                // @ts-ignore
                .map(x => x.expression.left.object as ESTree.Expression)
                .forEach(node => context.report({
                    node,
                    message,
                    fix: fixer => fixer.replaceText(node, alias)
                }));
        }

        alreadyExisted = true;
    }

    /**
     * Adding export alias at file start
     * @param codePath
     * @param node
     */
    function onCodePathEnd(codePath: CodePath, node: Node): void {
        if (codePath.upper !== null || node.type !== "Program" || node.body.length < 1 || !anyExport || alreadyExisted)
            return;

        context.report({
            node: node.body[0],
            message,
            fix: fixer => {
                return fixer.insertTextBefore(node.body[0], `const ${alias} = ${exportsName};\n`);
            }
        });
    }
}