import { createContext, useContext } from 'react'
import { Action } from '@/layout/tagsView'
interface ViewContext {
	name?: string
	dispatch?: React.Dispatch<Action>
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
