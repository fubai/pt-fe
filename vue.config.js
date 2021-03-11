module.exports = {
  devServer: {
    port: 9991
  },
  lintOnSave: true,
  configureWebpack: {
    devtool: 'eval-source-map',
    resolve: {
      extensions: ['.js', '.vue'],
      alias: {
        'vue$': 'vue/dist/vue.esm.js'
      }
    }
  },
  productionSourceMap: true
}
