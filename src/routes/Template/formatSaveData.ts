import * as _ from 'lodash';
import { ROW_STATUS } from 'src/config';
import { TEMPLATE_CONFIG } from './config';
import { VISUALIZATION_CONFIG } from '../Visualization/config';
import { PROTOTYPE_CONFIG } from '../Prototype/config';
import { IDatasource, PID_KEY, ID_KEY } from 'src/models/datasourceModel';

const layoutEventsKey = TEMPLATE_CONFIG.layoutEventsKey;
// const layoutEventsCopyKey = TEMPLATE_CONFIG.layoutEventsCopyKey;
const elementEventsKey = TEMPLATE_CONFIG.elementEventsKey;
// const elementEventsCopyKey = TEMPLATE_CONFIG.elementEventsCopyKey;

const emptyLayout: any = {
  formHeaders: null,
  ipfCcmFormToolbars: null,
  ipfCcmGridColumns: null,
  ipfCcmGridToolbars: null,
  ipfCcmPageLayout: null,
  ipfCcmPageLayoutCopy: null,
  rowStatus: ROW_STATUS.NOT_MODIFIED,
  searchFormColumns: [],
};

const emptyElement: any = {
  cellName: null,
  ipfCcmFormColumn: null,
  ipfCcmGridColumn: null,
  ipfCcmPgLoElement: null,
  rowStatus: ROW_STATUS.NOT_MODIFIED,
};

export function formatSaveData(dataIn: any,
  _dm: any) {
  const { urlParams } = _dm;
  const output = {
    boPageLayout: _.map(dataIn.boPageLayout, l => {
      l[layoutEventsKey] = _.filter(l[layoutEventsKey], ev => ev.__isActive !== false);
      if (!l.baseViewId) {
        l.baseViewId = urlParams.baseViewId;
      }
      return _.assign({}, emptyLayout, {
        rowStatus: l.rowStatus,
        ipfCcmPageLayout: l,
      });
    }),
    boPgLoElement: _.map(dataIn.boPgLoElement, e => {
      e[elementEventsKey] = _.filter(e[elementEventsKey], ev => ev.__isActive !== false);
      if (!e.baseViewId) {
        e.baseViewId = urlParams.baseViewId;
      }
      return _.assign({}, emptyElement, {
        cellName: e.cellName,
        rowStatus: e.rowStatus,
        ipfCcmPgLoElement: e,
      });
    }),
  };

  return output;
}

/**
 * 对象建模可视化另存为模板转换
 * @param layouts
 */
export function formatLayoutsFromVisualization(layouts: any[], urlParams: any, removeParentCellNameLayout?: string, isOriginPage = false, datasource: IDatasource[] = []) {
  const boPageLayout = [] as any[];
  const boPgLoElement = [] as any[];
  const { baseViewId } = urlParams;
  const config = isOriginPage ? PROTOTYPE_CONFIG : VISUALIZATION_CONFIG;
  // 查询条件结构
  let queryCriteriaLayout = 'UPDOWN'; // 'LEFTRIGHT'
  let lableLayout =  'UPDOWN'; // 'LEFTRIGHT';

  _.forEach(layouts, l => {
    const layoutId = l[config.layoutIdKey];
    const cellName = l[config.cellNameKey];
    if (l.layoutContainerType === 'FORM' && l.formType === 'form-horizontal') {
      lableLayout = 'LEFTRIGHT';
    }
    if (_.includes(l.styleClass, 'ModuleLeft')) {
      queryCriteriaLayout = 'LEFTRIGHT';
    }

    // 处理 elements
    const elements = l[config.childrenElementsKey] || [];
    delete l[config.childrenElementsKey];
    _.forEach(elements, e => {
      const elementId = e[config.elementIdKey];

      // 处理 element events
      const elementEvents = _.filter(e[config.elementEventsKey], ev => ev.__isActive !== false);
      _.forEach(elementEvents, ev => {
        delete ev.__isActive;
        ev.rowStatus = ROW_STATUS.ADDED;
        ev['baseViewId'] = baseViewId;
      });
      delete e[config.elementEventsKey];
      e[elementEventsKey] = elementEvents;
      e[config.cellNameKey] = cellName;
      e.rowStatus = ROW_STATUS.ADDED;
      e.fieldText = e.fieldText || e.columnName;
      e[TEMPLATE_CONFIG.elementIdKey] = elementId;
      e[TEMPLATE_CONFIG.layoutIdKey] = layoutId;
      e['baseViewId'] = baseViewId;
      delete e['_fromFormHeader'];
      e.layoutBoName = null;
      boPgLoElement.push(e);
    });

    // 处理 layout events
    const layoutEvents = _.filter(l[config.layoutEventsKey], ev => ev.__isActive !== false);
    _.forEach(layoutEvents, ev => {
      delete ev.__isActive;
      ev.rowStatus = ROW_STATUS.ADDED;
      ev['baseViewId'] = baseViewId;
    });
    delete l[config.layoutEventsKey];
    l[layoutEventsKey] = layoutEvents;

    // 处理 layout
    if (removeParentCellNameLayout === l[config.cellNameKey]) {
      l[config.parentCellNameKey] = null;
    }
    l.rowStatus = ROW_STATUS.ADDED;
    l.layoutBoName = null;
    l['baseViewId'] = baseViewId;
    l[TEMPLATE_CONFIG.layoutIdKey] = layoutId;
    l[TEMPLATE_CONFIG.elementIdKey] = l[config.elementIdKey];
    delete l['__formHeaders'];
    delete l['__ipfCcmBoFormColumns'];
    delete l['__ipfCcmBoFormToolbars'];
    delete l['__ipfCcmBoGridColumns'];
    delete l['__ipfCcmBoGridToolbars'];
    delete l['__ipfCcmBoToolbars'];
    delete l['_fromKey'];
    boPageLayout.push(l);
  });

  return {
    boPageLayout: _.map(boPageLayout, l => {
      return _.assign({}, emptyLayout, {
        rowStatus: l.rowStatus,
        ipfCcmPageLayout: l,
      });
    }),
    boPgLoElement: _.map(boPgLoElement, e => {
      return _.assign({}, emptyElement, {
        cellName: e.cellName,
        rowStatus: e.rowStatus,
        ipfCcmPgLoElement: e,
      });
    }),
    queryCriteriaLayout,
    lableLayout,
  };
}

