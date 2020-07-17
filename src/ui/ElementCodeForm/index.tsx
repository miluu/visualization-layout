import * as React from 'react';
import * as _ from 'lodash';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
} from 'antd';
import { connect } from 'dva';
import { Dispatch, AnyAction } from 'redux';
import I18N_IDS from 'src/i18n/ids';
import { t } from 'src/i18n';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { IAppState, IDictsMap } from 'src/models/appModel';
import { createRequireRule, createEnUcNumUlStringRule, createRichLengthRule, createUniqGlRules } from 'src/utils/validateRules';

const FormItem = Form.Item;
const Option = Select.Option;

interface IElementCodeFormModalProps {
  dispatch?: Dispatch<AnyAction>;
  dicts?: IDictsMap;
}

interface IElementCodeFormModalState {
  visible: boolean;
  title: string;
  submitText: string;
  editType: 'edit' | 'add';
  onSubmitHandle?(data: any): any;
}

@connect(
  ({ APP }: {
    APP: IAppState,
  }) => ({
    dicts: APP.dicts,
  }), null, null, {
    withRef: true,
  },
)
export class UiElementCodeFormModal extends React.PureComponent<IElementCodeFormModalProps, IElementCodeFormModalState> {
  state: IElementCodeFormModalState = {
    visible: false,
    title: '',
    submitText: t(I18N_IDS.TEXT_OK),
    onSubmitHandle: null,
    editType: null,
  };

  formRef = React.createRef<any>();

  render() {
    const { visible, title, submitText, editType } = this.state;
    const { dicts } = this.props;
    return (
      <Modal
        visible={visible}
        title={title}
        onOk={this._onSubmit}
        onCancel={this._onCancle}
        afterClose={this._afterClose}
        okText={submitText}
        cancelText={t(I18N_IDS.TEXT_CANCEL)}
      >
        <ElementCodeForm
          ref={this.formRef}
          dicts={dicts}
          editType={editType}
        />
      </Modal>
    );
  }
  open(options?: {
    title?: string,
    formData?: any,
    submitText?: string,
    editType: 'edit' | 'add';
    onSubmit?(data: any): void,
  }) {
    const {
      title,
      formData,
      submitText,
      editType,
      onSubmit,
    } = options ?? {};
    this.setState({
      visible: true,
      title: title ?? '',
      editType,
      submitText: submitText ?? t(I18N_IDS.TEXT_OK),
      onSubmitHandle: onSubmit,
    }, () => {
      setTimeout(() => {
        this._getForm()?.setFieldsValue(formData ?? {});
      }, 0);
    });
  }
  close() {
    this._getForm()?.resetFields();
    this.setState({
      visible: false,
      title: '',
      onSubmitHandle: null,
    });
  }
  private _getForm = () => {
    return this.formRef.current as WrappedFormUtils;
  }
  private _onSubmit = () => {
    this._getForm()?.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.state.onSubmitHandle?.(values);
    });
  }
  private _onCancle = () => {
    this.close();
  }
  private _afterClose = () => {
    //
  }
}

interface IElementCodeFormProps {
  form?: WrappedFormUtils;
  dicts: IDictsMap;
  editType: 'edit' | 'add';
}

@(Form.create({ name: 'ElementCodeForm' }) as any)
class ElementCodeForm extends React.PureComponent<IElementCodeFormProps> {
  render() {
    const { getFieldDecorator } = this.props.form;
    const { dicts, editType } = this.props;
    return (
      <Form autoComplete="off">
        <Row gutter={24}>
          <Col span={12}>
            <FormItem label="数据元素代码" required>
              {
                getFieldDecorator('elementCode', editType === 'edit' ? {} : {
                  validateFirst: true,
                  rules: [
                    createRequireRule({ label: '数据元素代码' }),
                    createEnUcNumUlStringRule({ label: '数据元素代码' }),
                    createRichLengthRule({ label: '数据元素代码', max: 50 }),
                    createUniqGlRules({
                      label: '数据元素代码',
                      boName: 'IpfDmlElement',
                      entityName: 'com.gillion.platform.implement.dml.domain.IpfDmlElement',
                      fields: ['elementCode'],
                      form: this.props.form,
                      property: 'elementCode',
                    }),
                  ],
                })(
                  <Input disabled={editType === 'edit'} />,
                )
              }
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="显示文本" required>
              {
                getFieldDecorator('fieldText', {
                  rules: [
                    createRequireRule({ label: '显示文本' }),
                    createRichLengthRule({ label: '显示文本', max: 200 }),
                  ],
                })(
                  <Input />,
                )
              }
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <FormItem label="默认语言">
              {
                getFieldDecorator('ddLanguage', {
                  // rules: [
                  //   createRichLengthRule({ label: '默认语言', max: 50 }),
                  // ],
                })(
                  <Select allowClear={true} disabled >
                    {
                      _.map(dicts['DdLanguage'], d => <Option value={d.key} key={d.key}>{d.value}</Option>)
                    }
                  </Select>,
                )
              }
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="字段长度">
              {
                getFieldDecorator('fieldLength', {
                  // rules: [
                  //   createRequireRule({ label: '字段长度' }),
                  // ],
                })(
                  <InputNumber style={{ width: '100%' }} disabled />,
                )
              }
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <FormItem label="数据类型" required>
              {
                getFieldDecorator('dataType', {
                  // rules: [
                  //   createRequireRule({ label: '数据类型' }),
                  //   createRichLengthRule({ label: '数据类型', max: 50 }),
                  // ],
                })(
                  <Select allowClear={true} disabled >
                    {
                      _.map(dicts['DataType'], d => <Option value={d.key} key={d.key}>{d.value}</Option>)
                    }
                  </Select>,
                )
              }
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="小数位">
              {
                getFieldDecorator('decimals', {})(
                  <InputNumber style={{ width: '100%' }} disabled />,
                )
              }
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
