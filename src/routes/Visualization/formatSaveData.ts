import * as _ from 'lodash';
import { ROW_STATUS } from 'src/config';
import { LAYOUT_FIELDS, ELEMENT_FIELDS } from './addFields';

let dm: any;

const layoutEventsKey = 'ipfCcmBoContainerEvents';
const layoutEventsCopyKey = 'ipfCcmBoContainerEventTwos';
const elementEventsKey = 'ipfCcmBoElementEvents';
const elementEventsCopyKey = 'ipfCcmBoElementEventCopys';

const emptyLayout: any = {
  formHeaders: null,
  ipfCcmBoFormToolbars: [],
  ipfCcmBoGridColumns: [],
  ipfCcmBoGridToolbars: [],
  ipfCcmBoPageLayout: {
    baseViewId: null,
    cellName: null,
    childrenLineCount: null,
    columnNo: null,
    commitRemark: null,
    commitTime: null,
    committer: null,
    configItemCode: null,
    controlConnector: null,
    createOffice: null,
    createTime: null,
    createTimeText: null,
    createTimeZone: null,
    creator: null,
    elementName: null,
    formType: null,
    groupMsgCode: null,
    isLayoutDispSetting: null,
    groupTitle: null,
    groupWidget: null,
    height: null,
    ipfCcmBoId: null,
    ipfCcmBoPageId: null,
    ipfCcmBoPageLayoutId: null,
    isLock: null,
    isMainTabPanel: null,
    isParent: null,
    isShowGroup: null,
    labelUnitCount: null,
    lastModifyOffice: null,
    lastModifyTime: null,
    lastModifyTimeText: null,
    lastModifyTimeZone: null,
    lastModifyor: null,
    layoutBoName: null,
    layoutBoViewDesc: null,
    layoutBoViewId: null,
    layoutContainerType: null,
    layoutElementType: null,
    layoutType: null,
    lockTime: null,
    lockUser: null,
    logged: false,
    operationType: null,
    parentCellName: null,
    principalGroupCode: null,
    processState: null,
    recordVersion: null,
    revisionNumber: null,
    rowNo: null,
    rowStatus: 2,
    seqNo: null,
    sourceRevisionNumber: null,
    style: null,
    styleClass: null,
    tabBuildType: null,
    unitCount: null,
    versionStatus: null,
    versionStatusEnName: null,
    workFlowExamine: null,
    workFlowSequenceFlowName: null,
    workFlowTaskId: null,
  },
  ipfCcmBoPageLayoutCopy: null,
  rowStatus: ROW_STATUS.NOT_MODIFIED,
  searchFormColumns: [],
};

_.forEach(LAYOUT_FIELDS, field => {
  emptyLayout.ipfCcmBoPageLayout[field] = null;
});

const emptyElement: any = {
  cellName: null,
  ipfCcmBoFormColumn: null,
  ipfCcmBoGridColumn: null,
  ipfCcmBoPgLoElement: {
    baseViewId: null,
    columnStyle: null,
    commitRemark: null,
    commitTime: null,
    committer: null,
    conditionType: null,
    configItemCode: null,
    controlConnector: null,
    controlHeight: null,
    controlWidth: null,
    correctType: null,
    createOffice: null,
    createTime: null,
    createTimeText: null,
    createTimeZone: null,
    creator: null,
    defaultValue: null,
    formatExpress: null,
    isZeroFill: null,
    dataElementCode: null,
    dataElementText: null,
    elementMsgCode: null,
    elementMsgText: null,
    titleMsgCode: null,
    titleMsgText: null,
    layoutElementAttr: null,
    initValueType: null,
    ipfCcmBoPageLayoutId: null,
    ipfCcmBoPgLoElementId: null,
    isInline: null,
    isLock: null,
    isNotNull: null,
    isReadOnly: null,
    isShowLable: null,
    isVisible: null,
    lableStyle: null,
    lastModifyOffice: null,
    lastModifyTime: null,
    lastModifyTimeText: null,
    lastModifyTimeZone: null,
    lastModifyor: null,
    layoutBoName: null,
    layoutBoViewDesc: null,
    layoutBoViewId: null,
    layoutElementType: null,
    lockTime: null,
    lockUser: null,
    logged: false,
    methodName: null,
    operation: null,
    operationType: null,
    principalGroupCode: null,
    processState: null,
    propertyName: null,
    queryType: null,
    rangeType: null,
    recordVersion: null,
    revisionNumber: null,
    rowStatus: 2,
    seqNo: null,
    sourceRevisionNumber: null,
    tabIndex: null,
    textLineNum: null,
    uiType: null,
    versionStatus: null,
    versionStatusEnName: null,
    workFlowExamine: null,
    workFlowSequenceFlowName: null,
    workFlowTaskId: null,
    staticContent: null,
    icon: null,
    elementName: null,
    fieldText: null,
    atValueType: null,
    atResultValue: null,
    searchHelp: null,
    searchHelpViewDesc: null,
    searchHelpViewId: null,
    refProName: null,
    dictTableName: null,
    dictGroupValue: null,
    uploadStrategy: null,
  },
  rowStatus: ROW_STATUS.NOT_MODIFIED,
};

_.forEach(ELEMENT_FIELDS, field => {
  emptyElement.ipfCcmBoPgLoElement[field] = null;
});

