import ReactDOM from 'react-dom'
import { equals, isNil, map, filter, not } from 'ramda'
import { useUpdate } from '@/hooks/useUpdate'
import {
	JSXElementConstructor,
	memo,
	ReactElement,
	RefObject,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react'
type Children = ReactElement<any, string | JSXElementConstructor<any>> | null
interface Props {
	active?: string
	isAsyncInclude: boolean // 是否异步添加 Include  如果不是又填写了 true 会导致重复渲染
	include?: Array<string>
	exclude?: Array<string>
	maxLen?: number
	children: Children
}
function KeepAlive({ active, children, exclude, include, isAsyncInclude, maxLen = 10 }: Props) {
	const containerRef = useRef<HTMLDivElement>(null)
	const components = useRef<Array<{ name: string; ele: Children }>>([])
	const [asyncInclude] = useState<boolean>(isAsyncInclude)
	const update = useUpdate()
	useLayoutEffect(() => {
		if (isNil(active)) {
			return
		}
		// 缓存超过上限的
		if (components.current.length >= maxLen) {
			components.current = components.current.slice(1)
		}
		// 添加
		const component = components.current.find((res) => equals(res.name, active))
		if (isNil(component)) {
			components.current = [
				...components.current,
				{
					name: active,
					ele: children,
				},
			]
			if (not(asyncInclude)) {
				update()
			}
		}
		return () => {
			if (isNil(exclude) && isNil(include)) {
				return
			}
			components.current = filter(({ name }) => {
				if (exclude && exclude.includes(name)) {
					return false
				}
				if (include) {
					return include.includes(name)
				}
				return true
			}, components.current)
		}
	}, [children, active, exclude, maxLen, include, update, asyncInclude])
	return (
		<>
			<div ref={containerRef} className="keep-alive" />
			{map(
				({ name, ele }) => (
					<Component active={equals(name, active)} renderDiv={containerRef} name={name} key={name}>
						{ele}
					</Component>
				),
				components.current
			)}
		</>
	)
}
export default memo(KeepAlive)
interface ComponentProps {
	active: boolean
	children: Children
	name: string
	renderDiv: RefObject<HTMLDivElement>
}

function Component({ active, children, name, renderDiv }: ComponentProps) {
	const [targetElement] = useState(() => document.createElement('div'))
	const activatedRef = useRef(false)
	activatedRef.current = activatedRef.current || active
	useEffect(() => {
		if (active) {
			renderDiv.current?.appendChild(targetElement)
		} else {
			try {
				renderDiv.current?.removeChild(targetElement)
			} catch (e) {}
		}
	}, [active, name, renderDiv, targetElement])
	useEffect(() => {
		targetElement.setAttribute('id', name)
	}, [name, targetElement])
	return <>{activatedRef.current && ReactDOM.createPortal(children, targetElement)}</>
}
export const KeepAliveComponent = memo(Component)
