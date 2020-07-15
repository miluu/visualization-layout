import I18N_IDS from 'src/i18n/ids';

export const ROUTER_TITLES = {
  // '/': '对象建模集成开发环境',
  // '/template': '经典案例模板可视化',
  // '/datasourceBinding': '经典案例向导-绑定数据源',
  // '/prototype': '可视化原型',
  // '*': '吉联云应用平台',
  '/': I18N_IDS.TITLE_VISUALIZATION,
  '/template': I18N_IDS.TITLE_TEMPLATE,
  '/datasourceBinding': I18N_IDS.TITLE_DATASOURCE_BINDING,
  '/prototype': I18N_IDS.TITLE_PROTOTYPE,
  '*': I18N_IDS.TITLE_GLPAAS,
};

export enum ROW_STATUS {
  ADDED = 4, // 新增
  NOT_MODIFIED = 2, // 未修改
  MODIFIED = 16, // 已修改
  DELETED = 8, // 删除
  ADDED_REMOVE = -1, // 新增后又删除掉的
}

export enum EditorStatus {
  EDIT,
  LAYOUT,
  DATA,
  PREVIEW,
}

export const PAGE_TYPE = {
  manage: '管理页面',
  add: '新增页面',
  edit: '编辑页面',
  view: '查看页面',
  AEV: '新增、编辑、查看页面',
  AE: '新增、编辑页面',
  AV: '新增、查看页面',
  EV: '编辑、查看页面',
  C: '用户自定义页面',
};

export const FORM_SETTINGS_CONFIG = {
  ROW_COUNT: 2,
  COL_COUNT: 4,
};

export const ZOOMS = {
  default: 100,
  max: 200,
  min: 20,
  step: 10,
};

export enum DeviceType {
  WEB,
  IONIC,
  CONFIG,
}

export type RouterPath = 'visualization' | 'prototype' | 'template' | 'datasourceBinding';

export const SIDEBAR_SPLIT_WIDTH = 8;
export const DEFAULT_SIDEBAR_WIDTH = 220;
export const DEFAULT_SIDEBAR_WIDTH_RIGHT = 250;

export const MAX_UNDO_COUNT = 20;

export const BUILT_IN_STYLE_CLASSES = [
  'full-height',
  'flex-item',
  'flex-container',
  'flex-container-horizontal',
  'flex-container-grid',
  'flex-container-tree',
  'flex-container-tab',
  'over-scroll-layout',
  'over-hidden-layout',
  'glpaas-double-join',
  'glpaas-layout-expand',
  'glpaas-layout-close-state',
  'glpaas-layout-expand-state',
  'glpaas-text-right',
];

export const DROPDOWN_ALIGN_PROPS = {
  dropdownMatchSelectWidth: false,
  dropdownAlign: {
    points: ['tl', 'bl', 'tr', 'br'],
    offset: [0, 4],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
  },
};
