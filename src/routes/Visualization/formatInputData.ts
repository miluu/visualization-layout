// tslint:disable
import * as _ from 'lodash';

import { VISUALIZATION_CONFIG } from './config';

const {
  layoutEventsKey,
  layoutEventsCopyKey,
  elementEventsKey,
  elementEventsCopyKey,
} = VISUALIZATION_CONFIG;

export function formatInputData(dataIn: any) {
  let boPageLayout: any[] = [];
  let elementParentCellList = {};
  _.forEach(dataIn.boPageLayout, function(boPageLayoutIn) {
      let formatedLayout = formatBoPageLayout(boPageLayoutIn);
      let layout = formatedLayout.layout;
      let elementParentCell = formatedLayout['elementParentCell'];

      if (layout) {
          boPageLayout.push(layout);
      }
      elementParentCellList = _.assign({}, elementParentCellList, elementParentCell);
  });
  _.forEach(dataIn.boPgLoElement, function(boPgLoElementIn) {
      let element = formatBoPgLoElement(boPgLoElementIn);
      if (element) {
          let layout = _.find(boPageLayout, function(l) {
              return l.cellName === element.cellName;
          });
          if (layout) {
              layout.__ipfCcmBoPgLoElements = layout.__ipfCcmBoPgLoElements || [];
              layout.__ipfCcmBoPgLoElements.push(element);
          }
      }
  });
  boPageLayout = _.forEach(boPageLayout, layout => {
    layout.__ipfCcmBoPgLoElements = _.sortBy(layout.__ipfCcmBoPgLoElements, 'seqNo');
  });
  return {
      boPageLayout: boPageLayout,
      properties: dataIn.properties || {},
      methods: dataIn.method || {},
      defaultSetting: dataIn.defaultSetting || {}
  };
}

function formatBoPageLayout(boPageLayoutIn: any) {
  let _fromKey = '';
  let layout;
  if (boPageLayoutIn.ipfCcmBoPageLayout) {
      layout = boPageLayoutIn.ipfCcmBoPageLayout;
      _fromKey = 'ipfCcmBoPageLayout';
  } else if (boPageLayoutIn.ipfCcmBoPageLayoutCopy) {
      layout = boPageLayoutIn.ipfCcmBoPageLayoutCopy;
      _fromKey = 'ipfCcmBoPageLayoutCopy';
  }
  layout[layoutEventsKey] = layout[layoutEventsKey] || layout[layoutEventsCopyKey];
  if (!layout) {
      return null;
  }
  let cellButtons = {};
  let cellGrids = {};
  let formHeaders = {};
  if (layout.layoutElementType === 'FORM_TOOLBAR') {
      layout.__ipfCcmBoFormToolbars = boPageLayoutIn.ipfCcmBoFormToolbars || [];
  }
  if (layout.layoutElementType === 'GRID_TOOLBAR') {
      layout.__ipfCcmBoGridToolbars = boPageLayoutIn.ipfCcmBoGridToolbars;
  }
  if (
      layout.layoutElementType === 'FORM_HEADER' ||
      layout.layoutElementType === 'SEARCH_FORM'
  ) {
      layout.__formHeaders = boPageLayoutIn.formHeaders;
  }
  if (layout.layoutElementType === 'GRID') {
      layout.__ipfCcmBoGridColumns = boPageLayoutIn.ipfCcmBoGridColumns;
  }
  return {
      layout: _.assign(layout, {
          rowStatus: boPageLayoutIn.rowStatus,
          __ipfCcmBoToolbars: boPageLayoutIn.ipfCcmBoToolbars,
          __ipfCcmBoFormToolbars: boPageLayoutIn.ipfCcmBoFormToolbars,
          __ipfCcmBoGridToolbars: boPageLayoutIn.ipfCcmBoGridToolbars,
          __formHeaders: boPageLayoutIn.formHeaders,
          __ipfCcmBoGridColumns: boPageLayoutIn.ipfCcmBoGridColumns,
          __ipfCcmBoFormColumns: boPageLayoutIn.ipfCcmBoFormColumns,
          _fromKey: _fromKey
      }),
      layoutBoName: layout.layoutBoName,
      layoutBoViewName: layout.layoutBoViewName,
      layoutBoViewId: layout.layoutBoViewId,
      cellButtons: cellButtons,
      cellGrids: cellGrids,
      formHeaders: formHeaders
  };
}

