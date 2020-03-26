import * as React from 'react';
import * as _ from 'lodash';
import { Button, Modal, TreeSelect } from 'antd';
import { IPrototypePage, IBoPageLayout, IPgLoElement } from './types';
import { IFormItemOption } from 'src/utils/forms';
import { IUiDraggableListItem } from 'src/ui/draggableList';
import { IUiDraggableListGroupItem } from 'src/ui/draggableListGroup';
import { transformUiType, createId, createGridSourceFromColumns } from 'src/utils';
import {
  openListSourceEditor,
  openUploaderModal,
  openTreeEditorModal,
  openJumpByGridSettingsModal,
  openDisabledExpreeModal,
} from 'src/utils/modal';
import { connect } from 'dva';
import { IPagesState } from 'src/models/pagesModel';
import { createUpdateGridColumnsDataEffect, createUpdateLayoutFieldsEffect, createClearLayoutEffect, createUpdateInnerDatasourceEffect } from 'src/models/layoutsActions';
import { IDatasourceState, ID_KEY, PID_KEY, TITLE_KEY, ORDER_KEY } from 'src/models/datasourceModel';
import { IAppState } from 'src/models/appModel';
import { createLoadPageListEffect } from 'src/models/pagesActions';
import { queryPageList } from './service';
import { BUILT_IN_STYLE_CLASSES } from 'src/config';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';
import { UiComponentGroupList } from 'src/ui/componentGroupList';
// import { UiComponentGroupList } from 'src/ui/componentGroupList';

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
  fieldText: '',
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

