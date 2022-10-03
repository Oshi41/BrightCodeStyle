import {Rule, RuleTester} from "eslint";
import exportsAlias from "./export-alias.spec";
import defaultExportAliasSpec from "./default-export-alias.spec";
import curlyBraceManageSpec from "./curly-brace-manage.spec";
import spacingManageSpec from "./spacing-manage.spec";
import preferSimpleNullCheckSpec from "./prefer-simple-null-check.spec";

const tester = new RuleTester({
    parserOptions: {
        ecmaFeatures: { globalReturn: false },
        ecmaVersion: 2019,
        sourceType: "module",
    }
});

export type ModuleTest = [
    string,
    Rule.RuleModule,
    {
        valid?: Array<string | RuleTester.ValidTestCase> | undefined;
        invalid?: RuleTester.InvalidTestCase[] | undefined;
    }
]

const testArray: ModuleTest[] = [ exportsAlias, defaultExportAliasSpec, curlyBraceManageSpec, spacingManageSpec,
    preferSimpleNullCheckSpec];

for (let [text, rule, opts] of testArray) {
    tester.run(text, rule, opts);
}

