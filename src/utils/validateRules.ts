import * as _ from 'lodash';
import { ValidationRule } from 'antd/lib/form';
import { httpPost } from 'src/services';
import { WrappedFormUtils } from 'antd/lib/form/Form';

export function createRequireRule({ label }: { label: string }): ValidationRule {
  return {
    required: true,
    message: `【${label}】不能为空。`,
  };
}

export function createRichLengthRule({
  label,
  max,
  min,
}: {
  label: string;
  max?: number;
  min?: number;
}): ValidationRule {
  return {
    validator(rule: any, value: string, callback: (message?: string) => void) {
      if (!value) {
        callback();
      }
      const length = getRichLength(value);
      if (!_.isUndefined(min) && length < min) {
        callback(`【${label}】长度必须大于等于${min}。`);
        return;
      }
      if (!_.isUndefined(max) && length > max) {
        callback(`【${label}】长度必须小于等于${max}。`);
        return;
      }
      callback();
    },
  };
}

function getRichLength(value: string = '', chineseWidth = 3) {
  let len = 0;
  for (let i = 0; i < value.length; i++) {
    if (value.charCodeAt(i) > 255) {
      len += chineseWidth;
    } else {
      len++;
    }
  }
  return len;
}

export function createEnUcNumUlStringRule({ label }: { label: string }): ValidationRule {
  return {
    validator(rule: any, value: string, callback: (message?: string) => void) {
      const message = `【${label}】由大写英文、下划线、数字组成。`;
      if (!value) {
        return callback();
      }
      const obj = value.split('');
      for (let i = 0; i < obj.length; i++) {
        if (i === 0) {
          if (!/[A-Z]/.test(obj[i])) {
            return callback(message);
          }
        } else {
          if (!/[A-Z0-9_]/.test(obj[i])) {
            return callback(message);
          }
          if (/[\s]/.test(obj[i])) {
            return callback(message);
          }
        }
      }
      return callback();
    },
  };
}

export function createUniqGlRules({ label, boName, entityName, fields, form }: {
  label: string;
  boName: string;
  entityName: string;
  fields: string[];
  form: WrappedFormUtils;
  property?: string;
}) {
  const message = `【${label}】必须唯一。`;
  return {
    async validator(rule: any, value: string, callback: (message?: string) => void) {
      let result;
      if (!value) {
        callback();
      }
      try {
        result = await httpPost('/ipf/validation/uniqueGl', {
          boName,
          configItemCode: '',
          entityName,
          fieldNames: _.map(fields, f => `${_.camelCase(boName)}.${f}`),
          fieldValues: _.map(fields, f => form.getFieldValue(f) || ''),
          pkValue: '',
          version: true,
        });
      } catch (e) {
        callback(message);
      }
      if (result?.success) {
        callback();
      }
      callback(message);
    },
  };
}
