import * as React from 'react';
import * as _ from 'lodash';
import {
  Input,
  InputNumber,
  Select,
  Checkbox,
  Form,
} from 'antd';
import { IDictsMap } from 'src/models/appModel';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { Dispatch, AnyAction } from 'redux';
import { DROPDOWN_ALIGN_PROPS } from 'src/config';
import { IAssociateColumn, IQueryOptions, IQueryResult, UiAssociate } from 'src/ui/associate';
import { IPropertiesMap, IMehtodsMap } from 'src/models/layoutsModel';

const { TextArea } = Input;
const { Option } = Select;
const FormItem = Form.Item;

export const WrappedInput = onChangeWrap(Input);
export const WrappedInputNumber = onChangeWrap(InputNumber, true);
export const WrappedTextArea = onChangeWrap(TextArea, false, false);

export interface IFormItemOption {
  /** 标签文字 */
  label?: string | ((values: any) => string);
  /** 属性名 */
  property?: string;
  /** 控件类型 */
  type?: string | ((values: any) => string);
  /** 是否隐藏 */
  hidden?: boolean;
  /** 自定义渲染控件 */
  render?: (
    opts?: IFormItemOption,
    values?: any,
    callback?: (opts?: IFormItemOption | IFormItemOption[], value?: any, forceChange?: boolean, actions?: AnyAction[]) => void,
    dispatch?: Dispatch<AnyAction>,
  ) => React.ReactNode;
  extra?: (
    opts?: IFormItemOption,
    values?: any, callback?: (opts?: IFormItemOption, value?: any, forceChange?: boolean) => void,
    dicts?: IDictsMap, dispatch?: Dispatch<AnyAction>,
  ) => React.ReactNode;
  /** 是否禁用 */
  disabled?: boolean;
  disabledWhen?: (options: any) => boolean;
  /** 下拉列表 */
  list?: any[];
  /** 字典表名称 */
  dictName?: string | ((values: any) => string);
  /** 下拉框可搜索 */
  filterable?: boolean;
  /** 控件值输入转换 */
  inputTransform?: (value: any) => any;
  /** 控件值输出转换 */
  outputTransform?: (value: any) => any;
  /** 数字最大值 */
  max?: number;
  /** 数字最小值 */
  min?: number;
  /** 数字步长 */
  step?: number;
  /** 数字小数位数 */
  precision?: number;
  /** 满足条件时才显示 */
  showWhen?: (values: any) => boolean;
  /** change 时同步更新其它字段 */
  changeExt?: (values: any) => any;
  placeholder?: string;
  // 联想控件
  refProperty?: string;
  otherRefProperties?: string[];
  otherRefPropertiesPair?: string[][];
  valueProp?: string;
  labelProp?: string;
  uniqueKeys?: string[];
  uniqueProps?: string[];
  columns?: IAssociateColumn[];
  queryMethod?: (options: IQueryOptions) => Promise<IQueryResult>;
  queryMethodCreator?: (options: any) => (options: IQueryOptions) => Promise<IQueryResult>;
  [key: string]: any;
}

export type OnChangeCallback = (item?: IFormItemOption, value?: any, forceChange?: boolean) => any;

/**
 * 对输入控件进行包装，只在离开焦点或按下回车键时触发 onChange 事件，onChange 事件的参数设置为控件值
 * @param WrappedComponent 待包装的组件
 * @param changeEventIsValue onChagne 事件的参数是否为控件值
 * @param listenEnterKey 是否监听回车键
 */
export function onChangeWrap<P>(WrappedComponent: React.ComponentClass<P>, changeEventIsValue = false, listenEnterKey = true) {
  return class Wrapped extends React.Component<P> {

    static getDerivedStateFromProps(nextProps: P, prevState: any) {
      if ('value' in nextProps) {
        const obj = {
          _value: nextProps['value'],
        };
        if (obj._value !== prevState['_value']) {
          obj['value'] = obj._value;
        }
        return obj;
      }
      return null;
    }

    constructor(props: P) {
      super(props);
      this.state = {
        value: null,
      };
    }

    render() {
      console.log('[onChangeWrap#render]');
      return (
        <WrappedComponent
          {...this.props}
          {...{
            value: this.state['value'],
            onChange: this._onChange,
            onBlur: () => this._triggerChange(this.state['value']),
            onKeyDown: this._onKeyDown,
          }}
        />
      );
    }

    private _onChange = (e: React.ChangeEvent | any) => {
      const value = (changeEventIsValue) ? e : e.target['value'];
      this.setState({
        value,
      });
    }

    private _onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!listenEnterKey) {
        return;
      }
      if (e.key === 'Enter') {
        this._triggerChange(this.state['value']);
      }
    }

    private _triggerChange = (value: any) => {
      this.props['onChange'](value);
    }
  };
}