export const PROTOTYPE_CONFIG = {
  /** 查询页面列表 URL */
  queryPageListUrl: '/ipf/ipfCcmOriginPage/query?gridKey=default_0&currentPage=1&pageSize=1000&queryResultType=page&sum=false',

  /** 查询页面布局数据 URL */
  queryPageUrl: '/ipf/ipfCcmOriginPageLayout/getIpfCcmOriginPageLayoutByOriginPage',

  /** 保存 Url */
  savePageUrl: '/ipf/ipfCcmOriginPageLayout/saveOrUpdatesByOriginPage',

  /** 页面显示文本转换 */
  pageDisplayFunc: (page: IPrototypePage) => {
    return page.originName;
  },

  /** 页面 ID 字段 */
  pageIdKey: 'ipfCcmOriginPageId',
  /** 页面父 ID 字段 */
  parentPageIdKey: 'ipfCcmOriginPagePid',
  /** 页面排序字段 */
  pageOrderKey: 'seqNo',
  /** cellName 字段 */
  cellNameKey: 'cellName',
  /** 父 cellName 字段 */
  parentCellNameKey: 'parentCellName',
  /** layout ID 字段 */
  layoutIdKey: 'ipfCcmOriginPageLayoutId',
  /** layout 上的子 element 字段 */
  childrenElementsKey: '__ipfCcmBoPgLoElements',
  /** layout 上的 elementId 字段 */
  layoutElementIdKey: 'ipfCcmOriginPgLoEleId',
  /** element ID 字段 */
  elementIdKey: 'ipfCcmOrPgLoEleId',
  /** element 上的父 Layout 字段 */
  elementParentLayoutKey: 'cellName',
  /** element 上的父 LayoutId 字段 */
  elementParentLayoutIdKey: 'ipfCcmOriginPageLayoutId',
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
      property: 'referenceId',
      label: t(I18N_IDS.LABEL_REFERENCE_ID),
      showWhen: values => _.get(values, 'layoutElementType') === 'REFERENCE',
      render: (opts, values, callback, dispatch) => {
        const ConnectTreeSelect = connect(
          ({ PAGES }: {
            PAGES: IPagesState<any>,
          }) => {
            const {
              pageList,
            } = PAGES;
            return {
              treeData: _.map(pageList, p => {
                return {
                  id: p.ipfCcmOriginPageId,
                  pid: p.ipfCcmOriginPagePid || '',
                  title: p.originName,
                  value: p.ipfCcmOriginPageId,
                };
              }),
            };
          },
        )(TreeSelect);
        return (
          <ConnectTreeSelect
            allowClear
            style={{ width: '100%' }}
            treeDefaultExpandAll
            size="small"
            onChange={
              (value: any) => {
                callback(
                  { property: 'referenceId' },
                  value,
                );
                const cellName = values.cellName;
                setTimeout(() => {
                  dispatch(createClearLayoutEffect({ cellName }, false));
                  dispatch(createUpdateLayoutFieldsEffect(cellName, {
                    __referenceLoadStatus: null,
                  }));
                }, 0);
              }
            }
            treeDataSimpleMode={{
              id: 'id',
              pId: 'pid',
              rootPId: '',
            }}
            dropdownClassName="editor-tree-select"
          >
            {}
          </ConnectTreeSelect>
        );
      },
    },
    {
      property: 'dataSourceId',
      label: t(I18N_IDS.LABEL_DATA_SOURCE_ID),
      render: (opts, values, callback) => {
        const ConnectTreeSelect = connect(
          ({ DATASOURCE }: {
            DATASOURCE: IDatasourceState,
          }) => {
            return {
              treeData: _.chain(DATASOURCE.source)
                .orderBy(ORDER_KEY)
                .map(s => {
                  return {
                    id: s[ID_KEY],
                    pid: s[PID_KEY] || '',
                    title: s[TITLE_KEY],
                    value: s[ID_KEY],
                  };
                })
                .value(),
            };
          },
        )(TreeSelect);
        return (
          <ConnectTreeSelect
            allowClear
            style={{ width: '100%' }}
            treeDefaultExpandAll
            size="small"
            onChange={
              (value: any) => callback({ property: 'dataSourceId' }, value)
            }
            treeDataSimpleMode={{
              id: 'id',
              pId: 'pid',
              rootPId: '',
            }}
            dropdownClassName="editor-tree-select"
          />
        );
      },
      extra: (__, values, callback, ___, dispatch) => {
        return (
          <Button
            type="primary"
            size="small"
            block
            onClick={() => dispatch(createUpdateInnerDatasourceEffect(values.cellName, values.dataSourceId))}
          >{t(I18N_IDS.TEXT_SYNC_INNER_DATASOURCE)}</Button>
        );
      },
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
      property: 'dropdownList',
      label: t(I18N_IDS.LABEL_DROPDOWN_LIST),
      type: 'textarea',
      disabled: true,
      showWhen: values => isShowDropdownList(values),
      extra: (__, values, callback, ___, dispatch) => {
        return (
          <>
            <Button
              type="primary"
              size="small"
              block
              onClick={() => {
                const value = values.dropdownList || '';
                let source: string[][] = [];

                if (isTree(values)) {
                  openTreeEditorModal({
                    source: createTreeSource(value),
                    onSubmit: (list) => {
                      const obj = {
                        title: ['id', 'pid', 'title'],
                        source: [] as string[][],
                      };
                      obj.source = _.map(list, item => [item.id, item.pid, item.title]);
                      const str = JSON.stringify(obj);
                      callback({ property: 'dropdownList' }, str, true);
                    },
                  });
                  return;
                }

                if (!values.__gridColumns || !values.__gridColumns.length) {
                  Modal.warn({
                    content: '尚未配置表格列，无法配置列表数据。',
                    maskClosable: true,
                  });
                  return;
                }
                const sourceTitle: string[] = _.map(values.__gridColumns, c => c.fieldText || c.columnName);
                source = createGridSourceFromColumns(values.__gridColumns);
                openListSourceEditor({
                  source,
                  sourceTitle,
                  columnsEditable: false,
                  onSubmit: editor => {
                    const data = editor.getListSourceObj();
                    const columnsData = _.unzip(data.source);
                    console.log('......', columnsData);
                    // callback({ property: 'dropdownList' }, data, true);
                    dispatch(createUpdateGridColumnsDataEffect(columnsData));
                  },
                });
              }}
            >
              {t(I18N_IDS.TEXT_EDIT_LIST_DATA)}
            </Button>
          </>
        );
      },
    },
    {
      property: 'remark',
      label: t(I18N_IDS.LABEL_REMARK),
      type: 'textarea',
    },
    {
      property: 'pageLayoutAttr#disabledExpree',
      label: t(I18N_IDS.LABEL_DISABLED_EXPREE),
      showWhen: values => values && values.layoutContainerType === 'TAB',
      render: (options, values, callback) => {
        return (
          <div style={{ display: 'flex' }}>
            <Button
              type="primary"
              size="small"
              onClick={() => openDisabledExpreeModal(values, 'layout')}
              block
            >
              {t(I18N_IDS.TEXT_EDIT_CONDITIONS)}
            </Button>
            {
              values && values['pageLayoutAttr#disabledExpree']
                ? <Button
                    type="danger"
                    size="small"
                    style={{ marginLeft: 4 }}
                    onClick={() => {
                      callback(
                        { property: 'pageLayoutAttr#disabledExpree' },
                        null,
                        true,
                      );
                    }}
                    block
                  >
                    {t(I18N_IDS.TEXT_CLEAR_CONDITIONS)}
                  </Button>
                : null
            }
          </div>
        );
      },
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
      property: 'groupTitle',
      label: t(I18N_IDS.LABEL_GROUP_TITLE),
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
      property: 'gridEditType',
      label: t(I18N_IDS.LABEL_GRID_EDIT_TYPE),
      type: 'select',
      dictName: 'gridEditType',
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
      disabled: true,
      type: 'textarea',
    },
  ] as IFormItemOption[],
  /** Element 属性表单配置 */
  elementPropertyFormOptions: [
    // {
    //   property: '__data',
    //   label: '[数据]',
    //   type: 'textarea',
    // },
    {
      property: 'fieldText',
      label: t(I18N_IDS.LABEL_FIELD_TEXT),
    },
    {
      property: 'uiType',
      label: t(I18N_IDS.LABEL_UI_TYPE),
      type: 'select',
      dictName: 'IpfCcmBoUIType',
    },
    {
      property: 'layoutElementType',
      label: t(I18N_IDS.LABEL_LAYOUT_ELEMENT_TYPE),
      type: 'select',
      dictName: 'layoutElementType2',
    },
    {
      property: 'dataSourceId',
      label: t(I18N_IDS.LABEL_DATA_SOURCE_ID),
      render: (opts, values, callback) => {
        const ConnectTreeSelect = connect(
          ({ DATASOURCE }: {
            DATASOURCE: IDatasourceState,
          }) => {
            return {
              treeData: _.chain(DATASOURCE.source)
                .orderBy(ORDER_KEY)
                .map(s => {
                  return {
                    id: s[ID_KEY],
                    pid: s[PID_KEY] || '',
                    title: s[TITLE_KEY],
                    value: s[ID_KEY],
                  };
                })
                .value(),
            };
          },
        )(TreeSelect);
        return (
          <ConnectTreeSelect
            allowClear
            style={{ width: '100%' }}
            treeDefaultExpandAll
            size="small"
            onChange={
              (value: any) => callback({ property: 'dataSourceId' }, value)
            }
            treeDataSimpleMode={{
              id: 'id',
              pId: 'pid',
              rootPId: '',
            }}
            dropdownClassName="editor-tree-select"
          >
            {}
          </ConnectTreeSelect>
        );
      },
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
      property: 'dropdownList',
      // label: '下拉列表',
      // label: (values: any) => {
      //   const uiTypeText = transformUiType(values && values.uiType);
      //   switch (uiTypeText) {
      //     case 'checkbox-group':
      //     case 'radio-group':
      //       return '选项列表';
      //     default:
      //       return '下拉列表';
      //   }
      // },
      label: t(I18N_IDS.LABEL_DROPDOWN_LIST),
      type: 'textarea',
      disabled: true,
      showWhen: values => isShowDropdownList(values),
      extra: (__, values, callback) => {
        return (
          <>
            <Button
              type="primary"
              size="small"
              block
              onClick={() => {
                const value = values.dropdownList || '';
                let source: string[][] = [];
                let sourceTitle: string[] = ['字段1'];
                let columnsEditable = true;
                if (value) {
                  try {
                    const obj = JSON.parse(value) || {};
                    source = obj.source || [];
                    sourceTitle = obj.title || [];
                  } catch (e) {
                    console.warn('[dropdownList] error:', e);
                  }
                }
                const uiTypeText = transformUiType(values.uiType);
                if (
                  uiTypeText === 'dropdown'
                  || uiTypeText === 'checkbox-group'
                  || uiTypeText === 'radio-group'
                ) {
                  sourceTitle = ['key', 'value'];
                  columnsEditable = false;
                }
                openListSourceEditor({
                  source,
                  sourceTitle,
                  columnsEditable,
                  onSubmit: editor => {
                    const data = editor.getListSourceJson();
                    callback({ property: 'dropdownList' }, data, true);
                  },
                });
              }}
            >
              {t(I18N_IDS.TEXT_EDIT_LIST_DATA)}
            </Button>
          </>
        );
      },
    },
    {
      property: 'remark',
      label: t(I18N_IDS.LABEL_REMARK),
      type: 'textarea',
    },
    {
      property: 'layoutElementAttr#disabledExpree',
      label: t(I18N_IDS.LABEL_DISABLED_EXPREE2),
      render: (options, values, callback) => {
        return (
          <div style={{ display: 'flex' }}>
            <Button
              type="primary"
              size="small"
              onClick={() => openDisabledExpreeModal(values, 'element')}
              block
            >
              {t(I18N_IDS.TEXT_EDIT_CONDITIONS)}
            </Button>
            {
              values && values['layoutElementAttr#disabledExpree']
                ? <Button
                    type="danger"
                    size="small"
                    style={{ marginLeft: 4 }}
                    onClick={() => {
                      callback(
                        { property: 'layoutElementAttr#disabledExpree' },
                        null,
                        true,
                      );
                    }}
                    block
                  >
                    {t(I18N_IDS.TEXT_CLEAR_CONDITIONS)}
                  </Button>
                : null
            }
          </div>
        );
      },
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
      property: 'seqNo',
      label: t(I18N_IDS.LABEL_SEQ_NO),
      type: 'number',
      disabled: true,
      min: 0,
      max: Infinity,
    },
    {
      property: 'isFocus',
      label: t(I18N_IDS.LABEL_IS_FOCUS),
      type: 'checkbox',
    },
    {
      property: 'fieldCode',
      label: t(I18N_IDS.LABEL_FIELD_CODE),
    },
    {
      property: 'fieldValue',
      label: t(I18N_IDS.LABEL_FIELD_VALUE),
    },
    // 按钮属性
    {
      property: 'showExpree',
      label: t(I18N_IDS.LABEL_SHOW_EXPREE),
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
      property: 'layoutElementAttr#actionType',
      label: t(I18N_IDS.LABEL_ACTION_TYPE),
      type: 'select',
      dictName: 'LayoutElementAttr',
      changeExt: () => ({
        'layoutElementAttr#baseViewId': null,
        'layoutElementAttr#pageId': null,
        'layoutElementAttr#title': null,
        'layoutElementAttr#message': null,
        'layoutElementAttr#width': null,
        'layoutElementAttr#height': null,
        'layoutElementAttr#jumpByGridSettings': null,
      }),
      showWhen: values => isButton(values),
      extra: (opts, values, callback, dicts, dispatch) => {
        if (values['layoutElementAttr#actionType'] !== 'JUMP_BY_GRID') {
          return null;
        }
        return (
          <Button
            type="primary"
            size="small"
            block
            onClick={openJumpByGridSettingsModal}
          >配置跳转规则</Button>
        );
      },
    },
    {
      property: 'layoutElementAttr#baseViewId',
      label: t(I18N_IDS.LABEL_BASE_VIEW_ID),
      showWhen: values => {
        if (!values) return false;
        return isButton(values)
          && (
            values['layoutElementAttr#actionType'] === 'JUMP'
            || values['layoutElementAttr#actionType'] === 'MODAL_PAGE'
          );
      },
      render: (opts, values, callback, dispatch) => {
        const ConnectTreeSelect = connect(
          ({ APP }: {
            APP: IAppState,
          }) => {
            return {
              treeData: _.map(APP.viewList, v => {
                return {
                  id: v.id,
                  pid: v.pid || '',
                  title: v.name,
                  value: v.id,
                };
              }),
            };
          },
        )(TreeSelect);
        return (
          <ConnectTreeSelect
            allowClear
            style={{ width: '100%' }}
            treeDefaultExpandAll
            size="small"
            onChange={
              (value: any) => {
                console.log('baseViewIdChange...', values, value);
                if (values['layoutElementAttr#baseViewId'] !== value) {
                  callback(
                    [
                      { property: 'layoutElementAttr#baseViewId' },
                      { property: 'layoutElementAttr#pageId' },
                    ],
                    [value, null],
                    true,
                  );
                  dispatch(createLoadPageListEffect(
                    queryPageList,
                    [{ baseViewId: value }],
                    value || '',
                  ));
                }
              }
            }
            treeDataSimpleMode={{
              id: 'id',
              pId: 'pid',
              rootPId: '',
            }}
            dropdownClassName="editor-tree-select"
          >
            {}
          </ConnectTreeSelect>
        );
      },
    },
    {
      property: 'layoutElementAttr#pageId',
      label: t(I18N_IDS.LABEL_JUMP_PAGE),
      showWhen: values => {
        if (!values) return false;
        return isButton(values)
          && (
            values['layoutElementAttr#actionType'] === 'JUMP'
            || values['layoutElementAttr#actionType'] === 'MODAL_PAGE'
          );
      },
      render: (opts, values, callback) => {
        const ConnectTreeSelect = connect(
          ({ PAGES }: {
            PAGES: IPagesState<any>,
          }) => {
            const {
              pageList,
              viewPageList,
            } = PAGES;
            const viewId = values['layoutElementAttr#baseViewId'];
            const list = viewId
              ? viewPageList[viewId]
              : pageList;
            return {
              treeData: _.map(list, p => {
                return {
                  id: p.ipfCcmOriginPageId,
                  pid: p.ipfCcmOriginPagePid || '',
                  title: p.originName,
                  value: p.ipfCcmOriginPageId,
                };
              }),
            };
          },
        )(TreeSelect);
        return (
          <ConnectTreeSelect
            allowClear
            style={{ width: '100%' }}
            treeDefaultExpandAll
            size="small"
            onChange={
              (value: any) => callback(
                { property: 'layoutElementAttr#pageId' },
                value,
              )
            }
            treeDataSimpleMode={{
              id: 'id',
              pId: 'pid',
              rootPId: '',
            }}
            dropdownClassName="editor-tree-select"
          >
            {}
          </ConnectTreeSelect>
        );
      },
    },
    {
      property: 'layoutElementAttr#title',
      label: t(I18N_IDS.LABEL_MODAL_TITLE),
      showWhen: values => {
        if (!values) return false;
        return isButton(values)
          && (
            values['layoutElementAttr#actionType'] === 'MODAL'
            || values['layoutElementAttr#actionType'] === 'MODAL_PAGE'
          );
      },
    },
    {
      property: 'layoutElementAttr#message',
      label: t(I18N_IDS.LABEL_MODAL_TITLE),
      showWhen: values => {
        if (!values) return false;
        return isButton(values)
          && (
            values['layoutElementAttr#actionType'] === 'MODAL'
          );
      },
    },
    {
      property: 'layoutElementAttr#width',
      label: t(I18N_IDS.LABEL_MODAL_WIDTH),
      type: 'number',
      min: 0,
      max: Infinity,
      showWhen: values => {
        if (!values) return false;
        return isButton(values)
          && (
            values['layoutElementAttr#actionType'] === 'MODAL'
            || values['layoutElementAttr#actionType'] === 'MODAL_PAGE'
          );
      },
    },
    {
      property: 'layoutElementAttr#height',
      label: t(I18N_IDS.LABEL_MODAL_HEIGHT),
      min: 0,
      max: Infinity,
      type: 'number',
      showWhen: values => {
        if (!values) return false;
        return isButton(values)
          && (
            values['layoutElementAttr#actionType'] === 'MODAL'
            || values['layoutElementAttr#actionType'] === 'MODAL_PAGE'
          );
      },
    },
    {
      property: 'layoutElementAttr',
      label: t(I18N_IDS.LABEL_LAYOUT_ELEMENT_ATTR),
      disabled: true,
      type: 'textarea',
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
      groupTitle: t(I18N_IDS.PANEL_TITLE_CONTAINERS),
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
        // {
        //   source: createLayout({
        //     layoutContainerType: 'DYNAMIC_GROUP',
        //   }),
        //   type: 'layout',
        //   title: 'DYNAMIC_GROUP',
        //   icon: 'icongl-dynamic-gr',
        // },
      ],
    },
    {
      groupTitle: t(I18N_IDS.PANEL_TITLE_PAGE_LAYOUT_TYPES),
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
        // {
        //   source: createLayout({
        //     layoutContainerType: 'DIV',
        //     layoutElementType: 'LIST_VIEW',
        //   }),
        //   type: 'layout',
        //   title: 'LIST_VIEW',
        //   icon: 'icongl-list-view',
        // },
        // {
        //   source: createLayout({
        //     layoutContainerType: 'DIV',
        //     layoutElementType: 'FLUID_VIEW',
        //     // tslint:disable-next-line:prefer-template
        //     pageLayoutAttr: '{\r\n'
        //       + '  "columnCount": 3\r\n'
        //       + '}\r\n',
        //     __ipfCcmBoPgLoElements: [
        //       createElement({}),
        //     ],
        //   }),
        //   type: 'layout',
        //   title: 'FLUID_VIEW',
        //   icon: 'icongl-fluid-view',
        // },
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
            layoutElementType: 'TREE_VIEW_NEW',
          }),
          type: 'layout',
          title: 'TREE',
          icon: 'icongl-div',
        },
        // {
        //   source: createLayout({
        //     layoutContainerType: 'DIV',
        //     layoutElementType: 'DYNAMIC_FORM',
        //     formType: 'form-horizontal',
        //     pageLayoutAttr: '{\n  "colCount": 4,\n  "propertyName": ""\n}',
        //   }),
        //   type: 'layout',
        //   title: 'DYNAMIC_FORM',
        //   icon: 'icongl-dynamic-fo',
        // },
        {
          source: createLayout({
            layoutContainerType: 'DIV',
            layoutElementType: 'REFERENCE',
          }),
          type: 'layout',
          title: 'REFERENCE',
          icon: 'icongl-reference',
        },
        // {
        //   source: createLayout({
        //     layoutContainerType: 'DIV',
        //     layoutElementType: 'TEMPLATE',
        //   }),
        //   type: 'layout',
        //   title: 'TEMPLATE',
        //   icon: 'icongl-div',
        // },
      ],
    },
    {
      groupTitle: t(I18N_IDS.PANEL_TITLE_BASE_CONTROLS),
      listSource: [
        {
          source: createElement({
            uiType: '03',
            fieldText: '',
            staticContent: '',
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_IMAGE),
          icon: 'icongl-image',
        },
        {
          source: createElement({
            uiType: '32',
            fieldText: '',
            staticContent: '',
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_BUTTON),
          icon: 'icongl-btn',
        },
        {
          source: createElement({
            uiType: '33',
            fieldText: '',
            staticContent: '',
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_STATIC_TEXT),
          icon: 'icongl-static-text',
        },
        {
          source: createElement({
            uiType: '34',
            fieldText: '',
            staticContent: '',
          }),
          type: 'element',
          title: t(I18N_IDS.LABEL_ICON),
          icon: 'icongl-icon',
        },
      ],
    },
    {
      groupTitle: t(I18N_IDS.PANEL_TITLE_STATIC_CONTROLS),
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
            layoutElementType: 'BUTTON',
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_BUTTON),
          icon: 'icongl-btn',
        },
        {
          source: createElement({
            uiType: '14',
            fieldText: t(I18N_IDS.CONTROL_TEXT),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_TEXT),
          icon: 'icongl-text',
        },
        {
          source: createElement({
            uiType: '01',
            fieldText: t(I18N_IDS.CONTROL_TEXT_INPUT),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_TEXT_INPUT),
          icon: 'icongl-text',
        },
        {
          source: createElement({
            uiType: '08',
            fieldText: t(I18N_IDS.CONTROL_CHECKBOX),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_CHECKBOX),
          icon: 'icongl-check-box',
        },
        {
          source: createElement({
            uiType: '20',
            fieldText: t(I18N_IDS.CONTROL_CHECKBOX_GROUP),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_CHECKBOX_GROUP),
          icon: 'icongl-check-box',
        },
        {
          source: createElement({
            uiType: '24',
            fieldText: t(I18N_IDS.CONTROL_RADIO_GROUP),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_RADIO_GROUP),
          icon: 'icongl-check-box',
        },
        {
          source: createElement({
            uiType: '06',
            fieldText: t(I18N_IDS.CONTROL_DROPDOWN),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_DROPDOWN),
          icon: 'icongl-drop-down',
        },
        {
          source: createElement({
            uiType: '15',
            fieldText: t(I18N_IDS.CONTROL_MULTIPLE_DROPDOWN),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_MULTIPLE_DROPDOWN),
          icon: 'icongl-many-select',
        },
        {
          source: createElement({
            uiType: '05',
            fieldText: t(I18N_IDS.CONTROL_TIME_SELECT),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_TIME_SELECT),
          icon: 'icongl-time',
        },
        {
          source: createElement({
            uiType: '04',
            fieldText: t(I18N_IDS.CONTROL_DATE_SELECT),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_DATE_SELECT),
          icon: 'icongl-date',
        },
        {
          source: createElement({
            uiType: '12',
            fieldText: t(I18N_IDS.CONTROL_TEXTAREA),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_TEXTAREA),
          icon: 'icongl-multiline-text',
        },
        {
          source: createElement({
            uiType: '11',
            fieldText: t(I18N_IDS.CONTROL_ASSOCIATE),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_ASSOCIATE),
          icon: 'icongl-associatio',
        },
        {
          source: createElement({
            uiType: '21',
            fieldText: t(I18N_IDS.CONTROL_FILTERABLE_DROPDOWN),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_FILTERABLE_DROPDOWN),
          icon: 'icongl-text-associatio',
        },
        {
          source: createElement({
            uiType: '16',
            fieldText: t(I18N_IDS.CONTROL_MULTIPLE_ASSOCIATE),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_MULTIPLE_ASSOCIATE),
          icon: 'icongl-many-association',
        },
        {
          source: createElement({
            uiType: '07',
            fieldText: t(I18N_IDS.CONTROL_NUMBER_INPUT),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_NUMBER_INPUT),
          icon: 'icongl-number-text',
        },
        {
          source: createElement({
            uiType: '19',
            fieldText: t(I18N_IDS.CONTROL_CHECKBOX_YN),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_CHECKBOX_YN),
          icon: 'icongl-check-box',
        },
        {
          source: createElement({
            uiType: '22',
            fieldText: t(I18N_IDS.CONTROL_FILTERABLE_DROPDOWN),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_FILTERABLE_DROPDOWN),
          icon: 'icongl-filte-drop',
        },
        // {
        //   source: createElement({
        //     uiType: '35',
        //     fieldText: '单选筛选',
        //   }),
        //   type: 'element',
        //   title: '单选筛选',
        //   icon: 'icongl-single-select',
        // },
        // {
        //   source: createElement({
        //     uiType: '36',
        //     fieldText: '多选筛选',
        //   }),
        //   type: 'element',
        //   title: '多选筛选',
        //   icon: 'icongl-many-drop',
        // },
        {
          source: createElement({
            uiType: '13',
            fieldText: t(I18N_IDS.CONTROL_HIDDEN),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_HIDDEN),
          icon: 'icongl-hide',
        },
        {
          source: createElement({
            uiType: '25',
            fieldText: t(I18N_IDS.CONTROL_FILE_UPLOADER),
          }),
          type: 'element',
          title: t(I18N_IDS.CONTROL_FILE_UPLOADER),
          icon: 'icongl-div',
        },
      ],
    },
    {
      groupTitle: '控件组合',
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

export function createLayout(options?: any): IBoPageLayout {
  return _.assign({}, INIT_LAYOUT_DATA, options);
}

export function createElement(options: any): IPgLoElement {
  return _.assign({}, INIT_ELEMENT_DATA, options);
}

export function isButton(values: any) {
  return values && (values.uiType === '32' || values.layoutElementType === 'BUTTON');
}

function isGridColumn(values: any): boolean {
  return values && values.__isGridColumn;
}

function isShowDropdownList(values: any): boolean {
  if (!values) {
    return false;
  }
  const { uiType, layoutElementType } = values;
  if (uiType) {
    const type = transformUiType(uiType);
    return type === 'associate'
      || type === 'dropdown'
      || type === 'checkbox-group'
      || type === 'radio-group';
  }
  return layoutElementType === 'GRID' || layoutElementType === 'TREE_VIEW' || layoutElementType === 'TREE_VIEW_NEW';
}

function isTree(values: any): boolean {
  if (!values) {
    return false;
  }
  const { layoutElementType } = values;
  return layoutElementType === 'TREE_VIEW' || layoutElementType === 'TREE_VIEW_NEW';
}

function createTreeSource(str: string) {
  let obj: {
    source: string[][];
    title: string[];
  };
  try {
    obj = JSON.parse(str);
  } catch (e) {
    console.warn(e);
    return [];
  }
  return _.map(obj.source, item => ({
    id: item[0],
    pid: item[1],
    title: item[2],
  }));
}
