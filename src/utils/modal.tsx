import * as React from 'react';
import * as _ from 'lodash';
import { UiTransferModal, TransferHandler, ITransferListProps } from 'src/ui/transferModal';
import { UiColumnList } from 'src/ui/columnList';
import { createElement, createLayout } from 'src/routes/Visualization/config';
import { createId, delay, propertiesFilter } from '.';
import { UiFormSettingsModal } from 'src/ui/formSettingsModal';
import { ICreateLayouttsModelOptions } from 'src/models/layoutsModel';
import { cellNameManager } from './cellName';
import { UiEditableListModal, EditableListHandler } from 'src/ui/editableListModal';
import { UiUploader, IUiUploaderState } from 'src/ui/uploaderModal';
import { IUiListSourceEditorModalState, UiListSourceEditorModal } from 'src/ui/listSourceEditor';
import { IDictItem } from 'src/models/appModel';
import { PROTOTYPE_CONFIG } from 'src/routes/Prototype/config';
import { UiTreeEditorModal, IUiTreeEditorModalState } from 'src/ui/treeEditorModal';
import { UiJumpByGridSettingsModal } from 'src/ui/jumpByGridSettingsModal';
import { UiDisabledExpreeModal } from 'src/ui/disabledExpreeModal';
import { UiImportLayoutsJsonModal } from 'src/ui/importLayoutsJsonModal';
import { UiElementCodeFormModal } from 'src/ui/ElementCodeForm';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';
import { UiLanguageMsgFormModal } from 'src/ui/LanguageMsgForm';

export const uploaderRef = React.createRef<UiUploader>();
export const transferModalRef = React.createRef<UiTransferModal>();
export const editableListModalRef = React.createRef<UiEditableListModal>();
export const formSettingsModalRef = React.createRef<any>();
export const listSourceEditorModalRef = React.createRef<UiListSourceEditorModal>();
export const treeEditorModalRef = React.createRef<UiTreeEditorModal>();
export const jumpByGridSettingsModal = React.createRef<UiJumpByGridSettingsModal>();
export const disabledExpreeModal = React.createRef<UiDisabledExpreeModal>();
export const importLayoutsJsonModal = React.createRef<UiImportLayoutsJsonModal>();
export const elementCodeFormModalRef = React.createRef<UiElementCodeFormModal>();
export const languageMsgFormModalRef = React.createRef<UiLanguageMsgFormModal>();

const propertyListProp = {
  keyProp: 'propertyName',
  filterProps: ['fieldText', 'propertyName'],
  displayFunc: (item: any) => {
    const isKey = item.isKey || item.keyFlag || item.uiType === '10';
    return `${item.fieldText}${isKey ? '【主键】' : ''}(${item.propertyName})`;
  },
};

/**
 * 打开表格快捷设置弹窗
 * @param options
 */
