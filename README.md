# 功能简介
这是一个基于`knockoutJS`和`GoogleMap Api`实现的简单应用。
支持简单的搜索地点（基于自定义数据文件），并在地图中标示，并且调用`wiki api`显示相应地点的简介。

# 启动方法
克隆本项目，进入根目录下，执行 `npm install` 安装所需依赖包。
然后在浏览器运行`index.html`即可。

# 相关功能说明

- 地点搜索：支持列表中所显示地点的中文、英文或者英文首字母组合搜索。
比如`ZhongShan Park` 可以输入`zsp` 或者 `zhongshan` 或者`中山` 来获得搜索结果

- wiki 信息获取：1、可以通过 点击 右侧列表对应地点来激活 GoogleMap 的`infoWindow`来显示相关`wiki`词条的信息，
点击之后当前列表项红色高亮，再次点击取消。2、直接地图上对应的`红色marker`，效果同前一种。

- 点击右上角的`x`按钮可以隐藏搜索栏，再次点击显示。

- 由于`GoogleMap api`和`wiki api`均是境外服务商提供，在国内环境下访问可能会遇网络故障，请确保在网络环境无碍的情况下使用。