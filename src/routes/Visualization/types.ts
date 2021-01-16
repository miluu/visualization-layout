import { ROW_STATUS } from 'src/config';

export interface IIpfCcmPage {
  description: string;
  pageName: string;
  pageType: string;
  pageText?: string;
  ipfCcmId?: string;
  ipfCcmBoPageId?: string;
  ipfCcmBoId?: string;
  rowStatus?: ROW_STATUS;
  deviceType?: string;
  boName?: string;
  businessType?: string;
  isPageDispSetting?: string;
  isDataPenetration?: string;
  linkBoName?: string;
  baseViewId?: string;
  [key: string]: any;
}

export interface IBoPageLayout {
  baseViewId: string;
  cellName: string;
  controlConnector?: string;
  elementName?: string;
  formType: string;
  groupMsgCode?: string;
  isLayoutDispSetting?: string;
  groupTitle: string;
  groupWidget: string;
  height?: number;
  ipfCcmBoPageLayoutId: string;
  isParent: string;
  isShowGroup: string;
  labelUnitCount?: number;
  layoutBoName: string;
  layoutContainerType: string;
  layoutElementType: string;
  parentCellName: string;
  seqNo: number;
  style: string;
  styleClass: string;
  unitCount: number;
  rowStatus?: number;
  isMainTabPanel?: string;
  tabBuildType?: string;
  tabDataUrl?: string;
  icon?: string;
  treeName?: string;
  gridType?: string;
  pageLayoutAttr?: string;
  validationGroupName?: string;
  conditionType?: string;
  gridEditType?: string;

  __ipfCcmBoFormToolbars?: any[];
  __ipfCcmBoGridToolbars?: any[];
  __ipfCcmBoToolbars?: any[];
  __ipfCcmBoPgLoElements?: IPgLoElement[];

  /** 容器事件 */
  ipfCcmBoContainerEvents?: IIpfCcmBoControlEvent[];
  __ipfCcmBoContainerEventsMap?: IIpfCcmBoControlEventMap;

  [key: string]: any;
}

export interface IPgLoElement {
  fieldText?: string;
  layoutBoName?: string;
  conditionType?: string;
  baseViewId?: string;
  cellName?: string;
  columnName?: string;
  columnStyle?: string;
  controlConnector?: string;
  controlHeight?: number;
  controlWidth?: number;
  correctType?: string;
  defaultValue?: string;
  initValueType?: string;
  ipfCcmBoPgLoElementId?: string;
  __ipfCcmBoPageLayoutId?: string;
  isInline?: string;
  isNotNull?: string;
  isReadOnly?: string;
  isShowLable?: string;
  isVisible?: string;
  lableStyle?: string;
  layoutElementType?: string;
  methodName?: string;
  operation?: string;
  propertyName?: string;
  queryType?: string;
  rangeType?: string;
  seqNo?: number;
  styleClass?: string;
  tabIndex?: number;
  textLineNum?: number;
  uiType?: number | string;
  rowStatus?: number;
  staticContent?: string;
  elementName?: string;
  icon?: string;
  groupTotType?: string;
  formatExpress?: string;
  isFocus?: string;
  disabledExpree?: string;
  showExpree?: string;
  isRefreshParentBo?: string;
  hotkeyType?: string;
  hotkeyValue?: string;
  isCellEditable?: string;
  columnStyleExpress?: string;
  isSum?: string;
  isOrderBy?: string;
  sortOrder?: number;
  isDropFilter?: string | boolean;
  isShowSort?: string;
  unlockColumnExpress?: string;
  lockColumnExpress?: string;
  fieldCode?: string;
  fieldValue?: string;
  methodBoName?: string;
  initValueType2?: string;
  defaultValue2?: string;

  searchHelp?: string;
  refProName?: string;
  dictTableName?: string;
  dictGroupValue?: string;

  /** 控件事件 */
  ipfCcmBoElementEvents?: IIpfCcmBoControlEvent[];
  __ipfCcmBoElementEventsMap?: IIpfCcmBoControlEventMap;

  [key: string]: any;
}

export interface IBoPageLayoutWrapper {
  ipfCcmBoPageLayout?: IBoPageLayout;
  ipfCcmBoPageLayoutCopy?: IBoPageLayout;
  formHeaders?: any[];
  ipfCcmBoGridColumns?: any[];
  searchFormColumns?: any[];
  ipfCcmBoFormToolbars?: any[];
  ipfCcmBoGridToolbars?: any[];
}

export interface IBoPgLoElementWrapper {
  cellName: string;
  fieldText: string;
  ipfCcmBoFormColumn?: any;
  ipfCcmBoGridColumn?: any;
  ipfCcmBoPgLoElement?: IPgLoElement;
  ipfCcmBoPgLoElementCopy?: IPgLoElement;
}

/**
 * 控件事件
 */
export interface IIpfCcmBoControlEvent {
  /** 事件类型 */
  eventType?: string;
  /** 执行类型 */
  execType?: string;
  /** 回调JS方法 */
  callBack?: string;
  /** 执行内容 */
  execContent?: string;
  /** 修改状态 */
  rowStatus?: number;
  /** baseViewId */
  baseViewId?: string;
  /** 事件ID */
  ipfCcmBoControlEventId?: string;
  /** 所属 Element Id */
  ipfCcmBoPgLoElementId?: string;
  /** 所属 Layout Id */
  ipfCcmBoPageLayoutId?: string;

  /** 是否启用 */
  __isActive?: boolean;
}

export interface IIpfCcmBoControlEventMap {
  [eventType: string]: IIpfCcmBoControlEvent;
}