export const openGridSettingsModal = async (options: {
  config: any;
  layout: any;
  properties: any;
  methods: any;
  isPrototype?: boolean;
  onSubmit?: TransferHandler;
  showMethodSelect?: boolean;
}) => {

  const transferModal = transferModalRef.current;

  const leftListProps = options.isPrototype
    ? {
      keyProp: 'title',
      displayFunc: (item: any) => item.title,
    }
    : propertyListProp;

  const showMethodSelect = _.isUndefined(options.showMethodSelect) ? true : options.showMethodSelect;

  const rightListProps = {
    displayFunc: (item: any) => {
      let display = item.fieldText || item.columnName;
      if (item.isKey || item.keyFlag || item.uiType === '10') {
        display += '【主键】';
      }
      if (item.methodName) {
        display += ` [${item.methodName}]`;
      }
      if (item.propertyName) {
        display += ` (${item.propertyName})`;
      }
      return display;
    },
    checkboxProps: [
      { label: t(I18N_IDS.LABEL_IS_VISIBLE), property: 'isVisible' },
      { label: t(I18N_IDS.LABEL_IS_SHOW_SORT), property: 'isShowSort' },
    ],
  };

  const { config, layout, properties, methods } = options;
  const methodList = methods[layout.layoutBoName];
  const propertList = propertiesFilter(properties, layout);

  transferModal.open({
    leftListProps: {
      list: options.isPrototype
        ? PROTOTYPE_CONFIG.draggableItems_tools[3].listSource.slice(3)
        : [...propertList],
      selectOptions: showMethodSelect ? {
        list: methodList,
        keyProp: 'methodName',
        placeholder: `${t(I18N_IDS.TEXT_SELECT_METHOD)}...`,
        displayFunc: item => `${item.methodDesc}(${item.methodName})`,
      } : null,
      ...leftListProps,
    },
    rightListProps: {
      list: [...(layout[config.childrenElementsKey] || [])],
      keyProp: config.elementIdKey,
      ...rightListProps,
    },
    onMoveToLeft,
    onMoveToRight,
    onSubmit: options.onSubmit,
  });

  await delay(0);
  transferModal.do((leftList, rightList) => {
    updateDisabledItems(leftList, rightList);
    leftList.resetSelectValue();
  });

  /**
   * 更新禁用选项
   * @param leftList 左侧列表组件对象
   * @param rightList 右侧列表组件对象
   */
  async function updateDisabledItems(leftList: UiColumnList, rightList: UiColumnList) {
    if (options.isPrototype) {
      return;
    }
    await delay(0);
    const disabledItems = new Set<any>();
    const leftAllItems = leftList.state.list;
    const rightItems = rightList.state.sortedList;
    _.forEach(rightItems, item => {
      if (item.methodName) {
        return;
      }
      const disabledItem = _.find(leftAllItems, lItem => lItem.propertyName === item.propertyName);
      if (disabledItem) {
        disabledItems.add(disabledItem);
      }
    });
    leftList.setDisabledItems(disabledItems);
  }

  async function onMoveToLeft(leftList: UiColumnList, rightList: UiColumnList, list: any[]) {
    rightList.removeItems(list);
    updateDisabledItems(leftList, rightList);
  }

  async function onMoveToRight(leftList: UiColumnList, rightList: UiColumnList, list: any[]) {
    const selectedMethod = leftList.state.selectValue;
    const method = _.find(methodList, m => m.methodName === selectedMethod);
    const addItems = _.chain(list).map(item => {
      if (!selectedMethod && leftList.isDisabledItem(item)) {
        return null;
      }
      if (options.isPrototype) {
        return {
          fieldText: item.title,
          layoutElementType: 'ELEMENT',
          isVisible: 'X',
          isShowLable: 'X',
          uiType: _.get(item, 'source.uiType', '01'),
          [config.cellNameKey]: layout.cellName,
          [config.elementIdKey]: createId(),
        };
      }
      return createElement({
        layoutElementType: 'ELEMENT',
        layoutBoName: layout.layoutBoName,
        layoutBoViewName: layout.layoutBoViewName,
        layoutBoViewId: layout.layoutBoViewId,
        controlWidth: 150,
        isVisible: 'X',
        isShowSort: 'X',
        propertyName: item.propertyName,
        columnName: item.fieldText,
        fieldText: item.fieldText,
        dataElementCode: item.elementCode,
        dataElementText: item.fieldText,
        uiType: selectedMethod && (item.keyFlag || item.isKey) ? '10' : item.uiType,
        [config.cellNameKey]: layout.cellName,
        [config.elementIdKey]: createId(),
        methodName: selectedMethod,
        methodId: method && method.methodId,
      });
    }).filter(item => !!item).value();
    if (addItems.length) {
      rightList.addItems(addItems);
    }
    leftList.resetSelectValue();
    updateDisabledItems(leftList, rightList);
  }

};

/**
 * 打开按钮快捷配置弹窗
 * @param options
 */