function formatBoPgLoElement(boPgLoElementIn: any) {
  let _ipfCcmBoPgLoElement = boPgLoElementIn.ipfCcmBoPgLoElement || boPgLoElementIn.ipfCcmBoPgLoElementCopy;
  let ipfCcmBoPgLoElementId = _ipfCcmBoPgLoElement.ipfCcmBoPgLoElementId;
  let cellName = boPgLoElementIn.cellName;
  let columnName = boPgLoElementIn.fieldText;
  let elementFormData;
  if (_ipfCcmBoPgLoElement.layoutElementType === 'FORM_COLUMN') {
      elementFormData = boPgLoElementIn.ipfCcmBoFormColumn;
  } else if (_ipfCcmBoPgLoElement.layoutElementType === 'SEARCH_FORM') {
      elementFormData = boPgLoElementIn.ipfCcmBoGridColumn;
  }
  if (!cellName) {
      return null;
  }
  return {
      ipfCcmBoPgLoElementId: ipfCcmBoPgLoElementId,
      cellName: cellName,
      columnName: columnName,
      conditionType: _ipfCcmBoPgLoElement.conditionType,
      baseViewId: _ipfCcmBoPgLoElement.baseViewId,
      layoutElementType: _ipfCcmBoPgLoElement.layoutElementType,
      layoutBoName: _ipfCcmBoPgLoElement.layoutBoName,
      layoutBoViewName: _ipfCcmBoPgLoElement.layoutBoViewName,
      layoutBoViewId: _ipfCcmBoPgLoElement.layoutBoViewId,
      propertyName: _ipfCcmBoPgLoElement.propertyName || (elementFormData ? elementFormData.propertyName : null),
      propertyType: _ipfCcmBoPgLoElement.propertyType || (elementFormData ? elementFormData.propertyType : null),
      queryType: _ipfCcmBoPgLoElement.queryType,
      isNotNull: _ipfCcmBoPgLoElement.isNotNull || (elementFormData ? elementFormData.notNull : null),
      isReadOnly: _ipfCcmBoPgLoElement.isReadOnly || (elementFormData ? elementFormData.readOnly : null),
      isShowLable: _ipfCcmBoPgLoElement.isShowLable || (elementFormData ? elementFormData.isShowLabel : null),
      isVisible: _ipfCcmBoPgLoElement.isVisible || (elementFormData ? elementFormData.isVisible : null),
      uiType: _ipfCcmBoPgLoElement.uiType || (elementFormData ? elementFormData.uiType : null),
      controlWidth: _ipfCcmBoPgLoElement.controlWidth,
      controlHeight: _ipfCcmBoPgLoElement.controlHeight,
      controlConnector: _ipfCcmBoPgLoElement.controlConnector,
      correctType: _ipfCcmBoPgLoElement.correctType || (elementFormData ? elementFormData.correctType : null),
      initValueType: _ipfCcmBoPgLoElement.initValueType || (elementFormData ? elementFormData.initValueType : null),
      defaultValue: _ipfCcmBoPgLoElement.defaultValue || (elementFormData ? elementFormData.defaultValue : null),
      isInline: _ipfCcmBoPgLoElement.isInline,
      tabIndex: _ipfCcmBoPgLoElement.tabIndex || (elementFormData ? elementFormData.tabIndex : null),
      lableStyle: _ipfCcmBoPgLoElement.lableStyle || (elementFormData ? elementFormData.lableStyle : null),
      methodName: _ipfCcmBoPgLoElement.methodName || (elementFormData ? elementFormData.methodName : null),
      operation: _ipfCcmBoPgLoElement.operation || (elementFormData ? elementFormData.operation : null),
      rangeType: _ipfCcmBoPgLoElement.rangeType,
      columnStyle: _ipfCcmBoPgLoElement.columnStyle || (elementFormData ? elementFormData.columnStyle : null),
      textLineNum: _ipfCcmBoPgLoElement.textLineNum || (elementFormData ? elementFormData.textLineNum : null),
      staticContent: _ipfCcmBoPgLoElement.staticContent || (elementFormData ? elementFormData.staticContent : null),
      icon: _ipfCcmBoPgLoElement.icon || (elementFormData ? elementFormData.icon : null),
      elementName: _ipfCcmBoPgLoElement.elementName || (elementFormData ? elementFormData.elementName : null),
      fieldText: _ipfCcmBoPgLoElement.fieldText || (elementFormData ? elementFormData.fieldText : null),
      atValueType: _ipfCcmBoPgLoElement.atValueType || (elementFormData ? elementFormData.atValueType : null),
      atResultValue: _ipfCcmBoPgLoElement.atResultValue || (elementFormData ? elementFormData.atResultValue : null),
      searchHelp: _ipfCcmBoPgLoElement.searchHelp || (elementFormData ? elementFormData.searchHelp : null),
      searchHelpViewDesc: _ipfCcmBoPgLoElement.searchHelpViewDesc || (elementFormData ? elementFormData.searchHelpViewDesc : null),
      searchHelpViewId: _ipfCcmBoPgLoElement.searchHelpViewId || (elementFormData ? elementFormData.searchHelpViewId : null),
      refProName: _ipfCcmBoPgLoElement.refProName || (elementFormData ? elementFormData.refProName : null),
      dictTableName: _ipfCcmBoPgLoElement.dictTableName || (elementFormData ? elementFormData.dictTableName : null),
      dictGroupValue: _ipfCcmBoPgLoElement.dictGroupValue || (elementFormData ? elementFormData.dictGroupValue : null),
      uploadStrategy: _ipfCcmBoPgLoElement.uploadStrategy || (elementFormData ? elementFormData.uploadStrategy : null),
      groupTotType: _ipfCcmBoPgLoElement.groupTotType || (elementFormData ? elementFormData.groupTotType : null),
      formatExpress: _ipfCcmBoPgLoElement.formatExpress || (elementFormData ? elementFormData.formatExpress : null),
      isFocus: _ipfCcmBoPgLoElement.isFocus || (elementFormData ? elementFormData.isFocus : null),
      disabledExpree: _ipfCcmBoPgLoElement.disabledExpree || (elementFormData ? elementFormData.disabledExpree : null),
      showExpree: _ipfCcmBoPgLoElement.showExpree || (elementFormData ? elementFormData.showExpree : null),
      isRefreshParentBo: _ipfCcmBoPgLoElement.isRefreshParentBo || (elementFormData ? elementFormData.isRefreshParentBo : null),
      hotkeyType: _ipfCcmBoPgLoElement.hotkeyType || (elementFormData ? elementFormData.hotkeyType : null),
      hotkeyValue: _ipfCcmBoPgLoElement.hotkeyValue || (elementFormData ? elementFormData.hotkeyValue : null),
      isCellEditable: _ipfCcmBoPgLoElement.isCellEditable || (elementFormData ? elementFormData.isCellEditable : null),
      columnStyleExpress: _ipfCcmBoPgLoElement.columnStyleExpress || (elementFormData ? elementFormData.columnStyleExpress : null),
      isSum: _ipfCcmBoPgLoElement.isSum || (elementFormData ? elementFormData.isSum : null),
      isOrderBy: _ipfCcmBoPgLoElement.isOrderBy || (elementFormData ? elementFormData.isOrderBy : null),
      sortOrder: _ipfCcmBoPgLoElement.sortOrder || (elementFormData ? elementFormData.sortOrder : null),
      isDropFilter: _ipfCcmBoPgLoElement.isDropFilter || (elementFormData ? elementFormData.isDropFilter : null),
      isShowSort: _ipfCcmBoPgLoElement.isShowSort || (elementFormData ? elementFormData.isShowSort : null),
      unlockColumnExpress: _ipfCcmBoPgLoElement.unlockColumnExpress || (elementFormData ? elementFormData.unlockColumnExpress : null),
      lockColumnExpress: _ipfCcmBoPgLoElement.lockColumnExpress || (elementFormData ? elementFormData.lockColumnExpress : null),
      fieldCode: _ipfCcmBoPgLoElement.fieldCode || (elementFormData ? elementFormData.fieldCode : null),
      fieldValue: _ipfCcmBoPgLoElement.fieldValue || (elementFormData ? elementFormData.fieldValue : null),
      methodBoName: _ipfCcmBoPgLoElement.methodBoName || (elementFormData ? elementFormData.methodBoName : null),
      initValueType2: _ipfCcmBoPgLoElement.initValueType2 || (elementFormData ? elementFormData.initValueType2 : null),
      defaultValue2: _ipfCcmBoPgLoElement.defaultValue2 || (elementFormData ? elementFormData.defaultValue2 : null),
      isZeroFill: _ipfCcmBoPgLoElement.isZeroFill || (elementFormData ? elementFormData.isZeroFill : null),
      dataElementCode: _ipfCcmBoPgLoElement.dataElementCode || (elementFormData ? elementFormData.dataElementCode : null),
      dataElementText: _ipfCcmBoPgLoElement.dataElementText || (elementFormData ? elementFormData.dataElementText : null),
      elementMsgCode: _ipfCcmBoPgLoElement.elementMsgCode || (elementFormData ? elementFormData.elementMsgCode : null),
      elementMsgText: _ipfCcmBoPgLoElement.elementMsgText || (elementFormData ? elementFormData.elementMsgText : null),
      titleMsgCode: _ipfCcmBoPgLoElement.titleMsgCode || (elementFormData ? elementFormData.titleMsgCode : null),
      titleMsgText: _ipfCcmBoPgLoElement.titleMsgText || (elementFormData ? elementFormData.titleMsgText : null),
      layoutElementAttr: _ipfCcmBoPgLoElement.layoutElementAttr || (elementFormData ? elementFormData.layoutElementAttr : null),
      seqNo: _ipfCcmBoPgLoElement.seqNo,
      rowStatus: boPgLoElementIn.rowStatus || 2,
      ipfCcmBoElementEvents: _ipfCcmBoPgLoElement[elementEventsKey] || _ipfCcmBoPgLoElement[elementEventsCopyKey] || (elementFormData ? (elementFormData[elementEventsKey] || elementFormData[elementEventsCopyKey]) : null),
      _fromFormHeader: false
  };
}
