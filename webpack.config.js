const path = require('path')
const HTMLWebpackPlagin = require('html-webpack-plugin')
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    }


    if (isProd) {
        config.minimizer = [
            new OptimizeCssAssetsWebpackPlugin(),
            new TerserWebpackPlugin()
        ];
    }

    return config
}

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const cssLoaders = extra => {
    const loaders = [{
            loader: MiniCssExtractPlugin.loader,
            options: {
                hmr: isDev,
                reloadAll: true
            }
        },
        "css-loader"
    ]

    if (extra) {
        loaders.push(extra)
    }

    return loaders
}

const babelOptions = preset => {
    const options = {
        presets: [
            '@babel/preset-env',

        ],
        plugins: [
            '@babel/plugin-proposal-class-properties'
        ]
    }

    if (preset) {
        options.presets.push(preset)
    }
    return options
};

const jsLoader = () => {
    const loader = [{
        loader: "babel-loader",
        options: babelOptions()
    }];

    if (isDev) {
        loader.push('eslint-loader')
    }

    return loader;
};

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: {
        main: ['@babel/polyfill', './index.jsx']
    },
    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist')
    },

    resolve: {
        extensions: ['.js', '.jsx','.json', '.png'],
        alias: {
            '@models': path.resolve(__dirname, 'src/models'),
            '@': path.resolve(__dirname, 'src'),
            images: path.resolve(__dirname, '/images'),
        }
    },
    optimization: optimization(),
    devServer: {
        port: 4300,
        hot: isDev
    },
    devtool: isDev ? 'source-map' : "",
    plugins: [
        new HTMLWebpackPlagin({
            template: './index.html',
            minify: {
                collapseWhitespace: isProd
            }
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
            {from: path.resolve(__dirname, 'src/favicon.ico'),
            to: path.resolve(__dirname, 'dist')
        }, {
            from: path.resolve(__dirname, 'src/assets'),
            to: path.resolve(__dirname, 'dist/images')
        }]}),
        new MiniCssExtractPlugin({
            filename: filename('css'),
        })
    ],
    module: {
        rules: [{
                test: /\.css$/,
                use: cssLoaders()
            },
            {
                test: /\.less$/,
                use: cssLoaders("less-loader")
            },
            {
                test: /\.s[ac]ss$/,
                use: cssLoaders("sass-loader")
            },
            {
                test: /\.(png|jpg|svg|gif)$/,
                use: ["file-loader"]
            },
            {
                test: /\.(ttf|woff|woff2|eot)$/,
                use: ["file-loader"]
            },
            {
                test: /\.xml$/,
                use: ["xml-loader"]
            },
            {
                test: /\.csv$/,
                use: ["csv-loader"]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: jsLoader()
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [ 
                    {
                    loader: "babel-loader",
                    options: babelOptions('@babel/preset-typescript')
                    }
                ]
            },
            {
                test: /\.jsx$/,
                exclude: /node_modules/,
                use: [
                {
                    loader: 'babel-loader',
                    options: {
                    presets: [
                        '@babel/preset-react'
                    ],
                    plugins: [
                        '@issr/babel-plugin'
                    ]
                    }
                }
                ]
            }
        ]
    }

}
  