export const openToolbarSettingsModal = async (options: {
  config: any;
  layout: any;
  childrenButtons: any[];
  properties: any;
  methods: any;
  showButtonGroupButton?: boolean;
  onSubmit?: TransferHandler;
}) => {

  const transferModal = transferModalRef.current;

  const leftListProps = {
    keyProp: 'methodName',
    filterProps: ['methodDesc', 'methodName'],
    displayFunc: (item: any) => `${item.methodDesc}(${item.methodName})`,
    buttonOptions: options.showButtonGroupButton ? {
      text: t(I18N_IDS.TEXT_ADD_BUTTON_GROUP),
      onClick: onClickButton,
    } : null,
  };

  const rightListProps = {
    displayFunc: (item: any) => {
      let display: string;
      if (item.layoutElementType === 'BUTTON_GROUP') {
        display = `${t(I18N_IDS.CONTROL_BUTTON_GROUP)}：`;
        if (item.__groupButtons && item.__groupButtons.length) {
          display += `【${_.map(item.__groupButtons, b => (b.fieldText || b.columnName)).join('、')}】`;
        } else {
          display += `【${t(I18N_IDS.TEXT_NOT_SETTING)}】`;
        }
        return display;
      }
      display = item.fieldText || item.columnName;
      if (item.methodName) {
        display += ` (${item.methodName})`;
      }
      return display;
    },
  };

  const { config, layout, methods, childrenButtons } = options;
  const methodList = methods[layout.layoutBoName] || [];

  transferModal.open({
    leftListProps: {
      list: [...methodList],
      ...leftListProps,
    },
    rightListProps: {
      list: [...childrenButtons],
      keyProp: config.elementIdKey,
      ...rightListProps,
    },
    onMoveToLeft,
    onMoveToRight,
    onSubmit: options.onSubmit,
  });

  await delay(0);
  transferModal.do((leftList, rightList) => {
    updateDisabledItems(leftList, rightList);
  });

  /**
   * 更新禁用选项
   * @param leftList 左侧列表组件对象
   * @param rightList 右侧列表组件对象
   */
  async function updateDisabledItems(leftList: UiColumnList, rightList: UiColumnList) {
    await delay(0);
    const disabledItems = new Set<any>();
    const leftAllItems = leftList.state.list;
    const rightItems = rightList.state.sortedList;
    _.forEach(rightItems, item => {
      if (item.__groupButtons) {
        _.forEach(item.__groupButtons, b => {
          disableItem(b);
        });
        return;
      }
      disableItem(item);
    });

    leftList.setDisabledItems(disabledItems);

    function disableItem(rItem: any) {
      const disabledItem = _.find(leftAllItems, lItem => lItem.methodName === rItem.methodName);
      if (disabledItem) {
        disabledItems.add(disabledItem);
      }
    }
  }

  async function onMoveToLeft(leftList: UiColumnList, rightList: UiColumnList, list: any[]) {
    rightList.removeItems(list);
    updateDisabledItems(leftList, rightList);
  }

  async function onMoveToRight(leftList: UiColumnList, rightList: UiColumnList, list: any[]) {
    const addItems = _.chain(list).map(item => {
      if (leftList.isDisabledItem(item)) {
        return null;
      }
      return createElement({
        layoutElementType: 'BUTTON',
        layoutBoName: layout.layoutBoName,
        layoutBoViewName: layout.layoutBoViewName,
        layoutBoViewId: layout.layoutBoViewId,
        isVisible: 'X',
        methodName: item.methodName,
        methodId: item.methodId,
        columnName: item.methodDesc,
        cellName: layout.cellName,
        [config.elementIdKey]: createId(),
      });
    }).filter(item => !!item).value();
    if (addItems.length) {
      rightList.addItems(addItems);
    }
    updateDisabledItems(leftList, rightList);
  }

  function onClickButton(e: React.MouseEvent) {
    transferModal.rightListRef.current.addItems([createElement({
      layoutElementType: 'BUTTON_GROUP',
      layoutBoName: layout.layoutBoName,
      layoutBoViewId: layout.layoutBoViewId,
      layoutBoViewName: layout.layoutBoViewName,
      isVisible: 'X',
      cellName: layout.cellName,
      [config.elementIdKey]: createId(),
    })]);
  }

};

