const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    // ✅ ESTA LÍNEA ES LA CLAVE: Guarda el 'dist' dentro de la carpeta del servicio
    path: join(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'], // Si da error en algún servicio que no tenga assets, borra esta línea
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};