import { loadEnv, defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { urbitPlugin } from '@urbit/vite-plugin-urbit';
import path from 'path';

// export default defineConfig({
//   plugins: [solidPlugin()],
//   server: {
//     port: 3000,
//   },
//   build: {
//     target: 'esnext',
//   },
// });

// https://vitejs.dev/config/
export default ({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  const SHIP_URL = process.env.SHIP_URL || process.env.VITE_SHIP_URL || 'http://localhost:8080';
  console.log(SHIP_URL);

  return defineConfig({
    plugins: [
      urbitPlugin({ base: 'turf', target: SHIP_URL, secure: false }),
      solidPlugin(),
    ],
    base: '/apps/turf/',
    resolve: {
      alias: {
        '~': path.resolve('./src'),
        '@': path.resolve('./src/components'),
        lib: path.resolve('./src/lib'),
        css: path.resolve('./src/css'),
        stores: path.resolve('./src/stores'),
        assets: path.resolve('./src/assets'),
        vendor: path.resolve('./src/vendor'),
      },
    },
    define: {
      'process.env.prod': !process.env.NODE_ENV === 'development',
      'process.env.meteredApiKey': '"' + process.env.METERED_API_KEY + '"',
    },
    server: {
      port: 3000,
      fs: {
        strict: false,
      },
      hmr: {
        overlay: false,
      },
    },
    build: {
      target: 'esnext',
    },
  });
};