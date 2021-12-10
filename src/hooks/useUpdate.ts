import { useState, useCallback } from 'react'
export function useUpdate() {
	const [, setSate] = useState()
	const update = useCallback(() => {
		setSate(() => {
			return undefined
		})
	}, [])
	return update
}