const ipfCcmBoFormColumn: any = {
  activeExpree: null,
  baseViewId: null,
  boId: null,
  caNote: null,
  cellName: null,
  columnNo: null,
  columnStyle: null,
  configItemCode: null,
  correctType: null,
  createOffice: null,
  createTime: null,
  createTimeText: null,
  createTimeZone: null,
  creator: null,
  defaultValue: null,
  displayLable: null,
  formatExpress: null,
  fproId: null,
  group: null,
  groupName: null,
  initValueType: null,
  inlineConnector: null,
  inlineOrderNo: null,
  inlineWidth: null,
  isHeader: null,
  isRadioInline: null,
  isShowLabel: null,
  lableStyle: null,
  lastModifyOffice: null,
  lastModifyTime: null,
  lastModifyTimeText: null,
  lastModifyTimeZone: null,
  lastModifyor: null,
  logged: false,
  notNull: null,
  operationType: null,
  principalGroupCode: null,
  proId: null,
  processState: null,
  propertyName: null,
  propertyType: '1',
  readOnly: null,
  recordVersion: null,
  revisionNumber: null,
  rowNo: null,
  rowNoNum: 0,
  rowStatus: 2,
  ruleNo: null,
  sourceRevisionNumber: null,
  tabIndex: null,
  textFormHeight: null,
  textLineNum: null,
  uiType: null,
  validationRules: null,
  versionStatus: null,
  versionStatusEnName: null,
  visibility: null,
  workFlowExamine: null,
  workFlowSequenceFlowName: null,
  workFlowTaskId: null,
};

const ipfCcmBoGridColumn: any = {
  activeExpree: null,
  advCellName: null,
  advInlineConnector: null,
  advInlineOrderNo: null,
  advInlineWidth: null,
  advTextFormHeight: null,
  advTextLineNum: null,
  baseViewId: null,
  boId: null,
  cellClass: null,
  columnNo: null,
  columnNoInt: null,
  columnStyle: null,
  columnStyleColor: null,
  columnStyleExpress: null,
  conditionVisible: null,
  configItemCode: null,
  correctType: null,
  createOffice: null,
  createTime: null,
  createTimeText: null,
  createTimeZone: null,
  creator: null,
  defaultValue: null,
  defaultValue2: null,
  formColumn: null,
  formatExpress: null,
  grdId: null,
  groupTotType: null,
  initValueType: null,
  initValueType2: null,
  isAdvRadioInline: null,
  isAdvSearch: null,
  isAdvShowLabel: null,
  isAdvanceSearchItem: null,
  isCellEditable: null,
  isCondition: null,
  isQuickRadioInline: null,
  isQuickSearch: null,
  isQuickSearchItem: null,
  isQuickShowLabel: null,
  isRange: null,
  isShowSort: null,
  isSum: null,
  lastModifyOffice: null,
  lastModifyTime: null,
  lastModifyTimeText: null,
  lastModifyTimeZone: null,
  lastModifyor: null,
  lockColumnExpress: null,
  logged: false,
  methodId: null,
  methodName: null,
  notNull: null,
  operation: null,
  operationEnum: null,
  operationType: null,
  orderBy: null,
  parentQuickCellName: null,
  principalGroupCode: null,
  processState: null,
  propertyId: null,
  propertyName: null,
  propertyType: '1',
  quickCellName: null,
  quickInlineConnector: null,
  quickInlineOrderNo: null,
  quickInlineWidth: null,
  quickSearchGroupName: null,
  quickTextFormHeight: null,
  quickTextLineNum: null,
  rangeTypeTxt: null,
  readOnly: null,
  recordVersion: null,
  revisionNumber: null,
  rowStatus: 2,
  searchColNo: null,
  searchRowNo: null,
  shlpValueType: null,
  sortOrder: null,
  sourceRevisionNumber: null,
  tabIndex: null,
  uiType: null,
  unlockColumnExpress: null,
  fieldCode: null,
  fieldValue: null,
  methodBoName: null,
  versionStatusEnName: null,
  visibility: null,
  width: null,
  workFlowExamine: null,
  workFlowSequenceFlowName: null,
  workFlowTaskId: null,
};

export function formatSaveData(dataIn: any, _dm: any) {

  dm = _dm;

  dataIn.boPageLayout = dataIn.boPageLayout || dataIn.pageLayout;
  dataIn.boPgLoElement = dataIn.boPgLoElement || dataIn.pgLoElement;

  _.forEach(dataIn.boPageLayout, l => {
    if (!l.baseViewId && _dm.baseViewId) {
      l.baseViewId = _dm.baseViewId;
    }
  });

  _.forEach(dataIn.boPgLoElement, e => {
    if (!e.baseViewId && _dm.baseViewId) {
      e.baseViewId = _dm.baseViewId;
    }
  });

  let postData: any;
  let opts: any;
  postData = formatPostData(dm.originData, dataIn);
  opts = {
    id: dm.ipfCcmBoPageId || dm.ipfCcmBoId,
    isPage: dm.isPage,
    baseViewId: dm.baseViewId,
  };
  return JSON.parse(JSON.stringify(_.assign({}, postData, opts), (k: any, v: any) => {
    if (k.indexOf('__') === 0) {
      return undefined;
    }
    if (v === 'ROOT' || v === 'ROOT_E') {
      return '';
    }
    return v;
  }));
}

function assetIsPage(isPage: any) {
  return isPage === 'true' || isPage === true;
}

function removePrefix(cellName: string) {
  if (!cellName) {
    return cellName;
  }
  const cellNameArr = cellName.split('.');
  return _.last(cellNameArr);
}

function removeCellNamePrefix(data: any) {
  _.forEach(data.boPgLoElement, (o, index) => {
    const cellName = data.boPgLoElement[index].cellName;
    data.boPgLoElement[index].cellName = removePrefix(cellName);
    const ipfCcmBoFormColumn1 = data.boPgLoElement[index].ipfCcmBoFormColumn;
    if (ipfCcmBoFormColumn1) {
      const cellName2 = ipfCcmBoFormColumn1.cellName;
      if (cellName2) {
        data.boPgLoElement[index].ipfCcmBoFormColumn.cellName = removePrefix(cellName2);
      }
    }
    const ipfCcmBoGridColumn1 = data.boPgLoElement[index].ipfCcmBoGridColumn;
    if (ipfCcmBoGridColumn1) {
      const _cellName = ipfCcmBoGridColumn1.cellName;
      if (_cellName) {
        data.boPgLoElement[index].ipfCcmBoGridColumn.cellName = removePrefix(_cellName);
      }
    }
    const ipfCcmBoPgLoElement = data.boPgLoElement[index].ipfCcmBoPgLoElement || data.boPgLoElement[index].ipfCcmBoPgLoElementCopy;
    if (ipfCcmBoPgLoElement) {
      const _cellName2 = ipfCcmBoPgLoElement.cellName;
      if (_cellName2) {
        data.boPgLoElement[index].ipfCcmBoPgLoElement.cellName = removePrefix(_cellName2);
      }
    }
  });
  _.forEach(data.boPageLayout, (o, index) => {
    let layoutKey;
    if (o.ipfCcmBoPageLayout) {
      layoutKey = 'ipfCcmBoPageLayout';
    } else if (o.ipfCcmBoPageLayoutCopy) {
      layoutKey = 'ipfCcmBoPageLayoutCopy';
    } else {
      return;
    }
    const cellName = o[layoutKey].cellName;
    const parentCellName = o[layoutKey].parentCellName;
    data.boPageLayout[index][layoutKey].cellName = removePrefix(cellName);
    data.boPageLayout[index][layoutKey].parentCellName = removePrefix(parentCellName);
  });
  return data;
}

