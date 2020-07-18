const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig');

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverageFrom: ['src/**'],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
    testMatch: [
        '<rootDir>/tests/**/*.spec.ts',
    ],
    globals: {
        'ts-jest': {
            packageJson: 'package.json',
        },
    },
};
