const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = {
    mode: process.env.NODE_ENV === "production" ? "production" : "development",
    entry: path.resolve(__dirname, "src/index.ts"),
    devServer: {
        static: path.resolve(__dirname, "dist"),
        compress: true,
        liveReload: true,
        port: 8080,
        hot: true,
        watchFiles: ["dist/**/*.js", "dist/**/*.html"],
        open: true,
    },
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: ["babel-loader"],
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: ["ts-loader"],
            },
            {
                test: /\.html$/i,
                exclude: /node_modules/,
                use: ["html-loader"],
            },
            {
                test: /\.(css|s[ac]ss)$/,
                exclude: /node_modules/,
                use: [
                    "style-loader",
                    "css-loader",
                    {
                        loader: "sass-loader",
                        options: {
                            implementation: require.resolve("sass"),
                        }
                    },
                ],
            },
            {
                test: /\.(jpg|jpeg|png|gif|mp3|svg)$/,
                use: ["file-loader"],
            },
        ]
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "Development",
            template: "./index.html"
        }),
        new webpack.ProvidePlugin({
            PIXI: "pixi.js"
        }),
        new webpack.DefinePlugin({
            "typeof CANVAS_RENDERER": JSON.stringify(true),
            "typeof WEBGL_RENDERER": JSON.stringify(true),
        }),
    ],
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        alias: {
            root: path.resolve(__dirname, ""),
            assets: path.resolve(__dirname, "assets"),
            src: path.resolve(__dirname, "src"),
            styles: path.resolve(__dirname, "styles"),
        },
    },
};
