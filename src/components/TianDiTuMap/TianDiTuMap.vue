<template>
    <div class="map-container">
        <div id="map" ref="mapContainer"></div>

        <!-- 地图类型切换 -->
        <div class="map-type-control" v-if="isMapReady">
            <el-button-group>
                <el-button
                    v-for="type in mapTypeList"
                    :key="type.value"
                    :type="currentMapType === type.value ? 'primary' : 'default'"
                    size="small"
                    @click="handleMapTypeClick(type.value)"
                >
                    {{ type.label }}
                </el-button>
            </el-button-group>
        </div>

        <!-- 地图控件 -->
        <div class="map-controls" v-if="isMapReady">
            <el-button-group>
                <el-button type="primary" size="small" @click="zoomIn" :disabled="zoom >= maxZoom">
                    <el-icon><Plus /></el-icon>
                </el-button>
                <el-button type="primary" size="small" @click="zoomOut" :disabled="zoom <= minZoom">
                    <el-icon><Minus /></el-icon>
                </el-button>
            </el-button-group>

            <el-button type="primary" size="small" @click="centerMap" class="center-btn">
                <el-icon><Position /></el-icon>
                回到中心
            </el-button>

            <el-button type="info" size="small" @click="showCurrentLocation" class="location-btn">
                <el-icon><Location /></el-icon>
                当前位置
            </el-button>
        </div>

        <!-- 坐标显示 -->
        <div class="coordinate-display" v-if="showCoordinate && isMapReady">
            <div class="coordinate-item">
                <span class="label">经度:</span>
                <span class="value">{{ currentLng.toFixed(6) }}</span>
            </div>
            <div class="coordinate-item">
                <span class="label">纬度:</span>
                <span class="value">{{ currentLat.toFixed(6) }}</span>
            </div>
            <div class="coordinate-item">
                <span class="label">级别:</span>
                <span class="value">{{ zoom }}</span>
            </div>
            <div class="coordinate-item">
                <span class="label">类型:</span>
                <span class="value">{{ currentMapTypeLabel }}</span>
            </div>
        </div>

        <!-- 加载状态 -->
        <div class="loading-overlay" v-if="loading">
            <div class="loading-content">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <span>地图加载中...</span>
            </div>
        </div>

        <!-- 错误提示 -->
        <div class="error-overlay" v-if="error">
            <el-alert :title="error" type="error" :closable="true" @close="error = ''" show-icon />
        </div>
    </div>
</template>

<script>
    // 在模块作用域中定义配置
    import { MAP_TYPES, DEFAULT_CONFIG } from './config.js';

    // 导出配置
    export { MAP_TYPES, DEFAULT_CONFIG };
</script>

