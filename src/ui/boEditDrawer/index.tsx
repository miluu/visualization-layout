import * as React from 'react';
import { Drawer, Button, Input, notification, Select } from 'antd';
import Form, { FormProps, WrappedFormUtils } from 'antd/lib/form/Form';
import * as _ from 'lodash';
import './style.less';
import { appModuleQueryMehtod, getIpfCcmBo, saveOrUpdateIpfCcmBo, tableNameQueryMehtod, messageQueryMehtod, dynaCacheKeyQueryMehtod } from 'src/services/bo';
import { DROPDOWN_ALIGN_PROPS, ROW_STATUS } from 'src/config';
import { connect } from 'dva';
import { IAppState, IDictsMap } from 'src/models/appModel';
import { IAssociateColumn, UiAssociate } from '../associate';
import { UiCheckbox } from '../checkbox';
import { createRequireRule } from 'src/utils/validateRules';
window['_'] = _;

const Option = Select.Option;

const FormItem = Form.Item;

const APP_MODULE_ASSOCIATE_COLUMNS: IAssociateColumn[] = [
  { field: 'moduleName', title: '模块名称' },
  { field: 'moduleDesc', title: '模块描述' },
  { field: 'systemName', title: '系统名称' },
  { field: 'systemDesc', title: '系统描述' },
];
//
const TABLE_NAME_ASSOCIATE_COLUMNS: IAssociateColumn[] = [
  { field: 'tableName', title: '表名' },
  { field: 'tableDesc', title: '描述' },
  { field: 'tableType', title: '表类型' },
];
// 系统消息代码
const MESSAGE_ASSOCIATE_COLUMNS: IAssociateColumn[] = [
  { field: 'messageKey', title: '消息键值' },
  { field: 'creator', title: '描述' },
  { field: 'messageText', title: '消息内容' },
  { field: 'messageType ', title: '消息类型', dictName: 'MessageType' },
  { field: 'ddLanguage ', title: '语言名称', dictName: 'DdLanguage' },
];
//  自定义key值策略
const DYNACACHE_KEY_ASSOCIATE_COLUMNS: IAssociateColumn[] = [
  { field: 'propertyName', title: '属性名' },
  { field: 'fieldText', title: '显示文本' },
  { field: 'fieldLength', title: '字段长度' },
];

export interface IUiAssociateProps {
  disabled?: boolean;
  dicts?: IDictsMap;
}
export interface IUiDrawerEditorModalState {
  visible?: boolean;
  baseViewId?: string;
  ipfCcmBoId?: string;
  record?: any;
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
export class BoEditDrawe extends React.PureComponent<IUiAssociateProps, IUiDrawerEditorModalState> {
  formRef = React.createRef<any>();

  constructor(props: IUiAssociateProps) {
    super(props);
    this.state = {
      visible: false,
      baseViewId: null,
      ipfCcmBoId: null,
      record: null,
    };
  }
  render() {
    return (
      <Drawer
          title="业务对象编辑"
          placement="right"
          closable={false}
          onClose={() => this._onClose()}
          visible={this.state.visible}
          width={400}
          className="editor-drawer-common"
        >
         <div className="edito-drawer-body-content">
          { this.renderForm() }
          { this.renderFooter() }
        </div>
        </Drawer>
    );
  }
  async open({
    baseViewId,
    ipfCcmBoId,
  }:  {
    baseViewId: string;
    ipfCcmBoId: string;
  }) {
    this.setState({
      visible: true,
      baseViewId,
      ipfCcmBoId,
    });
    const result = await getIpfCcmBo({
      baseViewId,
      ipfCcmBoId,
    });
    this.setState({
      record: result,
    });
    console.log('....', result);
    const form = this.getForm();
    const formValues = form.getFieldsValue();
    const values: any = {};
    _.forEach(formValues, (v, k) => {
      if (_.isObject(v)) {
        values[k] = _.pick(result[k], _.keys(v));
      } else {
        values[k] = result[k];
      }
    });
    form.setFieldsValue(values);
  }

  private _onClose = () => {
    this.setState({
      visible: false,
    });
  }

  private getForm = () => {
    const form: WrappedFormUtils = this.formRef.current?.getForm();
    return form;
  }

