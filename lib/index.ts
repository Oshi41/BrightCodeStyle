module.exports = {
    configs: {
        'recommended-module': {
            parserOptions: {
                ecmaFeatures: {globalReturn: true},
                ecmaVersion: 2019,
                sourceType: "script",
            },
            env: {
                es6: true,
                node: true
            },
            extends: require('eslint/conf/eslint-recommended'),
            plugins: ["bright", 'node'],
            rules: {
                'bright/curly-brace-manage': ['error',
                    'IfStatement', {start: 'new'},
                    'ForStatement', {start: 'new'},
                    'ForInStatement', {start: 'new'},
                    'ForOfStatement', {start: 'new'},
                    'WhileStatement', {start: 'new'},

                    'TryStatement', {start: 'same'},
                    'CatchClause', {start: 'same'},
                    'FinalStatement', {start: 'same'},
                    'FunctionDeclaration', {start: 'new_for_long_declaration'},
                    'ArrowFunctionExpression', {start: 'same'},
                    'ObjectExpression', {start: 'same'},
                ],
                'bright/default-exports-alias': ['error', 'E'],
                'bright/exports-alias': ['error', 'E'],
                'bright/no-undefined-return': 'error',
                'bright/prefer-simple-null-checks': ['error', {
                    zeroEq: true,
                    strictZeroEq: true
                }],
                'bright/require-rules': ['error', {
                    addExtToLocal: true,
                    noAbsolute: true,
                    topFileDef: true,
                    fixNames: {
                        replacePatterns: [
                            {
                                restricted: ['-', '/'],
                                to: '_'
                            },
                            {
                                startsWith: ['node-'],
                                endsWith: ['-js'],
                                to: ''
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
                }],
                'bright/spacing-manage': ['error',
                    'catch', {after: false},
                    'function', {after: false},
                    'try', {after: true},

                    '>', {before: false, after: false},
                    '>=', {before: false, after: false},
                    '<', {before: false, after: false},
                    '<=', {before: false, after: false},
                    '==', {before: false, after: false},
                    '===', {before: false, after: false},
                    '!=', {before: false, after: false},
                    '!==', {before: false, after: false},
                    '!', {before: false, after: false},
                    '+', {before: false, after: false},
                    '-', {before: false, after: false},
                    '--', {before: false, after: false},
                    '++', {before: false, after: false},
                    '~', {before: false, after: false},

                    '?', {before: true, after: true},
                    ':', {before: true, after: true},

                    '&&', {before: true, after: true},
                    '||', {before: true, after: true},
                    '=', {before: true, after: true},
                    '+=', {before: true, after: true},
                    '-=', {before: true, after: true},
                    '*=', {before: true, after: true},
                    '/=', {before: true, after: true},
                    '%=', {before: true, after: true},
                    '**=', {before: true, after: true},
                    '<<=', {before: true, after: true},
                    '>>=', {before: true, after: true},
                    '>>>=', {before: true, after: true},
                    '|=', {before: true, after: true},
                    '^=', {before: true, after: true},
                    '&=', {before: true, after: true},
                ],
                'no-tabs': 'error',
                'no-trailing-spaces': 'error',
                "space-before-function-paren": ["error", {
                    "anonymous": "never",
                    "named": "never",
                    "asyncArrow": "never"
                }],
                "max-len": ["error", {
                    "code": 79,
                    "tabWidth": 4,
                    "ignoreComments": false,
                    "ignoreTrailingComments": false,
                    "ignoreStrings": false,
                    "ignoreTemplateLiterals": false,

                    "ignoreUrls": true,
                    "ignoreRegExpLiterals": true
                }],
                "no-multiple-empty-lines": ["error", {
                    "max": 1,
                    "maxEOF": 0,
                    "maxBOF": 0
                }],
                "padding-line-between-statements": ["error",
                    {
                        "blankLine": "never",
                        "prev": "*",
                        "next": "*"
                    },
                    {
                        "blankLine": "always",
                        "prev": "*",
                        "next": "class"
                    }
                ],
                "comma-spacing": ["error", {
                    "before": false,
                    "after": true
                }],
                "arrow-parens": ["error", "as-needed"],
                "key-spacing": ["error", {
                    "beforeColon": false
                }],
                "space-in-parens": ["error", "never"],
                "indent": ["error", 4, {
                    "VariableDeclarator": 1
                }],
                "arrow-spacing": ["error", {
                    "before": false,
                    "after": false
                }],
                "no-irregular-whitespace": "error",
                "no-extra-parens": "error",
                "no-extra-semi": "error",
                "semi": ["error", "always"],
                "operator-linebreak": ["error", "after", {
                    "overrides": {
                        "?": "before",
                        ":": "before",
                        "+": "before"
                    }
                }],
                "no-unused-vars": [
                    "error", {
                        "args": "none"
                    }
                ],
                "no-multi-spaces": ["error"],
                "comma-dangle": ["error", {
                    "objects": "always"
                }],
            }
        }
    },
    rules: {
        'curly-brace-manage': require('./rules/curly-brace-manage'),
        'default-exports-alias': require('./rules/default-exports-alias'),
        'exports-alias': require('./rules/exports-alias'),
        'no-undefined-return': require('./rules/no-undefined-return'),
        'prefer-simple-null-checks': require('./rules/prefer-simple-null-check'),
        'require-rule': require('./rules/require-rules'),
        'spacing-manage': require('./rules/spacing-manage'),
    }
}