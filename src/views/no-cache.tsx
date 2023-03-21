import { Input } from 'antd'

export default function NoCache() {
	return (
		<div>
			<Input placeholder="输入一个值 然后切换tag内容会清空" />
			<div>NoCache</div>
		</div>
	)
}