<script setup>
    import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
    import { ElButton, ElButtonGroup, ElIcon, ElAlert } from 'element-plus';
    import { Plus, Minus, Position, Location, Loading } from '@element-plus/icons-vue';

    // 导入工具函数
    import { loadTianDiTuAPI, getMapTypeUrls, getTKError } from './utils.js';

    // 组件props定义
    const props = defineProps({
        center: {
            type: Object,
            default: () => ({ lng: 116.404, lat: 39.915 }),
        },
        zoom: {
            type: Number,
            default: DEFAULT_CONFIG.zoom,
        },
        minZoom: {
            type: Number,
            default: DEFAULT_CONFIG.minZoom,
        },
        maxZoom: {
            type: Number,
            default: DEFAULT_CONFIG.maxZoom,
        },
        showCoordinate: {
            type: Boolean,
            default: true,
        },
        defaultMapType: {
            type: String,
            default: 'vector',
            validator: (value) => ['vector', 'image', 'terrain'].includes(value),
        },
        showControls: {
            type: Boolean,
            default: true,
        },
    });

    // 响应式变量
    const mapContainer = ref(null);
    const mapInstance = ref(null);
    const currentLng = ref(props.center.lng);
    const currentLat = ref(props.center.lat);
    const zoom = ref(props.zoom);
    const currentMapType = ref(props.defaultMapType);
    const isMapReady = ref(false);
    const loading = ref(false);
    const error = ref('');

    // 计算属性
    const currentMapTypeLabel = computed(() => {
        return MAP_TYPES[currentMapType.value]?.label || '未知';
    });

    const mapTypeList = computed(() => {
        return Object.keys(MAP_TYPES).map((value) => ({
            value,
            label: MAP_TYPES[value].label,
        }));
    });

    // 验证是否为有效的地图类型
    const isValidMapType = (type) => {
        return ['vector', 'image', 'terrain'].includes(type);
    };

    // 地图类型点击处理
    const handleMapTypeClick = (type) => {
        if (isValidMapType(type)) {
            switchMapType(type);
        }
    };

    // 初始化地图
    const initMap = async () => {
        if (!mapContainer.value) return;

        loading.value = true;
        error.value = '';

        await nextTick();

        // 检查TK
        const tkError = getTKError();
        if (tkError) {
            error.value = tkError;
            loading.value = false;
            return;
        }

        try {
            // 动态加载天地图API
            if (!window.T) {
                await loadTianDiTuAPI();
            }

            // 创建地图实例
            mapInstance.value = new window.T.Map(mapContainer.value, {
                minZoom: props.minZoom,
                maxZoom: props.maxZoom,
            });

            // 设置中心点和缩放
            mapInstance.value.centerAndZoom(
                new window.T.LngLat(props.center.lng, props.center.lat),
                props.zoom
            );

            // 添加当前类型的地图
            addMapLayer(currentMapType.value);

            // 添加事件监听
            addMapEventListeners();

            // 添加控件
            addMapControls();

            isMapReady.value = true;
            loading.value = false;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : '地图加载失败，请检查TK和网络连接';
            console.error('地图初始化失败:', err);
            error.value = errorMessage;
            loading.value = false;
        }
    };

    // 添加地图图层
    const addMapLayer = (type) => {
        if (!mapInstance.value) return;

        const config = MAP_TYPES[type];
        if (!config) return;

        try {
            // 清除现有图层
            mapInstance.value.clearLayers();

            const { baseUrl, labelUrl } = getMapTypeUrls(type);

            if (!baseUrl || !labelUrl) {
                throw new Error('图层URL生成失败');
            }

            // 添加底图
            const baseLayer = new window.T.TileLayer(baseUrl, {
                minZoom: props.minZoom,
                maxZoom: props.maxZoom,
            });
            mapInstance.value.addLayer(baseLayer);

            // 添加注记
            const labelLayer = new window.T.TileLayer(labelUrl, {
                minZoom: props.minZoom,
                maxZoom: props.maxZoom,
            });
            mapInstance.value.addLayer(labelLayer);
        } catch (err) {
            console.error('添加地图图层失败:', err);
            error.value = '地图图层加载失败';
        }
    };

    // 切换地图类型
    const switchMapType = (type) => {
        if (currentMapType.value === type || !isMapReady.value) return;

        currentMapType.value = type;
        addMapLayer(type);
    };

    // 添加地图事件监听
    const addMapEventListeners = () => {
        if (!mapInstance.value) return;

        const updatePosition = () => {
            try {
                const center = mapInstance.value.getCenter();
                if (center) {
                    currentLng.value = center.lng;
                    currentLat.value = center.lat;
                    zoom.value = mapInstance.value.getZoom();
                }
            } catch (err) {
                console.error('更新地图位置失败:', err);
            }
        };

        // 地图移动结束事件
        mapInstance.value.addEventListener('moveend', updatePosition);

        // 缩放结束事件
        mapInstance.value.addEventListener('zoomend', () => {
            zoom.value = mapInstance.value.getZoom();
        });

        // 地图点击事件
        mapInstance.value.addEventListener('click', (e) => {
            if (e && e.lnglat) {
                console.log('点击坐标:', { lng: e.lnglat.lng, lat: e.lnglat.lat });
            }
        });

        // 初始更新
        updatePosition();
    };

    // 添加地图控件
    const addMapControls = () => {
        if (!mapInstance.value || !props.showControls) return;

        try {
            const scaleControl = new window.T.Control.Scale();
            const zoomControl = new window.T.Control.Zoom();
            mapInstance.value.addControl(scaleControl);
            mapInstance.value.addControl(zoomControl);
        } catch (err) {
            console.error('添加地图控件失败:', err);
        }
    };

    // 地图控制方法
    const zoomIn = () => {
        if (mapInstance.value && zoom.value < props.maxZoom) {
            mapInstance.value.zoomIn();
        }
    };

    const zoomOut = () => {
        if (mapInstance.value && zoom.value > props.minZoom) {
            mapInstance.value.zoomOut();
        }
    };

    // 回到中心点
    const centerMap = () => {
        if (mapInstance.value) {
            mapInstance.value.centerAndZoom(
                new window.T.LngLat(props.center.lng, props.center.lat),
                props.zoom
            );
        }
    };

    // 显示当前位置信息
    const showCurrentLocation = () => {
        if (!mapInstance.value) return;

        const center = mapInstance.value.getCenter();
        const zoomLevel = mapInstance.value.getZoom();

        alert(`当前位置:
  经度: ${center.lng.toFixed(6)}
  纬度: ${center.lat.toFixed(6)}
  缩放级别: ${zoomLevel}
  地图类型: ${currentMapTypeLabel.value}`);
    };

    // 重新加载地图
    const reloadMap = () => {
        if (mapInstance.value) {
            mapInstance.value.destroy();
            mapInstance.value = null;
        }

        isMapReady.value = false;
        initMap();
    };

    // 组件挂载时初始化地图
    onMounted(() => {
        initMap();
    });

    // 组件卸载时销毁地图
    onUnmounted(() => {
        if (mapInstance.value) {
            try {
                mapInstance.value.destroy();
            } catch (err) {
                console.error('地图销毁失败:', err);
            }
        }
    });

    // 暴露方法给父组件
    defineExpose({
        switchMapType,
        centerMap,
        zoomIn,
        zoomOut,
        showCurrentLocation,
        reloadMap,
        getCurrentCenter: () => ({ lng: currentLng.value, lat: currentLat.value }),
        getCurrentZoom: () => zoom.value,
        getCurrentMapType: () => currentMapType.value,
    });
