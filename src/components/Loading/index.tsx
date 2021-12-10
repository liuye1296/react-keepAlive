import { Button, Spin, Modal } from 'antd'
import { Suspense } from 'react'
import $style from './index.module.css'
/**
 * 加载资源时候 显示的等待界面
 * @user: antes
 * @emial: tangzhlyd@gmail.com
 * @data: 2020/12/15 下午1:07
 */
export function Loading() {
	return (
		<div className={$style.rantion_loading} style={{ paddingTop: '20vh', minHeight: '80vh' }}>
			<Spin tip="Loading..." size="large" />
		</div>
	)
}
interface Props {
	children: JSX.Element
}
export function SuspenseLoading({ children }: Props) {
	return <Suspense fallback={<Loading />}>{children}</Suspense>
}
/**
 * 加载失败
 * @param props
 * @constructor
 */
export function LoadingError() {
	function reload() {
		localStorage.clear()
		location.reload()
	}
	function showConfirm() {
		Modal.confirm({
			title: 'sorry',
			content: '程序猿认识到他的错误了, 确定将清理缓存，重新登录',
			onOk() {
				reload()
			},
		})
	}
	return (
		<div className={$style.rantion_loading}>
			<div className={$style.page404}>500</div>
			<div className={$style.subtitle}>很抱歉，程序出现异常了。</div>
			<br />
			<Button type="link" onClick={reload}>
				注销登录，重新加载
			</Button>
			or
			<Button type="link" onClick={showConfirm}>
				狠狠的批斗程序猿
			</Button>
		</div>
	)
}
