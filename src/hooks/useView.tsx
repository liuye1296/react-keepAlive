import { createContext, useContext } from 'react'
import type { Dispatch } from 'react'
import type { Action } from '@/layout/tagsView'
interface ViewContext {
	name?: string
	dispatch?: Dispatch<Action>
	mate?: any
}
const ViewContext = createContext<ViewContext>({})
const Provider = ViewContext.Provider
export const useView = () => {
	// const routeContext = React.useContext(RouteContext)
	return useContext(ViewContext)
}
interface Props {
	children: JSX.Element
	value: ViewContext
}
export const ViewProvider = ({ value, children }: Props) => <Provider value={value}>{children}</Provider>
