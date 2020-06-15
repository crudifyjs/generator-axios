module.exports = {
    root: true,
    extends: ['@crudifyjs/typescript'],
    parserOptions: {
        project: './tsconfig.lint.json',
    },
    settings: {
        'import/resolver': {
            typescript: {},
        },
    },
};
