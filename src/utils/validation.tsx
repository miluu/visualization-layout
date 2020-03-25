import { transformUiType, needBinding } from '.';
// import { UiLink } from 'src/ui/link';
import * as React from 'react';
import * as _ from 'lodash';
import { ICreateLayouttsModelOptions } from 'src/models/layoutsModel';

export interface IValidResult {
  element?: any;
  layout?: any;
  valid: boolean;
  messages: React.ReactNode[];
}

// --------- 可视化原型校验 --------------

/** 可视化原型校验 */
export function validLayouts(layouts: any[], config: any): IValidResult[] {
  const {
    elementIdKey,
    cellNameKey,
    childrenElementsKey,
  } = config;
  let results: IValidResult[]  = [];
  _.forEach(layouts, l => {
    results.push(validGrid(l, cellNameKey));
    results.push(validGroup(l, cellNameKey));
    results.push(validTab(l, cellNameKey));
    _.forEach(l[childrenElementsKey], e => {
      results.push(validBaseControl(e, elementIdKey));
    });
  });
  results = _.filter(results, r => !r.valid);
  return results;
}

/**
 * 校验基础控件: 显示文本\控件类型(按钮不可用)\页面布局元素类型 不能为空
 * @param {any} element
 * @param {string} elementIdKey
 * @returns {IValidResult}
 */
export function validBaseControl(element: any, elementIdKey: string): IValidResult {
  const {
    uiType,
    layoutElementType,
    fieldText,
  } = element;
  // const id = element[elementIdKey];
  const uiTypeDes = transformUiType(uiType);
  const result: IValidResult = {
    element,
    valid: true,
    messages: [],
  };
  if (!(
    uiTypeDes === 'static'
    || layoutElementType === 'DYNA_COMB_QUERY'
    || layoutElementType === 'DYNA_MORE_QUERY'
    || layoutElementType === 'BUTTON_GROUP'
  ) && !fieldText) {
    result.valid = false;
    result.messages.push('控件 的显示文本不能为空。');
  }
  if (!(
    layoutElementType === 'DYNA_COMB_QUERY'
    || layoutElementType === 'DYNA_MORE_QUERY'
    || layoutElementType === 'BUTTON_GROUP'
    || layoutElementType === 'BUTTON'
  ) && !uiType) {
    result.valid = false;
    result.messages.push(`控件 [${fieldText}] 的控件类型为空。`);
  }
  if (!layoutElementType) {
    result.valid = false;
    result.messages.push(`控件 [${fieldText}] 的页面布局元素类型为空`);
  }
  return result;
}

/**
 * 验证表格
 */
export function validGrid(layout: any, cellNameKey: string): IValidResult {
  const result: IValidResult = {
    layout,
    valid: true,
    messages: [],
  };
  const cellName = layout[cellNameKey];
  const {
    layoutElementType,
    layoutContainerType,
  } = layout;
  if (
    layoutElementType === 'GRID'
    && !layoutContainerType
  ) {
    result.valid = false;
    result.messages.push(`表格 [${cellName}] 的页面布局容器类型为空。`);
  }
  return result;
}

/**
 * 验证TAB
 */
export function validTab(layout: any, cellNameKey: string): IValidResult {
  const result: IValidResult = {
    layout,
    valid: true,
    messages: [],
  };
  const cellName = layout[cellNameKey];
  const {
    layoutContainerType,
    groupTitle,
  } = layout;
  if (
    layoutContainerType === 'TAB'
    && !groupTitle
  ) {
    result.valid = false;
    result.messages.push(`TAB [${cellName}]  的分组标题为空。`);
  }
  return result;
}

/**
 * 验证 GROUP
 */
export function validGroup(layout: any, cellNameKey: string): IValidResult {
  const result: IValidResult = {
    layout,
    valid: true,
    messages: [],
  };
  const cellName = layout[cellNameKey];
  const {
    layoutContainerType,
    groupTitle,
  } = layout;
  if (
    layoutContainerType === 'GROUP'
    && !groupTitle
  ) {
    result.valid = false;
    result.messages.push(`GROUP [${cellName}]  的分组标题为空。`);
  }
  return result;
}

interface IValidOption {
  method: boolean;
  property: boolean;
}
// --------- 绑定数据源校验 --------------
export function validDataSourceBindingLayouts(layouts: any[], config: ICreateLayouttsModelOptions, option?: IValidOption): IValidResult[] {
  const { childrenElementsKey } = config;
  const results: IValidResult[] = [];
  _.forEach(layouts, l => {
    const result = validLayoutBoName(l, config);
    if (!result.valid) {
      results.push(result);
    }
    _.forEach(l[childrenElementsKey], e => {
      const resultElement = validElementBinding(e, config, option);
      if (!resultElement.valid) {
        results.push(resultElement);
      }
    });
  });
  return results;
}

export function validLayoutBoName(layout: any, config: ICreateLayouttsModelOptions): IValidResult {
  const result: IValidResult = {
    layout,
    valid: true,
    messages: [],
  };
  if (layout.layoutElementType && !layout.layoutBoName) {
    result.valid = false;
    result.messages.push(`[${layout[config.cellNameKey]}] ${layout.layoutElementType} 布局元素业务对象名称不能为空。`);
  }
  return result;
}

export function validElementBinding(element: any, config: ICreateLayouttsModelOptions, option: IValidOption = { method: true, property: true }): IValidResult {
  const result: IValidResult = {
    element,
    valid: true,
    messages: [],
  };

  const bindingType = needBinding(element);
  switch (bindingType) {
    case 'method':
      if (!option.method) {
        break;
      }
      if (!element.methodName) {
        result.valid = false;
        result.messages.push(`[${element.fieldText || element.columnName}] 未绑定方法。`);
      }
      break;
    case 'property':
      if (!option.property) {
        break;
      }
      if (!element.propertyName) {
        result.valid = false;
        result.messages.push(`[${element.fieldText || element.columnName}]未绑定属性。`);
      }
      break;
    default:
      break;
  }

  return result;
}
