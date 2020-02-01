import svelte from 'rollup-plugin-svelte-hot';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import { config } from '@sveltech/routify'
import hmr, { autoCreate } from 'rollup-plugin-hot'

const split = config.dynamicImports
const production = !process.env.ROLLUP_WATCH;
const nollup = !!process.env.NOLLUP;
const hot = true

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		name: 'app',
		format: split ? 'esm' : 'iife',
		// entryFileNames: 'build/[name]-[hash].js',
		// chunkFileNames: 'build/[name]-[hash].js',
		[split ? 'dir' : 'file']: split ? 'public' : 'public/build/bundle.js'
	},
	plugins: [
		svelte({
			// enable run-time checks when not in production
			dev: !production,
			// we'll extract any component CSS out into
			// a separate file — better for performance
			...production && {
				css: css => {
					css.write('public/build/bundle.css');
				}
			},
      hot: !production && {
        // optimistic will try to recover from runtime
        // errors during component init
        optimistic: true,
        // turn on to disable preservation of local component
        // state -- i.e. non exported `let` variables
        noPreserveState: false,
      },
		}),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration —
		// consult the documentation for details:
		// https://github.com/rollup/rollup-plugin-commonjs
		resolve({
			browser: true,
			dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
		}),
		commonjs(),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!nollup && !production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		// !production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser(),

    hmr({
      public: 'public',
      inMemory: true,
      // This is needed, otherwise Terser (in npm run build) chokes
      // on import.meta. With this option, the plugin will replace
      // import.meta.hot in your code with module.hot, and will do
      // nothing else.
      compatModuleHot: !hot,
    }),
	],
	watch: {
		clearScreen: false
	}
};

function serve() {
	let started = false;

	return {
		writeBundle() {
			const script = !split ? 'start' : 'start:split'
			if (!started) {
				started = true;

				require('child_process').spawn('npm', ['run', script, '--', '--dev'], {
					stdio: ['ignore', 'inherit', 'inherit'],
					shell: true
				});
			}
		}
	};
}