export function renderControl({
  item,
  values,
  dicts,
  urlParams,
  onChangeCallback,
  dispatch,
  propertiesMap,
  methodsMap,
  info,
}: IRenderFormItemOptions) {
  let _item = item;
  if (values && values.__isInReference) {
    _item = _.assign({}, item, {
      disabled: true,
    });
  }
  if (_item.render) {
    return _item.render(_item, values, onChangeCallback, dispatch);
  }
  const type = _.isFunction(_item.type)
    ? _item.type(values)
    : _item.type;
  switch (type) {
    case 'text':
      return renderText(_item, values);
    case 'link':
      return renderLink(_item, values);
    case 'number':
      return renderNumberInput(_item, info, onChangeCallback);
    case 'select':
      return renderSelect(_item, dicts, info, values, onChangeCallback);
    case 'textarea':
      return renderTextarea(_item, info, onChangeCallback);
    case 'checkbox':
      return renderCheckbox(_item, info, onChangeCallback);
    case 'multiSelect':
      return renderMultiSelect(_item, dicts, info, values, onChangeCallback);
    case 'associate':
      return renderAssociate(_item, values, info, urlParams, propertiesMap, methodsMap, onChangeCallback);
    default:
      return renderInput(_item, info, onChangeCallback);
  }
}

interface IRenderFormItemOptions {
  form?: WrappedFormUtils;
  item?: IFormItemOption;
  values?: any;
  dicts?: IDictsMap;
  propertiesMap?: IPropertiesMap;
  methodsMap?: IMehtodsMap;
  urlParams?: any;
  onChangeCallback?: OnChangeCallback;
  dispatch?: Dispatch<AnyAction>;
  info?: any;
}

export function renderFormItem({
  form,
  item,
  values,
  dicts,
  urlParams,
  propertiesMap,
  methodsMap,
  onChangeCallback,
  dispatch,
  info,
}: IRenderFormItemOptions) {
  const { getFieldDecorator } = form;
  if (item.showWhen && !item.showWhen(values)) {
    return null;
  }
  const label = _.isFunction(item.label)
    ? item.label(values)
    : item.label;

  if (item.type === 'devider') {
    return (
      <div key={item.property} className="editor-form-devider">
        <span>{item.label}</span>
      </div>
    );
  }

  return (
    <FormItem
      key={item.key || item.property}
      label={label}
      colon={false}
      style={item.hidden ? { display: 'none' } : null}
    >
      {getFieldDecorator(item.property, {
        initialValue: _.get(values, item.property),
        valuePropName: item.type === 'checkbox' ? 'checked' : 'value',
      })(
        renderControl({
          item,
          values,
          dicts,
          urlParams,
          onChangeCallback,
          dispatch,
          info,
          propertiesMap,
          methodsMap,
        }),
      )}
      {
        item.extra ? item.extra(item, values, onChangeCallback, dicts, dispatch) : null
      }
    </FormItem>
  );
}

export function renderInput(item: IFormItemOption, info: any, onChangeCallback: OnChangeCallback) {
  return <WrappedInput
    disabled={getDisabledValue({ options: item, info })}
    size="small"
    placeholder={item.placeholder}
    onChange={(value: any) => onChangeCallback(item, value)}
  />;
}

export function renderCheckbox(item: IFormItemOption, info: any, onChangeCallback: OnChangeCallback) {
  return (
    <Checkbox
      disabled={getDisabledValue({ options: item, info })}
      onChange={() => onChangeCallback(item)}
    />
  );
}

export function renderTextarea(item: IFormItemOption, info: any, onChangeCallback: OnChangeCallback) {
  return <WrappedTextArea
    disabled={getDisabledValue({ options: item, info })}
    autoSize={{ minRows: 2, maxRows: 10 }}
    onChange={value => onChangeCallback(item, value)}
    placeholder={item.placeholder}
  />;
}

