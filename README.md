### 关于本项目
基于 react-routerV6 原生实现 KeepAlive 无需任何其他库或者其他插件

### 原理：
   ####核心API  
     1：react-routerV6 的 useRoutes。
     2：Reate 的  createPortal。
   利用 useRoutes 动态匹配路由  存储每次匹配到的信息<br/>。
   利用 createPortal 将非当前渲染的路由 移动到一个 document.createElement('div') 当中

### 核心代码：
    /*路由 渲染layout组件  在layout里面利用 useRoutes 匹配  路由信息跟vnode
    然后传递给 /components/KeepAlive 组件
    KeepAlive 自己缓存一个Map 对象 map.set('路由信息的pathname',vnode)
    然后匹配当前路由的 pathname 渲染对应的 vnode 
    没匹配的就利用createPortal渲染到DIV里面
