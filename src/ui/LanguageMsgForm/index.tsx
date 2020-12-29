import * as React from 'react';
import * as _ from 'lodash';
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Button,
  // Table,
} from 'antd';
import { connect } from 'dva';
import { Dispatch, AnyAction } from 'redux';
import I18N_IDS from 'src/i18n/ids';
import { t } from 'src/i18n';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { IAppState, IDictsMap } from 'src/models/appModel';
import { createRequireRule, createRichLengthRule, createEnNumUlStringRule, createUniqGlRules } from 'src/utils/validateRules';
import { checkLanguageMsg } from 'src/services/elementCode';
import { createSetIsLoadingAction } from 'src/models/appActions';
import { getDictDisplay } from 'src/utils';

const FormItem = Form.Item;
const Option = Select.Option;

interface IUiLanguageMsgFormModalProp {
  dispatch?: Dispatch<AnyAction>;
  dicts?: IDictsMap;
}

interface IUiLanguageMsgFormModalState {
  visible: boolean;
  editType: 'edit' | 'add';
  step: number;
  referenceRecords: any[];
  onSubmitHandle?(data: any, editType?: string): any;
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
export class UiLanguageMsgFormModal extends React.PureComponent<IUiLanguageMsgFormModalProp, IUiLanguageMsgFormModalState> {
  state: IUiLanguageMsgFormModalState = {
    visible: false,
    onSubmitHandle: null,
    editType: null,
    step: 0,
    referenceRecords: [],
  };

  formRef = React.createRef<any>();

  private _tableColumns: any[] = null;

