import * as _ from 'lodash';
import { IFormItemOption } from './forms';

export function createValues(opts: IFormItemOption[], originValues: any, isGridColumn = false, isInReference = false): any {
  if (!originValues) {
    return null;
  }
  const values: any = {};
  if (isGridColumn) {
    values.__isGridColumn = true;
  }
  if (isInReference) {
    values.__isInReference = true;
  }
  _.forEach(opts, opt => {
    const { property } = opt;
    if (!_.includes(property, '#')) {
      values[property] = transformInputValue(originValues[property], opt);
    } else {
      try {
        const paths = property.split('#');
        const propertyValue = originValues[paths[0]];
        const valueObj = propertyValue ? JSON.parse(propertyValue) || {} : {};
        const fieldValue = valueObj[paths[1]];
        values[property] = fieldValue;
      } catch (e) {
        console.warn('[createValues]', e);
        values[property] = null;
      }
    }
  });
  return values;
}

export function transformInputValue(value: any, opt: IFormItemOption) {
  const { type } = opt;
  let { inputTransform } = opt;
  if (!inputTransform) {
    switch (type) {
      case 'checkbox':
        inputTransform = checkboxInputTransform;
        break;
      case 'multiSelect':
        inputTransform = multiSelectInputTransform;
        break;
      default:
        inputTransform = defaultInputTransform;
        break;
    }
  }
  return inputTransform(value);
}

export function transformOutputValue(value: any, opt: IFormItemOption) {
  const { type } = opt;
  let { inputTransform } = opt;
  if (!inputTransform) {
    switch (type) {
      case 'checkbox':
        inputTransform = checkboxOutputTransform;
        break;
      case 'number':
        inputTransform = numberOutputTransform;
        break;
      case 'multiSelect':
        inputTransform = multiSelectOutputTransform;
        break;
      default:
        inputTransform = defaultOutputTransform;
        break;
    }
  }
  return inputTransform(value);
}

export function defaultInputTransform(input: any): any {
  if (input === null) {
    return undefined;
  }
  return input;
}

export function defaultOutputTransform(input: any): any {
  if (input === undefined) {
    return null;
  }
  if (typeof input === 'string') {
    return _.trim(input);
  }
  return input;
}

export function checkboxInputTransform(input: string): boolean {
  if (typeof input === 'boolean') {
    return input;
  }
  switch (input) {
    case 'X':
      return true;
    default:
      return false;
  }
}

export function checkboxOutputTransform(input: boolean): string {
  if (typeof input === 'string') {
    return input;
  }
  switch (input) {
    case true:
      return 'X';
    default:
      return '';
  }
}

export function numberOutputTransform(input: string | number): number {
  if (typeof input === 'number') {
    return input;
  }
  let n = parseFloat(input);
  if (!n && n !== 0) {
    n = null;
  }
  return n;
}

export function multiSelectInputTransform(input: string): string[] {
  const _input = _.trim(input);
  if (!_input) {
    return [];
  }
  return _.split(input, /\s+/);
}

export function multiSelectOutputTransform(input: string[]): string {
  return _.join(input, ' ');
}
