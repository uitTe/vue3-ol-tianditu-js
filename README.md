# 🗺️ 天地图 Vue3 项目

基于 Vue 3 + Element Plus + JavaScript 的天地图集成项目，提供矢量、影像、地形三种地图类型切换，支持城市快速定位、地图缩放、坐标显示等功能。

## ✨ 功能特性

-   🗺️ **三种地图类型**：矢量地图、影像地图、地形地图
<!-- -   🎯 **快速定位**：支持北京、上海、广州、深圳等主要城市 -->
-   🔍 **地图控制**：缩放、定位、重载、当前位置显示
-   📊 **实时信息**：显示当前坐标、缩放级别、地图类型
-   🎨 **现代化 UI**：基于 Element Plus 的响应式设计
-   🚀 **性能优化**：异步加载、错误处理、加载状态
-   ⚙️ **配置灵活**：环境变量配置、可自定义中心点

## 🚀 快速开始

### 环境要求

-   Node.js >= 20.19.0
-   npm >= 7.0.0 或 yarn >= 1.22.0

### 安装步骤

1. **克隆项目**
   bash
   git clone <项目地址>
   cd vue-tianditu-js
   复制
2. **安装依赖**
   bash
   npm install
   或
   yarn install
   复制
3. **配置天地图 TK**

新建并编辑 .env 文件，设置你的天地图 TK
打开 .env 文件，修改以下内容：
VITE_TIAN_DI_TU_TK=你的实际天地图 tk
复制