</script>

<style scoped>
    .map-container {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 500px;
        overflow: hidden;
    }

    #map {
        width: 100%;
        height: 100%;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        background: #f5f7fa;
    }

    .map-type-control {
        position: absolute;
        top: 20px;
        right: 20px;
        z-index: 1000;
        background: rgba(255, 255, 255, 0.95);
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #dcdfe6;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }

    .map-type-control .el-button-group {
        display: flex;
        gap: 2px;
    }

    .map-controls {
        position: absolute;
        top: 10px;
        left: 60px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        z-index: 1000;
        background: rgba(255, 255, 255, 0.95);
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #dcdfe6;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }

    .center-btn,
    .location-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
    }

    .coordinate-display {
        position: absolute;
        bottom: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.95);
        padding: 8px 16px;
        border-radius: 4px;
        border: 1px solid #dcdfe6;
        font-size: 12px;
        color: #606266;
        z-index: 1000;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .coordinate-item {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .coordinate-item .label {
        color: #909399;
        min-width: 40px;
    }

    .coordinate-item .value {
        color: #303133;
        font-weight: 500;
        font-family: 'Monaco', 'Consolas', monospace;
    }

    .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .loading-content {
        text-align: center;
        padding: 40px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        border: 1px solid #dcdfe6;
    }

    .loading-icon {
        font-size: 40px;
        color: #409eff;
        margin-bottom: 16px;
        animation: rotate 2s linear infinite;
    }

    .loading-content span {
        display: block;
        color: #606266;
        font-size: 16px;
    }

    .error-overlay {
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1001;
        width: 90%;
        max-width: 600px;
    }

    @keyframes rotate {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
