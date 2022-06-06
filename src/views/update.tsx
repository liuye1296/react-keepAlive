import { Input, Button } from 'antd'
import { useRef } from 'react'
import useUpdateTagName from '@/hooks/useUpdateTagName'

export default function Role() {
	const name = useRef('')
	const updateTagName = useUpdateTagName()
	return (
		<div>
			<Input
				placeholder="输入一个值 然后切换 组件不会被销毁"
				onChange={(e) => {
					name.current = e.target.value
				}}
			/>
			<Button
				type="primary"
				onClick={() => {
					updateTagName(name.current)
				}}
			>
				修改页签名字
			</Button>
		</div>
	)
}
