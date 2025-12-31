import TianDiTuMap from './TianDiTuMap.vue'

export default TianDiTuMap

// 导出配置
export {
    MAP_TYPES,
    DEFAULT_CONFIG,
    CITY_COORDINATES,
    TDT_TK
} from './config.js'

// 导出工具函数
export {
    getTileUrl,
    getMapTypeUrls,
    validateTK,
    loadTianDiTuAPI,
    formatCoordinate
} from './utils.js'