import * as path from 'path'
import react from '@vitejs/plugin-react'
import { ConfigEnv } from 'vite'
import { createStyleImportPlugin, AntdResolve } from 'vite-plugin-style-import'
import vitePluginImp from 'vite-plugin-imp'
import svgr from 'vite-plugin-svgr'
import checker from 'vite-plugin-checker'
import { createHtmlPlugin } from 'vite-plugin-html'
export default ({ mode, command }: ConfigEnv) => {
	const isTest = mode === 'beta'
	const alias = {
		'@': path.resolve(__dirname, './src'),
		moment: 'dayjs',
	}
	return {
		base: '/',
		root: './', // index.html 文件所在的位置
		envDir: './env', // 加载 .env 文件的目录
		resolve: {
			alias,
			extensions: ['.tsx', '.ts', '.js', 'jsx', '.mjs'],
		},
		css: {
			modules: {
				scopeBehaviour: 'local',
			},
			preprocessorOptions: {
				less: {
					javascriptEnabled: true,
				},
				scss: {
					javascriptEnabled: true,
				},
			},
		},
		server: {
			port: 3000,
			// proxy: {},
			host: '0.0.0.0',
			cors: true,
		},
		esbuild: {
			drop: command === 'build' ? ['console', 'debugger'] : [],
		},
		build: {
			target: 'modules', // modules es6 es2015  esnext
			minify: isTest ? false : 'esbuild', // 是否进行压缩,boolean | 'terser' | 'esbuild',
			manifest: isTest, // 是否产出maifest.json
			sourcemap: isTest, // 是否产出soucemap.json
			outDir: './dist', // 产出目录
			terserOptions: {
				//生产环境时移除console
				compress: {
					drop_console: true,
					drop_debugger: true,
				},
			},
		},
		plugins: [
			react(),
			{
				...createStyleImportPlugin({
					resolves: [AntdResolve()],
				}),
				apply: 'serve',
			},
			vitePluginImp({
				libList: [
					{
						libName: 'antd',
						libDirectory: 'es',
						style: (name) => {
							return command === 'serve' ? false : `antd/es/${name}/style/index`
						},
					},
					// { libName: 'ahooks', libDirectory: 'es', camel2DashComponentName: false },
					{ libName: 'ramda', libDirectory: 'es', camel2DashComponentName: false },
				],
			}),
			checker({
				typescript: {
					tsconfigPath: path.resolve(__dirname, './tsconfig.json'),
				},
			}),
			createHtmlPlugin({
				minify: true,
				inject: {
					data: {
						polyfill:
							command === 'serve'
								? ''
								: `<script src="https://polyfill.io/v3/polyfill.min.js?features=es2021"></script>`,
					},
				},
			}),

			// 转化svg
			svgr(),
		],
	}
}
