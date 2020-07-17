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
  Button,
  Table,
} from 'antd';
import { connect } from 'dva';
import { Dispatch, AnyAction } from 'redux';
import I18N_IDS from 'src/i18n/ids';
import { t } from 'src/i18n';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { IAppState, IDictsMap } from 'src/models/appModel';
import { createRequireRule, createEnUcNumUlStringRule, createRichLengthRule, createUniqGlRules } from 'src/utils/validateRules';
import { checkElementCode } from 'src/services/elementCode';
import { createSetIsLoadingAction } from 'src/models/appActions';

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
  step: number;
  referenceRecords: any[];
  onSubmitHandle?(data: any, editType?: string): any;
}

const tableColumns: any = [
  { dataIndex: 'sourceType', title: 'sourceType' },
  { dataIndex: 'pageType', title: 'pageType' },
  { dataIndex: 'pageName', title: 'pageName' },
  { dataIndex: 'layoutBoName', title: 'layoutBoName' },
  { dataIndex: 'propertyName', title: 'propertyName' },
  { dataIndex: 'description', title: 'description' },
  { dataIndex: 'fieldText', title: 'fieldText' },
  { dataIndex: 'dataElementCode', title: 'dataElementCode' },
  { dataIndex: 'dataElementText', title: 'dataElementText' },
];

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
    step: 0,
    referenceRecords: [],
  };

  formRef = React.createRef<any>();

  private _tableColumns: any[] = tableColumns;

  render() {
    const { visible, title, submitText, editType, step } = this.state;
    const { dicts } = this.props;
    return (
      <Modal
        visible={visible}
        title={title}
        maskClosable={false}
        keyboard={false}
        afterClose={this._afterClose}
        footer={[
          <Button key="cancel" onClick={this._onCancle}>
            {t(I18N_IDS.TEXT_CANCEL)}
          </Button>,
          this.showNextButton() ? <Button key="next" onClick={this._onNext}>
            下一步
          </Button> : null,
          this.showSubmitButton() ? <Button key="submit" type="primary" onClick={this._onSubmit}>
            {submitText}
          </Button> : null,
          this.showJumptoAddButton() ? <Button key="toAdd" type="primary" onClick={this._onJumpToAdd}>
            另建数据元素
          </Button> : null,
        ]}
      >
        <ElementCodeForm
          ref={this.formRef}
          dicts={dicts}
          editType={editType}
          show={this._showForm()}
        />
        {
          step === 1
            ? this._renderStep2()
            : null
        }
      </Modal>
    );
  }
  open(options?: {
    title?: string,
    formData?: any,
    submitText?: string,
    editType: 'edit' | 'add';
    onSubmit?(data: any, editType?: string): void,
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
      step: 0,
      referenceRecords: [],
    });
  }
  private _getForm = () => {
    return this.formRef.current as WrappedFormUtils;
  }
  private showNextButton = () => {
    const { step, editType } = this.state;
    if (step === 0 && editType === 'edit') {
      return true;
    }
    return false;
  }
  private showSubmitButton = () => {
    const { step, editType } = this.state;
    if (step === 0 && editType === 'edit') {
      return false;
    }
    return true;
  }
  private showJumptoAddButton = () => {
    const { step, editType, referenceRecords } = this.state;
    if (step === 1 && editType === 'edit' && referenceRecords?.length) {
      return true;
    }
    return false;
  }
  private _showForm = () => {
    const { step, editType } = this.state;
    if (editType === 'edit' && step === 1) {
      return false;
    }
    return true;
  }
  private _renderStep2 = () => {
    const list = this.state.referenceRecords ?? [];
    if (!list.length) {
      return (
        <p>当前数据元素无引用记录，点击 “修改并提交” 按钮提交修改。</p>
      );
    }
    return (
      <div>
        <p>当前数据元素存在 {list.length} 条引用记录，点击 “修改并提交” 按钮将提交修改所有引用数据，点击 ”另建数据元素“ 进行新增修改。</p>
        <Table columns={this._tableColumns} dataSource={list} size="small" scroll={{ x: 1500, y: 200 }} />
      </div>
    );
  }
  private _onSubmit = () => {
    this._getForm()?.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.state.onSubmitHandle?.(values, this.state.editType);
    });
  }
  private _onJumpToAdd = () => {
    this.setState({
      step: 0,
      editType: 'add',
      title: '新增数据元素',
    });
  }
  private _onNext = async () => {
    let result: any;
    this.props.dispatch(createSetIsLoadingAction(true, true));
    try {
      result = await checkElementCode({});
    } catch (e) {
      Modal.error({ content: e?.msg ?? '查询失败。' });
      return;
    } finally {
      this.props.dispatch(createSetIsLoadingAction(false, true));
    }
    const referenceRecords = result?.records ?? [];
    this.setState({
      referenceRecords,
      step: this.state.step + 1,
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
  show: boolean;
}

@(Form.create({ name: 'ElementCodeForm' }) as any)
class ElementCodeForm extends React.PureComponent<IElementCodeFormProps> {
  render() {
    const { getFieldDecorator } = this.props.form;
    const { dicts, editType, show } = this.props;
    return (
      <Form autoComplete="off" style={ show ? null : { display: 'none' } }>
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
