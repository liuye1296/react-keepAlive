import { Input } from 'antd'

export default function List() {
	return (
		<div>
			<Input placeholder="输入一个值 然后切换tag 组件不会被销毁" />
			<div>List</div>
		</div>
	)
}