function removeDirty(data: any) {
  if (_.isNull(data.boPgLoElement)) {
    data.boPgLoElement = [];
  }
  _.forEach(data.boPgLoElement, (o, i) => {
    delete data.boPgLoElement[i].dirty;
    delete data.boPgLoElement[i].baseViewId;
    delete data.boPgLoElement[i].configItemCode;
    delete data.boPgLoElement[i].createOffice;
    delete data.boPgLoElement[i].createTime;
    delete data.boPgLoElement[i].createTimeText;
    delete data.boPgLoElement[i].createTimeZone;
    delete data.boPgLoElement[i].creator;
    delete data.boPgLoElement[i].lastModifyOffice;
    delete data.boPgLoElement[i].lastModifyTime;
    delete data.boPgLoElement[i].lastModifyTimeText;
    delete data.boPgLoElement[i].lastModifyTimeZone;
    delete data.boPgLoElement[i].lastModifyor;
    delete data.boPgLoElement[i].logged;
    delete data.boPgLoElement[i].operationType;
    delete data.boPgLoElement[i].principalGroupCode;
    delete data.boPgLoElement[i].processState;
    delete data.boPgLoElement[i].recordVersion;
    delete data.boPgLoElement[i].revisionNumber;
    // delete data.boPgLoElement[i].rowStatus;
    if (!data.boPgLoElement[i].rowStatus) {
      data.boPgLoElement[i].rowStatus = ROW_STATUS.NOT_MODIFIED;
    }
    delete data.boPgLoElement[i].sourceRevisionNumber;
    delete data.boPgLoElement[i].versionStatus;
    delete data.boPgLoElement[i].versionStatusEnName;
    delete data.boPgLoElement[i].workFlowExamine;
    delete data.boPgLoElement[i].workFlowSequenceFlowName;
    delete data.boPgLoElement[i].workFlowTaskId;

    if (o.ipfCcmBoFormColumn) {
      delete data.boPgLoElement[i].ipfCcmBoFormColumn.dirty;
      delete data.boPgLoElement[i].ipfCcmBoFormColumn.versionStatusEnName;
      delete data.boPgLoElement[i].ipfCcmBoFormColumn.createTimeText;
      delete data.boPgLoElement[i].ipfCcmBoFormColumn.lastModifyTimeText;
    }

    if (o.ipfCcmBoGridColumn) {
      delete data.boPgLoElement[i].ipfCcmBoGridColumn.dirty;
      delete data.boPgLoElement[i].ipfCcmBoGridColumn.versionStatusEnName;
      delete data.boPgLoElement[i].ipfCcmBoGridColumn.createTimeText;
      delete data.boPgLoElement[i].ipfCcmBoGridColumn.lastModifyTimeText;
    }

    if (o.ipfCcmBoPgLoElement) {
      delete data.boPgLoElement[i].ipfCcmBoPgLoElement.dirty;
      delete data.boPgLoElement[i].ipfCcmBoPgLoElement.versionStatusEnName;
      delete data.boPgLoElement[i].ipfCcmBoPgLoElement.createTimeText;
      delete data.boPgLoElement[i].ipfCcmBoPgLoElement.lastModifyTimeText;
    }

    if (o.ipfCcmBoPgLoElementCopy) {
      delete data.boPgLoElement[i].ipfCcmBoPgLoElementCopy.dirty;
      delete data.boPgLoElement[i].ipfCcmBoPgLoElementCopy.versionStatusEnName;
      delete data.boPgLoElement[i].ipfCcmBoPgLoElementCopy.createTimeText;
      delete data.boPgLoElement[i].ipfCcmBoPgLoElementCopy.lastModifyTimeText;
    }
  });

  if (_.isNull(data.boPageLayout)) {
    data.boPageLayout = [];
  }
  _.forEach(data.boPageLayout, (o, i) => {
    delete data.boPageLayout[i].dirty;
    delete data.boPageLayout[i].versionStatusEnName;
    delete data.boPageLayout[i].createTimeText;
    delete data.boPageLayout[i].lastModifyTimeText;
    delete data.boPageLayout[i].baseViewId;
    delete data.boPageLayout[i].configItemCode;
    delete data.boPageLayout[i].createOffice;
    delete data.boPageLayout[i].createTime;
    delete data.boPageLayout[i].createTimeZone;
    delete data.boPageLayout[i].creator;
    delete data.boPageLayout[i].lastModifyOffice;
    delete data.boPageLayout[i].lastModifyTime;
    delete data.boPageLayout[i].lastModifyTimeZone;
    delete data.boPageLayout[i].lastModifyor;
    delete data.boPageLayout[i].logged;
    delete data.boPageLayout[i].operationType;
    delete data.boPageLayout[i].principalGroupCode;
    delete data.boPageLayout[i].processState;
    delete data.boPageLayout[i].recordVersion;
    delete data.boPageLayout[i].revisionNumber;
    // delete data.boPageLayout[i].rowStatus;
    if (!data.boPageLayout[i].rowStatus) {
      data.boPageLayout[i].rowStatus = ROW_STATUS.NOT_MODIFIED;
    }
    delete data.boPageLayout[i].searchFormColumns;
    delete data.boPageLayout[i].sourceRevisionNumber;
    delete data.boPageLayout[i].versionStatus;
    delete data.boPageLayout[i].workFlowExamine;
    delete data.boPageLayout[i].workFlowSequenceFlowName;
    delete data.boPageLayout[i].workFlowTaskId;

    if (o.ipfCcmBoPageLayout) {
      delete data.boPageLayout[i].ipfCcmBoPageLayout.dirty;
      delete data.boPageLayout[i].ipfCcmBoPageLayout.versionStatusEnName;
      delete data.boPageLayout[i].ipfCcmBoPageLayout.createTimeText;
      delete data.boPageLayout[i].ipfCcmBoPageLayout.lastModifyTimeText;
      if (_.isNull(data.boPageLayout[i].ipfCcmBoPageLayout.ipfCcmBoPgLoElements)) {
        data.boPageLayout[i].ipfCcmBoPageLayout.ipfCcmBoPgLoElements = [];
      }
      if (o.ipfCcmBoPageLayout.ipfCcmBoPgLoElements) {
        _.forEach(o.ipfCcmBoPageLayout.ipfCcmBoPgLoElements, (__, j) => {
          delete data.boPageLayout[i].ipfCcmBoPageLayout.ipfCcmBoPgLoElements[j].dirty;
          delete data.boPageLayout[i].ipfCcmBoPageLayout.ipfCcmBoPgLoElements[j].versionStatusEnName;
          delete data.boPageLayout[i].ipfCcmBoPageLayout.ipfCcmBoPgLoElements[j].createTimeText;
          delete data.boPageLayout[i].ipfCcmBoPageLayout.ipfCcmBoPgLoElements[j].lastModifyTimeText;
        });
      }
      if (_.isNull(data.boPageLayout[i].ipfCcmBoPageLayout.ipfCcmBoContainerEvents)) {
        data.boPageLayout[i].ipfCcmBoPageLayout.ipfCcmBoContainerEvents = [];
      }
      if (o.ipfCcmBoPageLayout.ipfCcmBoContainerEvents) {
        _.forEach(o.ipfCcmBoPageLayout.ipfCcmBoContainerEvents, (__, j) => {
          delete data.boPageLayout[i].ipfCcmBoPageLayout.ipfCcmBoContainerEvents[j].dirty;
          delete data.boPageLayout[i].ipfCcmBoPageLayout.ipfCcmBoContainerEvents[j].versionStatusEnName;
          delete data.boPageLayout[i].ipfCcmBoPageLayout.ipfCcmBoContainerEvents[j].createTimeText;
          delete data.boPageLayout[i].ipfCcmBoPageLayout.ipfCcmBoContainerEvents[j].lastModifyTimeText;
        });
      }
      if (_.isNull(data.boPageLayout[i].ipfCcmBoPageLayout.searchFormColumns)) {
        data.boPageLayout[i].ipfCcmBoPageLayout.searchFormColumns = [];
      }
      if (o.ipfCcmBoPageLayout.ipfCcmBoContainerEvents) {
        _.forEach(o.ipfCcmBoPageLayout.ipfCcmBoContainerEvents, (__, j) => {
          delete data.boPageLayout[i].ipfCcmBoPageLayout.ipfCcmBoContainerEvents[j].dirty;
          delete data.boPageLayout[i].ipfCcmBoPageLayout.ipfCcmBoContainerEvents[j].versionStatusEnName;
          delete data.boPageLayout[i].ipfCcmBoPageLayout.ipfCcmBoContainerEvents[j].createTimeText;
          delete data.boPageLayout[i].ipfCcmBoPageLayout.ipfCcmBoContainerEvents[j].lastModifyTimeText;
        });
      }
    }

    if (o.ipfCcmBoPageLayoutCopy) {
      delete data.boPageLayout[i].ipfCcmBoPageLayoutCopy.dirty;
      delete data.boPageLayout[i].ipfCcmBoPageLayoutCopy.versionStatusEnName;
      delete data.boPageLayout[i].ipfCcmBoPageLayoutCopy.createTimeText;
      delete data.boPageLayout[i].ipfCcmBoPageLayoutCopy.lastModifyTimeText;
      if (_.isNull(data.boPageLayout[i].ipfCcmBoPageLayoutCopy.ipfCcmBoPgLoElementCopys)) {
        data.boPageLayout[i].ipfCcmBoPageLayoutCopy.ipfCcmBoPgLoElementCopys = [];
      }
      if (o.ipfCcmBoPageLayoutCopy.ipfCcmBoPgLoElementCopys) {
        _.forEach(o.ipfCcmBoPageLayoutCopy.ipfCcmBoPgLoElementCopys, (__, j) => {
          delete data.boPageLayout[i].ipfCcmBoPageLayoutCopy.ipfCcmBoPgLoElementCopys[j].dirty;
          delete data.boPageLayout[i].ipfCcmBoPageLayoutCopy.ipfCcmBoPgLoElementCopys[j].versionStatusEnName;
          delete data.boPageLayout[i].ipfCcmBoPageLayoutCopy.ipfCcmBoPgLoElementCopys[j].createTimeText;
          delete data.boPageLayout[i].ipfCcmBoPageLayoutCopy.ipfCcmBoPgLoElementCopys[j].lastModifyTimeText;
        });
      }
      if (_.isNull(data.boPageLayout[i].ipfCcmBoPageLayoutCopy.ipfCcmBoContainerEventTwos)) {
        data.boPageLayout[i].ipfCcmBoPageLayoutCopy.ipfCcmBoContainerEventTwos = [];
      }
      if (o.ipfCcmBoPageLayoutCopy.ipfCcmBoContainerEventTwos) {
        _.forEach(o.ipfCcmBoPageLayoutCopy.ipfCcmBoContainerEventTwos, (__, j) => {
          delete data.boPageLayout[i].ipfCcmBoPageLayoutCopy.ipfCcmBoContainerEventTwos[j].dirty;
          delete data.boPageLayout[i].ipfCcmBoPageLayoutCopy.ipfCcmBoContainerEventTwos[j].versionStatusEnName;
          delete data.boPageLayout[i].ipfCcmBoPageLayoutCopy.ipfCcmBoContainerEventTwos[j].createTimeText;
          delete data.boPageLayout[i].ipfCcmBoPageLayoutCopy.ipfCcmBoContainerEventTwos[j].lastModifyTimeText;
        });
      }
    }
    if (_.isNull(data.boPageLayout[i].ipfCcmBoFormToolbars)) {
      data.boPageLayout[i].ipfCcmBoFormToolbars = [];
    }
    if (o.ipfCcmBoFormToolbars) {
      _.forEach(o.ipfCcmBoFormToolbars, (__, j) => {
        delete data.boPageLayout[i].ipfCcmBoFormToolbars[j].dirty;
        delete data.boPageLayout[i].ipfCcmBoFormToolbars[j].versionStatusEnName;
        delete data.boPageLayout[i].ipfCcmBoFormToolbars[j].createTimeText;
        delete data.boPageLayout[i].ipfCcmBoFormToolbars[j].lastModifyTimeText;
      });
    }
    if (_.isNull(data.boPageLayout[i].formHeaders)) {
      data.boPageLayout[i].formHeaders = [];
    }
    if (o.formHeaders) {
      _.forEach(o.formHeaders, (__, j) => {
        delete data.boPageLayout[i].formHeaders[j].dirty;
        delete data.boPageLayout[i].formHeaders[j].versionStatusEnName;
        delete data.boPageLayout[i].formHeaders[j].createTimeText;
        delete data.boPageLayout[i].formHeaders[j].lastModifyTimeText;
      });
    }
    if (_.isNull(data.boPageLayout[i].ipfCcmBoGridColumns)) {
      data.boPageLayout[i].ipfCcmBoGridColumns = [];
    }
    if (o.ipfCcmBoGridColumns) {
      _.forEach(o.ipfCcmBoGridColumns, (__, j) => {
        delete data.boPageLayout[i].ipfCcmBoGridColumns[j].dirty;
        delete data.boPageLayout[i].ipfCcmBoGridColumns[j].versionStatusEnName;
        delete data.boPageLayout[i].ipfCcmBoGridColumns[j].createTimeText;
        delete data.boPageLayout[i].ipfCcmBoGridColumns[j].lastModifyTimeText;
      });
    }
    if (_.isNull(data.boPageLayout[i].ipfCcmBoGridToolbars)) {
      data.boPageLayout[i].ipfCcmBoGridToolbars = [];
    }
    if (o.ipfCcmBoGridToolbars) {
      _.forEach(o.ipfCcmBoGridToolbars, (__, j) => {
        delete data.boPageLayout[i].ipfCcmBoGridToolbars[j].dirty;
        delete data.boPageLayout[i].ipfCcmBoGridToolbars[j].versionStatusEnName;
        delete data.boPageLayout[i].ipfCcmBoGridToolbars[j].createTimeText;
        delete data.boPageLayout[i].ipfCcmBoGridToolbars[j].lastModifyTimeText;
      });
    }
  });
  return data;
}

