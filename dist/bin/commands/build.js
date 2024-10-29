import { build as viteBuild } from 'vite';
import getConfig from "../utils/getConfig.js";
// 构建配置
const build = async () => {
    // vite配置
    const { config } = await getConfig('development');
    viteBuild(config);
};
export default build;
//# sourceMappingURL=build.js.map