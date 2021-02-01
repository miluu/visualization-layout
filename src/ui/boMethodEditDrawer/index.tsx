import { Button, Drawer, Input, notification, Select, Collapse, InputNumber } from 'antd';
import * as _ from 'lodash';
import Form, { FormProps, WrappedFormUtils } from 'antd/lib/form/Form';
import { Dispatch, AnyAction } from 'redux';
import React from 'react';

import './style.less';
import { confirm } from 'src/utils';
import { connect } from 'dva';
import { DROPDOWN_ALIGN_PROPS, ROW_STATUS } from 'src/config';
import { isFormDataModified } from 'src/utils/forms';
import { IBoMethod } from 'src/models/methodsModel';
import { IAppState, IDictsMap } from 'src/models/appModel';
import { createRichLengthRule, createRequireRule, createFirstLetterLowerRule } from 'src/utils/validateRules';
import { createSaveOrUpdateMethodEffect } from 'src/models/methodsAction';
import { UiCheckbox } from '../checkbox';
import { IAssociateColumn, IQueryOptions, IQueryResult, UiAssociate } from '../associate';
import { querySearchHelpMethod, queryDictTableMethod } from '../../services/properties';
import { queryPenetrationMethod, queryLanguageMsgMethod, queryDataTransferMethod, queryBoNameMethod, queryMethodMethod } from '../../services/methods';

const FormItem = Form.Item;
const { Panel } = Collapse;
const Option = Select.Option;

interface IUiBoMethodEditDrawerProps {
  dispatch?: Dispatch<AnyAction>;
  params?: any;
  dicts?: IDictsMap;
}

interface IUiBoMethodEditDrawerState {
  boMethod: IBoMethod;
  visible: boolean;
  selectedMethodColumns: string[];
  editingMethodColumn: string[];
  type: string;
}

@connect(({
  APP,
}: {
  APP: IAppState,
}) => {
  return {
    params: APP.params,
    dicts: APP.dicts,
  };
}, null, null, { withRef: true })
export class UiBoMethodEditDrawer extends React.PureComponent<IUiBoMethodEditDrawerProps, IUiBoMethodEditDrawerState> {
  state: IUiBoMethodEditDrawerState = {
    boMethod: null,
    visible: false,
    selectedMethodColumns: [],
    editingMethodColumn: null,
    type: 'edit',
  };

  formRef = React.createRef<any>();

  render() {
    const { visible } = this.state;
    return (
      <Drawer
        title={this.getTitle()}
        className="editor-drawer-common"
        visible={visible}
        onClose={this.onClose}
        width={400}
        destroyOnClose
        afterVisibleChange={this.afterVisibleChange}
      >
        <div className="edito-drawer-body-content">
          { this.renderForm() }
          { this.renderFooter() }
        </div>
      </Drawer>
    );
  }

  open = (options: any = {}) => {
    this.setState({
      visible: true,
      type: options.type,
      boMethod: options.boMethod,
    });
  }

  close = () => {
    this.setState({
      boMethod: null,
      visible: false,
      selectedMethodColumns: [],
      editingMethodColumn: null,
    });
  }

  private getTitle = () => {
    const { type } = this.state;
    if (type === 'add') {
      return '新增方法';
    }
    return '编辑方法';
  }

  private afterVisibleChange = (visible: boolean) => {
    if (visible) {
      const form: WrappedFormUtils = this.formRef.current?.getForm();
      if (form) {
        form.setFieldsValue(
          _.pick(
            this.state.boMethod,
            _.keys(form.getFieldsValue()),
          ),
        );
      }
    }
  }

  private save = () => {
    const isMethodModified = this.isDataModified();
    if (!(isMethodModified)) {
      notification.info({
        message: '提示',
        description: '数据未修改，无需保存。',
      });
      return;
    }
    this.getForm().validateFields(null, { force: true }, (err) => {
      if (err) {
        return;
      }
      const data = this.combineBoMethodWithFormValues();
      this.props.dispatch(createSaveOrUpdateMethodEffect(data, this.state.type, () => {
        this.close();
      }));
    });
  }

