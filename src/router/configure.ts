import { NotFound } from '@/components/NotFound'
import Children from '@/router/Children'
import { lazy } from 'react'
export type Component = React.ComponentType<any> | React.LazyExoticComponent<any>
export interface RouteConfig {
	path: string
	models?: () => Array<PromiseLike<any>>
	component: Component
	exact?: boolean // 完全匹配 has  routes 必须false
	name: string
	icon?: Component
	noCache?: boolean
	noTags?: boolean
	meta?: { title: string }
	alwaysShow?: boolean // 是否显示在导航栏 true 不显示 默认false
	children?: Array<this>
	notLogin?: boolean // 是否需要登录  默认需要登录 不需要登录设置为true
	redirect?: string // 重定向
}
const routesOther: Array<RouteConfig> = [
	{
		path: 'user',
		component: lazy(() => import('@/views/user')),
		meta: { title: '用户' },
		name: 'User',
	},
	{
		path: 'role',
		component: lazy(() => import('@/views/role')),
		meta: { title: '角色' },
		name: 'Role',
	},
	{
		path: 'nesting',
		component: Children,
		meta: { title: '嵌套路由' },
		name: 'Nesting',
		children: [
			{
				path: 'list',
				component: lazy(() => import('@/views/nesting/list')),
				meta: { title: '嵌套路由-列表' },
				name: 'List',
			},
		],
	},
]
export const routes: Array<RouteConfig> = [
	{
		path: '/404',
		component: NotFound,
		meta: {
			title: '404',
		},
		name: '404',
		notLogin: true,
	},
	{
		path: '/*',
		component: lazy(() => import('@/layout')),
		meta: { title: 'erp' },
		name: 'erp',
		children: routesOther,
	},
]
