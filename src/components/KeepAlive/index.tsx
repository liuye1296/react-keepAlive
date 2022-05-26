import { createPortal } from 'react-dom'
import { equals, isNil, map, filter, slice, length, append, includes } from 'ramda'
import { memo, useEffect, useRef, useState } from 'react'
import type { RefObject, ReactNode } from 'react'
export interface ComponentReactElement {
	children?: ReactNode | ReactNode[]
}
interface Props extends ComponentReactElement {
	activeName?: string
	include?: Array<string>
	exclude?: Array<string>
	maxLen?: number
}
function KeepAlive({ activeName, children, exclude, include, maxLen = 10 }: Props) {
	const containerRef = useRef<HTMLDivElement>(null)
	const [cacheReactNodes, setCacheReactNodes] = useState<Array<{ name: string; ele?: ReactNode }>>([])
	useEffect(() => {
		if (isNil(activeName)) {
			return
		}
		setCacheReactNodes((reactNodes) => {
			// 缓存超过上限的
			if (reactNodes.length >= maxLen) {
				reactNodes = slice(1, length(reactNodes), reactNodes)
			}
			// 添加
			const reactNode = reactNodes.find((res) => equals(res.name, activeName))
			if (isNil(reactNode)) {
				reactNodes = append(
					{
						name: activeName,
						ele: children,
					},
					reactNodes
				)
			}
			return isNil(exclude) && isNil(include)
				? reactNodes
				: filter(({ name }) => {
						if (exclude) {
							if (includes(name, exclude)) {
								return false
							}
						}
						if (include) {
							return includes(name, include)
						}
						return true
				  }, reactNodes)
		})
	}, [children, activeName, exclude, maxLen, include])
	return (
		<>
			<div ref={containerRef} className="keep-alive" />
			{map(
				({ name, ele }) => (
					<Component active={equals(name, activeName)} renderDiv={containerRef} name={name} key={name}>
						{ele}
					</Component>
				),
				cacheReactNodes
			)}
		</>
	)
}
export default memo(KeepAlive)
interface ComponentProps extends ComponentReactElement {
	active: boolean
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
	return <>{activatedRef.current && createPortal(children, targetElement)}</>
}
export const KeepAliveComponent = memo(Component)
