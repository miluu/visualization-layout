import * as React from 'react';
import * as _ from 'lodash';
import { IIpfCcmPage, IBoPageLayout, IPgLoElement } from 'src/routes/Template/types';
import { PAGE_TYPE, BUILT_IN_STYLE_CLASSES } from '../../config';
import { IFormItemOption } from 'src/utils/forms';
import { IUiDraggableListItem } from 'src/ui/draggableList';
import { IUiDraggableListGroupItem } from 'src/ui/draggableListGroup';
import { transformUiType, createId } from 'src/utils';
import { Button } from 'antd';
import { openUploaderModal } from 'src/utils/modal';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

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

export const TEMPLATE_CONFIG = {

  /** 查询页面布局数据 URL */
  queryPageUrl: '/ipf/ipfPageLayout/getIpfPageLayout',

  /** 保存页面布局数据 URL */
  savePageUrl: '/ipf/templatePageLayout/batchSavePageLayoutData',

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
  pageIdKey: 'ipfCcmPageId',
  /** cellName 字段 */
  cellNameKey: 'cellName',
  /** 父 cellName 字段 */
  parentCellNameKey: 'parentCellName',
  /** layout ID 字段 */
  layoutIdKey: 'ipfCcmPageLayoutId',
  /** layout 上的子 element 字段 */
  childrenElementsKey: '__ipfCcmBoPgLoElements',
  /** element ID 字段 */
  elementIdKey: 'ipfCcmPgLoElementId',
  /** element 上的父 Layout 字段 */
  elementParentLayoutKey: 'cellName',
  /** layout 上的事件字段 */
  layoutEventsKey: 'ipfCcmControlEvents',
  /** layout 上的事件字段 (copy) */
  layoutEventsCopyKey: 'ipfCcmControlEvents',
  /** element 上的事件字段 */
  elementEventsKey: 'ipfCcmControlEventForEles',
  /** element 上的事件字段 (copy) */
  elementEventsCopyKey: 'ipfCcmControlEventForEles',
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
      label: '栅格名称',
      disabled: true,
    },
    {
      property: 'parentCellName',
      label: '父栅格',
      disabled: true,
    },
    {
      property: 'isParent',
      label: '是否父栅格',
      type: 'checkbox',
    },
    {
      property: 'layoutBoName',
      label: '数据源',
      type: 'select',
      dictName: '_Relations',
    },
    {
      property: 'unitCount',
      label: '包含栅格数',
      type: 'number',
    },
    {
      property: 'layoutContainerType',
      label: '页面布局容器类型',
      type: 'select',
      dictName: 'LayoutContainerType',
    },
    {
      property: 'layoutElementType',
      label: '页面布局元素类型',
      type: 'select',
      dictName: 'layoutElementType',
    },
    {
      property: 'conditionType',
      label: '查询条件类型',
      type: 'select',
      dictName: 'conditionType',
    },
    {
      property: 'styleClass',
      label: '样式名称',
      type: 'multiSelect',
      list: BUILT_IN_STYLE_CLASSES,
    },
    {
      property: 'style',
      label: '样式',
    },
    {
      property: 'formType',
      label: '表单类型',
      type: 'select',
      dictName: 'CellType',
    },
    {
      property: 'elementName',
      label: '布局元素名称',
    },
    {
      property: 'isLayoutDispSetting',
      label: '显示隐藏设置',
      type: 'checkbox',
    },
    {
      property: 'groupTitle',
      label: '分组标题',
    },
    {
      property: 'groupWidget',
      label: '分组控件',
      type: 'select',
      dictName: 'GroupWidget',
    },
    {
      property: 'isShowGroup',
      label: '显示分组',
      type: 'checkbox',
    },
    {
      property: 'groupMsgCode',
      label: '分组标题消息代码',
      // type: 'select',
      // render: (__: any, ___: any, callback: (opts: IFormItemOption) => void) => (
      //   <UiAssociate
      //     onChange={() => callback({ property: 'groupMsgCode' })}
      //   />
      // ),
    },
    {
      property: 'labelUnitCount',
      label: '标签栅格数',
      type: 'number',
    },
    {
      property: 'controlConnector',
      label: '连接符',
    },
    {
      property: 'height',
      label: '栅格高度',
      type: 'number',
      max: Infinity,
      min: 0,
      step: 1,
    },
    {
      property: 'isMainTabPanel',
      label: '是否主页签',
      type: 'checkbox',
    },
    {
      property: 'tabBuildType',
      label: '页签生成方式',
      type: 'select',
      dictName: 'tabBuildType',
    },
    {
      property: 'tabDataUrl',
      label: '页签URL',
    },
    {
      property: 'icon',
      label: '图标',
    },
    {
      property: 'treeName',
      label: '树名称',
    },
    {
      property: 'gridType',
      label: '表格类型',
      type: 'select',
      dictName: 'NewGridType',
    },
    {
      property: 'isAutoLoad',
      label: '自动查询',
      type: 'select',
      dictName: 'YesOrNo',
    },
    {
      property: 'gridEditType',
      label: '表格编辑类型',
      type: 'select',
      dictName: 'gridEditType',
    },
    {
      property: 'validationGroupName',
      label: '校验分组名称',
    },
    {
      property: 'seqNo',
      label: '顺序',
      type: 'number',
      disabled: true,
      min: 0,
      max: Infinity,
    },
    {
      property: 'pageLayoutAttr',
      label: '页面布局属性',
      type: 'textarea',
    },
  ] as IFormItemOption[],
  /** Element 属性表单配置 */
  elementPropertyFormOptions: [
    // {
    //   property: 'columnName',
    //   label: '标签文字',
    //   type: 'link',
    // },
    {
      property: 'fieldText',
      label: '显示文本',
    },
    {
      property: 'layoutElementType',
      label: '页面布局元素类型',
      type: 'select',
      dictName: 'layoutElementType2',
    },
    {
      property: 'layoutBoName',
      label: '布局元素业务对象名称',
    },
    {
      property: 'propertyName',
      label: '属性名',
    },
    {
      property: 'methodName',
      label: '方法名',
    },
    {
      property: 'queryType',
      label: '查询类型',
      type: 'select',
      dictName: 'queryType',
    },
    {
      property: 'isNotNull',
      label: '非空',
      type: 'checkbox',
    },
    {
      property: 'isReadOnly',
      label: '只读',
      type: 'checkbox',
    },
    {
      property: 'isShowLable',
      label: values => {
        if (isButton(values)) {
          return '主按钮';
        }
        return '显示标签';
      },
      type: 'checkbox',
    },
    {
      property: 'isVisible',
      label: '可见',
      type: 'checkbox',
    },
    {
      property: 'uiType',
      label: '控件类型',
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
      label: '搜索帮助名',
    },
    {
      property: 'refProName',
      label: '搜索帮助关联属性',
    },
    {
      property: 'dictTableName',
      label: '字典表',
    },
    {
      property: 'dictGroupValue',
      label: '字典分组值',
    },
    {
      property: 'uploadStrategy',
      label: '上传策略',
    },
    {
      property: 'controlWidth',
      label: '控件宽度',
      type: 'number',
      min: 0,
      max: Infinity,
    },
    {
      property: 'controlHeight',
      label: '控件高度',
      type: 'number',
      min: 0,
      max: Infinity,
    },
    {
      property: 'controlConnector',
      label: '连接符',
    },
    {
      property: 'correctType',
      label: '转换类型',
      type: 'select',
      dictName: 'correctType',
    },
    {
      property: 'initValueType',
      label: '初始值类型',
      type: 'select',
      dictName: 'initValueType',
    },
    {
      property: 'defaultValue',
      label: '默认值',
    },
    {
      property: 'isZeroFill',
      label: '自动补零',
      type: 'select',
      dictName: 'YesOrNo',
    },
    {
      property: 'layoutElementAttr#placeholder',
      label: '提示文本',
    },
    {
      property: 'isInline',
      label: '控件内联',
      type: 'checkbox',
    },
    {
      property: 'tabIndex',
      label: 'TAB顺序',
      type: 'number',
      min: 0,
      max: Infinity,
    },
    {
      property: 'lableStyle',
      label: 'Lable样式',
    },
    {
      property: 'operation',
      label: '操作符',
      type: 'select',
      dictName: 'SearchOperation',
    },
    {
      property: 'conditionType',
      label: '查询条件类型',
      type: 'select',
      dictName: 'conditionType',
    },
    {
      property: 'rangeType',
      label: '区间类型',
      type: 'select',
      dictName: 'rangeType',
    },
    // {
    //   property: 'columnStyle',
    //   label: '按钮样式',
    //   type: 'select',
    //   dictName: 'buttonStyle',
    // },
    {
      property: 'columnStyle',
      label: values => {
        if (isButton(values)) {
          return '按钮样式';
        }
        return '列样式';
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
      label: '多行文本数',
      type: 'number',
      min: 1,
      max: 100,
    },
    {
      property: 'elementName',
      label: '布局元素名称',
    },
    {
      property: 'seqNo',
      label: '顺序',
      type: 'number',
      disabled: true,
      min: 0,
      max: Infinity,
    },
    {
      property: 'formatExpress',
      label: '格式化表达式',
    },
    {
      property: 'isFocus',
      label: '获取焦点',
      type: 'checkbox',
    },
    {
      property: 'disabledExpree',
      label: '可编辑表达式',
    },
    {
      property: 'fieldCode',
      label: '静态值代码',
    },
    {
      property: 'fieldValue',
      label: '静态值',
    },
    {
      property: 'methodBoName',
      label: '关联方法对象',
    },
    // 按钮属性
    {
      property: 'showExpree',
      label: '可见表达式',
      showWhen: values => isButton(values),
    },
    {
      property: 'isRefreshParentBo',
      label: '刷新主表',
      type: 'checkbox',
      showWhen: values => isButton(values),
    },
    {
      property: 'hotkeyType',
      label: '快捷键',
      type: 'select',
      dictName: 'hotkeyType',
      showWhen: values => isButton(values),
    },
    {
      property: 'hotkeyValue',
      label: '键值',
      type: 'select',
      dictName: 'hotkeyValue',
      showWhen: values => isButton(values),
    },

    // 表格列
    {
      property: 'isCellEditable',
      label: '表格可编辑',
      type: 'checkbox',
      showWhen: values => isGridColumn(values),
    },
    {
      property: 'isSum',
      label: '汇总',
      type: 'checkbox',
      showWhen: values => isGridColumn(values),
    },
    {
      property: 'groupTotType',
      label: '分组统计类型',
      type: 'select',
      dictName: 'groupTotType',
      showWhen: values => isGridColumn(values),
    },
    {
      property: 'columnStyleExpress',
      label: '列样式表达式',
      showWhen: values => isGridColumn(values),
    },
    {
      property: 'isOrderBy',
      label: '排序',
      type: 'select',
      dictName: 'isOrderBy',
      showWhen: values => isGridColumn(values),
    },
    {
      property: 'sortOrder',
      label: '排序顺序',
      type: 'number',
      min: 0,
      max: Infinity,
      showWhen: values => isGridColumn(values),
    },
    {
      property: 'isDropFilter',
      label: '下拉筛选',
      type: 'checkbox',
      showWhen: values => isGridColumn(values),
    },
    {
      property: 'isShowSort',
      label: '显示排序',
      type: 'checkbox',
      showWhen: values => isGridColumn(values),
    },
    {
      property: 'unlockColumnExpress',
      label: '列解锁表达式',
      showWhen: values => isGridColumn(values),
    },
    {
      property: 'lockColumnExpress',
      label: '列锁定表达式',
      showWhen: values => isGridColumn(values),
    },

    // 通用
    {
      property: 'icon',
      label: '图标',
    },
    {
      property: 'staticContent',
      label: '静态内容',
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
      label: '页面元素属性',
      type: 'textarea',
    },
    {
      property: 'devider-1',
      type: 'devider',
      label: '测试属性',
    },
    {
      property: 'atValueType',
      type: 'select',
      label: '测试用例值类型',
      dictName: 'AutoTestValueType',
    },
    {
      property: 'atResultValue',
      label: '测试用例值',
    },
  ] as IFormItemOption[],

  /** Page 属性表单配置 */
  pagePropertyFormOptions: [
    {
      property: 'pageType',
      label: t(I18N_IDS.TEXT_PAGE_TYPE),
      type: 'select',
      dictName: 'PageType',
      disabled: true,
    },
    {
      property: 'pageName',
      label: t(I18N_IDS.TEXT_PAGE_NAME),
      disabled: true,
    },
    {
      property: 'description',
      label: t(I18N_IDS.TEXT_DESCRIPTION),
      disabled: true,
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
      groupTitle: '容器组件',
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
      groupTitle: '页面布局类型',
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
      groupTitle: '静态控件',
      listSource: [
        {
          source: createElement({
            uiType: '03',
            fieldText: '',
            staticContent: '',
          }),
          type: 'element',
          title: '图片',
          icon: 'icongl-image',
        },
        {
          source: createElement({
            uiType: '32',
            fieldText: '',
            staticContent: '',
          }),
          type: 'element',
          title: '按钮',
          icon: 'icongl-btn',
        },
        {
          source: createElement({
            uiType: '33',
            fieldText: '',
            staticContent: '',
          }),
          type: 'element',
          title: '静态文本',
          icon: 'icongl-static-text',
        },
        {
          source: createElement({
            uiType: '34',
            fieldText: '',
            staticContent: '',
          }),
          type: 'element',
          title: '图标',
          icon: 'icongl-icon',
        },
      ],
    },
    {
      groupTitle: '基础组件',
      listSource: [
        {
          source: createElement({
            layoutElementType: 'DYNA_COMB_QUERY',
          }),
          type: 'element',
          title: '组合查询',
          icon: 'icongl-group-search',
        },
        {
          source: createElement({
            layoutElementType: 'DYNA_MORE_QUERY',
          }),
          type: 'element',
          title: '更多查询条件（抽屉）',
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
          title: '按钮',
          icon: 'icongl-btn',
        },
        {
          source: createElement({
            uiType: '14',
            fieldText: '文本',
          }),
          type: 'element',
          title: '文本',
          icon: 'icongl-text',
        },
        {
          source: createElement({
            uiType: '01',
            fieldText: '文本框',
          }),
          type: 'element',
          title: '文本框',
          icon: 'icongl-text',
        },
        {
          source: createElement({
            uiType: '08',
            fieldText: '复选框',
          }),
          type: 'element',
          title: '复选框',
          icon: 'icongl-check-box',
        },
        {
          source: createElement({
            uiType: '06',
            fieldText: '下拉框',
          }),
          type: 'element',
          title: '下拉框',
          icon: 'icongl-drop-down',
        },
        {
          source: createElement({
            uiType: '15',
            fieldText: '多选下拉框',
          }),
          type: 'element',
          title: '多选下拉框',
          icon: 'icongl-many-select',
        },
        {
          source: createElement({
            uiType: '05',
            fieldText: '时间',
          }),
          type: 'element',
          title: '时间',
          icon: 'icongl-time',
        },
        {
          source: createElement({
            uiType: '04',
            fieldText: '日期',
          }),
          type: 'element',
          title: '日期',
          icon: 'icongl-date',
        },
        {
          source: createElement({
            uiType: '12',
            fieldText: '多行文本',
          }),
          type: 'element',
          title: '多行文本',
          icon: 'icongl-multiline-text',
        },
        {
          source: createElement({
            uiType: '11',
            fieldText: '联想控件',
          }),
          type: 'element',
          title: '联想控件',
          icon: 'icongl-associatio',
        },
        {
          source: createElement({
            uiType: '21',
            fieldText: '可输入联想控件',
          }),
          type: 'element',
          title: '可输入联想控件',
          icon: 'icongl-text-associatio',
        },
        {
          source: createElement({
            uiType: '16',
            fieldText: '多选联想控件',
          }),
          type: 'element',
          title: '多选联想控件',
          icon: 'icongl-many-association',
        },
        {
          source: createElement({
            uiType: '07',
            fieldText: '数字文本框',
          }),
          type: 'element',
          title: '数字文本框',
          icon: 'icongl-number-text',
        },
        {
          source: createElement({
            uiType: '19',
            fieldText: '复选框(Y/N)',
          }),
          type: 'element',
          title: '复选框(Y/N)',
          icon: 'icongl-check-box',
        },
        {
          source: createElement({
            uiType: '22',
            fieldText: '可过滤下拉框',
          }),
          type: 'element',
          title: '可过滤下拉框',
          icon: 'icongl-filte-drop',
        },
        {
          source: createElement({
            uiType: '35',
            fieldText: '单选筛选',
          }),
          type: 'element',
          title: '单选筛选',
          icon: 'icongl-single-select',
        },
        {
          source: createElement({
            uiType: '36',
            fieldText: '多选筛选',
          }),
          type: 'element',
          title: '多选筛选',
          icon: 'icongl-many-drop',
        },
        {
          source: createElement({
            uiType: '13',
            fieldText: '隐藏',
          }),
          type: 'element',
          title: '隐藏',
          icon: 'icongl-hide',
        },
        {
          source: createElement({
            uiType: '25',
            fieldText: '上传控件',
          }),
          type: 'element',
          title: '上传控件',
          icon: 'icongl-div',
        },
      ],
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
