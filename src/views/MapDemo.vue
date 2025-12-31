<template>
    <div class="map-demo">
        <div class="header">
            <p>天地图演示 (Vue3 + Element Plus + JS)</p>
        </div>

        <div class="map-section">
            <div class="map-wrapper">
                <TianDiTuMap
                    ref="mapRef"
                    :center="currentCenter"
                    :zoom="currentZoom"
                    :default-map-type="currentMapType"
                />
            </div>

            <div class="control-section">
                <div class="control-card">
                    <h3>
                        <el-icon><MapLocation /></el-icon> 地图类型
                    </h3>
                    <div class="button-group">
                        <el-button
                            v-for="type in mapTypes"
                            :key="type.value"
                            :type="currentMapType === type.value ? 'primary' : 'default'"
                            @click="switchMap(type.value)"
                            size="large"
                            class="type-button"
                        >
                            {{ type.label }}
                        </el-button>
                    </div>
                </div>

                <!-- <div class="control-card">
                    <h3>
                        <el-icon><Location /></el-icon> 快速定位
                    </h3>
                    <div class="city-buttons">
                        <el-button
                            v-for="city in cities"
                            :key="city.id"
                            @click="gotoCity(city.id)"
                            size="small"
                            class="city-button"
                        >
                            {{ city.name }}
                        </el-button>
                    </div>
                </div> -->

                <div class="control-card">
                    <h3>
                        <el-icon><Setting /></el-icon> 地图控制
                    </h3>
                    <div class="action-buttons">
                        <el-button @click="zoomIn" type="primary" plain>
                            <el-icon><ZoomIn /></el-icon> 放大
                        </el-button>
                        <el-button @click="zoomOut" type="primary" plain>
                            <el-icon><ZoomOut /></el-icon> 缩小
                        </el-button>
                        <el-button @click="centerMap" type="success" plain>
                            <el-icon><Position /></el-icon> 回中心
                        </el-button>
                        <el-button @click="reloadMap" type="warning" plain>
                            <el-icon><Refresh /></el-icon> 重载
                        </el-button>
                        <el-button @click="showCurrentLocation" type="info" plain>
                            <el-icon><Monitor /></el-icon> 当前位置
                        </el-button>
                    </div>
                </div>

                <div class="control-card">
                    <h3>
                        <el-icon><InfoFilled /></el-icon> 地图信息
                    </h3>
                    <div class="info-display">
                        <div class="info-item">
                            <span class="label">中心坐标：</span>
                            <span class="value">{{ mapInfo.center || '--' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">缩放级别：</span>
                            <span class="value">{{ mapInfo.zoom || '--' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">地图类型：</span>
                            <span class="value">{{ mapInfo.type || '--' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">状态：</span>
                            <span class="value" :class="mapInfo.ready ? 'success' : 'error'">
                                {{ mapInfo.ready ? '就绪' : '加载中' }}
                            </span>
                        </div>
                    </div>
                    <el-button @click="updateMapInfo" type="info" size="small" class="refresh-btn">
                        <el-icon><Refresh /></el-icon> 刷新信息
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { ElButton, ElIcon, ElMessage } from 'element-plus';
    import {
        MapLocation,
        // Map,
        Picture,
        Promotion,
        Location,
        Setting,
        ZoomIn,
        ZoomOut,
        Position,
        Refresh,
        Monitor,
        InfoFilled,
    } from '@element-plus/icons-vue';
    import TianDiTuMap from '@/components/TianDiTuMap/TianDiTuMap.vue';
    import { CITY_COORDINATES } from '@/components/TianDiTuMap/config.js';

    const mapRef = ref();
    const currentCenter = ref(CITY_COORDINATES.BEIJING);
    const currentZoom = ref(12);
    const currentMapType = ref('vector');
    const mapInfo = ref({
        center: '',
        zoom: '',
        type: '',
        ready: false,
    });

    const mapTypes = [
        { value: 'vector', label: '矢量地图' },
        { value: 'image', label: '影像地图' },
        { value: 'terrain', label: '地形地图' },
    ];

    const cities = [
        { id: 'beijing', name: '北京' },
        { id: 'shanghai', name: '上海' },
        { id: 'guangzhou', name: '广州' },
        { id: 'shenzhen', name: '深圳' },
        { id: 'hangzhou', name: '杭州' },
        { id: 'chengdu', name: '成都' },
        { id: 'wuhan', name: '武汉' },
        { id: 'xian', name: '西安' },
    ];

    // 切换地图类型
    const switchMap = (type) => {
        if (mapRef.value) {
            mapRef.value.switchMapType(type);
            currentMapType.value = type;
            const typeLabels = { vector: '矢量', image: '影像', terrain: '地形' };
            ElMessage.success(`已切换到${typeLabels[type]}地图`);
        }
    };

    // 定位到城市
    const gotoCity = (cityId) => {
        const cityConfig = {
            beijing: { lng: 116.404, lat: 39.915, zoom: 12, name: '北京' },
            shanghai: { lng: 121.4737, lat: 31.2304, zoom: 13, name: '上海' },
            guangzhou: { lng: 113.2644, lat: 23.1291, zoom: 12, name: '广州' },
            shenzhen: { lng: 114.0579, lat: 22.5431, zoom: 12, name: '深圳' },
            hangzhou: { lng: 120.1551, lat: 30.2741, zoom: 12, name: '杭州' },
            chengdu: { lng: 104.0668, lat: 30.5728, zoom: 12, name: '成都' },
            wuhan: { lng: 114.3052, lat: 30.5928, zoom: 12, name: '武汉' },
            xian: { lng: 108.9422, lat: 34.2644, zoom: 12, name: '西安' },
        };

        const city = cityConfig[cityId];
        if (city) {
            currentCenter.value = { lng: city.lng, lat: city.lat };
            currentZoom.value = city.zoom;
            if (mapRef.value) {
                mapRef.value.centerMap();
            }
            ElMessage.success(`已定位到${city.name}`);
        }
    };

    // 地图控制
    const zoomIn = () => {
        if (mapRef.value) {
            mapRef.value.zoomIn();
        }
    };

    const zoomOut = () => {
        if (mapRef.value) {
            mapRef.value.zoomOut();
        }
    };

    const centerMap = () => {
        if (mapRef.value) {
            mapRef.value.centerMap();
        }
    };

    const reloadMap = () => {
        if (mapRef.value) {
            mapRef.value.reloadMap();
            ElMessage.info('正在重新加载地图...');
        }
    };

    const showCurrentLocation = () => {
        if (mapRef.value) {
            mapRef.value.showCurrentLocation();
        }
    };

    // 更新地图信息
    const updateMapInfo = () => {
        if (mapRef.value) {
            const center = mapRef.value.getCurrentCenter();
            const zoom = mapRef.value.getCurrentZoom();
            const type = mapRef.value.getCurrentMapType();

            mapInfo.value = {
                center: `${center.lng.toFixed(4)}, ${center.lat.toFixed(4)}`,
                zoom: zoom.toString(),
                type: type === 'vector' ? '矢量地图' : type === 'image' ? '影像地图' : '地形地图',
                ready: true,
            };

            ElMessage.success('地图信息已更新');
        }
    };

    // 初始化
    onMounted(() => {
        setTimeout(updateMapInfo, 1000);
    });
</script>

<style lang="scss" scoped>
    .map-demo {
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
        :deep(.el-button) {
            margin-left: 0;
        }
    }

    .header {
        text-align: center;
        padding: 5px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .header p {
        margin: 0;
        color: #2c3e50;
        font-size: 18px;
        font-weight: 600;
    }

    .subtitle {
        margin: 0;
        color: #7f8c8d;
        font-size: 16px;
    }

    .map-section {
        flex: 1;
        display: flex;
        padding: 12px;
    }

    .map-wrapper {
        width: calc(100% - 300px);
        height: 100%;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        background: white;
    }

    .control-section {
        display: flex;
        flex-direction: column;
        margin-left: 12px;
        width: 300px;
    }

    .control-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        border: 1px solid #e0e6ed;
    }

    .control-card h3 {
        margin: 0 0 20px 0;
        color: #2c3e50;
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .button-group {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .type-button {
        width: 100%;
        justify-content: flex-start;
        padding: 12px 20px;
        font-size: 14px;
    }

    .city-buttons {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
    }

    .city-button {
        width: 100%;
    }

    .action-buttons {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
    }

    .info-display {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        border: 1px solid #e9ecef;
    }

    .info-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px dashed #dee2e6;
    }

    .info-item:last-child {
        border-bottom: none;
    }

    .info-item .label {
        color: #6c757d;
        font-size: 13px;
    }

    .info-item .value {
        color: #495057;
        font-weight: 500;
        font-size: 13px;
        font-family: 'Monaco', 'Consolas', monospace;
    }

    .info-item .value.success {
        color: #67c23a;
    }

    .info-item .value.error {
        color: #f56c6c;
    }

    .refresh-btn {
        width: 100%;
    }

    .footer {
        text-align: center;
        padding: 20px;
        color: #7f8c8d;
        font-size: 14px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        margin-top: 20px;
    }
</style>