export async function openFormSettingsModal(options: {
  layout: any;
  onSubmit?: TransferHandler;
  acceptCols?: number[];
  editable?: boolean;
  rangeTypeDicts?: IDictItem[];
}) {
  const formSettingsModal: UiFormSettingsModal = formSettingsModalRef.current.getWrappedInstance();
  const {
    layout,
    acceptCols,
    editable,
    rangeTypeDicts,
  } = options;

  console.log('[openFormSettingsModal]', options);
  formSettingsModal.open({
    listProp: _.assign(
      {
        selectOptions: rangeTypeDicts ? {
          list: rangeTypeDicts,
          keyProp: 'key',
          placeholder: `${t(I18N_IDS.TEXT_SELECT_RANGE_TYPE)}...`,
          displayFunc: (item: IDictItem) => `${item.value}`,
        } : null,
      },
      propertyListProp as ITransferListProps,
    ),
    layout,
    acceptCols,
    editable,
  });

}

/**
 * 打开表格快捷设置弹窗
 * @param options
 */
export const openFormQuickSettingsModal = async (options: {
  config: ICreateLayouttsModelOptions;
  layout: any;
  properties: any;
  isPrototype?: boolean;
  childrenLayouts: any;
  onSubmit?: TransferHandler;
}) => {

  const transferModal = transferModalRef.current;

  const leftListProps = options.isPrototype
    ? {
      keyProp: 'title',
      displayFunc: (item: any) => item.title,
    }
    : propertyListProp;

  const rightListProps = {
    displayFunc: (rowLayout: any) => {
      const elements: any[] = getRowElements(rowLayout);
      if (!elements.length) {
        return '[空]';
      }
      const fieldTextArr: string[] = _.map(elements, e => e.fieldText || e.columnName);
      const propertyNameArr: string[] = _.map(elements, e => e.propertyName);
      let propertyNameStr = propertyNameArr.join('/');
      if (propertyNameStr) {
        propertyNameStr = ` (${propertyNameStr})`;
      }
      return `${fieldTextArr.join('/')}${propertyNameStr}`;
    },
  };

  const { config, layout, properties } = options;
  const propertList = propertiesFilter(properties, layout);

  transferModal.open({
    leftListProps: {
      list: options.isPrototype
        ? PROTOTYPE_CONFIG.draggableItems_tools[3].listSource.slice(3)
        : [...propertList],
      ...leftListProps,
    },
    rightListProps: {
      list: options.childrenLayouts,
      keyProp: config.cellNameKey,
      ...rightListProps,
    },
    onMoveToLeft,
    onMoveToRight,
    onSubmit: options.onSubmit,
  });

  await delay(0);
  transferModal.do((leftList, rightList) => {
    updateDisabledItems(leftList, rightList);
  });

  function getRowElements(rowLayout: any) {
    const cols = rowLayout[config.tempChildrenLayoutsKey] || [];
    const elementsArr = _.map(cols, col => col[config.childrenElementsKey] || []);
    const elements = _.flatten(elementsArr);
    return elements;
  }

  /**
   * 更新禁用选项
   * @param leftList 左侧列表组件对象
   * @param rightList 右侧列表组件对象
   */
  async function updateDisabledItems(leftList: UiColumnList, rightList: UiColumnList) {
    if (options.isPrototype) {
      return;
    }
    await delay(0);
    const disabledItems = new Set<any>();
    const leftAllItems = leftList.state.list;
    const rightLayouts = rightList.state.sortedList;
    _.forEach(rightLayouts, rowLayout => {
      const elements = getRowElements(rowLayout);
      _.forEach(elements, e => {
        const disabledItem = _.find(leftAllItems, lItem => lItem.propertyName === e.propertyName);
        if (disabledItem) {
          disabledItems.add(disabledItem);
        }
      });
    });
    leftList.setDisabledItems(disabledItems);
  }

  async function onMoveToLeft(leftList: UiColumnList, rightList: UiColumnList, list: any[]) {
    rightList.removeItems(list);
    updateDisabledItems(leftList, rightList);
  }

  async function onMoveToRight(leftList: UiColumnList, rightList: UiColumnList, list: any[]) {
    const addItems = _.chain(list).map(item => {
      if (leftList.isDisabledItem(item)) {
        return null;
      }
      return createRow(item);
    })
      .compact()
      .value();
    if (addItems.length) {
      rightList.addItems(addItems);
    }
    updateDisabledItems(leftList, rightList);
  }

  /**
   * 根据属性创建一个 row 及 一个 col，col 下有一个对应属性的 element
   * @param property 属性定义
   */
  function createRow(property: any) {
    const parentCellName = layout[config.cellNameKey];
    const rowCellName = cellNameManager.create(`${parentCellName}`);
    const colCellName = cellNameManager.create(rowCellName);
    const row = createLayout({
      layoutContainerType: 'DIV',
      isParent: 'X',
      styleClass: 'row',
      [config.parentCellNameKey]: parentCellName,
      [config.cellNameKey]: rowCellName,
      [config.tempChildrenLayoutsKey]: [
        createLayout({
          layoutContainerType: 'DIV',
          isParent: '',
          unitCount: 12,
          [config.parentCellNameKey]: rowCellName,
          [config.cellNameKey]: colCellName,
          [config.childrenElementsKey]: [
            options.isPrototype
              ? {
                fieldText: property.title,
                uiType: _.get(property, 'source.uiType', '01'),
              }
              : {
                layoutBoName: layout.layoutBoName,
                propertyName: property.propertyName,
                columnName: property.fieldText,
                uiType: property.uiType || '01',
                conditionType: layout.conditionType,
              },
          ],
        }),
      ],
    });
    return row;
  }

};

