import * as _ from 'lodash';
import * as React from 'react';
import { Modal, notification } from 'antd';
import * as uuid from 'uuid';
import produce from 'immer';

import { IChildrenLayoutsMap, ILayoutsHistory, IPropertiesMap, IMehtodsMap, ICreateLayouttsModelOptions } from 'src/models/layoutsModel';
import { cellNameManager } from './cellName';
import { ModalFuncProps } from 'antd/lib/modal';
import { ROW_STATUS } from 'src/config';
import { IControlEvent } from 'src/ui/eventForm';
import { isButton } from 'src/routes/Prototype/config';
import { IDatasource, ID_KEY } from 'src/models/datasourceModel';
import { RcFile } from 'antd/lib/upload';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

const GROUPABLE_UI_TYPES = [
  'input',
  'area',
  'number-input',
  'textarea',
  'dropdown',
  'date',
  'associate',
  'time',
];

export async function delay(ms: number = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export function updateChildrenLayoutsMap(
  layouts: any[] = [],
  rootElement: any,
  elementIdKey: string,
  layoutElementIdKey: string,
  parentCellNameKey: string = 'parentCellName',
  orderKey: string = 'seqNo',
) {
  const groupedLayouts: IChildrenLayoutsMap<any> = _.chain(layouts)
    .filter(l => (l[layoutElementIdKey || elementIdKey] || '') === (rootElement && rootElement[elementIdKey] || ''))
    .sortBy(orderKey)
    .groupBy(l => ((l[parentCellNameKey] || '') as string))
    .value();
  return groupedLayouts;
}

export function isEqual(a: any[] = [], b: any = []): boolean {
  if (a === b) {
    return true;
  }
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0, len = a.length; i < len; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

export function registGlobalComponentClass(key: string, componentClass: React.ComponentClass) {
  window['_DYNAMIC_COMPONENTS_'] = _.assign(window['_DYNAMIC_COMPONENTS_'], {
    [key]: componentClass,
  });
}

export function getDynamicComponentClass(key: string): React.ComponentType<any> {
  let Component;
  try {
    Component = window['_DYNAMIC_COMPONENTS_'][key];
  } catch (e) {
    console.warn('[getDynamicComponentClass] ERROR.', e);
    return null;
  }
  if (!Component) {
    console.warn('[getDynamicComponentClass] ERROR: Component Not Found.');
  }
  return Component || null;
}

export function createId(prefix = 'NEW_', removeDash = false) {
  let id = `${prefix}${uuid()}`;
  if (removeDash) {
    id = id.replace(/(_|-)/g, '');
  }
  return id;
}

export function boolToX(value: boolean): '' | 'X' {
  switch (value) {
    case true:
      return 'X';
    case false:
      return '';
    default:
      return value;
  }
}

export function xToBool(value: '' | 'X'): boolean {
  switch (value) {
    case '':
      return false;
    case 'X':
      return true;
    default:
      return value;
  }
}

export function arrayToString(value: string[], sep = ' '): string {
  if (!value) {
    return value as any;
  }
  return value.join(sep);
}

export function stringToArray(value: string, sep = ' '): string[] {
  if (value === null || value === undefined) {
    return value as any;
  }
  return value.split(sep);
}

export function groupPages<P>(pages: P[], pidKey: string, orderKey: string): { [pid: string]: P[] } {
  return _.chain(pages)
    .orderBy(orderKey)
    .groupBy(p => (p[pidKey] || ''))
    .value() as any;
}

// export function getOffset(targetId: string, parentId: string) {
//   const target: HTMLElement = document.getElementById(targetId);
//   const parent: HTMLElement = document.getElementById(parentId);
//   const targetIsInline = target && isInline(target);
//   return getElementOffset(target, parent, targetIsInline ? -1 : 0);
// }

export function isHorizontalElement(domElement: HTMLElement) {
  const style = getComputedStyle(domElement);
  if (
    style.display === 'inline'
    || style.display === 'inline-block'
    || style.cssFloat === 'left'
    || style.cssFloat === 'right'
  ) {
    return true;
  }
  return false;
}

export function isInline(domElement: HTMLElement) {
  const style = getComputedStyle(domElement);
  if (
    style.display === 'inline'
    || style.display === 'inline-block'
  ) {
    return true;
  }
  return false;
}

// function getElementOffset(target: HTMLElement, parent: HTMLElement, amend = 0) {
//   if (!target || !parent) {
//     return null;
//   }
//   let left = target.offsetLeft;
//   let top = target.offsetTop;
//   let borderTopWidth = parseFloat(window.getComputedStyle(target).borderTopWidth) || 0;
//   let borderLeftWidth = parseFloat(window.getComputedStyle(target).borderLeftWidth) || 0;
//   const width = target.offsetWidth;
//   const height = target.offsetHeight;
//   let current = target.offsetParent as HTMLElement;
//   while (current != null && current !== parent) {
//     borderTopWidth = parseFloat(window.getComputedStyle(target).borderTopWidth) || 0;
//     borderLeftWidth = parseFloat(window.getComputedStyle(target).borderLeftWidth) || 0;
//     left += current.offsetLeft + borderLeftWidth + amend;
//     top += current.offsetTop + borderTopWidth + amend;
//     current = current.offsetParent as HTMLElement;
//   }
//   return { top, left, width, height };
// }

/**
 * 判断 l1 是否在 l2 里面
 * @param opts
 */
export function isInLayout(opts: {
  l1: any;
  l2: any;
  list: any[];
  cellNameKey: string;
  parentCellNameKey: string;
  includeSelf: boolean;
}): boolean {
  let l1 = opts.l1;
  const l2 = opts.l2;
  return next();

  function next(): boolean {
    if (!l1) {
      return false;
    }
    if (l1[opts.includeSelf ? opts.cellNameKey : opts.parentCellNameKey] === l2[opts.cellNameKey]) {
      return true;
    }
    l1 = _.find(opts.list, l => l[opts.cellNameKey] === l1[opts.parentCellNameKey]);
    return next();
  }
}

export function findChildren(
  list: any[],
  cellNames: string[],
  cellNameKey: string,
  parentCellNameKey: string,
  childrenElementsKey: string,
  elementIdKey: string,
  layoutElementIdKey: string,
  includeSelf = true,
): any[] {
  const items = _.filter(list, l => _.includes(cellNames, l[cellNameKey]));
  let retItems = includeSelf ? items : [];
  next(items);
  return retItems;

  function next(parentItems: any[]) {
    const parnetKeys = _.map(parentItems, item => item[cellNameKey]);
    const childrenItems = _.filter(list, l => _.includes(parnetKeys, l[parentCellNameKey]));
    _.forEach(parentItems, l => {
      const childrenElements = l[childrenElementsKey];
      if (!childrenElements || !childrenElements.length) {
        return;
      }
      const childrenElementsIds = _.map(childrenElements, e => e[elementIdKey]);
      const childrentElementLayouts = _.filter(list, la => _.includes(childrenElementsIds, la[layoutElementIdKey]));
      retItems = retItems.concat(childrentElementLayouts);
    });
    if (childrenItems.length) {
      retItems = retItems.concat(childrenItems);
      next(childrenItems);
    }
  }
}

export function canUndo({ currentIndex }: ILayoutsHistory<any>) {
  return currentIndex > 0;
}

export function canRndo({ currentIndex, layoutHistory }: ILayoutsHistory<any>) {
  return currentIndex < layoutHistory.length - 1;
}

export function changeCellName(
  list: any[],
  layout: any,
  newCellName: string,
  cellNameKey: string,
  parentCellNameKey: string,
  childrenElementKey: string,
  elementParentLayoutKey: string,
  includeSelf = false,
): any[] {
  const groupedLayouts = _.groupBy(list, parentCellNameKey);
  const oldCellName = layout[cellNameKey];
  const willChangeLayouts: any[] = [];
  if (includeSelf) {
    willChangeLayouts.push(produce(layout, draft => {
      draft[cellNameKey] = newCellName;
      _.forEach(draft[childrenElementKey], e => {
        e[elementParentLayoutKey] = newCellName;
      });
    }));
  }
  next([oldCellName], [newCellName]);
  return willChangeLayouts;

  function next(oldParentCellNames: string[], newParentCellNames: string[]) {
    _.forEach(oldParentCellNames, (oldParentCellName, i) => {
      const newParentCellName = newParentCellNames[i];
      const childrenLayouts = groupedLayouts[oldParentCellName] || [];
      if (!childrenLayouts.length) {
        return;
      }
      const changedChildrenLayouts = _.map(childrenLayouts, l => produce(l, draft => {
        const newLayoutCellName = cellNameManager.create(newParentCellName);
        draft[parentCellNameKey] = newParentCellName;
        draft[cellNameKey] = newLayoutCellName;
        _.forEach(draft[childrenElementKey], e => {
          e[elementParentLayoutKey] = newLayoutCellName;
        });
      }));
      willChangeLayouts.push(...changedChildrenLayouts);
      next(
        _.map(childrenLayouts, l => l[cellNameKey]),
        _.map(changedChildrenLayouts, l => l[cellNameKey]),
      );
    });
  }
}

export function findElementLayout(elementId: string, layouts: any[], childrenElementKey: string, elementIdKey: string) {
  const layout = _.find(layouts, l => {
    const childrenElement = l[childrenElementKey] || [];
    return !!_.find(childrenElement, e => e[elementIdKey] === elementId);
  });
  return layout;
}

export function findLayoutByCellName(layouts: any[], cellName: string, cellNameKey: string): any {
  return _.find(layouts, l => l[cellNameKey] === cellName);
}

export function findElementById(layouts: any[], elementId: string, childrenElementKey: string, elementIdKey: string, returnParentLayout = false): any {
  let element: any;
  let result: any;
  _.forEach(layouts, l => {
    element = _.find(l[childrenElementKey], e => e[elementIdKey] === elementId);
    if (element) {
      if (returnParentLayout) {
        result = {
          parentLayout: l,
          element,
        };
      }
      return false;
    }
    return true;
  });
  if (result) {
    return result;
  }
  return element;
}

export function paramsSerializer(params: any) {
  const parts: string[] = [];

  _.forEach(params, (val, key) => {
    if (val === null || typeof val === 'undefined') {
      return;
    }

    let vals: any[] = val;

    if (!_.isArray(vals)) {
      vals = [vals];
    }

    _.forEach(vals, (_v) => {
      let v: any = _v;
      if (_.isDate(v)) {
        v = v.toISOString();
      } else if (_.isObject(v)) {
        v = JSON.stringify(v);
      }
      parts.push(`${encode(key)}=${encode(v)}`);
    });
  });

  return parts.join('&');
}

function encode(val: string) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

export function transformStyleClassText(styleClass = ''): string {
  if (!styleClass) {
    return null;
  }
  const classList = _.trim(styleClass).split(/\s+/);
  return _.chain(classList)
    .filter(s => s !== 'row')
    .map(s => `.${s}`)
    .value()
    .join('');
}

export function noop() {/*  */}

export function renderHitArea(positions: Array<'top' | 'bottom' | 'left' | 'right'> = ['top', 'bottom', 'left', 'right']) {
  return _.map(positions, pos => <div key={pos} className={`editor-hit-${pos}`} />);
}

export function renderPagination() {
  return (
    <div className="pagination-container">
      <div className="pager pager-skin-tp">
        <button type="button" className="btn pager-btn-first" >
          <i className="fi fi-first" />
        </button>
        <button type="button" className="btn pager-btn-prev">
          <i className="fi fi-prev" />
        </button>
        <span className="pager-desc">{t(I18N_IDS.GRID_BEFORE_CURRENT_PAGE)} </span>
        <input type="text" disabled className="form-text pager-index" />
        <span className="pager-desc"><span>/</span>{t(I18N_IDS.GRID_AFTER_TOTAL_PAGE)}</span>
        <button type="button" className="btn pager-btn-next" disabled>
          <i className="fi fi-next" />
        </button>
        <button type="button" className="btn pager-btn-last">
          <i className="fi fi-last" />
        </button>
        <button type="button" className="btn pager-btn-refresh"><i className="fi fi-refresh" /></button>
        <span className="pager-desc pager-last-item">
          -
          <span>
            {t(I18N_IDS.GRID_BEFORE_TOTAL)}
            <span>-</span>
            {t(I18N_IDS.GRID_AFTER_TOTAL)}
          </span>
        </span>
      </div>
      <div className="pagesize pager-skin-tp" page-size-list="10,50,100,150,200">
        <span className="pager-desc"> {t(I18N_IDS.GRID_BEFORE_PAGE_SIZE)} </span>
        <div className="form-dorpdown">
          <input type="text" className="form-text" value="" readOnly />
          <a href="javascript:void(0)" type="button" className="btn dropdown-toggle">
            <i className="fi fi-caret" />
          </a>
        </div>
        <span className="pager-desc"> {t(I18N_IDS.GRID_AFTER_PAGE_SIZE)} </span>
      </div>
    </div>
  );
}

export function transformUiType(uiType: any) {
  switch (uiType) {
    case '01':
      return 'input';
    case '01':
      return 'input';
    case '10': // 按钮
      return 'button';
    case '12': // 多行文本
      return 'textarea';
    case '19': // 复选框(Y/N)
    case '08': // 复选框
      return 'checkbox';
    case '22': // 可过滤下拉框
    case '15': // 多选下拉框
    case '06': // 下拉框
      return 'dropdown';
    case '05': // 日期时间
    case '04': // 日期
    case '31': // 日期年月
    case '37': // 日期时间(秒级)
      return 'date';
    case '21': // 可输入联想控件
    case '16': // 多选联想控件
    case '11': // 联想控件
      return 'associate';
    case '13': // 隐藏
      return 'hidden';
    case '14': // 文本
      return 'text';
    case '23': // 时间
      return 'time';
    case '24': // 单选框组
      return 'radio-group';
    case '25': // 上传控件
      return 'uploader';
    case '20': // 复选框组
      return 'checkbox-group';
    case '35': // 单选筛选
      return 'query-filter';
    case '36': // 多选筛选
      return 'query-filter-multi';
    case '17':
    case '26':
    case '27':
    case '28':
      return 'area';
    case '03':
    case '32':
    case '33':
    case '34':
      return 'static';
    case '07':
      return 'number-input';
    default:
      return 'other';
  }
}

export function isGroupAble(uiType: any) {
  const type = transformUiType(uiType);
  return _.includes(GROUPABLE_UI_TYPES, type);
}

/**
 * 控件是否需要绑属性或方法
 * @param element
 * @return false - 不需要, 'method' - 需要绑定方法, 'property' - 需要绑定属性
 */
export function needBinding(element: any) {
  switch (element.layoutElementType) {
    case 'BUTTON_GROUP':
    case 'DYNA_MORE_QUERY':
    case 'DYNA_COMB_QUERY':
      return false;
    case 'BUTTON':
      return 'method';
    default:
      break;
  }
  switch (transformUiType(element.uiType)) {
    case 'button':
      return 'method';
    case 'static':
      return false;
    default:
      break;
  }
  return 'property';
}

export function getLayoutChildrenByParentElement(layouts: any, parentElement: any, elementIdKey: string, layoutElementIdKey: string, parentCellNameKey: string, orderKey: string) {
  const childrenLayout = _.chain(layouts)
    .filter(layout => layout[layoutElementIdKey || elementIdKey] === parentElement[elementIdKey]
      && (!layout[parentCellNameKey] || layout[parentCellNameKey] === 'ROOT' || layout[parentCellNameKey] === 'ROOT_E'),
    )
    .sortBy(orderKey).value();
  return childrenLayout;
}

export function getJsonObj(json: string): any {
  let obj;
  try {
    obj = JSON.parse(json);
  } catch (e) {
    obj = {};
  }
  return obj;
}

export function isRootLayout(layout: any, cellNameKey: string): boolean {
  return (layout[cellNameKey] || '').indexOf('ROOT') >= 0;
}

export function sortPropertiesMap(properties: IPropertiesMap): IPropertiesMap {
  const sortedProperties: IPropertiesMap = {};
  const localeCompare = String.prototype.localeCompare || (() => 0);
  const compareFunc = function (a: any, b: any): number {
    return localeCompare.call(a.fieldText || '', b.fieldText || '', 'zh');
  };
  _.forEach(properties, (v, k) => {
    sortedProperties[k] = v.sort(compareFunc);
  });
  // _.forEach(sortedProperties, v => {
  //   _.forEach(v, (p, i) => p['$columnNo'] = i);
  // });
  return sortedProperties;
}

export function sortMethodsMap(methods: IMehtodsMap): IMehtodsMap {
  const sortedMethods = {};
  const localeCompare = String.prototype.localeCompare || function () {
    return 0;
  };
  const compareFunc = function (a: any, b: any): number {
    return localeCompare.call(a.methodDesc || '', b.methodDesc || '', 'zh');
  };
  _.forEach(methods, (v, k) => {
    sortedMethods[k] = v.sort(compareFunc);
  });
  // _.forEach(sortedMethods, v => {
  //   _.forEach(v, (p, i) => p['$columnNo'] = i);
  // });
  return sortedMethods;
}

export function propertiesFilter(properties: IPropertiesMap, layout: any) {
  return _.filter(properties[layout.layoutBoName] || [], p => (
    /* p.propertyName !== 'principalGroupCode'
    &&  */p.propertyName !== 'recordVersion'
  ));
}

export async function confirm(options: ModalFuncProps) {
  return new Promise<boolean>((resolve) => {
    Modal.confirm(_.assign({
      title: t(I18N_IDS.TEXT_TIPS),
      okText: t(I18N_IDS.TEXT_OK),
      cancelText: t(I18N_IDS.TEXT_CANCEL),
      onOk: () => {
        resolve(true);
      },
      onCancel: () => {
        resolve(false);
      },
    } as ModalFuncProps, options));
  });
}

/**
 * 取最大公约数
 */
export function getBigFactor(a: number, b: number): number {
  if (b === 0) {
    return a;
  }
  return getBigFactor(b, a % b);
}

/**
 * 字段收集
 */
export function getFieldsJsonObj(layouts: any, config: ICreateLayouttsModelOptions): any {
  const json = _.chain(layouts)
    .map(l => (l[config.childrenElementsKey] || []))
    .flatten()
    .groupBy(e => e[config.fieldDomain] || 'default')
    .mapValues(
      elements => _.chain(elements)
        .filter(e => !isButton(e))
        .map(e => e.fieldText || e.columnName)
        .compact()
        .uniq()
        .value(),
    )
    .value();
  return json;
}

export function findMethodByFieldText(boName: string, fieldText: string, methods: IMehtodsMap) {
  let method: any;
  _.forEach(methods, (list, layoutBoName) => {
    if (boName && layoutBoName !== boName) {
      return true;
    }
    method = _.find(list, m => m.methodDesc === fieldText);
    if (method) {
      method = _.assign(method, { layoutBoName });
    }
    return !method;
  });
  return method;
}

export function findPropertyByFieldText(boName: string, fieldText: string, properties: IPropertiesMap) {
  let property: any;
  _.forEach(properties, (list, layoutBoName) => {
    if (boName && layoutBoName !== boName) {
      return true;
    }
    property = _.find(list, p => p.fieldText === fieldText);
    if (property) {
      property = _.assign(property, { layoutBoName });
    }
    return !property;
  });
  return property;
}

export function showListMessage(title: string, messages: string[]) {
  notification.open({
    message: title,
    description: (
      <ul>
        {_.map(messages, (m, i) => (
          <li key={i}>
            {m}
          </li>
        ))}
      </ul>
    ),
    duration: 0,
  });
}

export function diffDatasourcesRowStatus(currentSource: IDatasource[], initSource: IDatasource[]) {
  const ret: IDatasource[] = [];
  _.forEach(currentSource, s => {
    const old = _.find(initSource, is => is[ID_KEY] === s[ID_KEY]);
    if (!old) {
      ret.push(_.assign({}, s, {
        rowStatus: ROW_STATUS.ADDED,
        principalGroupCode: undefined,
        recordVersion: undefined,
      }));
    } else if (old === s) {
      ret.push(_.assign({}, s, {
        rowStatus: ROW_STATUS.NOT_MODIFIED,
        principalGroupCode: undefined,
        recordVersion: undefined,
      }));
    } else {
      ret.push(_.assign({}, s, {
        rowStatus: ROW_STATUS.MODIFIED,
        principalGroupCode: undefined,
        recordVersion: undefined,
      }));
    }
  });
  const removedSources = _.map(_.differenceBy(initSource, currentSource, ID_KEY), s => {
    return _.assign({}, s, {
      rowStatus: ROW_STATUS.DELETED,
      principalGroupCode: undefined,
      recordVersion: undefined,
    });
  });
  ret.push(...removedSources);
  return ret;
}

export function diffLayoutsRowStatus(
  _currentLayouts: any[],
  initLayouts: any[],
  currentPageId: string,
  config: ICreateLayouttsModelOptions,
  pathName: string,
  setElementLayoutId = false,
  setPageId = false,
) {
  const {
    layoutEventsKey,
    elementEventsKey,
    cellNameKey,
  } = config;
  const currentLayouts = _.filter(_currentLayouts, l => !_.startsWith(l[cellNameKey], '$REF_'));
  const willRemovedLayouts = _.map(
    _.differenceBy(initLayouts, currentLayouts, l => l[config.layoutIdKey]),
    l => produce(l, draft => {
      delete draft[config.childrenElementsKey];
      _.forEach(draft[layoutEventsKey], ev => {
        ev.rowStatus = ROW_STATUS.DELETED;
      });
      draft.rowStatus = ROW_STATUS.DELETED;
    }),
  );
  const currentElements = _.chain(currentLayouts)
    .map(l => {
      const layoutId = l[config.layoutIdKey];
      const isNew = pathName === '/' && (!layoutId || _.startsWith(layoutId, 'NEW'));
      const eles = _.map(l[config.childrenElementsKey] || [], e => produce(e, draft => {
        if (setElementLayoutId) {
          draft[config.layoutIdKey] = l[config.layoutIdKey];
        }
        draft[config.cellNameKey] = l[config.cellNameKey];
        if (isNew) {
          draft['__isNew'] = true;
        }
      }));
      return eles;
    })
    .flatten()
    .value();
  const initElements = _.chain(initLayouts)
    .map(l => {
      const eles = l[config.childrenElementsKey] || [];
      // const eles = _.map(l[config.childrenElementsKey] || [], e => produce(e, draft => {
      //   if (setElementLayoutId) {
      //     draft[config.layoutIdKey] = l[config.layoutIdKey];
      //   }
      //   draft[config.cellNameKey] = l[config.cellNameKey];
      // }));
      return eles;
    })
    .flatten()
    .value();
  const willRemovedElements = _.map(
    _.differenceBy(initElements, currentElements, e => e[config.elementIdKey]),
    e => produce(e, draft => {
      draft.rowStatus = ROW_STATUS.DELETED;
      _.forEach(draft[elementEventsKey], ev => {
        ev.rowStatus = ROW_STATUS.DELETED;
      });
    }),
  );
  const retLayouts: any[] = [...willRemovedLayouts];
  const retElements: any[] = [...willRemovedElements];
  _.forEach(currentLayouts, l => {
    const initLayout = _.find(initLayouts, iL => iL[config.layoutIdKey] === l[config.layoutIdKey]);
    if (!initLayout) {
      // 新增
      retLayouts.push(produce(l, draft => {
        delete draft[config.childrenElementsKey];
        if (setPageId && !draft[config.pageIdKey]) {
          draft[config.pageIdKey] = currentPageId;
        }
        draft.rowStatus = ROW_STATUS.ADDED;
        _.forEach(draft[layoutEventsKey], ev => {
          ev.rowStatus = ROW_STATUS.ADDED;
        });
        draft[layoutEventsKey] = _.filter(draft[layoutEventsKey], ev => ev.__isActive !== false && ev.eventType);
      }));
    } else if (initLayout === l) {
      // 未修改
      retLayouts.push(produce(l, draft => {
        delete draft[config.childrenElementsKey];
        if (setPageId && !draft[config.pageIdKey]) {
          draft[config.pageIdKey] = currentPageId;
        }
        draft.rowStatus = ROW_STATUS.NOT_MODIFIED;
        _.forEach(draft[layoutEventsKey], ev => {
          ev.rowStatus = ROW_STATUS.NOT_MODIFIED;
        });
      }));
    } else {
      // 修改
      retLayouts.push(produce(l, draft => {
        delete draft[config.childrenElementsKey];
        if (setPageId && !draft[config.pageIdKey]) {
          draft[config.pageIdKey] = currentPageId;
        }
        draft.rowStatus = ROW_STATUS.MODIFIED;
        draft[layoutEventsKey] = diffEvents(initLayout, l, layoutEventsKey);
        // _.forEach(draft[layoutEventsKey], ev => {
        //   ev.rowStatus = ROW_STATUS.MODIFIED;
        // });
      }));
    }
  });

  _.forEach(currentElements, e => {
    const initElement = _.find(initElements, iE => iE[config.elementIdKey] === e[config.elementIdKey]);
    if (!initElement) {
      // 新增
      retElements.push(produce(e, draft => {
        if (!draft[config.pageIdKey]) {
          draft[config.pageIdKey] = currentPageId;
        }
        draft.rowStatus = ROW_STATUS.ADDED;
        _.forEach(draft[elementEventsKey], ev => {
          ev.rowStatus = ROW_STATUS.ADDED;
        });
        draft[elementEventsKey] = _.filter(draft[elementEventsKey], ev => ev.__isActive !== false && ev.eventType);
      }));
    } else if (initElement === e) {
      // 未修改
      retElements.push(produce(e, draft => {
        draft.rowStatus = ROW_STATUS.NOT_MODIFIED;
        _.forEach(draft[elementEventsKey], ev => {
          ev.rowStatus = ROW_STATUS.NOT_MODIFIED;
        });
      }));
    } else {
      // 修改
      if (pathName === '/' && (e['__isNew'] || isParentLayoutRemoved(initElement, willRemovedLayouts, config))) {
        // 移动到新的 Layout 上，删除旧的，新增新的
        retElements.push(produce(initElement, draft => {
          draft.rowStatus = ROW_STATUS.DELETED;
        }));
        retElements.push(produce(e, draft => {
          if (!draft[config.pageIdKey]) {
            draft[config.pageIdKey] = currentPageId;
          }
          draft.rowStatus = ROW_STATUS.ADDED;
          _.forEach(draft[elementEventsKey], ev => {
            ev.rowStatus = ROW_STATUS.ADDED;
          });
        }));
      } else {
        retElements.push(produce(e, draft => {
          if (!draft[config.pageIdKey]) {
            draft[config.pageIdKey] = currentPageId;
          }
          draft.rowStatus = ROW_STATUS.MODIFIED;
          draft[elementEventsKey] = diffEvents(initElement, e, elementEventsKey);
          // _.forEach(draft[elementEventsKey], ev => {
          //   ev.rowStatus = ROW_STATUS.MODIFIED;
          // });
        }));
      }
    }
  });
  return {
    layouts: retLayouts,
    elements: retElements,
  };
}

export function isParentLayoutRemoved(initElement: any, willRemovedLayouts: any[], config: ICreateLayouttsModelOptions) {
  return !!_.find(willRemovedLayouts, (l: any) => l[config.cellNameKey] === initElement[config.cellNameKey]);
}

function diffEvents(originObj: any, newObj: any, eventsKey: string) {
  const originEvents: IControlEvent[] = originObj[eventsKey] || [];
  const newEvents: IControlEvent[] = _.filter(newObj[eventsKey] as IControlEvent[], ev => ev.__isActive || ev.__isActive == null);
  const retEvents: IControlEvent[] = [];
  let removedEvents = _.differenceBy(originEvents, newEvents, 'eventType');
  removedEvents = produce(removedEvents, draft => {
    _.forEach(draft, ev => ev.rowStatus = ROW_STATUS.DELETED);
  });
  retEvents.push(...removedEvents);
  _.forEach(newEvents, ev => {
    const originEv = _.find(originEvents, oev => oev.eventType === ev.eventType);
    if (!originEv) {
      retEvents.push(produce(ev, draft => {
        draft.rowStatus = ROW_STATUS.ADDED;
      }));
    } else if (originEv !== ev) {
      retEvents.push(produce(ev, draft => {
        draft.rowStatus = ROW_STATUS.MODIFIED;
      }));
    } else {
      retEvents.push(produce(ev, draft => {
        draft.rowStatus = ROW_STATUS.NOT_MODIFIED;
      }));
    }
  });
  return retEvents;
}

export function getLabelText(element: any) {
  let label = element.fieldText || element.columnName;
  switch (element.rangeType) {
    case 'start':
      label += '从';
      break;
    case 'end':
      label += '到';
      break;
    default:
      break;
  }
  return label;
}

export function isFtpUpload() {
  const hostname = window.location.hostname;
  return hostname.indexOf('localhost') < 0 && hostname.indexOf('127.0.0.1') < 0;
}

export function createFormElementNameFromCellName(cellName: string, prefix = 'Form_') {
  let elementName = prefix;
  elementName += cellName.replace(/(-|\.)/g, '_');
  return elementName;
}

/**
 * 校验下拉控件/联想控件
 */
export function checkUiType(layouts: any[], properties: IPropertiesMap, childrenElementKey: string) {
  const elements = getLayoutElements(layouts, true, childrenElementKey);
  const ret = {
    valid: true,
    msgs: [] as string[],
    element: null as any,
    tipType: 'confirm',
  };
  const invalidElementsAssociate: any[] = [];
  const invalidElementsDropdown: any[] = [];
  _.forEach(elements, ele => {
    const property = getProperty(ele, properties);
    const uiType = transformUiType(ele.uiType);
    if (!property) {
      return;
    }
    // if (property.dictTableName && uiType !== 'dropdown') {
    //   ret.valid = false;
    //   ret.msg = '属性定义已配置字典表，控件类型必须设置为下拉框。';
    //   ret.element = ele;
    //   return false;
    // }
    // if (property.shlpName && uiType !== 'associate') {
    //   ret.valid = false;
    //   ret.msg = '属性定义已配置搜索帮助，控件类型必须设置为联想控件。';
    //   ret.element = ele;
    //   return false;
    // }
    if (uiType === 'dropdown' && !(property.dictTableName || ele.dictTableName)) {
      invalidElementsDropdown.push(ele);
      ret.valid = false;
      // ret.msg = '属性定义未配置字典表，控件类型不能设置为下拉框。';
      ret.element = ret.element || ele;
      return;
    }
    if (uiType === 'associate' && !(property.shlpName || ele.searchHelp)) {
      invalidElementsAssociate.push(ele);
      ret.valid = false;
      // ret.msg = `【${ele.columnName}】属性定义未配置搜索帮助，控件类型不能设置为联想控件。`;
      ret.element = ret.element || ele;
      return;
    }
    return;
  });
  if (!ret.valid) {
    if (invalidElementsAssociate.length) {
      let msg = _.map(invalidElementsAssociate, (ele: any) => `【${ele.fieldText || ele.columnName || '-'}】`).join('、');
      msg += '属性定义未配置搜索帮助，控件类型不能设置为联想控件。';
      ret.msgs.push(msg);
    }
    if (invalidElementsDropdown.length) {
      let msg = _.map(invalidElementsDropdown, (ele: any) => `【${ele.fieldText || ele.columnName || '-'}】`).join('、');
      msg += '属性定义未配置字典表，控件类型不能设置为下拉框。';
      ret.msgs.push(msg);
    }
  }
  return ret;
}

/**
 * 校验 FORM 的布局元素名称是否重复
 */
export function checkFormElementName(layouts: any[]) {
  const ret = {
    valid: true,
    msgs: [] as string[],
    layout: null as any,
    tipType: 'confirm',
  };
  const groupedForms = _.chain(layouts)
    .filter(l => l.layoutContainerType === 'FORM')
    .groupBy(l => l.elementName || '')
    .value();
  _.forEach(groupedForms, (forms) => {
    if (forms.length > 1) {
      ret.valid = false;
      ret.layout = ret.layout || forms[0];
      const cellNames = _.map(forms, form => form.cellName);
      ret.msgs.push(`Form ${cellNames.join('、')} 的布局元素名称重复。`);
    }
  });
  return ret;
}

/**
 * 校验汇总列的控件类型及数据类型
 */
export function checkIsSum(layouts: any[], properties: IPropertiesMap, childrenElementKey: string) {
  const ret = {
    valid: true,
    msgs: [] as string[],
    element: null as any,
  };
  _.forEach(layouts, l => {
    _.forEach(l[childrenElementKey], e => {
      if (e.isSum) {
        const property = getProperty(e, properties);
        if (!property) {
          return ret.valid;
        }
        if (
          e.uiType !== '07'
          || property.dataType !== 'NUM'
        ) {
          ret.valid = false;
          ret.element = e;
          ret.msgs.push(`【${e.fieldText || e.columnName}】要配置汇总功能，其类型必须是数字类型且控件类型必须是数字文本框。`);
          return false;
        }
      }
      return ret.valid;
    });
    return ret.valid;
  });
  return ret;
}

/**
 * 校验只读和可编辑表达式
 */
export function checkIsReadOnlyAndDisabledExpree(layouts: any[], childrenElementKey: string) {
  const ret = {
    valid: true,
    msgs: [] as string[],
    element: null as any,
  };

  _.forEach(layouts, l => {
    _.forEach(l[childrenElementKey], e => {
      if (e.isReadOnly && e.disabledExpree) {
        ret.valid = false;
        ret.element = e;
        ret.msgs.push(`【${e.columnName}】不能同时配置只读和可编辑表达式。`);
        return false;
      }
      return ret.valid;
    });
    return ret.valid;
  });

  return ret;
}

export function getLayoutElements(layouts: any[], nonGridElement = false, childrenElementKey: string) {
  let elements: any[] = [];
  _.forEach(layouts, layout => {
    if (layout[childrenElementKey]) {
      if (nonGridElement && layout.layoutElementType === 'GRID') {
        return;
      }
      elements = elements.concat(layout[childrenElementKey]);
    }
  });
  return elements;
}

export function getProperty(element: any, properties: IPropertiesMap) {
  const boProperties = properties[element.layoutBoName];
  return _.find(boProperties, p => p.propertyName && element.propertyName && p.propertyName === element.propertyName);
}

export function initGridColumnData(layouts: any[], childrenElementsKey: string) {
  return produce(layouts, (draft) => {
    _.forEach(draft, l => {
      const childrenElements = l[childrenElementsKey];
      if (l.layoutElementType === 'GRID' && l.dropdownList && childrenElements && childrenElements.length) {
        let source: string[][] = [];
        try {
          source = JSON.parse(l.dropdownList).source;
        } catch (e) {/*  */}
        if (!source.length) {
          return;
        }
        const elementsData = _.zip(...source);
        _.forEach(childrenElements, (e, i) => {
          e.__data = elementsData[i] || [];
        });
      }
    });
  });
}

export function createGridSourceFromColumns(columns: any[]) {
  const source: string[][] = _.chain(columns)
    .map<string>((e: any) => e.__data || [])
    .unzip()
    .value() as any[][];
  return source;
}

export function transformDropdownList(input: string): any[] {
  let result: any[] = [];
  let obj: {
    title: string[];
    source: string[][];
  };
  try {
    obj = JSON.parse(input);
  } catch (e) {
    return result;
  }
  const source = _.get(obj, 'source', []);
  const title = _.get(obj, 'title', []);
  result = _.map(source || [], item => {
    return _.zipObject(title, item);
  });
  return result;
}

export function getLayoutTypeDisplay(layout: any) {
  const { layoutContainerType, layoutElementType, conditionType, unitCount, styleClass } = layout;
  const classList: string[] = styleClass && styleClass.split(/\s+/) || [];
  if (layoutElementType) {
    switch (layoutElementType) {
      case 'ELEMENT':
        if (conditionType) {
          return 'SEARCH_FORM';
        }
        return 'FORM_COLUMN';
      default:
        return layoutElementType;
    }
  }
  switch (layoutContainerType) {
    case 'DIV':
      if (classList.indexOf('row') >= 0) {
        return 'ROW';
      }
      if (unitCount >= 1 && unitCount <= 12) {
        return `COL-${unitCount}`;
      }
      if (
        layoutElementType === 'SEGMENT'
        || layoutElementType === 'HEADER_BAR'
        || layoutElementType === 'LIST_VIEW'
        || layoutElementType === 'TOOLBAR'
        || layoutElementType === 'TIMELINE'
      ) {
        return layoutElementType;
      }
    default:
      return layoutContainerType;
  }
}

export function getClosestLayout(layouts: any[], layout: any, matchs: any, config: ICreateLayouttsModelOptions, includeSelf = true): any {
  let _layout = layout;
  const { cellNameKey, parentCellNameKey } = config;
  if (!includeSelf) {
    _layout = getLayoutByCellName(layouts, layout[parentCellNameKey], cellNameKey);
  }
  return find(_layout);

  function find(l: any): any {
    if (_.isFunction(matchs)) {
      if (matchs(l)) {
        return l;
      }
    } else if (_.isMatch(l, matchs)) {
      return l;
    }
    const pL = getLayoutByCellName(layouts, l[parentCellNameKey], cellNameKey);
    if (!pL) {
      return null;
    }
    return find(pL);
  }
}

export function getLayoutByCellName(layouts: any[], cellName: string, cellNameKey: string) {
  return _.find(layouts, l => l[cellNameKey] === cellName);
}

export function getClosestElementTypeLayout(layouts: any[], layout: any, config: ICreateLayouttsModelOptions, includeSelf = true) {
  return getClosestLayout(layouts, layout, (l: any) => l.layoutElementType, config, includeSelf);
}

export function getClosestElementType(layouts: any[], layout: any, config: ICreateLayouttsModelOptions, includeSelf = true) {
  const l = getClosestElementTypeLayout(layouts, layout, config, includeSelf);
  if (!l) {
    return null;
  }
  switch (l.layoutElementType) {
    case 'TOOLBAR':
      return 'T'; // 按钮
    case 'GRID':
      return 'G'; // 表格
    case 'ELEMENT':
      if (l.conditionType) {
        return 'S'; // 查询表单
      }
      return 'F'; // 编辑表单
    default:
      return null;
  }
}

export function getControlDefaultSetting(defaultSetting: any, type: string, uiType: string): any {
  let gridSetting = {};
  let finalType = type;
  let finalUiType = uiType;
  if (type === 'G') {
    gridSetting = _.clone(defaultSetting[type]) || {};
    finalType = 'F';
  }
  if (type === 'T') {
    finalUiType = '32';
  }
  const controlDefaultSetting = (defaultSetting[finalType] || {})[finalUiType] || {};
  const commonDefaultSetting = (defaultSetting[finalType] || {})['99'] || {};
  const combinedDefaultSetting = _.assign(gridSetting, commonDefaultSetting, controlDefaultSetting);
  return combinedDefaultSetting;
}

export async function readerJsonFile(file: RcFile) {
  return new Promise<any>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const result = JSON.parse(e.target.result as string);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = function (e) {
      reject(e);
    };
    reader.onabort = function (e) {
      reject(e);
    };
    reader.readAsText(file, 'utf8');
  });
}