function formatPostData(initData: any, modifyedData: any) {
  const boPageLayout = formatPostLayoutData(initData.boPageLayout, modifyedData.boPageLayout);
  const boPgLoElement = formatPostElementData(initData.boPgLoElement, modifyedData.boPgLoElement);
  return removeDirty(removeCellNamePrefix({
    boPageLayout,
    boPgLoElement,
  }));
}

function formatPostLayoutData(initLayoutData: any, modifyedLayoutData: any) {
  const ret: any[] = [];
  _.forEach(modifyedLayoutData, (modifyedLayout) => {
    if (modifyedLayout._fromFormHeader) {
      // fromheader 不处理
      return;
    } if (modifyedLayout.rowStatus === ROW_STATUS.ADDED) {
      // 新增的 layout
      const rowStatus = modifyedLayout.rowStatus;
      delete modifyedLayout.rowStatus;
      const newLayout = _.cloneDeep(emptyLayout);
      const layoutKey = assetIsPage(dm.isPage) ? 'ipfCcmBoPageLayout' : 'ipfCcmBoPageLayoutCopy';
      newLayout[layoutKey] = _.assign({}, newLayout.ipfCcmBoPageLayout, modifyedLayout);
      if (!assetIsPage(dm.isPage)) {
        newLayout.ipfCcmBoPageLayout = null;
      }
      newLayout.rowStatus = rowStatus;
      newLayout[layoutKey].ipfCcmBoPageLayoutId = modifyedLayout.__origin_ipfCcmBoPageLayoutId || modifyedLayout.ipfCcmBoPageLayoutId;
      if (layoutKey === 'ipfCcmBoPageLayoutCopy') {
        newLayout[layoutKey][layoutEventsCopyKey] = newLayout[layoutKey][layoutEventsKey];
        delete newLayout[layoutKey][layoutEventsKey];
      }
      ret.push(newLayout);
    } else {
      // 原有的 layout
      const _fromKey = modifyedLayout._fromKey || 'ipfCcmBoPageLayout';
      const ipfCcmBoPageLayoutId = modifyedLayout.ipfCcmBoPageLayoutId;
      const rowStatus = modifyedLayout.rowStatus;

      delete modifyedLayout._fromKey;
      delete modifyedLayout.rowStatus;
      const initLayout = _.find(initLayoutData, (o) => {
        const layout = o.ipfCcmBoPageLayout || o.ipfCcmBoPageLayoutCopy;
        return layout.ipfCcmBoPageLayoutId === ipfCcmBoPageLayoutId;
      });
      // if (_.first(cellName.split('.')) !== configName) {
      //   // 来自其他表 不修改
      //   ret.push(initLayout);
      //   return;
      // }
      initLayout.rowStatus = rowStatus;
      if (rowStatus === ROW_STATUS.DELETED) {
        // 删除
        initLayout.rowStatus = ROW_STATUS.DELETED;
        if (_fromKey === 'ipfCcmBoPageLayoutCopy') {
          initLayout[_fromKey][layoutEventsCopyKey] = initLayout[_fromKey][layoutEventsKey];
          delete initLayout[_fromKey][layoutEventsKey];
        }
        ret.push(initLayout);
        return;
      }
      // 本表 正常修改
      initLayout[_fromKey] = _.assign({}, initLayout[_fromKey], modifyedLayout);
      if (_fromKey === 'ipfCcmBoPageLayoutCopy') {
        initLayout[_fromKey][layoutEventsCopyKey] = initLayout[_fromKey][layoutEventsKey];
        delete initLayout[_fromKey][layoutEventsKey];
      }
      ret.push(initLayout);
    }
  });
  return ret;
}

