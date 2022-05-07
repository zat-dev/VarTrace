//@ts-check

'use strict';

const path = require('path');

/**@type {import('webpack').Configuration}*/
const extensionConfig = {
    target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
    mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

    entry: './src/vscodeExtension/extension/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
    output: {
        // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        libraryTarget: 'commonjs'
    },
    devtool: 'nosources-source-map',
    externals: {
        "mysql2": "mysql2", //unused kysely dialect but cause error
        "pg": "pg",//unused kysely dialect but cause error
        "better-sqlite3": "commonjs better-sqlite3-electron",
        sqlite3: 'commonjs sqlite3',
        vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
        // modules added here also need to be added in the .vsceignore file
    },
    resolve: {
        // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
        extensions: ['.ts', '.js'],
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: "tsconfig.extension.json"
                        }
                    }
                ]
            },
        ]
    }
};

const webviewConfig = {
    entry: "./src/vscodeExtension/webview/index.tsx",
    output: {
        filename: "webview.js"
    },
    devtool: "eval-source-map",
    resolve: {
        extensions: [".js", ".ts", ".tsx", ".json"]
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                loader: "ts-loader",
                options: {
                    configFile: "tsconfig.webview.json"
                }
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader"
                    }
                ]
            }
        ]
    },
};


module.exports = [extensionConfig, webviewConfig]