  private combineBoMethodWithFormValues = () =>  {
    const isMethodModified = this.isDataModified();
    const formData = this.getForm()?.getFieldsValue?.() || {};
    const rowStatusObj: any = {};
    if (this.state.type === 'add') {
      rowStatusObj.rowStatus = ROW_STATUS.ADDED;
      rowStatusObj.ipfCcmBoMethodId = null;
    } else if (isMethodModified) {
      rowStatusObj.rowStatus = ROW_STATUS.MODIFIED;
    }
    const data: IBoMethod = {
      ...this.state.boMethod,
      ...formData,
      ...rowStatusObj,
    };
    return data;
  }

  private onClose = async () => {
    const isModified = this.isDataModified();
    if (isModified) {
      const b = await confirm({ content: '数据已修改，确定关闭？' });
      if (!b) {
        return;
      }
    }
    this.close();
  }

  private isDataModified = () => {
    const form = this.getForm();
    if (!form) {
      return false;
    }
    const formValues = form.getFieldsValue();
    const { boMethod } = this.state;
    return isFormDataModified(boMethod, formValues);
  }

  private getForm = () => {
    const form: WrappedFormUtils = this.formRef.current?.getForm();
    return form;
  }

  private renderForm = () => {
    const { dicts } = this.props;
    return (
      <div className="editor-drawer-form">
        <BoMethodEditForm dicts={dicts} ref={this.formRef} />
      </div>
    );
  }

  private renderFooter = () => {
    return (
      <div className="editor-drawer-footer">
        <Button
          type="default"
          size="small"
          onClick={this.onClose}
        >关闭</Button>
        {' '}
        <Button
          type="primary"
          size="small"
          onClick={this.save}
        >保存</Button>
      </div>
    );
  }

}

const SEARCH_HELP_ASSOCIATE_COLUMNS: IAssociateColumn[] = [
  { title: '搜索帮助名称', field: 'shlpName' },
];

const PENETRATION_CODE_ASSOCIATE_COLUMNS: IAssociateColumn[] = [
  { title: '穿透编码', field: 'penetrationCode' },
];

const DICT_TABLE_ASSOCIATE_COLUMNS: IAssociateColumn[] = [
  { title: '字典代码', field: 'dictCode' },
  { title: '字典名称', field: 'dictName' },
];

const LANGUAGE_MSG_ASSOCIATE_COLUMNS: IAssociateColumn[] = [
  { title: '消息键值', field: 'messageKey' },
  { title: '消息内容', field: 'messageText' },
  { title: '消息类型', field: 'messageType' },
];

const DATA_TRANSFER_ASSOCIATE_COLUMNS: IAssociateColumn[] = [
  { title: '数据流转代码', field: 'dataTransferCode' },
];

const BO_NAME_ASSOCIATE_COLUMNS: IAssociateColumn[] = [
  { title: '名称', field: 'boName' },
  { title: '表名称', field: 'tableName' },
];

const METHOD_ASSOCIATE_COLUMNS: IAssociateColumn[] = [
  { title: '调用方法名', field: 'methodName' },
  { title: '调用方法描述', field: 'methodDesc' },
  { title: '业务对象名', field: 'boName' },
];

interface IBoMethodEditFormProps {
  form?: WrappedFormUtils;
  dicts?: IDictsMap;
}

