module.exports = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'type-enum': [
			2,
			'always',
			[
				'feature', // 引入新功能 或者 需求调整    需求调整 最好记录 如: 2021-06-16 23:11:21 产品（宋导）要求 采购可交货数量只做展示 不限制 已注释
				'fix', //修复了bug
				'docs', //文档
				'style', //优化项目结构或者代码格式
				'refactor', // 代码重构. 代码重构不涉及新功能和bug修复. 不应该影响原有功能, 包括对外暴露的接口
				'test', //增加测试
				'chore', //构建过程, 辅助工具升级. 如升级依赖, 升级构建工具
				'perf', //性能优化
				'revert', //revert之前的commit
				'build', // 构建或发布版本
				'safe', //修复安全问题
				'api', //重新生成API 文件夹
				'other', //其他
				'ts', // typescript 优化
			],
		],
		'subject-full-stop': [0, 'never'],
		'subject-case': [0, 'never'],
	},
}