export function renderSelect(item: IFormItemOption, dicts: IDictsMap, info: any, values: any, onChangeCallback: OnChangeCallback) {
  const list = item.list || dicts[getDictName(item.dictName, values)];
  const filterProps = item.filterable ? {
    showSearch: true,
    filterOption: (input: string, option: React.ReactElement) =>
    (option.props.children as string).toLowerCase().indexOf(input.toLowerCase()) >= 0,
  } : {};
  return (
    <Select
      disabled={getDisabledValue({ options: item, info })}
      size="small"
      allowClear
      {...filterProps}
      onChange={(value: any) => {
        const items = [item];
        const _values = [value];
        let force = false;
        if (item.otherRefPropertiesPair?.length) {
          force = true;
          const selectItem = _.find(list, listItem => listItem.key === value) || {};
          console.log('...... selectItem', selectItem);
          items.push(
            ..._.map(item.otherRefPropertiesPair, pair => {
              return {
                property: pair[0],
              };
            }),
          );
          _values.push(
            ..._.map(item.otherRefPropertiesPair, pair => {
              return selectItem?.data?.[pair[1]] || null;
            }),
          );
        }
        onChangeCallback(items, _values, force);
      }}
      placeholder={item.placeholder}
      {...DROPDOWN_ALIGN_PROPS}
    >
        {_.map((list), listItem => (
          <Option title={listItem.value} key={listItem.key} value={listItem.key}>
            {listItem.value}
          </Option>
        ))}
    </Select>
  );
}

export function renderAssociate(item: IFormItemOption, values: any, urlParams: any, info: any, propertiesMap: IPropertiesMap, methodsMap: IMehtodsMap, onChangeCallback: OnChangeCallback) {
  const {
    property,
    refProperty,
    otherRefProperties,
    valueProp,
    labelProp,
    columns,
    queryMethod,
    queryMethodCreator,
    uniqueKeys,
    uniqueProps,
    otherRefPropertiesPair = [],
  } = item;
  const inputValue = uniqueProps
    ? _.chain(uniqueProps).map(prop => _.get(values, prop)).compact().join('|').value()
    : _.get(values, property);
  return (
    <>
      <UiAssociate
        disabled={getDisabledValue({ options: item, info })}
        value={inputValue}
        valueProp={valueProp}
        labelProp={labelProp}
        uniqueKeys={uniqueKeys}
        columns={columns}
        queryMethod={queryMethod || queryMethodCreator({
          urlParams,
          values,
          propertiesMap,
          methodsMap,
        })}
        labelInit={_.get(values, refProperty)}
        valueInit={_.get(values, valueProp)}
        onChange={(v, o) => {
          console.log('......', v, o);
          onChangeCallback([item, {
            property: item.refProperty,
          }, ...(otherRefProperties ?? []).map(p => ({ property: p })), ...otherRefPropertiesPair.map(pair => ({ property: pair[0] }))],
            [
              v || null,
              _.get(o, labelProp, null),
              ...(otherRefProperties ?? []).map(__ => _.get(o, labelProp, null)),
              ...otherRefPropertiesPair.map(pair => (_.get(o, pair[1], null))),
            ],
          true);
        }}
      />
    </>
  );
}

export function renderNumberInput(item: IFormItemOption, info: any, onChangeCallback: OnChangeCallback) {
  return (
    <WrappedInputNumber
      disabled={getDisabledValue({ options: item, info })}
      size="small"
      max={item.max || 12}
      min={item.min || 0}
      step={item.step || 1}
      precision={item.precision || 0}
      width="100%"
      placeholder={item.placeholder}
      onChange={v => onChangeCallback(item, v)}
    />
  );
}

export function renderText(item: IFormItemOption, values: any) {
  return <span className="ant-form-text">{_.get(values, item.property)}</span>;
}

export function renderLink(item: IFormItemOption, values: any) {
  return <a href="javascript:void(0)" className="ant-form-text">{_.get(values, item.property)}</a>;
}

export function renderMultiSelect(item: IFormItemOption, dicts: IDictsMap, info: any, values: any, onChangeCallback: OnChangeCallback) {
  return (
    <Select
      mode="tags"
      tokenSeparators={[' ']}
      onChange={() => onChangeCallback(item)}
      placeholder={item.placeholder}
      {...DROPDOWN_ALIGN_PROPS}
      disabled={getDisabledValue({ options: item, info })}
    >
      {_.map((item.list || dicts[getDictName(item.dictName, values)]), listItem => {
        let key: string;
        let value: string;
        if (_.isString(listItem)) {
          key = listItem;
          value = listItem;
        } else {
          key = listItem.key;
          value = listItem.value;
        }
        return (
          <Option key={key} value={key}>
            {value}
          </Option>
        );
      })}
    </Select>
  );
}

function getDisabledValue({ options, values, info }: { options?: any, values?: any, info?: any }) {
  if (options.disabledWhen) {
    return options.disabledWhen({ values, info, options });
  }
  return options.disabled;
}

function getDictName(input: string | ((values: any) => string), values: any): string {
  if (_.isString(input)) {
    return input;
  }
  return input(values);
}

export function isFormDataModified(obj: any, formValues: any) {
  let isModified = false;
  _.forEach(formValues, (v, k) => {
    if (obj[k] !== v) {
      isModified = true;
      return false;
    }
    return true;
  });
  return isModified;
}
