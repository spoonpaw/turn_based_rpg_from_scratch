// eslint-disable-next-line no-undef
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
        'simple-import-sort'
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    ignorePatterns: ['snowpack.config.js'],
    rules: {
        'semi': ['warn', 'always'],
        'no-console': 'warn',
        'quotes': ['error', 'single'],
        'curly': 0,
        'brace-style': ['error', 'stroustrup'],
        'indent': ['error', 4],
        'eol-last': ['error', 'never'],
        '@typescript-eslint/no-unused-vars': 2,
        '@typescript-eslint/no-extra-semi': 1,
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
    }
};