/**
 * 打开按钮快捷配置弹窗（原型）
 * @param options
 */
export const openPrototypeToolbarSettingsModal = async (options: {
  config: any;
  layout: any;
  childrenButtons: any[];
  showButtonGroupButton: boolean;
  onSubmit?: EditableListHandler;
}) => {

  const editableListModal = editableListModalRef.current;
  const { config, childrenButtons, layout } = options;

  const rightListProps = {
    displayFunc: (item: any) => {
      let display: string;
      if (item.layoutElementType === 'BUTTON_GROUP') {
        display = `${t(I18N_IDS.CONTROL_BUTTON_GROUP)}：`;
        if (item.__groupButtons && item.__groupButtons.length) {
          display += `【${_.map(item.__groupButtons, b => (b.fieldText || b.columnName)).join('、')}】`;
        } else {
          display += `【${t(I18N_IDS.TEXT_NOT_SETTING)}】`;
        }
        return display;
      }
      display = item.fieldText || item.columnName;
      return display;
    },
    buttonOptions: (() => {
      const opts = [
        {
          text: t(I18N_IDS.TEXT_ADD_BUTTON),
          onClick: () => {
            editableListModal.listRef.current.addItems([createElement({
              layoutElementType: 'BUTTON',
              layoutBoName: layout.layoutBoName,
              isVisible: 'X',
              cellName: layout.cellName,
              fieldText: t(I18N_IDS.CONTROL_BUTTON),
              dataSourceId: layout.dataSourceId,
              [config.elementIdKey]: createId(),
            })]);
          },
        },
      ];
      if (options.showButtonGroupButton) {
        opts.push(
          {
            text: t(I18N_IDS.TEXT_ADD_BUTTON_GROUP),
            onClick: () => {
              editableListModal.listRef.current.addItems([createElement({
                layoutElementType: 'BUTTON_GROUP',
                layoutBoName: layout.layoutBoName,
                isVisible: 'X',
                cellName: layout.cellName,
                dataSourceId: layout.dataSourceId,
                [config.elementIdKey]: createId(),
              })]);
            },
          },
        );
      }
      return opts;
    })(),
  };

  editableListModal.open({
    listProps: {
      list: [...childrenButtons],
      keyProp: config.elementIdKey,
      editProp: 'fieldText',
      canEdit: (item) => item && item.layoutElementType !== 'BUTTON_GROUP',
      ...rightListProps,
    },
    onSubmit: options.onSubmit,
  });
};

