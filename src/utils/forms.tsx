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
  /** 下拉列表 */
  list?: any[];
  /** 字典表名称 */
  dictName?: string;
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
  valueProp?: string;
  labelProp?: string;
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
      return renderNumberInput(_item, onChangeCallback);
    case 'select':
      return renderSelect(_item, dicts, onChangeCallback);
    case 'textarea':
      return renderTextarea(_item, onChangeCallback);
    case 'checkbox':
      return renderCheckbox(_item, onChangeCallback);
    case 'multiSelect':
      return renderMultiSelect(_item, dicts, onChangeCallback);
    case 'associate':
      return renderAssociate(_item, values, urlParams, onChangeCallback);
    default:
      return renderInput(_item, onChangeCallback);
  }
}

interface IRenderFormItemOptions {
  form?: WrappedFormUtils;
  item?: IFormItemOption;
  values?: any;
  dicts?: IDictsMap;
  urlParams?: any;
  onChangeCallback?: OnChangeCallback;
  dispatch?: Dispatch<AnyAction>;
}

export function renderFormItem({
  form,
  item,
  values,
  dicts,
  urlParams,
  onChangeCallback,
  dispatch,
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
        }),
      )}
      {
        item.extra ? item.extra(item, values, onChangeCallback, dicts, dispatch) : null
      }
    </FormItem>
  );
}

export function renderInput(item: IFormItemOption, onChangeCallback: OnChangeCallback) {
  return <WrappedInput
    disabled={item.disabled}
    size="small"
    placeholder={item.placeholder}
    onChange={(value: any) => onChangeCallback(item, value)}
  />;
}

export function renderCheckbox(item: IFormItemOption, onChangeCallback: OnChangeCallback) {
  return (
    <Checkbox
      disabled={item.disabled}
      onChange={() => onChangeCallback(item)}
    />
  );
}

export function renderTextarea(item: IFormItemOption, onChangeCallback: OnChangeCallback) {
  return <WrappedTextArea
    disabled={item.disabled}
    autosize={{ minRows: 2, maxRows: 10 }}
    onChange={value => onChangeCallback(item, value)}
    placeholder={item.placeholder}
  />;
}

export function renderSelect(item: IFormItemOption, dicts: IDictsMap, onChangeCallback: OnChangeCallback) {
  return (
    <Select
      disabled={item.disabled}
      size="small"
      allowClear
      onChange={(value: any) => onChangeCallback(item, value)}
      placeholder={item.placeholder}
      {...DROPDOWN_ALIGN_PROPS}
    >
        {_.map((item.list || dicts[item.dictName]), listItem => (
          <Option title={listItem.value} key={listItem.key} value={listItem.key}>
            {listItem.value}
          </Option>
        ))}
    </Select>
  );
}

export function renderAssociate(item: IFormItemOption, values: any, urlParams: any, onChangeCallback: OnChangeCallback) {
  const {
    property,
    refProperty,
    valueProp,
    labelProp,
    columns,
    queryMethod,
    queryMethodCreator,
  } = item;
  return (
    <>
      <UiAssociate
        value={_.get(values, property)}
        valueProp={valueProp}
        labelProp={labelProp}
        columns={columns}
        queryMethod={queryMethod || queryMethodCreator(urlParams)}
        labelInit={_.get(values, refProperty)}
        onChange={(v, o) => onChangeCallback([item, {
          property: item.refProperty,
        }], [v || null, _.get(o, labelProp, null)], true)}
      />
    </>
  );
}

export function renderNumberInput(item: IFormItemOption, onChangeCallback: OnChangeCallback) {
  return (
    <WrappedInputNumber
      disabled={item.disabled}
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

export function renderMultiSelect(item: IFormItemOption, dicts: IDictsMap, onChangeCallback: OnChangeCallback) {
  return (
    <Select
      mode="tags"
      tokenSeparators={[' ']}
      onChange={() => onChangeCallback(item)}
      placeholder={item.placeholder}
      {...DROPDOWN_ALIGN_PROPS}
    >
      {_.map((item.list || dicts[item.dictName]), listItem => {
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
