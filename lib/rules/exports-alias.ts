import {Rule} from "eslint";
import RuleModule = Rule.RuleModule;
import RuleContext = Rule.RuleContext;
import RuleListener = Rule.RuleListener;
import * as ESTree from "estree";
import RuleFixer = Rule.RuleFixer;
import Fix = Rule.Fix;
import {
    ExportSpecifier,
    Property
} from "estree";
import NodeParentExtension = Rule.NodeParentExtension;



export default {
    meta: {
        type: "problem",
        fixable: "code",
        docs: {
            description: "Use special alias for 'exports' directive"
        },
        schema: [{
            type: "string",
            default: "E"
        }]
    },
    create: checkRule
} as RuleModule;

function checkRule(context: RuleContext): RuleListener {
    const sourceCode = context.getSourceCode();
    const alias = context.options[0] as string ?? "E";
    const exportsName = "exports";
    const moduleName = "module";
    const message = `Use should use '${alias}' alias for '${exportsName}' directive`;

    return {
        AssignmentExpression: checkAssignmentExpression,
        ExportNamedDeclaration : checkExportDeclaration,
        VariableDeclaration: checkVariableDeclaration,
    }

    /**
     * exports = {...}  -->
     * E.bar = foo;
     * E.bar2 = foo2;
     *
     * module.exports = {...} -->
     * E.bar = foo;
     * E.bar2 = foo2;
     * @param node
     */
    function checkAssignmentExpression(node: ESTree.AssignmentExpression & NodeParentExtension) {
        if (node.operator !== "=")
            return;

        // wrong
        // exports = {...}
        if (node.left.type === "Identifier" && node.left.name === exportsName) {
            context.report({
                message: message,
                node: node.left,
                fix
            });
        }

        // wrong
        // module.exports = {...}
        if (node.left.type === "MemberExpression"
            && node.left.object.type === "Identifier"
            && node.left.object.name === moduleName
            && node.left.property.type === "Identifier"
            && node.left.property.name === exportsName) {
            context.report({
                node: node.right,
                message,
                fix
            });
        }

        function fix(fixer: RuleFixer): Fix | null {
            if (node.right.type === "Identifier")
                return (fixer.replaceText(node.right, alias));

            if (node.right.type === "ObjectExpression") {
                let text = node.right.properties
                    .filter(x => x.type === "Property")
                    .map(x => x as Property)
                    .map(x => `${alias}.${sourceCode.getText(x.key)} = ${sourceCode.getText(x.value)};`)
                    .join("\n");

                return (fixer.replaceText(node, text));
            }

            return null;
        }
    }

    /**
     * fix
     * export {...} -->
     * E.bar = foo;
     * E.bar2 = foo2
     * @param node
     */
    function checkExportDeclaration(node: ESTree.ExportNamedDeclaration & NodeParentExtension) {
        context.report({
            node: node,
            message,
            fix: fixer => {
                let exports = node.specifiers
                    .map((x: ExportSpecifier) => `${alias}.${sourceCode.getText(x.exported)} = ${sourceCode.getText(x.local)};`)
                    .join("\n");


                return (fixer.replaceText(node, exports));
            }
        });
    }

    /**
     * fix
     * [var|let] E = exports --> const E = exports;
     * const WRONG_NAME = exports --> const E = exports;
     *
     * Here: looking for correct export name
     * const E = exports;
     * @param node
     */
    function checkVariableDeclaration(node: ESTree.VariableDeclaration & NodeParentExtension) {
        if (node.declarations?.length !== 1)
            return;

        const {id, init} = node.declarations[0];
        if (init?.type !== "Identifier" || init.name !== exportsName || id.type !== "Identifier")
            return;

        // wrongs
        // [let|var] E = exports;
        // const WRONG_NAME = exports;
        if (id.name !== alias || node.kind !== 'const') {
            context.report({
                node,
                message,
                fix:fixer => (fixer.replaceText(node, `const ${alias} = ${sourceCode.getText(init)};`))
            });
        }
    }
}