/**
 * 打开表格快捷配置弹窗（原型）
 * @param options
 */
export const openPrototypeGridSettingsModal = async (options: {
  config: any;
  layout: any;
  gridColumns: any[];
  onSubmit?: EditableListHandler;
}) => {

  const editableListModal = editableListModalRef.current;
  const { config, gridColumns, layout } = options;

  const rightListProps = {
    displayFunc: (item: any) => {
      return item.fieldText || item.columnName;
    },
    buttonOptions: [
      {
        text: t(I18N_IDS.TEXT_ADD_TABLE_COLUMN),
        onClick: () => {
          editableListModal.listRef.current.addItems([createElement({
            layoutElementType: 'ELEMENT',
            layoutBoName: layout.layoutBoName,
            controlWidth: 150,
            isVisible: 'X',
            isShowSort: 'X',
            fieldText: t(I18N_IDS.TEXT_TABLE_COLUMN),
            uiType: '01',
            dataSourceId: layout.dataSourceId,
            [config.cellNameKey]: layout.cellName,
            [config.elementIdKey]: createId(),
          })]);
        },
      },
    ],

  };

  editableListModal.open({
    listProps: {
      list: [...gridColumns],
      keyProp: config.elementIdKey,
      editProp: 'fieldText',
      ...rightListProps,
    },
    onSubmit: options.onSubmit,
  });
};

export function openUploaderModal(options: IUiUploaderState) {
  const uploaderModal = uploaderRef.current;
  uploaderModal.open(options);
}

export function openListSourceEditor(options?: IUiListSourceEditorModalState) {
  const listSourceEditor = listSourceEditorModalRef.current;
  listSourceEditor.open(options);
}

/**
 * 打开树数据配置
 */
export async function openTreeEditorModal(options: IUiTreeEditorModalState) {
  const treeEditorModal = treeEditorModalRef.current;
  treeEditorModal.open(options);
}

/**
 * 打开原形页面跳转规则配置
 */
export async function openJumpByGridSettingsModal() {
  const modal: UiJumpByGridSettingsModal = jumpByGridSettingsModal.current['wrappedInstance'];
  modal.open();
}

/**
 * 打开原形页面原型只读条件配置
 */
export async function openDisabledExpreeModal(target: any, targetType: string) {
  const modal: UiDisabledExpreeModal = disabledExpreeModal.current['wrappedInstance'];
  modal.open(target, targetType);
}

/**
 * 打开导入布局配置
 */
export async function openImportLayoutsJsonModal() {
  const modal: UiImportLayoutsJsonModal = importLayoutsJsonModal.current['wrappedInstance'];
  modal.open();
}

/**
 * 打开数据元素弹窗
 */
export function openElementCodeFormModal(options?: {
  title?: string;
  formData?: any;
  submitText?: string;
  editType: 'edit' | 'add';
  onSubmit?(data: any, editType: string): any;
}) {
  const modal: UiElementCodeFormModal = elementCodeFormModalRef.current['wrappedInstance'];
  modal.open(options);
}

/**
 * 关闭数据元素弹窗
 */
export function closeElementCodeFormModal() {
  const modal: UiElementCodeFormModal = elementCodeFormModalRef.current['wrappedInstance'];
  modal.close();
}

/**
 * 打开国际化消息弹窗
 */
export function openLanguageMsgFormModal(options?: {
  formData?: any;
  editType: 'edit' | 'add';
  onSubmit?(data: any, editType: string): any;
}) {
  const modal: UiLanguageMsgFormModal = languageMsgFormModalRef.current['wrappedInstance'];
  modal.open(options);
}

/**
 * 关闭国际化消息弹窗
 */
export function closeLanguageMsgFormModal() {
  const modal: UiLanguageMsgFormModal = languageMsgFormModalRef.current['wrappedInstance'];
  modal.close();
}
