var pjson = require('./package.json')

module.exports = function() {
  var config = {
    projEnv: process.env.NODE_ENV !== 'production' ? 'development' : 'production',
    name: pjson.name,   // Naming your project based on package.json
    source: './src/',
    site: './site/',
    assetsPath: {
      css: 'assets/css/',
      sass: 'assets/styles/',
      img: 'assets/img/',
      js: 'assets/js/'
    },
    markup: 'markup/',
    filename: {
      cssFile: 'style.css',
      sassFile: 'style.{sass, scss}',
      htmlFile: 'index.html',
      pugFile: 'index.pug'
    }
  };
  return config;
}()
