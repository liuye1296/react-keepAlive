import { useView } from '@/hooks/useView'
import { useCallback } from 'react'
import { ActionType } from '@/layout/tagsView'
import { useLocation } from 'react-router'
export default function useUpdateTagName(key?: string) {
	const { dispatch } = useView()
	const location = useLocation()
	const updateTagName = useCallback(
		(title: string) => {
			if (dispatch && (key || location)) {
				dispatch({
					type: ActionType.update,
					payload: {
						key: key ?? location.pathname,
						title,
					},
				})
			}
		},
		[key, location, dispatch]
	)
	return updateTagName
}