> **注意**：天地图 TK 需要申请，访问 [天地图官网](https://www.tianditu.gov.cn/) 注册并获取 TK。

4. **启动开发服务器**
   bash
   npm run dev
   或
   yarn dev
   复制
5. **构建生产版本**
   bash
   npm run build
   或
   yarn build
   复制
6. **预览生产版本**
   bash
   npm run preview
   或
   yarn preview
   复制

## 📁 项目结构

vue-tianditu-js/
├── .env.example # 环境变量示例
├── index.html # 入口 HTML 文件
├── vite.config.js # Vite 配置
├── package.json # 项目依赖
├── src/
│ ├── main.js # 应用入口
│ ├── App.vue # 根组件
│ ├── components/ # 组件目录
│ │ ├── index.js # 组件导出
│ │ └── TianDiTuMap/ # 天地图组件
│ │ ├── index.js # 组件入口
│ │ ├── TianDiTuMap.vue # 主组件
│ │ ├── config.js # 配置常量
│ │ └── utils.js # 工具函数
│ └── views/ # 页面视图
│ └── MapDemo.vue # 地图演示页面
└── public/ # 静态资源
复制

## 🎮 使用说明

### 基本使用

vue
<template>

<div style="height: 600px;">
<TianDiTuMap />
</div>
</template>
<script setup>
import TianDiTuMap from '@/components/TianDiTuMap'
</script>
复制
### 自定义配置
vue
<template>
<TianDiTuMap
:center="{ lng: 121.4737, lat: 31.2304 }"
:zoom="13"
:default-map-type="'image'"
:show-coordinate="true"
style="height: 500px;"
/>
</template>
复制
### 通过ref控制地图
vue
<template>
<div>
<TianDiTuMap ref="mapRef" style="height: 500px;" />
复制
<div class="controls">
  <el-button @click="switchToImage">影像地图</el-button>
  <el-button @click="gotoBeijing">定位北京</el-button>
  <el-button @click="zoomIn">放大</el-button>
  <el-button @click="zoomOut">缩小</el-button>
</div>
</div>
</template>
<script setup>
import { ref } from 'vue'
import TianDiTuMap from '@/components/TianDiTuMap'
import { CITY_COORDINATES } from '@/components/TianDiTuMap/config.js'
const mapRef = ref()
const switchToImage = () => {
mapRef.value?.switchMapType('image')
}
const gotoBeijing = () => {
if (mapRef.value) {
mapRef.value.centerMap()
}
}
const zoomIn = () => mapRef.value?.zoomIn()
const zoomOut = () => mapRef.value?.zoomOut()
</script>
复制
## 📋 API 参考

### 组件属性 (Props)

| 属性           | 类型    | 默认值                      | 说明             |
| -------------- | ------- | --------------------------- | ---------------- |
| center         | Object  | {lng: 116.404, lat: 39.915} | 地图中心点坐标   |
| zoom           | Number  | 12                          | 缩放级别         |
| minZoom        | Number  | 3                           | 最小缩放级别     |
| maxZoom        | Number  | 18                          | 最大缩放级别     |
| showCoordinate | Boolean | true                        | 是否显示坐标信息 |
| defaultMapType | String  | 'vector'                    | 默认地图类型     |
| showControls   | Boolean | true                        | 是否显示地图控件 |

### 地图类型

| 类型值  | 说明     | 底图图层 | 注记图层 |
| ------- | -------- | -------- | -------- |
| vector  | 矢量地图 | vec_w    | cva_w    |
| image   | 影像地图 | img_w    | cia_w    |
| terrain | 地形地图 | ter_w    | cta_w    |

### 组件方法 (通过 ref 调用)

| 方法名              | 参数         | 返回值 | 说明               |
| ------------------- | ------------ | ------ | ------------------ |
| switchMapType       | type: String | void   | 切换地图类型       |
| centerMap           | 无           | void   | 回到中心点         |
| zoomIn              | 无           | void   | 放大地图           |
| zoomOut             | 无           | void   | 缩小地图           |
| showCurrentLocation | 无           | void   | 显示当前位置信息   |
| reloadMap           | 无           | void   | 重新加载地图       |
| getCurrentCenter    | 无           | Object | 获取当前中心点坐标 |
| getCurrentZoom      | 无           | Number | 获取当前缩放级别   |
| getCurrentMapType   | 无           | String | 获取当前地图类型   |

### 事件 (Events)

| 事件名  | 参数                       | 说明             |
| ------- | -------------------------- | ---------------- |
| moveend | 无                         | 地图移动结束事件 |
| zoomend | 无                         | 地图缩放结束事件 |
| click   | {lng: number, lat: number} | 地图点击事件     |

### 工具函数 (utils.js)

| 函数名           | 参数                                 | 返回值                              | 说明                       |
| ---------------- | ------------------------------------ | ----------------------------------- | -------------------------- |
| getTileUrl       | layerType: String                    | String                              | 获取瓦片 URL               |
| getMapTypeUrls   | mapType: String                      | {baseUrl: String, labelUrl: String} | 获取指定地图类型的图层 URL |
| loadTianDiTuAPI  | 无                                   | Promise<void>                       | 动态加载天地图 API         |
| validateTK       | 无                                   | Boolean                             | 验证 TK 有效性             |
| getTKError       | 无                                   | String                              | 获取 TK 错误信息           |
| formatCoordinate | value: Number, decimalPlaces: Number | String                              | 格式化坐标显示             |
| getLocationInfo  | center: {lng: number, lat: number}   | String                              | 判断位置信息               |

### 配置常量 (config.js)

| 常量名           | 类型   | 值               | 说明                               |
| ---------------- | ------ | ---------------- | ---------------------------------- |
| MAP_TYPES        | Object | 地图类型配置对象 | 包含矢量、影像、地形三种地图的配置 |
| DEFAULT_CONFIG   | Object | 默认地图配置     | 包含中心点、缩放级别等默认配置     |
| TDT_TK           | String | 从环境变量获取   | 天地图 TK                          |
| CITY_COORDINATES | Object | 城市坐标对象     | 包含 8 个主要城市的经纬度坐标      |

### 常用城市坐标

| 城市 | 经度 (lng) | 纬度 (lat) |
| ---- | ---------- | ---------- |
| 北京 | 116.404    | 39.915     |
| 上海 | 121.4737   | 31.2304    |
| 广州 | 113.2644   | 23.1291    |
| 深圳 | 114.0579   | 22.5431    |
| 杭州 | 120.1551   | 30.2741    |
| 成都 | 104.0668   | 30.5728    |
| 武汉 | 114.3052   | 30.5928    |
| 西安 | 108.9422   | 34.2644    |

## 🔧 配置说明

### 天地图 TK 配置

1. **申请 TK**：访问[天地图官网](https://www.tianditu.gov.cn/)注册并申请 TK
2. **配置环境变量**：在 `.env` 文件中设置
3. **验证 TK**：确保 TK 长度大于 20 位

### 自定义配置

修改 `src/components/TianDiTuMap/config.js` 文件：
javascript
// 地图类型配置
export const MAP_TYPES = {
vector: {
label: '矢量地图',
baseLayer: 'vec_w', // 矢量底图
labelLayer: 'cva_w' // 矢量注记
},
// ... 其他配置
}
// 默认地图配置
export const DEFAULT_CONFIG = {
center: { lng: 116.404, lat: 39.915 }, // 默认中心点
zoom: 12, // 默认缩放级别
minZoom: 3, // 最小缩放级别
maxZoom: 18 // 最大缩放级别
}
复制

## 🐛 常见问题

### 1. 地图不显示

-   **检查 TK 配置**：确保在 `.env` 文件中设置了正确的 TK
-   **检查网络**：确保可以访问天地图 API
-   **查看控制台**：检查浏览器控制台是否有错误信息

### 2. 坐标不正确

-   **坐标范围**：经度范围 -180~180，纬度范围 -90~90
-   **坐标系**：天地图使用 WGS84 坐标系（经纬度）

### 3. 地图切换失败

-   **检查 TK 有效性**：确保 TK 未过期
-   **网络请求**：查看浏览器开发者工具的网络请求

### 4. 图标显示问题

如果遇到图标导入错误，可以：

1. 检查图标名称是否正确
2. 暂时移除图标，只使用文字
3. 查看可用的图标列表

## 📱 浏览器兼容性

-   Chrome >= 60
-   Firefox >= 60
-   Safari >= 12
-   Edge >= 79

## 📄 许可证

本项目基于 MIT 许可证开源。

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 🙏 致谢

-   [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
-   [Element Plus](https://element-plus.org/) - Vue 3 UI 组件库
-   [天地图](https://www.tianditu.gov.cn/) - 国家基础地理信息公共服务
-   [Vite](https://vitejs.dev/) - 下一代前端构建工具

**开始使用** → 按照[快速开始](#快速开始)步骤配置和运行项目
