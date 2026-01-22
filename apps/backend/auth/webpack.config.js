const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    // ✅ ESTO ES LO VITAL: Fuerza a guardar en la carpeta del microservicio
    path: join(__dirname, 'dist'), 
    clean: true,
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'], // (Ponlo vacío [] si no tienes carpeta 'assets' en el src)
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};