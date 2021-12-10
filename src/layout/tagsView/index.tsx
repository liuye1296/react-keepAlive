import { clone, equals, find, findIndex, is, isEmpty, last, map, mergeRight, pick, pipe } from 'ramda'
import { Link } from 'react-router-dom'
import { CloseOutlined } from '@ant-design/icons'
import indexModule from './index.module.scss'
import classNames from 'classnames/bind'
const styles = classNames.bind(indexModule)
import type { NavigateFunction } from 'react-router-dom'
import { memo } from 'react'
export interface TagsViewDto {
	key: string
	active: boolean
	title: string
	name: string
	// ele: React.ReactElement<any, string | React.JSXElementConstructor<any>> | null
}
export enum ActionType {
	del = 'DEL',
	add = 'ADD',
	update = 'UPDATE',
	clear = 'CLEAR',
}
interface ActionDel {
	type: ActionType.del
	payload: ActionDelDto
}
interface ActionDelDto {
	key: string
	navigate: NavigateFunction
}
interface ActionClear {
	type: ActionType.clear
	payload: undefined
}
interface ActionTypeAddPayload {
	key: string
	title: string
	name: string
	selectedKeys: string[]
}
interface ActionAdd {
	type: ActionType.add
	payload: ActionTypeAddPayload
}
interface ActionUp {
	type: ActionType.update
	payload: Partial<TagsViewDto> | TagsViewDto[]
}
export interface ActionUpdateTitlePayload {
	key: string
	title: string
}
function isArray(arg: any): arg is Array<any> {
	return is(Array)(arg)
}
function delKeepAlive(keepAliveList: Array<TagsViewDto>, { key, navigate }: ActionDelDto) {
	const index = findIndex((item) => equals(item.key, key), keepAliveList)
	if (equals(index, -1)) {
		return keepAliveList
	}
	let pathname = ''
	if (keepAliveList.length > 1) {
		const index = findIndex((item) => equals(item.key, key), keepAliveList)
		const data = keepAliveList[index]
		// 如果删除是  当前渲染     需要移动位置
		if (data && data.active) {
			// 如果是最后一个 那么  跳转到上一个
			if (equals(index, keepAliveList.length - 1)) {
				pathname = keepAliveList[index - 1].key
			} else {
				// 跳转到最后一个
				pathname = last(keepAliveList)?.key ?? ''
			}
		}
	}
	keepAliveList.splice(index, 1)
	if (!isEmpty(pathname)) {
		navigate({ pathname })
	}
	return clone(keepAliveList)
}
const mergeMatchRoute = pipe(pick(['key', 'title', 'ele', 'name']), mergeRight({ active: true }))
function addKeepAlive(state: Array<TagsViewDto>, matchRouteObj: ActionTypeAddPayload) {
	if (state.some((item) => equals(item.key, matchRouteObj.key) && item.active)) {
		return state
	}
	let isNew = true
	// 改变选中的值
	const data = map((item) => {
		if (equals(item.key, matchRouteObj.key)) {
			item.active = true
			isNew = false
		} else {
			item.active = false
		}
		return item
	}, state)
	if (isNew) {
		if (data.length >= 10) {
			data.shift()
		}
		data.push(mergeMatchRoute(matchRouteObj))
	}
	return data
}
const updateKeepAlive = (state: Array<TagsViewDto>, keepAlive: Partial<TagsViewDto>) => {
	return map((item) => (equals(item.key, keepAlive.key) ? mergeRight(item, keepAlive) : item), state)
}
const updateKeepAliveList = (state: Array<TagsViewDto>, keepAlive: Array<TagsViewDto>) => {
	return map((item) => {
		const data = find((res) => equals(res.key, item.key), keepAlive)
		if (data) {
			item = mergeRight(item, data ?? {})
		}
		return item
	}, state)
}
export type Action = ActionDel | ActionAdd | ActionClear | ActionUp
export const reducer = (state: Array<TagsViewDto>, action: Action): TagsViewDto[] => {
	switch (action.type) {
		case ActionType.add:
			return addKeepAlive(state, action.payload)
		case ActionType.del:
			return delKeepAlive(state, action.payload)
		case ActionType.clear:
			return []
		case ActionType.update:
			return isArray(action.payload)
				? updateKeepAliveList(state, action.payload)
				: updateKeepAlive(state, action.payload)
		default:
			return state
	}
}
interface Props {
	delKeepAlive: (key: string) => void
	keepAliveList: Array<TagsViewDto>
}
function TagsView({ delKeepAlive, keepAliveList }: Props) {
	return (
		<>
			<div className={indexModule.tagsViewContainer} style={{ background: '#fff', paddingLeft: '16px' }}>
				<div className={indexModule.tagsViewWrapper}>
					{map(
						(tag) => (
							<Link
								to={tag.key}
								className={styles({
									tagsViewItem: true,
									select: tag.active || equals(keepAliveList.length, 1),
								})}
								color="#fff"
								key={tag.key}
							>
								{tag.title}
								{keepAliveList.length > 1 && (
									<CloseOutlined
										className={indexModule.closeIcon}
										onClick={(event) => {
											event.stopPropagation()
											event.preventDefault()
											delKeepAlive(tag.key)
										}}
									/>
								)}
							</Link>
						),
						keepAliveList
					)}
				</div>
			</div>
			<div
				className={styles({
					tagsHeight: !isEmpty(keepAliveList),
				})}
			/>
		</>
	)
}

export default memo(TagsView)
