import * as React from 'react';
import * as _ from 'lodash';
import { IIpfCcmPage, IBoPageLayout, IPgLoElement } from 'src/routes/Visualization/types';
import { PAGE_TYPE, BUILT_IN_STYLE_CLASSES, ROW_STATUS } from '../../config';
// import { UiAssociate } from 'src/ui/associate';
import { IFormItemOption } from 'src/utils/forms';
import { IUiDraggableListItem } from 'src/ui/draggableList';
import { IUiDraggableListGroupItem } from 'src/ui/draggableListGroup';
import { transformUiType, createId } from 'src/utils';
import { Button, Select, message, Modal } from 'antd';
import { openUploaderModal, openListSourceEditor, openElementCodeFormModal, closeElementCodeFormModal, closeLanguageMsgFormModal, openLanguageMsgFormModal } from 'src/utils/modal';
import { UiComponentGroupList } from 'src/ui/componentGroupList';
import I18N_IDS from 'src/i18n/ids';
import { t } from 'src/i18n';
import { dataElementCodeQueryMethodCreator, titleMsgCodeQueryMethod } from './service';
import { saveElementCode, getDmlElement, getDmlElementByPropertyName, saveLanguageMsg } from 'src/services/elementCode';
import { createSetIsLoadingAction } from 'src/models/appActions';

const { Option } = Select;

const INIT_LAYOUT_DATA: IBoPageLayout = {
  baseViewId: null,
  cellName: null,
  controlConnector: null,
  elementName: null,
  formType: null,
  groupMsgCode: null,
  groupTitle: null,
  groupWidget: null,
  height: null,
  ipfCcmBoPageLayoutId: null,
  isParent: 'X',
  isShowGroup: null,
  labelUnitCount: 4,
  layoutBoName: null,
  layoutContainerType: null,
  layoutElementType: null,
  parentCellName: null,
  seqNo: 0,
  style: null,
  styleClass: null,
  unitCount: 0,
};

const INIT_ELEMENT_DATA: IPgLoElement = {
  columnName: '',
  layoutElementType: 'ELEMENT',
  layoutBoName: '',
  propertyName: '',
  isNotNull: '',
  isReadOnly: '',
  isShowLable: 'X',
  isVisible: 'X',
  uiType: null,
  controlHeight: null,
  controlWidth: null,
  controlConnector: null,
  correctType: null,
  initValueType: null,
  defaultValue: null,
  isInline: null,
  tabIndex: null,
  lableStyle: null,
  methodName: null,
  operation: null,
  conditionType: null,
  rangeType: null,
  columnStyle: null,
  textLineNum: null,
  seqNo: 0,
  cellName: null,
  ipfCcmBoPgLoElementId: '',
};