function formatPostElementData(initElementData: any, modifyedElementData: any) {
  const ret: any[] = [];
  _.forEach(modifyedElementData, (element) => {
    const ipfCcmBoPgLoElementId = element.ipfCcmBoPgLoElementId;
    const uiType = element.uiType;
    const rowStatus = element.rowStatus;
    let layoutBoName = element.layoutBoName;
    const layoutBoViewDesc = element.layoutBoViewDesc;
    const layoutBoViewId = element.layoutBoViewId;
    const layoutElementType = element.layoutElementType;

    if (!layoutBoName) {
      layoutBoName = dm.configName;
    }
    if (element._fromFormHeader) {
      return;
    }
    if (uiType === 'button') {
      return;
    }
    if (rowStatus === ROW_STATUS.ADDED) {
      const NewElement = _.cloneDeep(emptyElement);
      let _formColumnKey: string = void 0;
      let emptyFormColumn: string = void 0;
      if (layoutElementType === 'FORM_COLUMN') {
        _formColumnKey = 'ipfCcmBoFormColumn';
        emptyFormColumn = _.clone(ipfCcmBoFormColumn);
      } else if (layoutElementType === 'SEARCH_FORM') {
        _formColumnKey = 'ipfCcmBoGridColumn';
        emptyFormColumn = _.clone(ipfCcmBoGridColumn);
      }
      const elementKey1: string = assetIsPage(dm.isPage) ? 'ipfCcmBoPgLoElement' : 'ipfCcmBoPgLoElementCopy';
      if (!assetIsPage(dm.isPage)) {
        NewElement.ipfCcmBoPgLoElementCopy = NewElement.ipfCcmBoPgLoElement;
        NewElement.ipfCcmBoPgLoElement = null;
      }
      NewElement.cellName = element.cellName;
      NewElement[elementKey1].baseViewId = element.baseViewId;
      NewElement[elementKey1].layoutElementType = element.layoutElementType;
      NewElement[elementKey1].layoutBoName = layoutBoName;
      NewElement[elementKey1].layoutBoViewDesc = layoutBoViewDesc;
      NewElement[elementKey1].layoutBoViewId = layoutBoViewId;
      NewElement[elementKey1].propertyName = element.propertyName;
      NewElement[elementKey1].queryType = element.queryType;
      NewElement[elementKey1].isNotNull = element.isNotNull;
      NewElement[elementKey1].isReadOnly = element.isReadOnly;
      NewElement[elementKey1].isShowLable = element.isShowLable;
      NewElement[elementKey1].isVisible = element.isVisible;
      NewElement[elementKey1].uiType = element.uiType;
      NewElement[elementKey1].controlWidth = element.controlWidth;
      NewElement[elementKey1].controlHeight = element.controlHeight;
      NewElement[elementKey1].controlConnector = element.controlConnector;
      NewElement[elementKey1].correctType = element.correctType;
      NewElement[elementKey1].initValueType = element.initValueType;
      NewElement[elementKey1].defaultValue = element.defaultValue;
      NewElement[elementKey1].isInline = element.isInline;
      NewElement[elementKey1].tabIndex = element.tabIndex;
      NewElement[elementKey1].lableStyle = element.lableStyle;
      NewElement[elementKey1].methodName = element.methodName;
      NewElement[elementKey1].operation = element.operation;
      NewElement[elementKey1].rangeType = element.rangeType;
      NewElement[elementKey1].columnStyle = element.columnStyle;
      NewElement[elementKey1].textLineNum = element.textLineNum;
      NewElement[elementKey1].seqNo = element.seqNo;
      NewElement[elementKey1].ipfCcmBoPageLayoutId = element.__ipfCcmBoPageLayoutId;
      NewElement[elementKey1].conditionType = element.conditionType;
      NewElement[elementKey1].staticContent = element.staticContent;
      NewElement[elementKey1].layoutElementAttr = element.layoutElementAttr;
      NewElement[elementKey1].icon = element.icon;
      NewElement[elementKey1].elementName = element.elementName;
      NewElement[elementKey1].fieldText = element.fieldText;
      NewElement[elementKey1].atValueType = element.atValueType;
      NewElement[elementKey1].atResultValue = element.atResultValue;
      NewElement[elementKey1].searchHelp = element.searchHelp;
      NewElement[elementKey1].searchHelpViewDesc = element.searchHelpViewDesc;
      NewElement[elementKey1].searchHelpViewId = element.searchHelpViewId;
      NewElement[elementKey1].refProName = element.refProName;
      NewElement[elementKey1].dictTableName = element.dictTableName;
      NewElement[elementKey1].dictGroupValue = element.dictGroupValue;
      NewElement[elementKey1].uploadStrategy = element.uploadStrategy;
      NewElement[elementKey1].groupTotType = element.groupTotType;
      NewElement[elementKey1].formatExpress = element.formatExpress;
      NewElement[elementKey1].isZeroFill = element.isZeroFill;
      NewElement[elementKey1].dataElementCode = element.dataElementCode;
      NewElement[elementKey1].dataElementText = element.dataElementText;
      NewElement[elementKey1].elementMsgCode = element.elementMsgCode;
      NewElement[elementKey1].elementMsgText = element.elementMsgText;
      NewElement[elementKey1].titleMsgCode = element.titleMsgCode;
      NewElement[elementKey1].titleMsgText = element.titleMsgText;
      NewElement[elementKey1].layoutElementAttr = element.layoutElementAttr;
      NewElement[elementKey1].isFocus = element.isFocus;
      NewElement[elementKey1].disabledExpree = element.disabledExpree;
      NewElement[elementKey1].showExpree = element.showExpree;
      NewElement[elementKey1].isRefreshParentBo = element.isRefreshParentBo;
      NewElement[elementKey1].hotkeyType = element.hotkeyType;
      NewElement[elementKey1].hotkeyValue = element.hotkeyValue;
      NewElement[elementKey1].isCellEditable = element.isCellEditable;
      NewElement[elementKey1].columnStyleExpress = element.columnStyleExpress;
      NewElement[elementKey1].isSum = element.isSum;
      NewElement[elementKey1].isOrderBy = element.isOrderBy;
      NewElement[elementKey1].sortOrder = element.sortOrder;
      NewElement[elementKey1].isDropFilter = element.isDropFilter;
      NewElement[elementKey1].isShowSort = element.isShowSort;
      NewElement[elementKey1].unlockColumnExpress = element.unlockColumnExpress;
      NewElement[elementKey1].fieldCode = element.fieldCode;
      NewElement[elementKey1].fieldValue = element.fieldValue;
      NewElement[elementKey1].methodBoName = element.methodBoName;
      NewElement[elementKey1].initValueType2 = element.initValueType2;
      NewElement[elementKey1].defaultValue2 = element.defaultValue2;
      NewElement[elementKey1].lockColumnExpress = element.lockColumnExpress;
      _.forEach(ELEMENT_FIELDS, field => {
        NewElement[elementKey1][field] = element[field];
      });
      NewElement[elementKey1].ipfCcmBoPgLoElementId = element.__origin_ipfCcmBoPgLoElementId || element.ipfCcmBoPgLoElementId;
      NewElement[elementKey1][elementKey1 === 'ipfCcmBoPgLoElementCopy' ? elementEventsCopyKey : elementEventsKey] = element.ipfCcmBoElementEvents;
      if (_formColumnKey === 'ipfCcmBoFormColumn') {
        NewElement[_formColumnKey] = emptyFormColumn;
        NewElement[_formColumnKey].propertyName = element.propertyName;
        NewElement[_formColumnKey].propertyType = element.propertyType || '1';
        // NewElement[_formColumnKey].notNull = element.isNotNull;
        NewElement[_formColumnKey].isShowLabel = element.isShowLable;
        NewElement[_formColumnKey].readOnly = element.isReadOnly;
        NewElement[_formColumnKey].uiType = element.uiType;
        NewElement[_formColumnKey].correctType = element.correctType;
        NewElement[_formColumnKey].initValueType = element.initValueType;
        NewElement[_formColumnKey].defaultValue = element.defaultValue;
        NewElement[_formColumnKey].tabIndex = element.tabIndex;
        NewElement[_formColumnKey].lableStyle = element.lableStyle;
        NewElement[_formColumnKey].columnStyle = element.columnStyle;
        NewElement[_formColumnKey].textLineNum = element.textLineNum;
      } else if (_formColumnKey === 'ipfCcmBoGridColumn') {
        NewElement[_formColumnKey] = emptyFormColumn;
        NewElement[_formColumnKey].propertyName = element.propertyName;
        NewElement[_formColumnKey].propertyType = element.propertyType || '1';
        // NewElement[_formColumnKey].isNotNull = element.isNotNull;
        NewElement[_formColumnKey].readOnly = element.isReadOnly;
        NewElement[_formColumnKey].uiType = element.uiType;
        NewElement[_formColumnKey].correctType = element.correctType;
        NewElement[_formColumnKey].initValueType = element.initValueType;
        NewElement[_formColumnKey].defaultValue = element.defaultValue;
        NewElement[_formColumnKey].tabIndex = element.tabIndex;
        NewElement[_formColumnKey].methodName = element.methodName;
        NewElement[_formColumnKey].operation = element.operation;
      }
      NewElement.rowStatus = rowStatus;
      ret.push(NewElement);
      return;
    }
    const initElement = _.find(initElementData, (o) => {
      const _ipfCcmBoPgLoElement = o.ipfCcmBoPgLoElement || o.ipfCcmBoPgLoElementCopy;
      return _ipfCcmBoPgLoElement && _ipfCcmBoPgLoElement.ipfCcmBoPgLoElementId === ipfCcmBoPgLoElementId;
    });
    initElement.rowStatus = rowStatus;
    if (rowStatus === ROW_STATUS.DELETED) {
      ret.push(initElement);
      return;
    }
    let formColumnKey;
    if (layoutElementType === 'FORM_COLUMN') {
      formColumnKey = 'ipfCcmBoFormColumn';
    } else if (layoutElementType === 'SEARCH_FORM') {
      formColumnKey = 'ipfCcmBoGridColumn';
    }
    let elementKey: any;
    if (initElement.ipfCcmBoPgLoElement) {
      elementKey = 'ipfCcmBoPgLoElement';
    } else if (initElement.ipfCcmBoPgLoElementCopy) {
      elementKey = 'ipfCcmBoPgLoElementCopy';
    } else {
      return;
    }
    initElement.cellName = element.cellName;
    initElement[elementKey].layoutElementType = element.layoutElementType;
    initElement[elementKey].layoutBoName = element.layoutBoName;
    initElement[elementKey].layoutBoViewDesc = element.layoutBoViewDesc;
    initElement[elementKey].layoutBoViewId = element.layoutBoViewId;
    initElement[elementKey].propertyName = element.propertyName;
    initElement[elementKey].queryType = element.queryType;
    initElement[elementKey].isNotNull = element.isNotNull;
    initElement[elementKey].isReadOnly = element.isReadOnly;
    initElement[elementKey].isShowLable = element.isShowLable;
    initElement[elementKey].isVisible = element.isVisible;
    initElement[elementKey].uiType = element.uiType;
    initElement[elementKey].controlWidth = element.controlWidth;
    initElement[elementKey].controlHeight = element.controlHeight;
    initElement[elementKey].controlConnector = element.controlConnector;
    initElement[elementKey].correctType = element.correctType;
    initElement[elementKey].initValueType = element.initValueType;
    initElement[elementKey].defaultValue = element.defaultValue;
    initElement[elementKey].isInline = element.isInline;
    initElement[elementKey].tabIndex = element.tabIndex;
    initElement[elementKey].lableStyle = element.lableStyle;
    initElement[elementKey].methodName = element.methodName;
    initElement[elementKey].operation = element.operation;
    initElement[elementKey].rangeType = element.rangeType;
    initElement[elementKey].columnStyle = element.columnStyle;
    initElement[elementKey].textLineNum = element.textLineNum;
    initElement[elementKey].seqNo = element.seqNo;
    initElement[elementKey].ipfCcmBoPageLayoutId = element.__ipfCcmBoPageLayoutId;
    initElement[elementKey].conditionType = element.conditionType;
    initElement[elementKey].staticContent = element.staticContent;
    initElement[elementKey].layoutElementAttr = element.layoutElementAttr;
    initElement[elementKey].icon = element.icon;
    initElement[elementKey].elementName = element.elementName;
    initElement[elementKey].fieldText = element.fieldText;
    initElement[elementKey].atValueType = element.atValueType;
    initElement[elementKey].atResultValue = element.atResultValue;
    initElement[elementKey].searchHelp = element.searchHelp;
    initElement[elementKey].searchHelpViewDesc = element.searchHelpViewDesc;
    initElement[elementKey].searchHelpViewId = element.searchHelpViewId;
    initElement[elementKey].refProName = element.refProName;
    initElement[elementKey].dictTableName = element.dictTableName;
    initElement[elementKey].dictGroupValue = element.dictGroupValue;
    initElement[elementKey].uploadStrategy = element.uploadStrategy;
    initElement[elementKey].groupTotType = element.groupTotType;
    initElement[elementKey].formatExpress = element.formatExpress;
    initElement[elementKey].isZeroFill = element.isZeroFill;
    initElement[elementKey].dataElementCode = element.dataElementCode;
    initElement[elementKey].dataElementText = element.dataElementText;
    initElement[elementKey].elementMsgCode = element.elementMsgCode;
    initElement[elementKey].elementMsgText = element.elementMsgText;
    initElement[elementKey].titleMsgCode = element.titleMsgCode;
    initElement[elementKey].titleMsgText = element.titleMsgText;
    initElement[elementKey].layoutElementAttr = element.layoutElementAttr;
    initElement[elementKey].isFocus = element.isFocus;
    initElement[elementKey].disabledExpree = element.disabledExpree;
    initElement[elementKey].showExpree = element.showExpree;
    initElement[elementKey].isRefreshParentBo = element.isRefreshParentBo;
    initElement[elementKey].hotkeyType = element.hotkeyType;
    initElement[elementKey].hotkeyValue = element.hotkeyValue;
    initElement[elementKey].isCellEditable = element.isCellEditable;
    initElement[elementKey].columnStyleExpress = element.columnStyleExpress;
    initElement[elementKey].isSum = element.isSum;
    initElement[elementKey].isOrderBy = element.isOrderBy;
    initElement[elementKey].sortOrder = element.sortOrder;
    initElement[elementKey].isDropFilter = element.isDropFilter;
    initElement[elementKey].isShowSort = element.isShowSort;
    initElement[elementKey].unlockColumnExpress = element.unlockColumnExpress;
    initElement[elementKey].fieldCode = element.fieldCode;
    initElement[elementKey].fieldValue = element.fieldValue;
    initElement[elementKey].methodBoName = element.methodBoName;
    initElement[elementKey].initValueType2 = element.initValueType2;
    initElement[elementKey].defaultValue2 = element.defaultValue2;
    initElement[elementKey].lockColumnExpress = element.lockColumnExpress;
    _.forEach(ELEMENT_FIELDS, field => {
      initElement[elementKey][field] = element[field];
    });
    initElement[elementKey][elementKey === 'ipfCcmBoPgLoElementCopy' ? elementEventsCopyKey : elementEventsKey] = element.ipfCcmBoElementEvents;

    if (formColumnKey === 'ipfCcmBoFormColumn') {
      if (!initElement[formColumnKey]) {
        initElement[formColumnKey] = _.clone(ipfCcmBoFormColumn);
      }
      initElement[formColumnKey].propertyName = element.propertyName;
      initElement[formColumnKey].propertyType = element.propertyType || '1';
      initElement[formColumnKey].isShowLabel = element.isShowLable;
      // initElement[formColumnKey].notNull = element.isNotNull;
      initElement[formColumnKey].readOnly = element.isReadOnly;
      initElement[formColumnKey].uiType = element.uiType;
      initElement[formColumnKey].correctType = element.correctType;
      initElement[formColumnKey].initValueType = element.initValueType;
      initElement[formColumnKey].defaultValue = element.defaultValue;
      initElement[formColumnKey].tabIndex = element.tabIndex;
      initElement[formColumnKey].lableStyle = element.lableStyle;
      initElement[formColumnKey].columnStyle = element.columnStyle;
      initElement[formColumnKey].textLineNum = element.textLineNum;
    } else if (formColumnKey === 'ipfCcmBoGridColumn') {
      if (!initElement[formColumnKey]) {
        initElement[formColumnKey] = _.clone(ipfCcmBoGridColumn);
      }
      initElement[formColumnKey].propertyName = element.propertyName;
      initElement[formColumnKey].propertyType = element.propertyType || '1';
      // initElement[formColumnKey].notNull = element.isNotNull;
      initElement[formColumnKey].readOnly = element.isReadOnly;
      initElement[formColumnKey].uiType = element.uiType;
      initElement[formColumnKey].correctType = element.correctType;
      initElement[formColumnKey].initValueType = element.initValueType;
      initElement[formColumnKey].defaultValue = element.defaultValue;
      initElement[formColumnKey].tabIndex = element.tabIndex;
      initElement[formColumnKey].methodName = element.methodName;
      initElement[formColumnKey].operation = element.operation;
    }
    initElement.rowStatus = rowStatus;
    ret.push(initElement);
  });
  return ret;
}
