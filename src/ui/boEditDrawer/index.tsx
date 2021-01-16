import * as React from 'react';
import { Drawer, Button, Input, notification } from 'antd';
import Form, { FormProps, WrappedFormUtils } from 'antd/lib/form/Form';
import * as _ from 'lodash';
import './style.less';
import { getIpfCcmBo, saveOrUpdateIpfCcmBo } from 'src/services/bo';
import { ROW_STATUS } from 'src/config';

window['_'] = _;

const FormItem = Form.Item;

export interface IUiAssociateProps {
  disabled?: boolean;
}
export interface IUiDrawerEditorModalState {
  visible?: boolean;
  baseViewId?: string;
  ipfCcmBoId?: string;
  record?: any;
}

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
        <BoForm ref={this.formRef} />
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
}
@(Form.create({ name: 'BoForm' }) as any)
class BoForm extends React.PureComponent<IBoFormProps> {
  render() {
    const { getFieldDecorator } = this.props.form;
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
            getFieldDecorator('ipfCcmBoExtend.boName')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="功能模块" required>
          {
            getFieldDecorator('ipfCcmBoExtend.appModule')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="JAVA路径">
          {
            getFieldDecorator('ipfCcmBoExtend.javaPath')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="主对象">
          {
            getFieldDecorator('ipfCcmBoExtend.isMainObject')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="对象类型">
          {
            getFieldDecorator('ipfCcmBoExtend.boType')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="表名">
          {
            getFieldDecorator('ipfCcmBoExtend.tableName')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="表类型" required>
          {
            getFieldDecorator('ipfCcmBoExtend.tableType')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="描述">
          {
            getFieldDecorator('ipfCcmBoExtend.description')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="需扩展JS">
          {
            getFieldDecorator('ipfCcmBoExtend.isExtCtrlJs')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="隐藏查看删除">
          {
            getFieldDecorator('ipfCcmBoExtend.isHideViewDelBtn')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="刷新合计数">
          {
            getFieldDecorator('ipfCcmBoExtend.isRefreshSum')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="生成导入模板">
          {
            getFieldDecorator('ipfCcmBoExtend.isPoiImportTemplate')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="生成导出模板">
          {
            getFieldDecorator('ipfCcmBoExtend.isPoiExportTemplate')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="代码生成选项">
          {
            getFieldDecorator('ipfCcmBoExtend.generateOption')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="系统消息代码">
          {
            getFieldDecorator('ipfCcmBoExtend.descMsgCode')(
              <Input
                size="small"
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
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="ID生成器名称">
          {
            getFieldDecorator('ipfCcmBoExtend.idGenerator')(
              <Input
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
              <Input
                size="small"
              />,
            )
          }
        </FormItem>

        <FormItem label="主键key值策略">
          {
            getFieldDecorator('ipfCcmBoExtend.cacheByPk')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
      </Form>
    );
  }
}
