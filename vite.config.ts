import legacyPlugin from '@vitejs/plugin-legacy'
import * as path from 'path'
import postcssFlexbugsFixes from 'postcss-flexbugs-fixes'
import postcssPresetEnv from 'postcss-preset-env'
import autoprefixer from 'autoprefixer'
import { ConfigEnv } from 'vite'
import styleImport from 'vite-plugin-style-import'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { minifyHtml, injectHtml } from 'vite-plugin-html'
const loder_presetEnv = postcssPresetEnv({
	autoprefixer: {
		flexbox: 'no-2009',
	},
	stage: 3,
})
export default ({ mode }: ConfigEnv) => {
	const isTest = mode === 'beta'
	const alias = {
		'@': path.resolve(__dirname, './src'),
		'@assets': path.resolve(__dirname, './src/assets'),
		'@styles': path.resolve(__dirname, './src/styles'),
		'@api': path.resolve(__dirname, './src/api'),
	}

	const proxy = {
		// '/serverApi/rantion-app-center': {
		// 	target: 'http://192.168.120.131:9201/',
		// 	rewrite: (path: string) => path.replace(/^\/serverApi\/rantion-app-center/, '')
		// },
		'/serverApi/rantion-member': {
			target: 'http://192.168.120.131:9033/',
			rewrite: (path: string) => path.replace(/^\/serverApi\/rantion-member/, ''),
		},
		'/serverApi': {
			target: 'http://192.168.120.180:28082/serverApi',
			rewrite: (path: string) => path.replace(/^\/serverApi/, ''),
		},
	}
	const define = {
		'process.env': {
			NODE_ENV: mode === 'development' ? 'development' : 'production',
		},
	}

	const esbuild = {
		// jsxInject: "import React from 'react'"
	}

	const server =
		mode === 'development'
			? {
					port: 3000,
					proxy,
					host: '0.0.0.0',
					cors: true,
			  }
			: {}

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
			postcss: {
				plugins: [autoprefixer, postcssFlexbugsFixes, loder_presetEnv],
			},
			preprocessorOptions: {
				less: {
					javascriptEnabled: true,
				},
				scss: {
					// 引入scss全局变量 给导入的路径最后加上;
					// additionalData: `@import "./src/style/app.scss";@import "./src/style/variables.scss";`,
					javascriptEnabled: true,
				},
			},
		},
		define: JSON.stringify(define),
		server: server,
		build: {
			target: 'modules', // modules es6 es2015  esnext
			minify: isTest ? false : 'terser', // 是否进行压缩,boolean | 'terser' | 'esbuild',默认使用terser
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
			//rollupOptions
		},
		esbuild,
		plugins: [
			legacyPlugin({
				targets: ['Android > 39', 'Chrome >= 60', 'Safari >= 10.1', 'iOS >= 10.3', 'Firefox >= 54', 'Edge >= 15'],
			}),
			react(),
			// 按需导入 antd 样式
			styleImport({
				libs: [
					{
						libraryName: 'antd',
						esModule: true,
						resolveStyle: (name) => {
							return `antd/es/${name}/style/index`
						},
					},
				],
			}),
			// 压缩图片体积
			// viteImagemin({
			// 	optipng: {
			// 		optimizationLevel: 7
			// 	},
			// 	mozjpeg: {
			// 		quality: 20
			// 	},
			// 	pngquant: {
			// 		quality: [0.8, 0.9],
			// 		speed: 4
			// 	},
			// 	svgo: {
			// 		plugins: [
			// 			{
			// 				name: 'removeViewBox'
			// 			},
			// 			{
			// 				name: 'removeEmptyAttrs',
			// 				active: false
			// 			}
			// 		]
			// 	}
			// }),
			minifyHtml(),
			injectHtml({
				injectData: {
					injectScript: '<script>global=globalThis</script>',
				},
			}),
			// 转化svg
			svgr(),
		],
	}
}
