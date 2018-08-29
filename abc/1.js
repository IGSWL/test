const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const ExtractPlugin = require('extract-text-webpack-plugin')

const isDev =process.env.NODE_ENV === 'development'

const config = {
  target:'web',
  entry:path.join(__dirname,'src/index.js'),
  output:{
    filename:'bundle.[hash:8].js',
    path:path.join(__dirname,'dist')
  },
  module:{
    rules:[
      {
        test:/\.vue$/,
        loader:'vue-loader'
      },
      {
        test:/\.js$/,
        use:'babel-loader',
        include:path.resolve(__dirname +'./src/'),  //绝对路径
        exclude:path.resolve(__dirname +'node_modules')   //打包过后无需再打包
      },
      //jsx是vue2才出来的，因为它相对于.vue写模板的方式，灵活性更高，可以更方便使用js的原生方法
      {
        test:/\.jsx$/,
        use:"babel-loader"
      },
      // {
      //   test:/\.css$/,
      //   use:[
      //     'style-loader',
      //     'css-loader'
      //   ]
      // },
      {
        test:/\.(jpg|png|gif|jpeg|svg)$/,
        use:[
          {
            loader:'url-loader',
            options:{limit:1024,name:'[name]-[hash:8].[ext]'}
          }
        ]
      }
    ]
  },
  plugins:[
    //new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env':{
        NODE_ENV: isDev ? '"development"' :'"production"'
      }
    }),
    new HTMLWebpackPlugin()
  ]
}


if(isDev){
  config.module.rules.push({
    test:/\.styl(us)?$/,
    use:[
      'style-loader',
      'css-loader',
      {
        loader:'postcss-loader',
        options:{
          sourceMap:true, //stylus-loader可以生成sourceMap，postcss-loader也可以生成sourceMap，此设置可省略postcss-loader生成的
        }
      },
      'stylus-loader'
    ]
  })
  config.devtool = '#cheap-module-eval-source-map'
  config.devServer = {
    port: 8000,
    host:'0.0.0.0',
    overlay:{
      error:true,
    },
    hot:true
  }
  //热加载
  config.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  )
}else{
  //生产环境
  config.entry = {
    app:path.join(__dirname,'src/index.js'),
    vendor:['vue']  //单独打包vue
  }
  config.output.filename = '[name].[chunkhash:8].js'
  config.module.rules.push({
    test:/\.styl(us)?$/,      //css预处理器
    use:ExtractPlugin.extract({
      fallback:'style-loader',
      use:[
        'css-loader',
        {
          loader:'postcss-loader',
          options:{
            sourceMap:true, //stylus-loader可以生成sourceMap，postcss-loader也可以生成sourceMap，此设置可省略postcss-loader生成的
          }
        },
        'stylus-loader'
      ]
    })
  })
  config.plugins.push(
    new ExtractPlugin('styles.[contentHash:8].css'),
    new webpack.optimize.CommonsChunkPlugin({
      name:'vendor'
    }),
    //单独打包webpack文件
    new webpack.optimize.CommonsChunkPlugin({
      name:'runtime'
    })
  )
}

module.exports = config