@(Form.create({ name: 'BoMethodEditForm' }) as any)
class BoMethodEditForm extends React.PureComponent<IBoMethodEditFormProps> {
  render() {
    const { dicts, form } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout: Partial<FormProps> = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
      labelAlign: 'left',
      autoComplete: 'off',
    };
    return (
      <Form {...formItemLayout} >
        <FormItem label="调用方法名称" >
          {
            getFieldDecorator('methodName', {
              rules: [
                createRequireRule({ label: '调用方法名称' }),
                createRichLengthRule({
                  label: '调用方法名称',
                  min: 0,
                  max: 200,
                }),
              ],
            })(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="调用方法描述">
          {
            getFieldDecorator('methodDesc', {
              rules: [
                createRequireRule({ label: '调用方法描述' }),
                createRichLengthRule({
                  label: '调用方法描述',
                  min: 0,
                  max: 200,
                }),
              ],
            })(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="方法类型">
          {
            getFieldDecorator('methodType', {
              rules: [
                createRequireRule({ label: '方法类型' }),
                createRichLengthRule({
                  label: '方法类型',
                  min: 0,
                  max: 50,
                }),
              ],
            })(
              <Select
                size="small"
                allowClear
                {...DROPDOWN_ALIGN_PROPS}
              >
                {_.map((dicts['IpfCcmBoMethodType']), listItem => (
                  <Option title={listItem.value} key={listItem.key} value={listItem.key}>
                    {listItem.value}
                  </Option>
                ))}
              </Select>,
            )
          }
        </FormItem>
        <FormItem label="URL地址">
          {
            getFieldDecorator('url', {
              rules: [
                createRequireRule({ label: 'URL地址' }),
                createFirstLetterLowerRule({ label: 'URL地址' }),
                createRichLengthRule({
                  label: 'URL地址',
                  min: 0,
                  max: 200,
                }),
              ],
            })(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="默认方法">
          {
            getFieldDecorator('isDefault')(
              <UiCheckbox
                trueValue="X"
                falseValue=""
              />,
            )
          }
        </FormItem>
        <FormItem label="是否刷新主表">
          {
            getFieldDecorator('isRefreshParentBo')(
              <UiCheckbox
                trueValue="X"
                falseValue=""
              />,
            )
          }
        </FormItem>
        <FormItem label="权限控制">
          {
            getFieldDecorator('isPermission')(
              <UiCheckbox
                trueValue="X"
                falseValue=""
              />,
            )
          }
        </FormItem>
        <FormItem label="请求成功不提示">
          {
            getFieldDecorator('succeePop')(
              <UiCheckbox
                trueValue="X"
                falseValue=""
              />,
            )
          }
        </FormItem>
        <FormItem label="请求之前提示">
          {
            getFieldDecorator('beforePop')(
              <UiCheckbox
                trueValue="X"
                falseValue=""
              />,
            )
          }
        </FormItem>
        <FormItem label="图标">
          {
            getFieldDecorator('icon', {
              rules: [
                createRichLengthRule({
                  label: '图标',
                  min: 0,
                  max: 200,
                }),
              ],
            })(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="字典名称">
          {
            getFieldDecorator('dictName', {
              rules: [
                createRichLengthRule({
                  label: '图标',
                  min: 0,
                  max: 200,
                }),
              ],
            })(
              <UiAssociate
                columns={DICT_TABLE_ASSOCIATE_COLUMNS}
                labelProp="dictName"
                valueProp="dictCode"
                labelInit={this.props.form.getFieldValue('dictName')}
                queryMethod={this.dictTableQueryMehtod}
                onChange={(value, option) => this.onSearchHelpChange({ dictName: option?.['dictName'], dictCode: option?.['dictCode'] })}
              />,
            )
          }
        </FormItem>
        <FormItem label="搜索帮助名称">
          {
            getFieldDecorator('refShlpName', {
              rules: [
                createRichLengthRule({
                  label: '搜索帮助名称',
                  min: 0,
                  max: 200,
                }),
              ],
            })(
              <UiAssociate
                columns={SEARCH_HELP_ASSOCIATE_COLUMNS}
                labelProp="shlpName"
                valueProp="shlpName"
                labelInit={this.props.form.getFieldValue('refShlpName')}
                queryMethod={this.searchHelpQueryMehtod}
                onChange={(value, option) => this.onSearchHelpChange({ refShlpName: option?.['shlpName'] })}
              />,
            )
          }
        </FormItem>
        <FormItem label="校验分组名称">
          {
            getFieldDecorator('groupName', {
              rules: [
                createRichLengthRule({
                  label: '校验分组名称',
                  min: 0,
                  max: 50,
                }),
              ],
            })(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="穿透编码">
          {
            getFieldDecorator('penetrationCode', {
              rules: [
                createRichLengthRule({
                  label: '穿透编码',
                  min: 0,
                  max: 50,
                }),
              ],
            })(
              <UiAssociate
                columns={PENETRATION_CODE_ASSOCIATE_COLUMNS}
                labelProp="penetrationCode"
                valueProp="penetrationCode"
                labelInit={this.props.form.getFieldValue('penetrationCode')}
                queryMethod={this.penetrationQueryMehtod}
                onChange={(value, option) => this.onSearchHelpChange({ penetrationCode: option?.['penetrationCode'] })}
              />,
            )
          }
        </FormItem>
        <Panel
          key="1"
          header="打印相关"
        />
        <FormItem label="打印方法">
          {
            getFieldDecorator('printMethod', {
              rules: [
                createRichLengthRule({
                  label: '打印方法',
                  min: 0,
                  max: 50,
                }),
              ],
            })(
              <Select
                size="small"
                allowClear
                {...DROPDOWN_ALIGN_PROPS}
              >
                {_.map((dicts['IpfCcmBoPrintMethod']), listItem => (
                  <Option title={listItem.value} key={listItem.key} value={listItem.key}>
                    {listItem.value}
                  </Option>
                ))}
              </Select>,
            )
          }
        </FormItem>
        <FormItem label="打印选项">
          {
            getFieldDecorator('printOption', {
              rules: [
                createRichLengthRule({
                  label: '打印选项',
                  min: 0,
                  max: 50,
                }),
              ],
            })(
              <Select
                size="small"
                allowClear
                {...DROPDOWN_ALIGN_PROPS}
              >
                {_.map((dicts['IpfCcmBoPrintOption']), listItem => (
                  <Option title={listItem.value} key={listItem.key} value={listItem.key}>
                    {listItem.value}
                  </Option>
                ))}
              </Select>,
            )
          }
        </FormItem>
        <FormItem label="文件路径" >
          {
            getFieldDecorator('fileUrl')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="操作类型">
          {
            getFieldDecorator('operateType', {
              rules: [
                createRichLengthRule({
                  label: '操作类型',
                  min: 0,
                  max: 50,
                }),
              ],
            })(
              <Select
                size="small"
                allowClear
                {...DROPDOWN_ALIGN_PROPS}
              >
                {_.map((dicts['IpfCcmBoMehtodOperateType']), listItem => (
                  <Option title={listItem.value} key={listItem.key} value={listItem.key}>
                    {listItem.value}
                  </Option>
                ))}
              </Select>,
            )
          }
        </FormItem>
        <Panel
          key="2"
          header="页面标题"
        />
        <FormItem label="简易标题" >
          {
            getFieldDecorator('jumpWindowTitle', {
              rules: [
                createRichLengthRule({
                  label: '简易标题',
                  min: 0,
                  max: 200,
                }),
              ],
            })(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="国际化标题" >
          {
            getFieldDecorator('jumpWindowTitleText')(
              <UiAssociate
                columns={LANGUAGE_MSG_ASSOCIATE_COLUMNS}
                labelProp="messageText"
                valueProp="messageKey"
                labelInit={this.props.form.getFieldValue('jumpWindowTitleText')}
                queryMethod={this.languageMsgMehtod}
                onChange={(value, option) => this.onSearchHelpChange({ jumpWindowTitleText: option?.['messageText'], jumpWindowTitleCode: option?.['messageKey'] })}
              />,
            )
          }
        </FormItem>
        <FormItem label="宽" >
          {
            getFieldDecorator('width')(
              <InputNumber
                size="small"
                precision={8}
                min={0}
                style={{ width: '100%' }}
              />,
            )
          }
        </FormItem>
        <FormItem label="高" >
          {
            getFieldDecorator('height')(
              <InputNumber
                size="small"
                precision={8}
                min={0}
                style={{ width: '100%' }}
              />,
            )
          }
        </FormItem>
        <Panel
          key="3"
          header="方法多语言"
        />
        <FormItem label="国际化消息" >
          {
            getFieldDecorator('languageMessageKey')(
              <UiAssociate
                columns={LANGUAGE_MSG_ASSOCIATE_COLUMNS}
                labelProp="messageKey"
                valueProp="messageKey"
                labelInit={this.props.form.getFieldValue('languageMessageKey')}
                queryMethod={this.languageMsgMehtod}
                onChange={(value, option) => this.onSearchHelpChange({ languageMessageKey: option?.['messageKey'] })}
              />,
            )
          }
        </FormItem>
        <FormItem label="提示信息" >
          {
            getFieldDecorator('methodHintText')(
              <UiAssociate
                columns={SEARCH_HELP_ASSOCIATE_COLUMNS}
                labelProp="messageText"
                valueProp="messageKey"
                labelInit={this.props.form.getFieldValue('methodHintText')}
                queryMethod={this.searchHelpQueryMehtod}
                onChange={(value, option) => this.onSearchHelpChange({ methodHintText: option?.['messageText'], methodHintCode: option?.['messageKey'] })}
              />,
            )
          }
        </FormItem>
        <Panel
          key="4"
          header="批量流转"
        />
        <FormItem label="跳转地址" >
          {
            getFieldDecorator('jumpAddress')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="数据流转名称" >
          {
            getFieldDecorator('dataTransferName')(
              <UiAssociate
                columns={DATA_TRANSFER_ASSOCIATE_COLUMNS}
                labelProp="dataTransferCode"
                valueProp="ipfCcmDataTransferId"
                labelInit={this.props.form.getFieldValue('dataTransferName')}
                queryMethod={this.dataTransferQueryMehtod}
                onChange={(value, option) => this.onSearchHelpChange({ dataTransferName: option?.['dataTransferCode'], dataTransferCode: option?.['ipfCcmDataTransferId'] })}
              />,
            )
          }
        </FormItem>
        <Panel
          key="4"
          header="跳转方法"
        />
        <FormItem label="业务对象名" >
          {
            getFieldDecorator('jumpBoName')(
              <UiAssociate
                columns={BO_NAME_ASSOCIATE_COLUMNS}
                labelProp="boName"
                valueProp="boName"
                labelInit={this.props.form.getFieldValue('jumpBoName')}
                queryMethod={this.boNameQueryMehtod}
                onChange={(value, option) => this.onSearchHelpChange({ jumpBoName: option?.['boName'] })}
              />,
            )
          }
        </FormItem>
        <FormItem label="方法名" >
          {
            getFieldDecorator('jumpMethodName')(
              <UiAssociate
                columns={METHOD_ASSOCIATE_COLUMNS}
                labelProp="methodName"
                valueProp="ipfCcmBoMethodId"
                labelInit={this.props.form.getFieldValue('jumpMethodName')}
                queryMethod={this.methodQueryMethod}
                onChange={(value, option) => this.onSearchHelpChange({ jumpMethodName: option?.['methodName'], jumpMethodId: option?.['ipfCcmBoMethodId'] })}
              />,
            )
          }
        </FormItem>
        <FormItem label="业务对象视图" >
          {
            getFieldDecorator('jumpBoViewDesc')(
              <Input
                size="small"
                disabled
              />,
            )
          }
        </FormItem>
        <FormItem label="方法内容" >
          {
            getFieldDecorator('methodBody')(
              <Input
                type="textarea"
                style={ { height:100 } }
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="备注" >
          {
            getFieldDecorator('remark')(
              <Input
                type="textarea"
                style={ { height:100 } }
                size="small"
              />,
            )
          }
        </FormItem>
      </Form>
    );
  }

  private onSearchHelpChange = (object: any) => {
    this.props.form.setFieldsValue({
      // [formProp]: option?.[optionProp] || null,
      ...object,
    });
  }

  private searchHelpQueryMehtod = async (options: IQueryOptions): Promise<IQueryResult> => {
    return querySearchHelpMethod(options);
  }

  private languageMsgMehtod = async (options: IQueryOptions): Promise<IQueryResult> => {
    return queryLanguageMsgMethod(options);
  }

  private dictTableQueryMehtod = async (options: IQueryOptions): Promise<IQueryResult> => {
    return queryDictTableMethod(options);
  }

  private penetrationQueryMehtod = async (options: IQueryOptions): Promise<IQueryResult> => {
    return queryPenetrationMethod(options);
  }

  private dataTransferQueryMehtod = async (options: IQueryOptions): Promise<IQueryResult> => {
    return queryDataTransferMethod(options);
  }

  private boNameQueryMehtod = async (options: IQueryOptions): Promise<IQueryResult> => {
    return queryBoNameMethod(options);
  }

  private methodQueryMethod = async (options: IQueryOptions): Promise<IQueryResult> => {
    return queryMethodMethod(options);
  }
}