export const VISUALIZATION_CONFIG = {
  /** 查询页面列表 URL */
  queryPageListUrl: '/ipf/boPageLayout/getIpfCcmBoPageList',

  /** 查询页面布局数据 URL */
  queryPageUrl: '/ipf/boPageLayout/getIpfCcmBoPage',

  /** 转换可视化原型 URL */
  convertPrototypeUrl: '/ipf/boPageLayout/convertToPagePrototype',

  /** 查询页面布局数据 URL */
  savePageUrl: '/ipf/boPageLayout/batchSaveBoPageLayoutData',

  /** 页面显示文本转换 */
  pageDisplayFunc: (page: IIpfCcmPage) => {
    if (page.pageText) {
      return page.pageText;
    }
    if (page.fileName) {
      return page.fileName;
    }
    let ret = getPageTypeDisplay(page);
    if (page.pageName) {
      ret += ` - ${page.pageName}`;
    }
    return ret;
  },

  /** 页面 ID 字段 */
  pageIdKey: 'ipfCcmBoPageId',
  /** cellName 字段 */
  cellNameKey: 'cellName',
  /** 父 cellName 字段 */
  parentCellNameKey: 'parentCellName',
  /** layout ID 字段 */
  layoutIdKey: 'ipfCcmBoPageLayoutId',
  /** layout 上的子 element 字段 */
  childrenElementsKey: '__ipfCcmBoPgLoElements',
  /** element ID 字段 */
  elementIdKey: 'ipfCcmBoPgLoElementId',
  /** element 上的父 Layout 字段 */
  elementParentLayoutKey: 'cellName',
  /** layout 上的事件字段 */
  layoutEventsKey: 'ipfCcmBoContainerEvents',
  /** layout 上的事件字段 (copy) */
  layoutEventsCopyKey: 'ipfCcmBoContainerEventTwos',
  /** element 上的事件字段 */
  elementEventsKey: 'ipfCcmBoElementEvents',
  /** element 上的事件字段 (copy) */
  elementEventsCopyKey: 'ipfCcmBoElementEventCopys',
  /** layout 上的排序字段 */
  orderKey: 'seqNo',
  /** element 上的排序字段 */
  elementOrderKey: 'seqNo',
  /** element 上的开始序号 */
  elementStartIndex: 3,
  /** 临时子 Layout 字段，新增带层级结构的布局使用 */
  tempChildrenLayoutsKey: '__childrenLayouts',

  /** Layout 属性表单配置 */
  layoutPropertyFormOptions: [
    {
      property: 'cellName',
      label: t(I18N_IDS.LABEL_CELL_NAME),
      disabled: true,
    },
    {
      property: 'ipfCcmBoPageLayoutId',
      disabled: true,
      label: 'ipfCcmBoPageLayoutId',
      hidden: true,
    },
    {
      property: 'parentCellName',
      label: t(I18N_IDS.LABEL_PARENT_CELL_NAME),
      disabled: true,
    },
    {
      property: 'isParent',
      label: t(I18N_IDS.LABEL_IS_PARENT),
      type: 'checkbox',
    },
    {
      property: 'layoutBoName',
      label: t(I18N_IDS.LABEL_LAYOUT_BO_NAME),
    },
    {
      property: 'unitCount',
      label: t(I18N_IDS.LABEL_UNIT_COUNT),
      type: 'number',
    },
    {
      property: 'layoutContainerType',
      label: t(I18N_IDS.LABEL_LAYOUT_CONTAINER_TYPE),
      type: 'select',
      dictName: 'LayoutContainerType',
    },
    {
      property: 'layoutElementType',
      label: t(I18N_IDS.LABEL_LAYOUT_ELEMENT_TYPE),
      type: 'select',
      dictName: 'layoutElementType',
    },
    {
      property: 'conditionType',
      label: t(I18N_IDS.LABEL_CONDITION_TYPE),
      type: 'select',
      dictName: 'conditionType',
    },
    {
      property: 'styleClass',
      label: t(I18N_IDS.LABEL_STYLE_CLASS),
      type: 'multiSelect',
      list: BUILT_IN_STYLE_CLASSES,
    },
    {
      property: 'style',
      label: t(I18N_IDS.LABEL_STYLE),
    },
    {
      property: 'formType',
      label: t(I18N_IDS.LABEL_FORM_TYPE),
      type: 'select',
      dictName: 'CellType',
    },
    {
      property: 'elementName',
      label: t(I18N_IDS.LABEL_ELEMENT_NAME),
    },
    {
      property: 'isLayoutDispSetting',
      label: t(I18N_IDS.LABEL_IS_LAYOUT_DISP_SETTING),
      type: 'checkbox',
    },
    {
      property: 'groupMsgCode',
      label: '分组标题',
      type: 'associate',
      refProperty: 'groupTitle',
      valueProp: 'messageKey',
      labelProp: 'messageText',
      columns: [
        { title: '消息键值', field: 'messageKey' },
        { title: '创建人', field: 'creator' },
        { title: '消息内容', field: 'messageText' },
        { title: '消息类型', field: 'messageType' },
        { title: '语言名称', field: 'ddLanguage' },
      ],
      queryMethod: titleMsgCodeQueryMethod,
      extra(__, values, callback, ___, dispatch) {
        if (!values) {
          return null;
        }
        return (
          <Button.Group size="small" >
            <Button
              disabled={!values?.groupMsgCode}
              onClick={() => modifyLanguageMsg({
                dispatch,
                callback,
                values,
                type: 'edit',
                layoutType: 'layout',
                codeKey: 'groupMsgCode',
                textKey: 'groupTitle',
              })}
            >
              修改
            </Button>
            <Button onClick={() => modifyLanguageMsg({
              dispatch,
              callback,
              values,
              type: 'add',
              layoutType: 'layout',
              codeKey: 'groupMsgCode',
              textKey: 'groupTitle',
            })}>
              新增
            </Button>
          </Button.Group>
        );
      },
    },
    {
      property: 'groupMsgCode',
      key: 'groupMsgCode_1',
      label: t(I18N_IDS.LABEL_GROUP_MSG_CODE),
      disabled: true,
    },
    {
      property: 'groupTitle',
      key: 'groupTitle_1',
      label: t(I18N_IDS.LABEL_GROUP_TITLE),
      disabled: true,
    },
    {
      property: 'groupWidget',
      label: t(I18N_IDS.LABEL_GROUP_WIDGET),
      type: 'select',
      dictName: 'GroupWidget',
    },
    {
      property: 'isShowGroup',
      label: t(I18N_IDS.LABEL_IS_SHOW_GROUP),
      type: 'checkbox',
    },
    {
      property: 'labelUnitCount',
      label: t(I18N_IDS.LABEL_LABEL_UNIT_COUNT),
      type: 'number',
    },
    {
      property: 'controlConnector',
      label: t(I18N_IDS.LABEL_CONTROL_CONNECTOR),
    },
    {
      property: 'height',
      label: t(I18N_IDS.LABEL_HEIGHT),
      type: 'number',
      max: Infinity,
      min: 0,
      step: 1,
    },
    {
      property: 'isMainTabPanel',
      label: t(I18N_IDS.LABEL_IS_MAIN_TAB_PANEL),
      type: 'checkbox',
    },
    {
      property: 'tabBuildType',
      label: t(I18N_IDS.LABEL_TAB_BUILD_TYPE),
      type: 'select',
      dictName: 'tabBuildType',
    },
    {
      property: 'tabDataUrl',
      label: t(I18N_IDS.LABEL_TAB_DATA_URL),
    },
    {
      property: 'icon',
      label: t(I18N_IDS.LABEL_ICON),
    },
    {
      property: 'treeName',
      label: t(I18N_IDS.LABEL_TREE_NAME),
    },
    {
      property: 'gridType',
      label: t(I18N_IDS.LABEL_GRID_TYPE),
      type: 'select',
      dictName: 'NewGridType',
    },
    {
      property: 'isAutoLoad',
      label: t(I18N_IDS.LABEL_IS_AUTO_LOAD),
      type: 'select',
      dictName: 'YesOrNo',
    },
    {
      property: 'gridEditType',
      label: t(I18N_IDS.LABEL_GRID_EDIT_TYPE),
      type: 'select',
      dictName: 'gridEditType',
    },
    {
      property: 'isEnabledDoubleToEdit',
      label: t(I18N_IDS.LABEL_IS_ENABLED_DOUBLE_TO_EDIT),
      type: 'checkbox',
      extra: (__, values, callback, dicts) => {
        if (!_.get(values, 'isEnabledDoubleToEdit')) {
          return null;
        }
        const pageLayoutAttrStr = _.get(values, 'pageLayoutAttr');
        let pageLayoutAttr: {
          pages?: Array<{
            propertyName: string;
            propertyValue: string;
            boName: string;
            pageType: string;
            businessType: string;
            pageTitle: string;
          }>;
        };
        try {
          pageLayoutAttr = JSON.parse(pageLayoutAttrStr);
        } catch (e) {
          pageLayoutAttr = {};
        }
        const pages = pageLayoutAttr.pages || [];
        const sourceTitle = ['属性名', '属性值', '业务对象名称', '页面类型', '业务类型', '页面标题'];
        const source = _.map(pages, p => [
          p.propertyName,
          p.propertyValue,
          p.boName,
          p.pageType,
          p.businessType,
          p.pageTitle,
        ]);
        return (
          <Button
            type="primary"
            size="small"
            block
            onClick={() => {
              openListSourceEditor({
                source,
                sourceTitle,
                columnsEditable: false,
                columnRender: ({
                  field,
                  record,
                  index,
                  instance,
                  onChange,
                }) => {
                  const { editingRowId } = instance.state;
                  const dict = dicts['PageType'] || [];
                  if (field !== '页面类型') {
                    return null;
                  }
                  if (editingRowId !== record.__id) {
                    const currentDictItem = _.find(dict, dictItem => dictItem.key === record[field]);
                    return currentDictItem ? currentDictItem.value : record[field];
                  }
                  return (
                    <Select
                      size="small"
                      style={{ width: '100%' }}
                      allowClear
                      value={record[field]}
                      onChange={(value: any) => onChange(index, field, value)}
                    >
                      {_.map(dicts['PageType'], dictItem => {
                        return (
                          <Option
                            title={dictItem.value}
                            key={dictItem.key}
                            value={dictItem.key}
                          >
                            {dictItem.value}
                          </Option>
                        );
                      })}
                    </Select>
                  );
                },
                onSubmit: editor => {
                  const obj = editor.getListSourceObj();
                  const newPages = _.map(obj.source, item => {
                    return {
                      propertyName: item[0],
                      propertyValue: item[1],
                      boName: item[2],
                      pageType: item[3],
                      businessType: item[4],
                      pageTitle: item[5],
                    };
                  });
                  if (newPages && newPages.length) {
                    pageLayoutAttr.pages = newPages;
                  } else {
                    pageLayoutAttr.pages = undefined;
                  }
                  const data = JSON.stringify(pageLayoutAttr);
                  callback({ property: 'pageLayoutAttr' }, data, true);
                },
              });
            }}
          >
            编辑跳转方式
          </Button>
        );
      },
    },
    {
      property: 'validationGroupName',
      label: t(I18N_IDS.LABEL_VALIDATION_GROUP_NAME),
    },
    {
      property: 'seqNo',
      label: t(I18N_IDS.LABEL_SEQ_NO),
      type: 'number',
      disabled: true,
      min: 0,
      max: Infinity,
    },
    {
      property: 'pageLayoutAttr',
      label: t(I18N_IDS.LABEL_PAGE_LAYOUT_ATTR),
      type: 'textarea',
    },
  ] as IFormItemOption[],
  /** Element 属性表单配置 */
  elementPropertyFormOptions: [
    {
      property: 'columnName',
      label: t(I18N_IDS.LABEL_COLUMN_NAME),
      type: 'link',
    },
    {
      property: 'ipfCcmBoPgLoElementId',
      disabled: true,
      label: 'ipfCcmBoPgLoElementId',
      hidden: true,
    },
    {
      property: 'fieldText',
      label: t(I18N_IDS.LABEL_FIELD_TEXT),
      disabledWhen: ({ info }) => info?.isMultiLanguage ?? false,
    },
    {
      property: 'dataElementCode',
      label: '数据元素',
      type: 'associate',
      refProperty: 'dataElementText',
      otherRefProperties: ['columnName', 'fieldText'],
      valueProp: 'elementCode',
      labelProp: 'fieldText',
      columns: [
        { title: '数据元素代码', field: 'elementCode' },
        { title: '显示文本', field: 'fieldText' },
        { title: '数据类型', field: 'dataType' },
        { title: '字段长度', field: 'fieldLength' },
        { title: '小数位', field: 'decimals' },
        { title: '数据库类型', field: 'dbType' },
      ],
      queryMethodCreator: dataElementCodeQueryMethodCreator,
      extra(__, values, callback, ___, dispatch) {
        if (!values) {
          return null;
        }
        return (
          <Button.Group size="small" >
            <Button
              disabled={!values?.dataElementCode}
              onClick={() => modifyDataElement({
                dispatch,
                callback,
                values,
                type: 'edit',
              })}
            >
              修改
            </Button>
            <Button onClick={() => modifyDataElement({
              dispatch,
              callback,
              values,
              type: 'add',
            })}>
              新增
            </Button>
          </Button.Group>
        );
      },
    },
    {
      property: 'dataElementCode',
      label: '数据元素编码',
      key: 'dataElementCode_1',
      disabled: true,
    },
    {
      property: 'dataElementText',
      label: '字段标题',
      refProperty: 'dataElementText_1',
      disabled: true,
    },
    {
      property: 'titleMsgCode',
      label: '标题消息',
      type: 'associate',
      refProperty: 'titleMsgText',
      valueProp: 'messageKey',
      labelProp: 'messageText',
      columns: [
        { title: '消息键值', field: 'messageKey' },
        { title: '创建人', field: 'creator' },
        { title: '消息内容', field: 'messageText' },
        { title: '消息类型', field: 'messageType' },
        { title: '语言名称', field: 'ddLanguage' },
      ],
      queryMethod: titleMsgCodeQueryMethod,
      extra(__, values, callback, ___, dispatch) {
        if (!values) {
          return null;
        }
        return (
          <Button.Group size="small" >
            <Button
              disabled={!values?.titleMsgCode}
              onClick={() => modifyLanguageMsg({
                dispatch,
                callback,
                values,
                type: 'edit',
                layoutType: 'element',
                codeKey: 'titleMsgCode',
                textKey: 'titleMsgText',
              })}
            >
              修改
            </Button>
            <Button onClick={() => modifyLanguageMsg({
              dispatch,
              callback,
              values,
              type: 'add',
              layoutType: 'element',
              codeKey: 'titleMsgCode',
              textKey: 'titleMsgText',
            })}>
              新增
            </Button>
          </Button.Group>
        );
      },
    },
    {
      property: 'titleMsgCode',
      label: '标题消息代码',
      key: 'titleMsgCode_1',
      disabled: true,
    },
    {
      property: 'titleMsgText',
      label: '标题消息文本',
      key: 'titleMsgText_1',
      disabled: true,
    },
    {
      property: 'layoutElementType',
      label: t(I18N_IDS.LABEL_LAYOUT_ELEMENT_TYPE),
      type: 'select',
      dictName: 'layoutElementType2',
    },
    {
      property: 'layoutBoName',
      label: t(I18N_IDS.LABEL_LAYOUT_BO_NAME),
    },
    {
      property: 'propertyName',
      label: t(I18N_IDS.LABEL_PROPERTY_NAME),
    },
    {
      property: 'methodName',
      label: t(I18N_IDS.LABEL_METHOD_NAME),
    },
    {
      property: 'queryType',
      label: t(I18N_IDS.LABEL_QUERY_TYPE),
      type: 'select',
      dictName: 'queryType',
    },
    {
      property: 'isNotNull',
      label: t(I18N_IDS.LABEL_IS_NOT_NULL),
      type: 'checkbox',
    },
    {
      property: 'isReadOnly',
      label: t(I18N_IDS.LABEL_IS_READ_ONLY),
      type: 'checkbox',
    },
    {
      property: 'isShowLable',
      label: values => {
        if (isButton(values)) {
          return t(I18N_IDS.LABEL_IS_MAIN_BUTTON);
        }
        return t(I18N_IDS.LABEL_IS_SHOW_LABLE);
      },
      type: 'checkbox',
    },
    {
      property: 'isVisible',
      label: t(I18N_IDS.LABEL_IS_VISIBLE),
      type: 'checkbox',
    },
    {
      property: 'uiType',
      label: t(I18N_IDS.LABEL_UI_TYPE),
      type: 'select',
      dictName: 'IpfCcmBoUIType',
    },
    {
      property: 'layoutElementAttr#limitCount',
      label: t(I18N_IDS.LABEL_LIMIT_COUNT),
      type: 'number',
      max: Infinity,
      min: 0,
      step: 1,
      showWhen: values => values && values.uiType === '40',
    },
    {
      property: 'layoutElementAttr#queryName',
      label: t(I18N_IDS.LABEL_QUERY_NAME),
      showWhen: values => values && values.uiType === '40',
    },
    {
      property: 'layoutElementAttr#fieldName',
      label: t(I18N_IDS.LABEL_FIELD_NAME),
      showWhen: values => values && values.uiType === '40',
    },
    {
      property: 'layoutElementAttr#url',
      label: t(I18N_IDS.LABEL_MATCHING_URL),
      showWhen: values => values && values.uiType === '40',
    },
    {
      property: 'searchHelp',
      label: t(I18N_IDS.LABEL_SEARCH_HELP),
    },
    {
      property: 'refProName',
      label: t(I18N_IDS.LABEL_REF_PRO_NAME),
    },
    {
      property: 'dictTableName',
      label: t(I18N_IDS.LABEL_DICT_TABLE_NAME),
    },
    {
      property: 'dictGroupValue',
      label: t(I18N_IDS.LABEL_DICT_GROUP_VALUE),
    },
    {
      property: 'uploadStrategy',
      label: t(I18N_IDS.LABEL_UPLOAD_STRATEGY),
    },
    {
      property: 'controlWidth',
      label: t(I18N_IDS.LABEL_CONTROL_WIDTH),
      type: 'number',
      min: 0,
      max: Infinity,
    },
    {
      property: 'controlHeight',
      label: t(I18N_IDS.LABEL_CONTROL_HEIGHT),
      type: 'number',
      min: 0,
      max: Infinity,
    },
    {
      property: 'controlConnector',
      label: t(I18N_IDS.LABEL_CONTROL_CONNECTOR),
    },
    {
      property: 'correctType',
      label: t(I18N_IDS.LABEL_CORRECT_TYPE),
      type: 'select',
      dictName: 'correctType',
    },
    {
      property: 'initValueType',
      label: t(I18N_IDS.LABEL_INIT_VALUE_TYPE),
      type: 'select',
      dictName: 'initValueType',
    },
    {
      property: 'defaultValue',
      label: t(I18N_IDS.LABEL_DEFAULT_VALUE),
    },
    {
      property: 'isZeroFill',
      label: t(I18N_IDS.LABEL_IS_ZERO_FILL),
      type: 'select',
      dictName: 'YesOrNo',
    },
    {
      property: 'layoutElementAttr#placeholder',
      label: t(I18N_IDS.LABEL_PLACEHOLDER),
    },
    {
      property: 'isInline',
      label: t(I18N_IDS.LABEL_IS_INLINE),
      type: 'checkbox',
    },
    {
      property: 'tabIndex',
      label: t(I18N_IDS.LABEL_TAB_INDEX),
      type: 'number',
      min: 0,
      max: Infinity,
    },
    {
      property: 'lableStyle',
      label: t(I18N_IDS.LABEL_LABLE_STYLE),
    },
    {
      property: 'operation',
      label: t(I18N_IDS.LABEL_OPERATION),
      type: 'select',
      dictName: 'SearchOperation',
    },
    {
      property: 'conditionType',
      label: t(I18N_IDS.LABEL_CONDITION_TYPE),
      type: 'select',
      dictName: 'conditionType',
    },
    {
      property: 'rangeType',
      label: t(I18N_IDS.LABEL_RANGE_TYPE),
      type: 'select',
      dictName: 'rangeType',
    },
    // {
    //   property: 'columnStyle',
    //   label: t(I18N_IDS.LABEL_COLUMN_STYLE),
    //   type: 'select',
    //   dictName: 'buttonStyle',
    // },
    {
      property: 'columnStyle',
      label: values => {
        if (isButton(values)) {
          return t(I18N_IDS.LABEL_BUTTON_STYLE);
        }
        return t(I18N_IDS.LABEL_COLUMN_STYLE);
      },
      type: values => {
        if (isButton(values)) {
          return 'select';
        }
        return null;
      },
      dictName: 'buttonStyle',
    },
    {
      property: 'textLineNum',
      label: t(I18N_IDS.LABEL_TEXT_LINE_NUM),
      type: 'number',
      min: 1,
      max: 100,
    },
    {
      property: 'elementName',
      label: t(I18N_IDS.LABEL_ELEMENT_NAME),
    },
    {
      property: 'seqNo',
      label: t(I18N_IDS.LABEL_SEQ_NO),
      type: 'number',
      disabled: true,
      min: 0,
      max: Infinity,
    },
    {
      property: 'formatExpress',
      label: t(I18N_IDS.LABEL_FORMAT_EXPRESS),
    },
    {
      property: 'isFocus',
      label: t(I18N_IDS.LABEL_IS_FOCUS),
      type: 'checkbox',
    },
    {
      property: 'disabledExpree',
      label: t(I18N_IDS.LABEL_DISABLED_EXPREE),
    },
    {
      property: 'fieldCode',
      label: t(I18N_IDS.LABEL_FIELD_CODE),
    },
    {
      property: 'fieldValue',
      label: t(I18N_IDS.LABEL_FIELD_VALUE),
    },
    {
      property: 'methodBoName',
      label: t(I18N_IDS.LABEL_METHOD_BO_NAME),
    },
    // 按钮属性
    {
      property: 'showExpree',
      label: t(I18N_IDS.LABEL_SHOW_EXPREE),
      showWhen: values => isButton(values),
    },
    {
      property: 'isRefreshParentBo',
      label: t(I18N_IDS.LABEL_IS_REFRESH_PARENT_BO),
      type: 'checkbox',
      showWhen: values => isButton(values),
    },
    {
      property: 'hotkeyType',
      label: t(I18N_IDS.LABEL_HOTKEY_TYPE),
      type: 'select',
      dictName: 'hotkeyType',
      showWhen: values => isButton(values),
    },
    {
      property: 'hotkeyValue',
      label: t(I18N_IDS.LABEL_HOTKEY_VALUE),
      type: 'select',
      dictName: 'hotkeyValue',
      showWhen: values => isButton(values),
    },

    // 表格列
    {
      property: 'isCellEditable',
      label: t(I18N_IDS.LABEL_IS_CELL_EDITABLE),
      type: 'checkbox',
      showWhen: values => isGridColumn(values),
    },
    {
      property: 'isSum',
      label: t(I18N_IDS.LABEL_IS_SUM),
      type: 'checkbox',
      showWhen: values => isGridColumn(values),
    },
    {
      property: 'groupTotType',
      label: t(I18N_IDS.LABEL_GROUP_TOT_TYPE),
      type: 'select',
      dictName: 'groupTotType',
      showWhen: values => isGridColumn(values),
    },
    {
      property: 'columnStyleExpress',
      label: t(I18N_IDS.LABEL_COLUMN_STYLE_EXPRESS),
      showWhen: values => isGridColumn(values),
    },
    {
      property: 'isOrderBy',
      label: t(I18N_IDS.LABEL_IS_ORDER_BY),
      type: 'select',
      dictName: 'isOrderBy',
      showWhen: values => isGridColumn(values),
    },
    {
      property: 'sortOrder',
      label: t(I18N_IDS.LABEL_SORT_ORDER),
      type: 'number',
      min: 0,
      max: Infinity,
      showWhen: values => isGridColumn(values),
    },
    {
      property: 'isDropFilter',
      label: t(I18N_IDS.LABEL_IS_DROP_FILTER),
      type: 'checkbox',
      showWhen: values => isGridColumn(values),
    },
    {
      property: 'isShowSort',
      label: t(I18N_IDS.LABEL_IS_SHOW_SORT),
      type: 'checkbox',
      showWhen: values => isGridColumn(values),
    },
    {
      property: 'unlockColumnExpress',
      label: t(I18N_IDS.LABEL_UNLOCK_COLUMN_EXPRESS),
      showWhen: values => isGridColumn(values),
    },
    {
      property: 'lockColumnExpress',
      label: t(I18N_IDS.LABEL_LOCK_COLUMN_EXPRESS),
      showWhen: values => isGridColumn(values),
    },

    // 通用
    {
      property: 'icon',
      label: t(I18N_IDS.LABEL_ICON),
    },
    {
      property: 'staticContent',
      label: t(I18N_IDS.LABEL_STATIC_CONTENT),
      type: 'textarea',
      extra: (__, values, callback) => {
        if (values && values.uiType === '03') {
          return (
            <>
              <Button
                type="primary"
                size="small"
                block
                onClick={() => openUploaderModal({
                  onOk: (fileList) => {
                    console.log(fileList);
                    const filekey: string = _.get(fileList, [0, 'fileInfo', 'fileKey']) || '';
                    callback({
                      property: 'staticContent',
                    }, filekey, true);
                  },
                })}
              >
                上传图片
              </Button>
            </>
          );
        }
        return null;
      },
    },
    {
      property: 'layoutElementAttr',
      label: t(I18N_IDS.LABEL_LAYOUT_ELEMENT_ATTR),
      type: 'textarea',
    },
    {
      property: 'devider-1',
      type: 'devider',
      label: t(I18N_IDS.LABEL_TEST_ATTRS),
    },
    {
      property: 'atValueType',
      type: 'select',
      label: t(I18N_IDS.LABEL_AT_VALUE_TYPE),
      dictName: 'AutoTestValueType',
    },
    {
      property: 'atResultValue',
      label: t(I18N_IDS.LABEL_AT_RESULT_VALUE),
    },
  ] as IFormItemOption[],

  /** 没有布局数据时的默认新增的两条 layout */
  defaultInitLayouts: (() => {
    const cellName0 = 'F0';
    const cellName1 = 'F0-0';
    return [
      createLayout({
        layoutContainerType: 'DIV',
        styleClass: 'module',
        ipfCcmOriginPageLayoutId: createId(),
        cellName: cellName0,
        parentCellName: null,
      }),
      createLayout({
        layoutContainerType: 'DIV',
        styleClass: 'container-fluid',
        ipfCcmOriginPageLayoutId: createId(),
        cellName: cellName1,
        parentCellName: cellName0,
      }),
    ];
  })(),

  /** 左侧拖拽列表：布局 */
  draggableItems_layout: [
    {
      title: 'ROW',
      source: createLayout({
        layoutContainerType: 'DIV',
        styleClass: 'row',
      }),
      type: 'layout',
      icon: 'icongl-row',
    },
    {
      title: 'COL',
      source: createLayout({
        layoutContainerType: 'DIV',
        unitCount: 3,
      }),
      type: 'layout',
      icon: 'icongl-form-col',
    },
  ] as IUiDraggableListItem[],

  /** 左侧拖拽列表：工具箱 */
  draggableItems_tools: [
    {
      groupTitle: I18N_IDS.PANEL_TITLE_CONTAINERS,
      listSource: [
        {
          source: createLayout({
            layoutContainerType: 'DIV',
          }),
          type: 'layout',
          title: 'DIV',
          icon: 'icongl-div',
        },
        // {
        //   source: createLayout({
        //     layoutContainerType: 'PANEL',
        //     isShowGroup: 'X',
        //     groupWidget: 'panel',
        //   }),
        //   type: 'layout',
        //   title: 'PANEL',
        //   icon: 'icongl-panel',
        // },
        {
          source: createLayout({
            layoutContainerType: 'PANEL_GROUP',
          }),
          type: 'layout',
          title: 'PANEL_GROUP',
          icon: 'icongl-panel-group',
        },
        {
          source: createLayout({
            layoutContainerType: 'GROUP',
          }),
          type: 'layout',
          title: 'GROUP',
          icon: 'icongl-group',
        },
        {
          source: createLayout({
            layoutContainerType: 'FORM',
          }),
          type: 'layout',
          title: 'FORM',
          icon: 'icongl-from',
        },
        {
          source: createLayout({
            layoutContainerType: 'TABS',
          }),
          type: 'layout',
          title: 'TABS',
          icon: 'icongl-tabs',
        },
        {
          source: createLayout({
            layoutContainerType: 'DYNAMIC_GROUP',
          }),
          type: 'layout',
          title: 'DYNAMIC_GROUP',
          icon: 'icongl-dynamic-gr',
        },
      ],
    },
    {
      groupTitle: I18N_IDS.PANEL_TITLE_PAGE_LAYOUT_TYPES,
      listSource: [
        {
          source: createLayout({
            layoutContainerType: 'DIV',
            layoutElementType: 'ELEMENT',
            conditionType: 'G',
          }),
          type: 'layout',
          title: 'SEARCH_FORM',
          icon: 'icongl-search-form',
        },
        {
          source: createLayout({
            layoutContainerType: 'DIV',
            layoutElementType: 'ELEMENT',
          }),
          type: 'layout',
          title: 'FORM_COLUMN',
          icon: 'icongl-col',
        },
        {
          source: createLayout({
            layoutContainerType: 'DIV',
            layoutElementType: 'GRID',
            gridType: 'HT',
          }),
          type: 'layout',
          title: 'GRID',
          icon: 'icongl-grid',
        },
        {
          source: createLayout({
            layoutContainerType: 'DIV',
            layoutElementType: 'LIST_VIEW',
          }),
          type: 'layout',
          title: 'LIST_VIEW',
          icon: 'icongl-list-view',
        },
        {
          source: createLayout({
            layoutContainerType: 'DIV',
            layoutElementType: 'FLUID_VIEW',
            // tslint:disable-next-line:prefer-template
            pageLayoutAttr: '{\r\n'
              + '  "columnCount": 3\r\n'
              + '}\r\n',
            __ipfCcmBoPgLoElements: [
              createElement({}),
            ],
          }),
          type: 'layout',
          title: 'FLUID_VIEW',
          icon: 'icongl-fluid-view',
        },
        {
          source: createLayout({
            layoutContainerType: 'DIV',
            layoutElementType: 'TOOLBAR',
            isParent: '',
          }),
          type: 'layout',
          title: 'TOOLBAR',
          icon: 'icongl-tool-bar',
        },
        {
          source: createLayout({
            layoutContainerType: 'DIV',
            layoutElementType: 'DYNAMIC_FORM',
            formType: 'form-horizontal',
            pageLayoutAttr: '{\n  "colCount": 4,\n  "propertyName": ""\n}',
          }),
          type: 'layout',
          title: 'DYNAMIC_FORM',
          icon: 'icongl-dynamic-fo',
        },
        {
          source: createLayout({
            layoutContainerType: 'DIV',
            layoutElementType: 'REFERENCE',
          }),
          type: 'layout',
          title: 'REFERENCE',
          icon: 'icongl-reference',
        },
        {
          source: createLayout({
            layoutContainerType: 'DIV',
            layoutElementType: 'TEMPLATE',
          }),
          type: 'layout',
          title: 'TEMPLATE',
          icon: 'icongl-div',
        },
        {
          source: createLayout({
            layoutContainerType: 'DIV',
            layoutElementType: 'TREE_VIEW_NEW',
          }),
          type: 'layout',
          title: 'TREE',
          icon: 'icongl-div',
        },
      ],
    },
    {
      groupTitle: I18N_IDS.PANEL_TITLE_STATIC_CONTROLS,
      listSource: [
        {
          source: createElement({
            uiType: '03',
            columnName: '',
            staticContent: '',
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_IMAGE),
          icon: 'icongl-image',
        },
        {
          source: createElement({
            uiType: '32',
            columnName: '',
            staticContent: '',
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_BUTTON),
          icon: 'icongl-btn',
        },
        {
          source: createElement({
            uiType: '33',
            columnName: '',
            staticContent: '',
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_STATIC_TEXT),
          icon: 'icongl-static-text',
        },
        {
          source: createElement({
            uiType: '34',
            columnName: '',
            staticContent: '',
          }),
          type: 'element',
          title: t(I18N_IDS.LABEL_ICON),
          icon: 'icongl-icon',
        },
      ],
    },
    {
      groupTitle: I18N_IDS.PANEL_TITLE_BASE_CONTROLS,
      listSource: [
        {
          source: createElement({
            layoutElementType: 'DYNA_COMB_QUERY',
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_COMBINED_SEARCH),
          icon: 'icongl-group-search',
        },
        {
          source: createElement({
            layoutElementType: 'DYNA_MORE_QUERY',
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_ADVANCED_SEARCH),
          icon: 'icongl-more-search',
        },
        {
          source: createElement({
            uiType: '40',
            columnName: t(I18N_IDS.CONTROL_TEXT_EXACT_MATCHING),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_TEXT_EXACT_MATCHING),
          icon: 'icongl-search-form',
        },
        {
          source: createElement({
            layoutElementType: 'BUTTON',
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_BUTTON),
          icon: 'icongl-btn',
        },
        {
          source: createElement({
            uiType: '14',
            columnName: t(I18N_IDS.CONTROL_TEXT),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_TEXT),
          icon: 'icongl-text',
        },
        {
          source: createElement({
            uiType: '01',
            columnName: t(I18N_IDS.CONTROL_TEXT_INPUT),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_TEXT_INPUT),
          icon: 'icongl-text',
        },
        {
          source: createElement({
            uiType: '08',
            columnName: t(I18N_IDS.CONTROL_CHECKBOX),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_CHECKBOX),
          icon: 'icongl-check-box',
        },
        {
          source: createElement({
            uiType: '06',
            columnName: t(I18N_IDS.CONTROL_DROPDOWN),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_DROPDOWN),
          icon: 'icongl-drop-down',
        },
        {
          source: createElement({
            uiType: '15',
            columnName: t(I18N_IDS.CONTROL_MULTIPLE_DROPDOWN),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_MULTIPLE_DROPDOWN),
          icon: 'icongl-many-select',
        },
        {
          source: createElement({
            uiType: '05',
            columnName: t(I18N_IDS.CONTROL_TIME_SELECT),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_TIME_SELECT),
          icon: 'icongl-time',
        },
        {
          source: createElement({
            uiType: '04',
            columnName: t(I18N_IDS.CONTROL_DATE_SELECT),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_DATE_SELECT),
          icon: 'icongl-date',
        },
        {
          source: createElement({
            uiType: '12',
            columnName: t(I18N_IDS.CONTROL_TEXTAREA),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_TEXTAREA),
          icon: 'icongl-multiline-text',
        },
        {
          source: createElement({
            uiType: '11',
            columnName: t(I18N_IDS.CONTROL_ASSOCIATE),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_ASSOCIATE),
          icon: 'icongl-associatio',
        },
        {
          source: createElement({
            uiType: '21',
            columnName: t(I18N_IDS.CONTROL_EDITABLE_ASSOCIATE),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_EDITABLE_ASSOCIATE),
          icon: 'icongl-text-associatio',
        },
        {
          source: createElement({
            uiType: '16',
            columnName: t(I18N_IDS.CONTROL_MULTIPLE_ASSOCIATE),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_MULTIPLE_ASSOCIATE),
          icon: 'icongl-many-association',
        },
        {
          source: createElement({
            uiType: '07',
            columnName: t(I18N_IDS.CONTROL_NUMBER_INPUT),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_NUMBER_INPUT),
          icon: 'icongl-number-text',
        },
        {
          source: createElement({
            uiType: '19',
            columnName: t(I18N_IDS.CONTROL_CHECKBOX_YN),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_CHECKBOX_YN),
          icon: 'icongl-check-box',
        },
        {
          source: createElement({
            uiType: '22',
            columnName: t(I18N_IDS.CONTROL_FILTERABLE_DROPDOWN),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_FILTERABLE_DROPDOWN),
          icon: 'icongl-filte-drop',
        },
        {
          source: createElement({
            uiType: '35',
            columnName: t(I18N_IDS.CONTROL_QUERY_FILTER),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_QUERY_FILTER),
          icon: 'icongl-single-select',
        },
        {
          source: createElement({
            uiType: '36',
            columnName: t(I18N_IDS.CONTROL_MULTIPLE_QUERY_FILTER),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_MULTIPLE_QUERY_FILTER),
          icon: 'icongl-many-drop',
        },
        {
          source: createElement({
            uiType: '13',
            columnName: t(I18N_IDS.CONTROL_HIDDEN),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_HIDDEN),
          icon: 'icongl-hide',
        },
        {
          source: createElement({
            uiType: '25',
            columnName: t(I18N_IDS.CONTROL_FILE_UPLOADER),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_FILE_UPLOADER),
          icon: 'icongl-div',
        },
      ],
    },
    {
      groupTitle: I18N_IDS.PANEL_TITLE_CONTROL_GROUPS,
      render: () => {
        return (
          <UiComponentGroupList />
        );
      },
    },
  ] as IUiDraggableListGroupItem[],

  /** 获取 Layout 对应的 Component Key, 用于动态渲染界面时获取对应的 Component
   * @param {IBoPageLayout} layout Layout 数据
   * @return {string}
   */
  getLayoutComponentKey(layout: IBoPageLayout) {
    let key = 'LayoutDivComponent';
    switch (layout.layoutElementType) {
      case 'GRID':
        key = 'LayoutGridComponent';
        break;
      case 'TREE_VIEW':
      case 'TREE_VIEW_NEW':
        key = 'LayoutTreeComponent';
        break;
      case 'FLUID_VIEW':
        key = 'LayoutFluidViewComponent';
        break;
      case 'LIST_VIEW':
        key = 'LayoutListViewComponent';
        break;
      default:
        break;
    }
    switch (layout.layoutContainerType) {
      case 'FORM':
        key = 'LayoutFormComponent';
        break;
      case 'PANEL':
        key = 'LayoutPanelComponent';
        break;
      case 'GROUP':
        if (layout.groupWidget === 'group-box') {
          key = 'LayoutGroupComponent';
        } else {
          key = 'LayoutPanelComponent';
        }
        break;
      case 'TABS':
        key = 'LayoutTabsComponent';
        break;
      case 'TAB':
        key = 'LayoutTabComponent';
        break;
      default:
        break;
    }
    return key;
  },

  /**
   * 获取 Element 对应的 Component Key, 用于动态渲染界面时获取对应的 Component
   * @param {IPgLoElement} element Element 数据
   * @param {IBoPageLayout} layout Element 的父 Layout 布局数据
   * @return {string}
   */
  getElementComponentKey(element: IPgLoElement, parentLayout?: IBoPageLayout) {
    let key = 'ElementInputComponent';
    if (parentLayout && parentLayout.layoutElementType === 'GRID') {
      key = 'ElementGridColumnComponent';
      return key;
    }
    switch (element.layoutElementType) {
      case 'BUTTON':
        key = 'ElementButtonComponent';
        break;
      case 'BUTTON_GROUP':
        key = 'ElementButtonGroupComponent';
        break;
      case 'DYNA_COMB_QUERY':
        key = 'ElementDynamicSearchBarComponent';
        break;
      case 'DYNA_MORE_QUERY':
        key = 'ElementDynamicDrawerButtonComponent';
        break;
      default:
        switch (transformUiType(element.uiType)) {
          case 'checkbox':
            key = 'ElementCheckboxComponent';
            break;
          case 'static':
            key = 'ElementStaticComponent';
            break;
          default:
            break;
        }
        break;
    }
    return key;
  },
};

/**
 * 获取页面列表显示文字的
 * @param {IIpfCcmPage} pageData page 数据
 * @return {string}
 */
function getPageTypeDisplay(pageData: IIpfCcmPage): string {
  return PAGE_TYPE[pageData.pageType] || pageData.pageType;
}

export function createLayout(options?: any): IBoPageLayout {
  return _.assign({}, INIT_LAYOUT_DATA, options);
}

export function createElement(options: any): IPgLoElement {
  return _.assign({}, INIT_ELEMENT_DATA, options);
}

function isButton(values: any) {
  return values && (values.uiType === '32' || values.layoutElementType === 'BUTTON');
}

function isGridColumn(values: any): boolean {
  return values && values.__isGridColumn;
}

async function modifyDataElement({
  values,
  dispatch,
  callback,
  type,
}: {
  values: any;
  dispatch: any;
  callback: any;
  type: 'edit' | 'add';
}) {
  let formData: any = {};
  dispatch(createSetIsLoadingAction(true, true));
  try {
    let getResult: any;
    if (type === 'add') {
      getResult = await getDmlElementByPropertyName({
        baseViewId: window['__urlParams']?.baseViewId,
        boName: values.layoutBoName,
        propertyName: values?.propertyName,
      });
    } else {
      getResult = await getDmlElement({
        elementCode: values?.dataElementCode,
        baseViewId: window['__urlParams']?.baseViewId,
      });
    }
    formData = getResult?.data ?? {};
  } catch (e) {
    console.error(e);
    Modal.error({ content: e?.msg ?? '查询数据元素失败。' });
    return;
  } finally {
    dispatch(createSetIsLoadingAction(false, true));
  }
  const originElementCode = formData.elementCode;
  if (type === 'edit') {
    formData.rowStatus = ROW_STATUS.MODIFIED;
  } else {
    formData.referenceCode = originElementCode;
    formData.elementCode = null;
    formData.configItemCode = null;
    formData.ipfDmlElementId = null;
    formData.rowStatus = ROW_STATUS.ADDED;
    formData.baseViewId = window['__urlParams']?.baseViewId ?? '';
    formData.revisionNumber = 0;
  }
  const typeText = type === 'edit' ? '修改' : '新增';
  openElementCodeFormModal({
    title: `${typeText}数据元素`,
    submitText: `${typeText}并提交`,
    formData: { ...formData },
    editType: type,
    async onSubmit(data, editType) {
      const postData = {
        ...formData,
        ...data,
      };
      if (type === 'edit' && editType === 'add') {
        postData.referenceCode = originElementCode;
        postData.configItemCode = null;
        postData.ipfDmlElementId = null;
        postData.rowStatus = ROW_STATUS.ADDED;
        postData.baseViewId = window['__urlParams']?.baseViewId ?? '';
        postData.revisionNumber = 0;
      }
      let result: any;
      dispatch(createSetIsLoadingAction(true, true));
      try {
        result = await saveElementCode(postData);
      } catch (e) {
        console.error(e);
        Modal.error({ content: e?.msg ?? '保存失败。' });
        return;
      } finally {
        dispatch(createSetIsLoadingAction(false, true));
      }
      console.log(result);
      message.success('保存成功。');
      callback(
        [{ property: 'dataElementCode' }, { property: 'dataElementText' }, { property: 'columnName' }, { property: 'fieldText' }],
        [data?.elementCode, data?.fieldText, data?.fieldText, data?.fieldText],
        true,
      );
      closeElementCodeFormModal();
    },
  });
}

async function modifyLanguageMsg({
  values,
  dispatch,
  callback,
  type,
  codeKey,
  textKey,
  layoutType,
}: {
  values: any;
  dispatch: any;
  callback: any;
  type: 'edit' | 'add';
  codeKey: string,
  textKey: string,
  layoutType: 'layout' | 'element',
}) {
  const formData: any = {};
  // const originMessageKey = formData.messageKey;
  if (type === 'edit') {
    formData.rowStatus = ROW_STATUS.MODIFIED;
    formData.baseViewId = window['__urlParams']?.baseViewId ?? '';
    formData.messageKey = values[codeKey];
    formData.messageText = values[textKey];
  } else {
    formData.rowStatus = ROW_STATUS.ADDED;
    formData.baseViewId = window['__urlParams']?.baseViewId ?? '';
  }
  openLanguageMsgFormModal({
    formData: { ...formData },
    editType: type,
    async onSubmit(data, editType) {
      const postData = {
        ...formData,
        ...data,
        metaDataType: layoutType === 'element' ? 'IpfCcmBoPgLoElement' : 'IpfCcmBoPageLayout',
        businessId: layoutType === 'element' ? values?.ipfCcmBoPgLoElementId : values?.ipfCcmBoPageLayoutId,
      };
      if (type === 'edit' && editType === 'add') {
        postData.rowStatus = ROW_STATUS.ADDED;
        postData.baseViewId = window['__urlParams']?.baseViewId ?? '';
      }
      if (postData.businessId?.indexOf?.('NEW_') >= 0) {
        postData.businessId = null;
      }
      let result: any;
      dispatch(createSetIsLoadingAction(true, true));
      try {
        result = await saveLanguageMsg(postData);
      } catch (e) {
        console.error(e);
        Modal.error({ content: e?.msg ?? '保存失败。' });
        return;
      } finally {
        dispatch(createSetIsLoadingAction(false, true));
      }
      console.log(result);
      message.success('保存成功。');
      callback(
        [{ property: 'titleMsgCode' }, { property: 'titleMsgText' }],
        [data?.messageKey, data?.messageText],
        true,
      );
      closeLanguageMsgFormModal();
    },
  });
}
