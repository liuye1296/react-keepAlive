/*
 * @Author: Chan
 * @Date: 2021-05-15 15:40:52
 * @LastEditTime: 2021-08-05 16:35:13
 * @LastEditors: Chan
 * @Description: 自定义图表spin
 */
import { Spin } from 'antd'
interface Props {
	height?: number
}
function customSpin(props: Props) {
	const { height } = props
	return (
		<div
			style={{
				height: height ? height + 'px' : '300px',
				width: '100%',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				zIndex: 99,
			}}
		>
			<Spin />
		</div>
	)
}

const CustomSpin = customSpin
export { CustomSpin }
