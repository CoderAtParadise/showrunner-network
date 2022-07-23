module.exports = {
    env: {
        es2021: true,
        node: true
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        tsconfigRootDir: __dirname,
        ecmaVersion: 2021,
        sourceType: "module"
    },
    plugins: ["@typescript-eslint", "import", "eslint-plugin-tsdoc"],
    overrides: [
        {
            files: ["*.ts", "*.tsx"],
            extends: [
                "plugin:@typescript-eslint/recommended",
                "plugin:@typescript-eslint/recommended-requiring-type-checking"
            ],
            parserOptions: {
                project: ["./tsconfig.json"]
            }
        }
    ],
    extends: ["eslint:recommended", "prettier"],
    rules: {
        "tsdoc/syntax": "warn",
        "@typescript-eslint/no-inferrable-types": [
            "error",
            {
                ignoreParameters: true,
                ignoreProperties: true
            }
        ],
        "import/no-unresolved": "error",
        "no-useless-escape": "off",
    },
    settings: {
        "import/parsers": {
            "@typescript-eslint/parser": [".ts", ".tsx"]
        },
        "import/resolver": {
            typescript: {
                alwaysTryTypes: true
            }
        }
    },
    root: true
};
