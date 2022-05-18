import { createRoot } from 'react-dom/client'
import { SyncRouter } from '@/router'
import { StrictMode } from 'react'
import './styles/index.scss'
const dom = document.getElementById('app')
if (dom) {
	const root = createRoot(dom)
	root.render(
		<StrictMode>
			<SyncRouter />
		</StrictMode>
	)
}
