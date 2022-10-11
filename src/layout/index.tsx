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
export interface RouteObjectDto extends NonIndexRouteObject {
	name: string
	meta?: { title: string }
}
function makeRouteObject(routes: RouteConfig[], dispatch: Dispatch<Action>): Array<RouteObjectDto> {
	return map((route) => {
		return {
			path: route.path,
			name: route.name,
			meta: route.meta,
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
	const matchRoute = getLatchRouteByEle(ele)
	if (isNil(matchRoute)) {
		return null
	}
	const selectedKeys: string[] = map((res) => res.route.path ?? '', matchRoute)
	const data = last(matchRoute)?.route as RouteObjectDto
	return {
		key: last(matchRoute)?.pathname ?? '',
		title: data?.meta?.title ?? '',
		name: data?.name ?? '',
		selectedKeys,
		include: isNil(data?.children),
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
	const [keepAliveList, dispatch] = useReducer(reducer, [])
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
			matchRouteObj.include &&
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
					<TagsView dispatch={dispatch} activeName={matchRouteObj?.key} keepAliveList={keepAliveList} />
					<ALayout.Content className="app-content">
						<Suspense fallback={<Loading />}>
							<KeepAlive activeName={matchRouteObj?.key} include={map((res) => res.key, keepAliveList)}>
								{eleRef.current}
							</KeepAlive>
						</Suspense>
					</ALayout.Content>
				</ALayout>
			</ALayout>
			<BackTop />
		</ALayout>
	)
}
export default memo(Layout)