export function createTemplateTableSaveData({
  layoutCode,
  layoutName,
  layoutType,
  baseViewId,
  pageType,
  pageName,
  description,
  componentType,
  queryCriteriaLayout,
  lableLayout,
  ipfCcmRelations,
}: {
  layoutCode: string;
  layoutName: string;
  layoutType: string;
  baseViewId: string;
  pageType: string;
  pageName?: string;
  description?: string;
  componentType: '' | 'X';
  queryCriteriaLayout: string;
  lableLayout: string;
  ipfCcmRelations: any[];
}) {
  return {
    rowStatus: 4,
    /** 布局编码 */
    layoutCode,
    /** 布局名称 */
    layoutName,
    /** 布局类型 */
    layoutType,
    /** 是否组合控件 */
    componentType,
    /** baseViewId */
    realBaseViewId: baseViewId,
    queryCriteriaLayout,
    lableLayout,
    layoutOneLayer: 1,
    layoutTwoLayer: 0,
    layoutThreeLayer: 0,
    layoutFourLayer: 0,
    layoutFiveLayer: 0,
    layoutSixLayer: 0,
    ipfCcmPageLayoutTableId: null as any,
    thumbnail: null as any,
    gridEditType: null as any,
    layerMatching: '',
    ipfCcmRelations: ipfCcmRelations || [],
    /** 页面列表 */
    ipfCcmPages: [
      {
        /** 页面类型 */
        pageType,
        pageName,
        description,
        ipfCcmPageLayoutTableId: null as any,
        ipfCcmPageId: null as any,
        ipfCcmPictures: [] as any[],
        rowStatus: 4,
      },
    ],
  };
}

export function createRelationsFromDatasource(datasource: IDatasource[]) {
  const groupedDatasource = _.chain(datasource)
    .sortBy('seqNo')
    .groupBy(s => (s[PID_KEY] || ''))
    .value();
  const relations: any[] = [];
  next('', 0, '表');
  return relations;

  function next(pid: string, level: number, pName: string) {
    const children = groupedDatasource[pid];
    const childrenRelations = _.map(children, (s, i) => {
      const n = _.padStart((i + 1).toString(), 2, '0');
      const name = `${pName}${n}`;
      next(s[ID_KEY], level + 1, name);
      return {
        ipfCcmRelationId: s[ID_KEY],
        sourcePkId: s[ID_KEY],
        parentId: pid,
        name,
        subBoName: name,
        level,
        pid,
        subBoRelType: '',
        persistentSaveType: '',
        gridEditType:'G',
        rowStatus: 4,
        objectType: '0',
        subBoOrderNo: i,
        baseViewId: '',
      };
    });
    if (childrenRelations.length) {
      relations.push(...childrenRelations);
    }
  }
}

export function createRelationsTreeFromDatasource(datasource: IDatasource[]) {
  if (!datasource) {
    return [];
  }
  const relations = createRelationsFromDatasource(datasource);
  const grouped = _.chain(relations)
    .orderBy(r => (r.subBoOrderNo || ''))
    .groupBy('parentId')
    .value();
  const tree = {};
  next(tree);
  return _.get(tree, 'ipfCcmSubRelations');
  function next(parent: any) {
    const children = grouped[parent.sourcePkId || ''];
    if (children && children.length) {
      parent.ipfCcmSubRelations = children;
      _.forEach(children, next);
    }
  }
}

window['createRelationsFromDatasource'] = createRelationsFromDatasource;
window['createRelationsTreeFromDatasource'] = createRelationsTreeFromDatasource;
