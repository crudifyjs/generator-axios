/* eslint-disable import/no-extraneous-dependencies */
import transformPaths from '@zerollup/ts-transform-paths';
import { Config } from 'bili';
import * as ts from 'typescript';

const config: Config = {
    input: 'src/index.ts',
    output: {
        moduleName: 'crudifyjs-generator-axios',
        format: ['cjs', 'es'],
    },
    plugins: {
        typescript2: {
            tsconfigOverride: {
                compilerOptions: {
                    declaration: true,
                    declarationDir: 'dist/types',
                },
            },
            useTsconfigDeclarationDir: true,
            transformers: [(service: ts.LanguageService) => transformPaths(service.getProgram())],
        },
    },
};

export default config;
