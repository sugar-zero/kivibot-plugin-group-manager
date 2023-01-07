import type { GroupRole } from "@kivibot/core";
import type { BotAdminCmdHandler } from "../types";
import type { ModuleConfig } from "../../config";
import { roleList } from "../../config";
import { initHandler } from "../init";
import { transformModuleKey } from "../../map";
import { getModuleCnName } from "../../utils";
export const adminCmdHandler: BotAdminCmdHandler = async (e, plugin, config, param) => {
    const [module, key, value] = param;

    // 开启插件
    if (module === "on") {
        if (e.message_type != "group") {
            return e.reply("请在群聊中使用此指令", true);
        }

        const gid = e.group_id;
        if (gid) {
            if (!config.enableGroups.includes(gid)) {
                config.enableGroups.push(gid);
                // 初始化，将各个模块的开启群聊列表加入当前群聊
                initHandler(plugin, config, gid);
                plugin.saveConfig(config);
            }
            return e.reply("本群已开启群管功能", true);
        }
    }
    // 关闭插件
    if (module === "off") {
        if (e.message_type != "group") {
            return e.reply("请在群聊中使用此指令", true);
        }
        const gid = e.group_id;
        if (gid) {
            if (config.enableGroups.includes(gid)) {
                const idx = config.enableGroups.findIndex(e => e === gid);
                config.enableGroups.splice(idx, 1);
                plugin.saveConfig(config);
            }
            return e.reply("本群已关闭群管功能", true);
        }
    }
    // 修改前缀
    if (module === "prefix") {
        if (e.message_type != "group") return e.reply("请在群聊内使用", true);
        const groupConfig = config.groupConfigs.find(group => group.gid === e.group_id);
        if (!groupConfig) return e.reply("本群尚未开启群管插件", true);
        groupConfig.cmdPrefix = key;
        plugin.saveConfig(config);
        return e.reply(`已修改本群功能触发前缀为: '${key}'`, true);
    }
    // 查看本群详情
    if (module === "dt") {
        if (e.message_type != "group") return e.reply("请在群聊内使用", true);
        const groupConfig = config.groupConfigs.find(group => group.gid === e.group_id);
        if (!groupConfig) return e.reply("本群尚未开启群管插件", true);
        return e.reply(
            `本群的详细配置为:\n${transformModuleKey(
                JSON.stringify(groupConfig, null, "\t")
            )}\n字段具体含义请自行查阅插件官网说明文档:\nhttps://github.com/Linxaee/kivibot-plugin-group-manager/blob/master/README.md`,
            true
        );
    }
    // 开启模块
    if (module && key === "on") {
        if (e.message_type != "group") return e.reply("请在群聊内使用", true);
        const groupConfig = config.groupConfigs.find(group => group.gid === e.group_id);
        if (!groupConfig) return e.reply("本群尚未开启群管插件", true);

        // 获取对应模块
        let curModule = (groupConfig as any)[`${module}Config`] as ModuleConfig;
        if (curModule) {
            if (!curModule.enable) {
                curModule.enable = true;
                plugin.saveConfig(config);
            }
            return e.reply(`本群已开启${getModuleCnName(curModule)}模块`, true);
        } else {
            return e.reply(`不存在${module}模块,请检查输入`, true);
        }
    }

    // 关闭模块
    if (module && key === "off") {
        if (e.message_type != "group") return e.reply("请在群聊内使用", true);
        const groupConfig = config.groupConfigs.find(group => group.gid === e.group_id);
        if (!groupConfig) return e.reply("本群尚未开启群管插件", true);

        // 获取对应模块
        let curModule = (groupConfig as any)[`${module}Config`] as ModuleConfig;
        if (curModule) {
            if (curModule.enable) {
                curModule.enable = false;
                plugin.saveConfig(config);
            }
            return e.reply(`本群已关闭${getModuleCnName(curModule)}模块`, true);
        } else {
            return e.reply(`不存在${module}模块,请检查输入`, true);
        }
    }

    // 模块配置查看
    if (module && key === "dt") {
        if (e.message_type != "group") return e.reply("请在群聊内使用", true);
        const groupConfig = config.groupConfigs.find(group => group.gid === e.group_id);
        if (!groupConfig) return e.reply("本群尚未开启群管插件", true);

        // 获取对应模块的权限组
        let curModule = (groupConfig as any)[`${module}Config`] as ModuleConfig;
        if (curModule) {
            return e.reply(
                `${getModuleCnName(curModule)}模块配置为:\n${transformModuleKey(
                    JSON.stringify(curModule, null, "\t")
                )}\n字段具体含义请自行查阅插件官网说明文档:\nhttps://github.com/Linxaee/kivibot-plugin-group-manager/blob/master/README.md`,
                true
            );
        } else {
            return e.reply(`不存在模块${module},请检查输入`, true);
        }
    }
    // 模块权限组查看
    if (module && key === "list") {
        if (e.message_type != "group") return e.reply("请在群聊内使用", true);
        const groupConfig = config.groupConfigs.find(group => group.gid === e.group_id);
        if (!groupConfig) return e.reply("本群尚未开启群管插件", true);

        // 获取对应模块的权限组
        let curModule = (groupConfig as any)[`${module}Config`] as ModuleConfig;
        if (curModule) {
            let msg = `${getModuleCnName(curModule)}模块的权限组中有以下角色: `;
            curModule.permissionList.forEach((item, index) => {
                index === curModule.permissionList!.length - 1 ? (msg += item) : (msg += item + "/");
            });
            return e.reply(msg, true);
        } else {
            return e.reply(`不存在模块${module},请检查输入`, true);
        }
    }
    // 模块权限组添加
    if (module && key === "+" && value) {
        if (e.message_type != "group") return e.reply("请在群聊内使用", true);
        const groupConfig = config.groupConfigs.find(group => group.gid === e.group_id);
        if (!groupConfig) return e.reply("本群尚未开启群管插件", true);

        // 获取对应模块的权限组
        let curModule = (groupConfig as any)[`${module}Config`] as ModuleConfig;
        if (curModule) {
            // 检查value是否是合法角色
            if (!roleList.includes(value as any)) return e.reply(`不存在角色名${value},请检查输入`, true);
            // 检查权限组中是否已有该角色
            if (curModule.permissionList.includes(value as GroupRole))
                return e.reply(`${value}已存在于${getModuleCnName(curModule)}模块的权限组`, true);
            else {
                // 权限组中添加该角色
                curModule.permissionList.push(value as GroupRole);
                plugin.saveConfig(config);
                return e.reply(`已将${value}添加至${getModuleCnName(curModule)}模块的权限组`, true);
            }
        } else {
            return e.reply(`不存在模块${module},请检查输入`, true);
        }
    }
    // 模块权限组删除
    if (module && key === "-" && value) {
        if (e.message_type != "group") return e.reply("请在群聊内使用", true);
        const groupConfig = config.groupConfigs.find(group => group.gid === e.group_id);
        if (!groupConfig) return e.reply("本群尚未开启群管插件", true);

        // 获取对应模块的权限组
        let curModule = (groupConfig as any)[`${module}Config`] as ModuleConfig;
        if (curModule) {
            // 检查value是否是合法角色
            if (!roleList.includes(value as any)) return e.reply(`不存在角色名${value},请检查输入`, true);
            // 检查权限组中是否已有该角色
            if (!curModule.permissionList.includes(value as GroupRole))
                return e.reply(`${value}不存在于${getModuleCnName(curModule)}模块的权限组中`, true);
            else {
                // 权限组中删除该角色
                const idx = curModule.permissionList.findIndex(item => item === value);
                curModule.permissionList.splice(idx, 1);
                plugin.saveConfig(config);
                return e.reply(`已将${value}从${getModuleCnName(curModule)}模块的权限组中移除`, true);
            }
        } else {
            return e.reply(`不存在模块${module},请检查输入`, true);
        }
    }

    // 启用at功能
    if (module && key === "at" && value) {
        if (e.message_type != "group") return e.reply("请在群聊内使用", true);
        const groupConfig = config.groupConfigs.find(group => group.gid === e.group_id);
        if (!groupConfig) return e.reply("本群尚未开启群管插件", true);

        // 获取对应模块
        let curModule = (groupConfig as any)[`${module}Config`] as ModuleConfig;
        if (curModule) {
            // 检查当前模块是否有at功能
            if (typeof curModule.enableAt === "undefined")
                return e.reply(`${getModuleCnName(curModule)}模块没有at功能哦~`, true);
            // 检查value是否是合法参数
            if (!["on", "off"].includes(value)) return e.reply(`参数错误`, true);
            // 检查权限组中是否已有该角色
            if (value == "on") {
                curModule.enableAt = true;
            } else {
                curModule.enableAt = false;
            }
            plugin.saveConfig(config);
            return e.reply(`已${value === "on" ? "开启" : "关闭"}${getModuleCnName(curModule)}模块的at功能`, true);
        } else {
            return e.reply(`不存在模块 ${module},请检查输入`, true);
        }
    }
};
