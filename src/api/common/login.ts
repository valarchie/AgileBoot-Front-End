import { http } from "@/utils/http";
import { RouteRecordRaw } from "vue-router";

export type CaptchaDTO = {
  /**  验证码的base64图片 */
  captchaCodeImg: string;
  /** 验证码对应的缓存key */
  captchaCodeKey: string;
};

export type ConfigDTO = {
  /** 验证码开关 */
  isCaptchaOn: boolean;
  /** 系统字典配置（下拉选项之类的） */
  dictionary: Map<String, Array<DictionaryData>>;
};

export type LoginByPasswordDTO = {
  /** 用户名 */
  username: string;
  /**  密码 */
  password: string;
  /** 验证码 */
  captchaCode: string;
  /** 验证码对应的缓存key */
  captchaCodeKey: string;
};

/**
 * 后端token实现
 */
export type TokenDTO = {
  /** token */
  token: string;
  /** 当前登录的用户 */
  currentUser: CurrentLoginUserDTO;
};

export type CurrentLoginUserDTO = {
  userInfo: CurrentUserInfoDTO;
  roleKey: string;
  permissions: Set<string>;
};

/**
 * 当前User
 */
export interface CurrentUserInfoDTO {
  avatar?: string;
  createTime?: Date;
  creatorId?: number;
  creatorName?: string;
  deptId?: number;
  deptName?: string;
  email?: string;
  loginDate?: Date;
  loginIp?: string;
  nickName?: string;
  phoneNumber?: string;
  postId?: number;
  postName?: string;
  remark?: string;
  roleId?: number;
  roleName?: string;
  sex?: number;
  status?: number;
  updaterId?: number;
  updaterName?: string;
  updateTime?: Date;
  userId?: number;
  username?: string;
  userType?: number;
}

export type DictionaryData = {
  label: string;
  value: number;
  cssTag: string;
};

/** 获取系统配置接口 */
export const getConfig = () => {
  return http.request<ResponseData<ConfigDTO>>("get", "/getConfig");
};

/** 验证码接口 */
export const getCaptchaCode = () => {
  return http.request<ResponseData<CaptchaDTO>>("get", "/captchaImage");
};

/** 登录接口 */
export const loginByPassword = (data: LoginByPasswordDTO) => {
  return http.request<ResponseData<TokenDTO>>("post", "/login", { data });
};

/** 获取当前登录用户接口 */
export const getLoginUserInfo = () => {
  return http.request<ResponseData<TokenDTO>>("get", "/getLoginUserInfo");
};

export interface RouteMeta {
  id: string;
  title: string;
  icon?: string;
  showLink?: boolean;
  showParent?: boolean;
  auths?: string[];
  rank?: number;
  frameSrc?: string;
  isFrameSrcInternal?: boolean;
}

export type RouteItem = RouteRecordRaw & {
  name?: string;
  path: string;
  meta: RouteMeta;
  children?: RouteItem[];
};

type AsyncRoutesResponse = {
  code: number;
  msg: string;
  data: RouteItem[];
};

/**
 * 为后端返回的路由添加唯一id，后面我们在构建菜单树的层级结构时需要用到
 * 这里我们假设 name + path 是唯一的，若日后有 name + path 不唯一的情况，
 * 则需要修改此处的逻辑
 */
const addUniqueId = (routes: RouteItem[]): RouteItem[] => {
  return routes.map(route => {
    const id = `${route.name || ""}${route.path}`;

    if (route.children && route.children.length > 0) {
      route.children = addUniqueId(route.children);
    }

    return {
      ...route,
      meta: {
        ...route.meta,
        id
      }
    };
  });
};

function withId(result: AsyncRoutesResponse) {
  if (result.data) {
    result.data = addUniqueId(result.data);
  }

  return result;
}

/**
 * 获取动态菜单
 * TODO:对于开发环境下此处可以对路由数据做一些校验，比如说 name 是否重复，name+path 是否重复等等
 */
export const getAsyncRoutes = async () => {
  const result = await http.request<AsyncRoutesResponse>("get", "/getRouters");
  return withId(result);
};
