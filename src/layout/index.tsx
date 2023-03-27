import { memo, Suspense, useEffect, useMemo, useReducer, useRef } from 'react'
import type { FunctionComponent, Dispatch, JSXElementConstructor, ReactElement } from 'react'
import { BackTop, Layout as ALayout, Menu } from 'antd'
import { Link, useLocation, useNavigate, useRoutes } from 'react-router-dom'
import { equals, filter, isEmpty, isNil, last, map, not, reduce } from 'ramda'
import TagsView, { ActionType, reducer } from './tagsView'
import type { Action } from './tagsView'
import { Loading } from '@/components/Loading'
import $styles from './tagsView/index.module.scss'
import type { RouteMatch, NonIndexRouteObject } from 'react-router-dom'
import KeepAlive from '@/components/KeepAlive'
import { ViewProvider } from '@/hooks/useView'
import type { RouteConfig } from '@/router/configure'
import type { ItemType } from 'antd/lib/menu/hooks/useItems'
export const MAXLEN = 10
export interface RouteObjectDto extends NonIndexRouteObject {
	name: string
	meta?: { title: string }
	cache: boolean
	layout?: boolean // 嵌套二次自定义布局
}
function makeRouteObject(routes: RouteConfig[], dispatch: Dispatch<Action>): Array<RouteObjectDto> {
	return map((route) => {
		const cache = isNil(route.noCache) ? (isNil(route.cache) ? true : route.cache) : route.noCache
		return {
			path: route.path,
			name: route.name,
			meta: route.meta,
			cache,
			element: (
				<ViewProvider value={{ name: route.name, dispatch, meta: route.meta }}>
					<route.component />
				</ViewProvider>
			),
			children: isNil(route.children) ? undefined : makeRouteObject(route.children, dispatch),
		}
	}, routes)
}
function getMatchRouteObj(ele: ReactElement | null) {
	if (isNil(ele)) {
		return null
	}
	const matchRoutes = getLatchRouteByEle(ele)
	if (isNil(matchRoutes)) {
		return null
	}
	const selectedKeys: string[] = reduce(
		(selectedKeys: string[], res) => {
			const route = res.route as RouteObjectDto
			if (route.name) {
				selectedKeys.push(route.name)
			}
			return selectedKeys
		},
		[],
		matchRoutes
	)
	const matchRoute = last(matchRoutes)
	const data = matchRoute?.route as RouteObjectDto
	return {
		key: data.layout ? matchRoute?.pathnameBase ?? '' : matchRoute?.pathname ?? '',
		title: data?.meta?.title ?? '',
		name: data?.name ?? '',
		selectedKeys,
		cache: data.cache,
	}
}

function mergePtah(path: string, paterPath = '') {
	// let pat = getGoto(path)
	path = path.startsWith('/') ? path : '/' + path
	return paterPath + path
}
// 渲染导航栏
function renderMenu(data: Array<RouteConfig>, path?: string) {
	return reduce(
		(items, route) => {
			if (route.alwaysShow) {
				return items
			}
			const thisPath = mergePtah(route.path, path)
			const children = filter((route) => not(route.alwaysShow), route.children ?? [])
			const hasChildren = isNil(children) || isEmpty(children)
			items.push({
				key: route.name,
				title: route.meta?.title,
				label: !hasChildren ? (
					<span className="a-black">{route.meta?.title}</span>
				) : (
					<Link to={thisPath} className="a-black">
						{route.meta?.title}
					</Link>
				),
				children: hasChildren ? undefined : renderMenu(children, thisPath),
			})
			return items
		},
		[] as ItemType[],
		data
	)
}
interface Props {
	route: RouteConfig
}
function getRouteContext(data: any): any {
	if (isNil(data.children)) {
		return null
	}
	return isNil(data.routeContext) ? getRouteContext(data.children.props) : data.routeContext
}
function getLatchRouteByEle(ele: ReactElement): RouteMatch[] | null {
	if (ele) {
		const data = getRouteContext(ele.props)
		return isNil(data?.outlet) ? (data?.matches as RouteMatch[]) : getLatchRouteByEle(data?.outlet)
	}
	return null
}
const Layout: FunctionComponent<Props> = ({ route }: Props) => {
	const eleRef = useRef<ReactElement<any, string | JSXElementConstructor<any>> | null>()
	const location = useLocation()
	const navigate = useNavigate()
	const [tagsViewList, dispatch] = useReducer(reducer, [])
	// 生成子路由
	const [routeObject, items] = useMemo(() => {
		if (isNil(route.children)) {
			return [[], []] as [RouteObjectDto[], ItemType[]]
		}
		return [makeRouteObject(route.children, dispatch), renderMenu(route.children)]
	}, [route.children])

	// 匹配 当前路径要渲染的路由
	const ele = useRoutes(routeObject, location)
	// 计算 匹配的路由name
	const matchRouteObj = useMemo(() => {
		eleRef.current = ele
		return getMatchRouteObj(ele)
		// eslint-disable-next-line
	}, [routeObject, location])
	// 缓存渲染 & 判断是否404
	useEffect(() => {
		if (matchRouteObj) {
			dispatch({
				type: ActionType.add,
				payload: {
					...matchRouteObj,
				},
			})
		} else if (!equals(location.pathname, '/')) {
			navigate({
				pathname: '/404',
			})
		}
	}, [location.pathname, matchRouteObj, navigate])
	const keepAliveList = useMemo(
		() =>
			reduce(
				(list, item) => {
					if (item.cache) {
						list.push(item.key)
					}
					return list
				},
				[] as Array<string>,
				tagsViewList
			),
		[tagsViewList]
	)
	return (
		<ALayout>
			<ALayout>
				<ALayout.Sider width={180} theme="light" className={$styles.fixed}>
					<Menu
						selectedKeys={matchRouteObj?.selectedKeys}
						defaultOpenKeys={matchRouteObj?.selectedKeys}
						mode="inline"
						items={items}
					/>
				</ALayout.Sider>
				<ALayout style={{ marginLeft: 180 }}>
					<TagsView dispatch={dispatch} activeName={matchRouteObj?.key} tagsViewList={tagsViewList} />
					<ALayout.Content className="app-content">
						<Suspense fallback={<Loading />}>
							<>
								<KeepAlive activeName={matchRouteObj?.key} maxLen={MAXLEN} include={keepAliveList}>
									{eleRef.current}
								</KeepAlive>
								<> {matchRouteObj?.cache ? null : eleRef.current}</>
							</>
						</Suspense>
					</ALayout.Content>
				</ALayout>
			</ALayout>
			<BackTop />
		</ALayout>
	)
}
export default memo(Layout)