  private save = async () => {
    const formValue = this.getForm().getFieldsValue();
    const { record, baseViewId } = this.state;
    const data = {
      ...record,
      ...formValue,
      rowStatus: ROW_STATUS.MODIFIED,
      ipfCcmBoExtend: {
        ...record.ipfCcmBoExtend,
        ...formValue.ipfCcmBoExtend,
        rowStatus: ROW_STATUS.MODIFIED,
      },
    };
    let result: any;
    try {
      result = await saveOrUpdateIpfCcmBo({
        data,
        baseViewId,
      });
    } catch (e) {
      notification.error({
        message: e?.msg || '失败！',
      });
      return;
    }
    notification.success({
      message: result.msg || '成功！',
    });
    this._onClose();
  }

  private onClose = () => {
    this._onClose();
  }

  private renderForm = () => {
    return (
      <div className="editor-drawer-form">
        <BoForm dicts={this.props.dicts} ref={this.formRef} />
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
        >确定</Button>
      </div>
    );
  }
}

interface IBoFormProps {
  form?: WrappedFormUtils;
  dicts?: IDictsMap;
}
@(Form.create({ name: 'BoForm' }) as any)
class BoForm extends React.PureComponent<IBoFormProps> {
  render() {
    const { getFieldDecorator } = this.props.form;
    const { dicts } = this.props;
    const formItemLayout: Partial<FormProps> = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
      labelAlign: 'left',
      autoComplete: 'off',
    };
    return (
      <Form {...formItemLayout} >
        <FormItem label="业务对象名称" required>
          {
            getFieldDecorator('ipfCcmBoExtend.boName', {
              rules: [
                createRequireRule({ label: '业务对象名称' }),
              ],
            })(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="功能模块" required>
          {
            getFieldDecorator('ipfCcmBoExtend.appModule', {
              rules: [
                createRequireRule({ label: '功能模块' }),
              ],
            })(
              <UiAssociate
                columns={APP_MODULE_ASSOCIATE_COLUMNS}
                labelProp="moduleName"
                valueProp="moduleName"
                labelInit={this.props.form.getFieldValue('ipfCcmBoExtend.appModule')}
                queryMethod={appModuleQueryMehtod}
                onChange={this.onAppModuleChange}
                uniqueKeys={['appModule', 'ipfFciModuleId']}
              />,
            )
          }
        </FormItem>
        <FormItem label="moduleName" style={{ display: 'none' }} >
          {
            getFieldDecorator('ipfCcmBoExtend.moduleName')(
              <Input
                type="hidden"
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="JAVA路径" required>
          {
            getFieldDecorator('ipfCcmBoExtend.javaPath', {
              rules: [
                createRequireRule({ label: 'JAVA路径' }),
              ],
            })(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="主对象">
          {
            getFieldDecorator('ipfCcmBoExtend.isMainObject')(
              <UiCheckbox
                trueValue="X"
                falseValue=""
              />,
            )
          }
        </FormItem>
        <FormItem label="对象类型" required>
          {
            getFieldDecorator('ipfCcmBoExtend.boType', {
              rules: [
                createRequireRule({ label: '对象类型' }),
              ],
            })(
              <Select
                size="small"
                allowClear
                {...DROPDOWN_ALIGN_PROPS}
              >
                {_.map((dicts['IpfCcmBoType']), listItem => (
                  <Option title={listItem.value} key={listItem.key} value={listItem.key}>
                    {listItem.value}
                  </Option>
                ))}
              </Select>,
            )
          }
        </FormItem>
        <FormItem label="表名" required>
          {
            getFieldDecorator('ipfCcmBoExtend.tableName', {
              rules: [
                createRequireRule({ label: '对象类型' }),
              ],
            })(
              <UiAssociate
                columns={TABLE_NAME_ASSOCIATE_COLUMNS}
                labelProp="tableName"
                valueProp="tableName"
                labelInit={this.props.form.getFieldValue('ipfCcmBoExtend.tableName')}
                queryMethod={tableNameQueryMehtod}
                onChange={this.onTableNameChange}
              />,
            )
          }
        </FormItem>
        <FormItem label="表类型" required>
          {
            getFieldDecorator('ipfCcmBoExtend.tableType', {
              rules: [
                createRequireRule({ label: '表类型' }),
              ],
            })(
              <Select
                size="small"
                allowClear
                {...DROPDOWN_ALIGN_PROPS}
              >
                {_.map((dicts['IpfCcmBoTableType']), listItem => (
                  <Option title={listItem.value} key={listItem.key} value={listItem.key}>
                    {listItem.value}
                  </Option>
                ))}
              </Select>,
            )
          }
        </FormItem>
        <FormItem label="描述" required>
          {
            getFieldDecorator('ipfCcmBoExtend.description', {
              rules: [
                createRequireRule({ label: '描述' }),
              ],
            })(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="需扩展JS">
          {
            getFieldDecorator('ipfCcmBoExtend.isExtCtrlJs')(
             <UiCheckbox
                            trueValue="X"
                            falseValue=""
                          />,
            )
          }
        </FormItem>
        <FormItem label="隐藏查看删除">
          {
            getFieldDecorator('ipfCcmBoExtend.isHideViewDelBtn')(
              <UiCheckbox
                             trueValue="X"
                             falseValue=""
                           />,
            )
          }
        </FormItem>
        <FormItem label="刷新合计数">
          {
            getFieldDecorator('ipfCcmBoExtend.isRefreshSum')(
              <UiCheckbox
                             trueValue="X"
                             falseValue=""
                           />,
            )
          }
        </FormItem>
        <FormItem label="生成导入模板">
          {
            getFieldDecorator('ipfCcmBoExtend.isPoiImportTemplate')(
             <UiCheckbox
                            trueValue="X"
                            falseValue=""
                          />,
            )
          }
        </FormItem>
        <FormItem label="生成导出模板">
          {
            getFieldDecorator('ipfCcmBoExtend.isPoiExportTemplate')(
              <UiCheckbox
                             trueValue="X"
                             falseValue=""
                           />,
            )
          }
        </FormItem>
        <FormItem label="代码生成选项">
          {
            getFieldDecorator('ipfCcmBoExtend.generateOption', {
            })(
              <Select
                size="small"
                allowClear
                {...DROPDOWN_ALIGN_PROPS}
              >
                {_.map((dicts['GenerateOption']), listItem => (
                  <Option title={listItem.value} key={listItem.key} value={listItem.key}>
                    {listItem.value}
                  </Option>
                ))}
              </Select>,
            )
          }
        </FormItem>
        <FormItem label="系统消息代码" required>
          {
            getFieldDecorator('ipfCcmBoExtend.descMsgCode')(
              <UiAssociate
                columns={MESSAGE_ASSOCIATE_COLUMNS}
                labelProp="descMsgCode"
                valueProp="messageKey"
                labelInit={this.props.form.getFieldValue('ipfCcmBoExtend.descMsgCode')}
                queryMethod={messageQueryMehtod}
              />,
            )
          }
        </FormItem>
        <FormItem label="刷新页面对象">
          {
            getFieldDecorator('ipfCcmBoExtend.refreshBoName')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="Where条件">
          {
            getFieldDecorator('ipfCcmBoExtend.whereClause')(
              <Input type="textarea" style={ { height:100 } }
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="ID生成器名称">
          {
            getFieldDecorator('ipfCcmBoExtend.idGenerator')(
                 <Input type="textarea" style={ { height:100 } }
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="服务版本号">
          {
            getFieldDecorator('ipfCcmBoExtend.serviceVersion')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>

        <FormItem label="缓存设置">
          {
            getFieldDecorator('ipfCcmBoExtend.isCache')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>

        <FormItem label="自定义key值策略">
          {
            getFieldDecorator('ipfCcmBoExtend.dynaCacheKey')(
              <UiAssociate
                columns={DYNACACHE_KEY_ASSOCIATE_COLUMNS}
                labelProp="dynaCacheKey"
                valueProp="propertyName"
                labelInit={this.props.form.getFieldValue('ipfCcmBoExtend.dynaCacheKey')}
                queryMethod={dynaCacheKeyQueryMehtod}
              />,
            )
          }
        </FormItem>

        <FormItem label="主键key值策略">
          {
            getFieldDecorator('ipfCcmBoExtend.cacheByPk')(
             <UiCheckbox
                            trueValue="X"
                            falseValue=""
                          />,
            )
          }
        </FormItem>
      </Form>
    );
  }
  private onAppModuleChange = (value: string, option: any) => {
    this.props.form.setFieldsValue({
      'ipfCcmBoExtend.moduleName': option?.moduleName,
    });
  }
  private onTableNameChange = (value: string, option: any) => {
    this.props.form.setFieldsValue({
      'ipfCcmBoExtend.tableType': option?.tableType,
    });
  }
}
