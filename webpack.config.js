const path 							= require('path'),
			webpack 					= require('webpack'),
			HtmlWebpackPlugin = require('html-webpack-plugin'),
			ExtractTextPlugin = require('extract-text-webpack-plugin');

const commonConfig = {
		// entry: {
		// 	app: path.join(__dirname, 'src') //will default to index.js if 'app/index.js' not specified
		// }, 
		entry: {
			app: [		
		    'react-hot-loader/patch',
		    'webpack-hot-middleware/client',
		    // 'webpack-hot-middleware/client?path=/__what&timeout=2000&overlay=false',
		    // activate HMR for React
		    // and connect to the provided endpoint
		    // 'webpack/hot/only-dev-server',
		    // './src/index.js'
				path.join(__dirname, 'src') //will default to index.js if 'app/index.js' not specified
			]
			
		}, 
		output: {
			path: path.join(__dirname, 'dist'),
			publicPath: '/',
			filename: 'js/[name].js'
		},
	  module: {
	    rules: [
	      {
	        test: /\.css$/,
	        use: ExtractTextPlugin.extract({
	        	use: [ 'css-loader'],
  	      }),
	      },
				// {
				// 	test: /\.(jpg|png|svg)$/,
				// 	use: 'file-loader?name=media/[name].[ext]',
    //     },				      
      	{
	        test: /\.html$/,
	        use: 'html-loader',
		    },
		    {
		      test: /\.js$/,
		      exclude: /node_modules/,
		      use: {
		        loader: 'babel-loader',
		        options: {
		          presets: ['env', 'react', 'stage-0'],
		          plugins: ['react-hot-loader/babel']
		        }
		      }
		    },
	    ],
	  },
		plugins: [
			//PROD new webpack.optimize.UglifyJsPlugin({minimize: true}),
			new HtmlWebpackPlugin({
				filename: 'main.html',
				template: 'src/index.html',
			}),
			new ExtractTextPlugin({
				filename: 'styles/[name].css',
				disable: false,
				allChunks: true,
			}),
		],
}

const productionConfig = () => commonConfig;

const developmentConfig = () => {
	const devConfig = {
		devServer: {
			historyApiFallback: true, //History Api routing fallback for HTML5
			stats: 'errors-only', //Less console output - only errors
			host: process.env.HOST, //default to 'localhost'
			port: process.env.PORT, //defaults to 8080
	    contentBase: './dist',
		},
		devtool: 'source-map', //source maps slow 'eval' is faster
	};
	//The following is my own crappy way of deep merging the production and dev objects when module/plugins are in both
	//Each new type of duplicative property/key will require it's own merge procedure using this method. But it lets me follow
	//the structure of surviveJS without having to use the author's own webpack-merge library and file structure which felt
	//unnecessarily complicated (just like everything to do with webpack (and react))

	// const rules = [
	// 			{
	// 				test: /\.js$/,
	// 				enforce: 'pre',
	// 				loader: 'eslint-loader',
	// 				options: {
	// 					emitWarning: true,
	// 				}
	// 			},
	// ];

	const devPlugins = [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
	];

	commonConfig.plugins = commonConfig.plugins.concat(devPlugins);
	// commonConfig.module.rules = commonConfig.module.rules.concat(rules);

	return Object.assign({}, commonConfig, devConfig);
}

// module.exports = (env) => {
// 	if (env === 'production') {
// 		return productionConfig();
// 	}
// 	return developmentConfig();
// }

//TODO: Set up dev and prod configs and call them appropriately. Right now dev is hardcoded.
module.exports = developmentConfig();