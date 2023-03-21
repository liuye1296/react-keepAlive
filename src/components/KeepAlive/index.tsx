import ReactDOM from 'react-dom'
import { equals, isNil, map, filter, includes, length, append, slice, find } from 'ramda'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
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
    setCacheReactNodes((cacheReactNodes) => {
      // 缓存超过上限的
      if (length(cacheReactNodes) >= maxLen) {
        cacheReactNodes = slice(1, length(cacheReactNodes), cacheReactNodes)
      }
      // 添加
      const cacheReactNode = cacheReactNodes.find((res) => equals(res.name, activeName))
      if (isNil(cacheReactNode)) {
        cacheReactNodes = append(
          {
            name: activeName,
            ele: children,
          },
          cacheReactNodes
        )
      } else {
        cacheReactNodes = map((res) => {
          return equals(res.name, activeName) ? { ...res, ele: children } : res
        }, cacheReactNodes)
      }
      return isNil(exclude) && isNil(include)
        ? cacheReactNodes
        : filter(({ name }) => {
          if (exclude && includes(name, exclude)) {
            return false
          }
          if (include) {
            return includes(name, include)
          }
          return true
        }, cacheReactNodes)
    })
  }, [children, activeName, exclude, maxLen, include])
  const currentKeepAlive = isNil(activeName)
    ? true
    : isNil(find((item) => equals(item.name, activeName), cacheReactNodes))
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
      {currentKeepAlive ? children : null}
    </>
  )
}
export default KeepAlive
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
  }, [active, renderDiv, targetElement])
  useEffect(() => {
    targetElement.setAttribute('id', name)
  }, [name, targetElement])
  return <>{activatedRef.current && ReactDOM.createPortal(children, targetElement)}</>
}
