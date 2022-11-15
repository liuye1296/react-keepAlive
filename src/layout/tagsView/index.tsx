import {
	equals,
	filter,
	find,
	findIndex,
	isEmpty,
	last,
	map,
	mergeRight,
	pick,
	length,
	append,
	slice,
	pipe,
	not,
	curry,
	ifElse,
	is,
} from 'ramda'
import { useNavigate } from 'react-router-dom'
import type { NavigateFunction } from 'react-router-dom'
import { Tabs } from 'antd'
import { MAXLEN } from '..'
export interface TagsViewDto {
	key: string
	title: string
	name: string
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
	activeKey?: string
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
const isArray = is(Array)
function delKeepAlive(keepAliveList: Array<TagsViewDto>, { key, navigate, activeKey }: ActionDelDto) {
	const index = findIndex((item) => equals(item.key, key), keepAliveList)
	if (equals(index, -1)) {
		return keepAliveList
	}
	let pathname = ''
	if (length(keepAliveList) > 1) {
		const data = keepAliveList[index]
		// 如果删除是  当前渲染  需要移动位置
		if (data && equals(data.key, activeKey)) {
			// 如果是最后一个 那么  跳转到上一个
			if (equals(index, keepAliveList.length - 1)) {
				pathname = keepAliveList[index - 1].key
			} else {
				// 跳转到最后一个
				pathname = last(keepAliveList)?.key ?? ''
			}
		}
	}
	if (!isEmpty(pathname)) {
		navigate({ pathname })
	}
	return filter((item) => !equals(item.key, key), keepAliveList)
}
function addKeepAlive(state: Array<TagsViewDto>, matchRouteObj: ActionTypeAddPayload) {
	if (state.some((item) => equals(item.key, matchRouteObj.key))) {
		return state
	}
	return append(
		pick(['key', 'title', 'name'], matchRouteObj),
		length(state) >= MAXLEN ? slice(1, length(state), state) : state
	)
}
const updateKeepAlive = curry((state: Array<TagsViewDto>, keepAlive: Partial<TagsViewDto>) => {
	return map((item) => (equals(item.key, keepAlive.key) ? mergeRight(item, keepAlive) : item), state)
})
const updateKeepAliveList = curry((state: Array<TagsViewDto>, keepAlive: Array<TagsViewDto>) => {
	return map((item) => {
		const data = find((res) => equals(res.key, item.key), keepAlive)
		if (data) {
			item = mergeRight(item, data ?? {})
		}
		return item
	}, state)
})
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
			return ifElse(isArray, updateKeepAliveList(state), updateKeepAlive(state))(action.payload) as any
		default:
			return state
	}
}
interface Props {
	dispatch: (value: Action) => void
	keepAliveList: Array<TagsViewDto>
	activeName?: string
}
const noIsNotActiveKey = pipe(equals('notActiveKey'), not)
function TagsView({ dispatch, keepAliveList, activeName = 'notActiveKey' }: Props) {
	const navigate = useNavigate()
	function hdChange(key: string) {
		if (key && noIsNotActiveKey(key)) navigate({ pathname: key })
	}
	function hdEdit(key: string) {
		if (key && noIsNotActiveKey(key)) {
			dispatch({
				type: ActionType.del,
				payload: {
					key,
					navigate,
					activeKey: activeName,
				},
			})
		}
	}
	const closable = equals(1, length(keepAliveList))
	return (
		<div className="tagsView">
			<Tabs
				type="editable-card"
				onChange={hdChange}
				className="tagsView-tabs"
				hideAdd
				activeKey={activeName}
				onEdit={hdEdit}
				items={map(
					(tag) => ({
						key: tag.key,
						label: tag.title,
						closable: !closable,
						// <Tabs.TabPane tab={tag.title} key={tag.key} closable={!closable} />
					}),
					keepAliveList
				)}
			/>
		</div>
	)
}

export default TagsView