  render() {
    const { visible, editType, step } = this.state;
    const { dicts } = this.props;
    return (
      <Modal
        visible={visible}
        title={this.getTitle()}
        onCancel={this._onCancle}
        maskClosable={false}
        keyboard={false}
        afterClose={this._afterClose}
        footer={[
          <Button key="cancel" onClick={this._onCancle}>
            {t(I18N_IDS.TEXT_CANCEL)}
          </Button>,
          this.showPrevButton() ? <Button key="next" onClick={this._onPrev}>
            上一步
          </Button> : null,
          this.showNextButton() ? <Button key="next" onClick={this._onNext}>
            下一步
          </Button> : null,
          this.showSubmitButton() ? <Button key="submit" type="primary" onClick={this._onSubmit}>
            {this.getSubmitText()}
          </Button> : null,
          this.showJumptoAddButton() ? <Button key="toAdd" type="primary" onClick={this._onJumpToAdd}>
            另建国际化消息
          </Button> : null,
        ]}
      >
        <LanguageMsgForm
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
  getTableColumns() {
    const { dicts } = this.props;
    if (!this._tableColumns) {
      this._tableColumns = [
        { title: '类型', dataIndex: 'sourceType', width: 60 },
        { title: '业务对象名称', dataIndex: 'pageBoName', width: 150 },
        {
          width: 200,
          title: '页面类型',
          dataIndex: 'pageType',
          render(text: any) {
            return getDictDisplay(text, 'PageType', dicts);
          },
        },
        { title: '业务类型', dataIndex: 'businessType', width: 150 },
      ];
    }
    return this._tableColumns;
  }
  getEditText() {
    const { editType } = this.state;
    const editText: string = editType === 'add' ? '新增' : '编辑';
    return editText;
  }
  getTitle() {
    const editText = this.getEditText();
    return `${editText}国际化消息`;
  }
  getSubmitText() {
    const editText = this.getEditText();
    return `${editText}并提交`;
  }
  open(options?: {
    formData?: any,
    editType: 'edit' | 'add';
    onSubmit?(data: any, editType?: string): void,
  }) {
    const {
      formData,
      editType,
      onSubmit,
    } = options ?? {};
    this.setState({
      visible: true,
      editType,
      onSubmitHandle: onSubmit,
    }, () => {
      setTimeout(() => {
        this._getForm()?.setFieldsValue(_.pick(formData ?? {}, [
          'messageKey',
          'messageText',
          'messageType',
          'ddLanguage',
        ]));
      }, 0);
    });
  }
  close() {
    this.setState({
      visible: false,
    });
  }
  private _getForm = () => {
    return this.formRef.current as WrappedFormUtils;
  }
  private showPrevButton = () => {
    const { step, editType } = this.state;
    if (step === 1 && editType === 'edit') {
      return true;
    }
    return false;
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
        <p>当前国际化消息无引用记录，点击 “修改并提交” 按钮提交修改。</p>
      );
    }
    return (
      <div>
        <p>当前国际化消息存在 {list.length} 条引用记录，点击 “修改并提交” 按钮将提交修改所有引用数据，点击 ”另建国际化消息“ 进行新增修改。</p>
        {/* <Table
          columns={this.getTableColumns()}
          dataSource={list}
          size="small"
          scroll={{ x: true, y: 200 }}
          rowKey={(record) => {
            if (!record.__key) {
              record.__key = (Math.random() * 10000000).toFixed(0);
            }
            return record.__key;
          }}
        /> */}
        <ul className="editor-ref-list">
          {
            _.map(list, (item, i) => {
              return <li key={i}>
                {
                  _.compact([
                    `【${item.sourceType ?? ''}】`,
                    item.pageBoName ? `${item.pageBoName}对象` : null,
                    getDictDisplay(item.pageType, 'PageType', this.props.dicts),
                    item.businessType ? `${item.businessType}业务类型` : null,
                  ]).join(' - ')
                }
              </li>;
            })
          }
        </ul>
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
    });
  }
  private _onPrev = () => {
    this.setState({
      step: 0,
    });
  }
  private _onNext = async () => {
    this._getForm().validateFields(async (err, values) => {
      if (err) {
        return;
      }
      const messageKey = values?.messageKey;
      this.props.dispatch(createSetIsLoadingAction(true, true));
      let result: any;
      try {
        result = await checkLanguageMsg({
          messageKey,
          baseViewId: window['__urlParams']?.baseViewId,
        });
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
    });
  }
  private _onCancle = () => {
    this.close();
  }
  private _afterClose = () => {
    this._getForm()?.resetFields();
    this._tableColumns = null;
    this.setState({
      onSubmitHandle: null,
      step: 0,
      referenceRecords: [],
    });
  }
}

interface ILanguageMsgFormProps {
  form?: WrappedFormUtils;
  dicts: IDictsMap;
  editType: 'edit' | 'add';
  show: boolean;
}

@(Form.create({ name: 'LanguageMsgForm' }) as any)
class LanguageMsgForm extends React.PureComponent<ILanguageMsgFormProps> {
  render() {
    const { getFieldDecorator } = this.props.form;
    const { dicts, editType, show } = this.props;
    return (
      <Form autoComplete="off" style={ show ? null : { display: 'none' } }>
        <Row gutter={24}>
          <Col span={12}>
            <FormItem label="消息键值" required>
              {
                getFieldDecorator('messageKey', editType === 'edit' ? {} : {
                  validateFirst: true,
                  rules: [
                    createRequireRule({ label: '消息键值' }),
                    createRichLengthRule({ label: '消息键值', max: 50 }),
                    createEnNumUlStringRule({ label: '消息键值' }),
                    createUniqGlRules({
                      label: '消息键值',
                      boName: 'IpfLanguageMsg',
                      entityName: 'com.gillion.platform.implement.dml.domain.IpfLanguageMsg',
                      fields: ['messageKey'],
                      form: this.props.form,
                      property: 'messageKey',
                      url: '/ipf/validation/uniqueGl',
                      baseViewId: window['__urlParams']?.baseViewId,
                    }),
                  ],
                })(
                  <Input disabled={editType === 'edit'} />,
                )
              }
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="消息内容" required>
              {
                getFieldDecorator('messageText', {
                  rules: [
                    createRequireRule({ label: '消息内容' }),
                    createRichLengthRule({ label: '消息内容', max: 4000 }),
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
            <FormItem label="消息类型" required>
              {
                getFieldDecorator('messageType', {
                  rules: editType === 'edit' ? [] : [
                    createRequireRule({ label: '消息类型' }),
                    createRichLengthRule({ label: '消息类型', max: 50 }),
                  ],
                })(
                  <Select allowClear={true} disabled={editType === 'edit'} >
                    {
                      _.map(dicts['MessageType'], d => <Option value={d.key} key={d.key}>{d.value}</Option>)
                    }
                  </Select>,
                )
              }
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="语言名称" required>
              {
                getFieldDecorator('ddLanguage', {
                  rules: editType === 'edit' ? [] : [
                    createRequireRule({ label: '语言名称' }),
                    createRichLengthRule({ label: '语言名称', max: 50 }),
                  ],
                })(
                  <Select allowClear={true} disabled={editType === 'edit'} >
                    {
                      _.map(dicts['DdLanguage'], d => <Option value={d.key} key={d.key}>{d.value}</Option>)
                    }
                  </Select>,
                )
              }
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
