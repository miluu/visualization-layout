import { Button, Drawer, Input, InputNumber } from 'antd';
import * as _ from 'lodash';
import Form, { FormProps, WrappedFormUtils } from 'antd/lib/form/Form';
import React from 'react';
import { IBoMethod, IBoMethodColumn } from 'src/models/methodsModel';

import './style.less';
import { isFormDataModified } from 'src/utils/forms';
import { confirm } from 'src/utils';
import { ROW_STATUS } from 'src/config';
import { IAssociateColumn, IQueryOptions, IQueryResult, UiAssociate } from '../associate';
import { queryPropertyNameMethod, querySubPropertyNameMethod } from '../../services/methods';
import { createAlphabetOrDigitalRule, createEnUcNumUlStringRule, createRequireRule, createRichLengthRule } from 'src/utils/validateRules';

const FormItem = Form.Item;

interface IUiBoMethodColumnEditDrawerProps {
  onSubmit?(data: any): void;
}

interface IUiBoMethodColumnEditDrawerState {
  boMethodColumn: IBoMethodColumn;
  boMethod: IBoMethod;
  type: string;
  visible: boolean;
}

export class UiBoMethodColumnEditDrawer extends React.PureComponent<IUiBoMethodColumnEditDrawerProps, IUiBoMethodColumnEditDrawerState> {
  state: IUiBoMethodColumnEditDrawerState = {
    boMethodColumn: null,
    boMethod: null,
    type: 'edit',
    visible: false,
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
        afterVisibleChange={this.afterVisibleChange}
      >
        <div className="edito-drawer-body-content">
          { this.renderForm() }
          { this.renderFooter() }
        </div>
      </Drawer>
    );
  }

  open = ({ boMethodColumn, type, boMethod }: { boMethodColumn: IBoMethodColumn, boMethod: IBoMethod, type: string }) => {
    this.setState({
      visible: true,
      type,
      boMethodColumn,
      boMethod,
    });
  }

  close = () => {
    this.setState({
      visible: false,
    });
  }

  private getForm() {
    const form: WrappedFormUtils = this.formRef.current?.getForm();
    return form;
  }

  private isDataModified() {
    const form = this.getForm();
    if (!form) {
      return false;
    }
    const formValues = form.getFieldsValue();
    const { boMethodColumn } = this.state;
    return isFormDataModified(boMethodColumn, formValues);

  }

  private getTitle = () => {
    const { type } = this.state;
    if (type === 'add') {
      return '新增子对象关系字段';
    }
    return '编辑子对象关系字段';
  }

  private save = () => {
    this.getForm().validateFields(null, { force: true }, (err) => {
      if (err) {
        return;
      }
      const { type } = this.state;
      const { boMethodColumn } = this.state;
      const formValues = this.getForm().getFieldsValue();
      const rowStatusObj: any = {};
      if (type === 'add') {
        rowStatusObj.rowStatus = ROW_STATUS.ADDED;
      } else if (boMethodColumn.rowStatus === ROW_STATUS.NOT_MODIFIED) {
        rowStatusObj.rowStatus = ROW_STATUS.MODIFIED;
      }
      this.props.onSubmit({
        type: this.state.type,
        data: {
          ...boMethodColumn,
          ...formValues,
          ...rowStatusObj,
        },
      });
      this.close();
    });
  }

  private onClose = async () => {
    if (
      this.isDataModified()
      && !await confirm({ content: '数据已修改，确定关闭？' })
    ) {
      return;
    }
    this.close();
  }

  private afterVisibleChange = (visible: boolean) => {
    const form: WrappedFormUtils = this.formRef.current?.getForm();
    if (!visible) {
      if (form) {
        this.formRef.current?.getForm()?.resetFields();
      }
      this.setState({
        boMethodColumn: null,
      });
    } else if (form) {
      form.setFieldsValue(
        _.pick(
          this.state.boMethodColumn,
          _.keys(form.getFieldsValue()),
        ),
      );
    }
  }

  private renderForm = () => {
    return (
      <div className="editor-drawer-form">
        <BoMethodColumnEditForm boMethod={this.state.boMethod} ref={this.formRef} />
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

interface IBoMethodColumnEditFormProps {
  form?: WrappedFormUtils;
  boMethod?: IBoMethod;
}

const PROPERTY_NAME_ASSOCIATE_COLUMNS: IAssociateColumn[] = [
  { title: '属性名称', field: 'propertyName' },
  { title: '字段名', field: 'columnName' },
  { title: '显示文本', field: 'fieldText' },
  { title: '数据类型', field: 'dataType' },
  { title: '业务对象名称', field: 'boName' },
];

@(Form.create({ name: 'BoMethodColumnEditForm' }) as any)
class BoMethodColumnEditForm extends React.PureComponent<IBoMethodColumnEditFormProps> {
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
        <FormItem label="属性名称" required>
          {
            getFieldDecorator('propertyName', {
              rules: [
                createRichLengthRule({
                  label: '属性名称',
                  min: 0,
                  max: 200,
                }),
                createAlphabetOrDigitalRule({ label: '属性名称' }),
              ],
            })(
              <UiAssociate
                columns={PROPERTY_NAME_ASSOCIATE_COLUMNS}
                labelProp="propertyName"
                valueProp="propertyName"
                labelInit={this.props.form.getFieldValue('propertyName')}
                queryMethod={this.propertyNameQueryMehtod}
                onChange={(value, option) => this.onPropertyNameChange(option, 'columnName', 'columnName')}
              />,
            )
          }
        </FormItem>
        <FormItem label="字段名" required>
          {
            getFieldDecorator('columnName', {
              rules: [
                createRichLengthRule({
                  label: '字段名',
                  min: 0,
                  max: 200,
                }),
                createEnUcNumUlStringRule({ label: '字段名' }),
              ],
            })(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="子属性名">
          {
            getFieldDecorator('subPropertyName', {
              rules: [
                createRichLengthRule({
                  label: '子属性名',
                  min: 0,
                  max: 200,
                }),
                createAlphabetOrDigitalRule({ label: '子属性名' }),
              ],
            })(
              <UiAssociate
                columns={PROPERTY_NAME_ASSOCIATE_COLUMNS}
                labelProp="propertyName"
                valueProp="propertyName"
                labelInit={this.props.form.getFieldValue('subPropertyName')}
                queryMethod={this.subPropertyNameQueryMehtod}
                onChange={(value, option) => this.onPropertyNameChange(option, 'subColumnName', 'columnName')}
              />,
            )
          }
        </FormItem>
        <FormItem label="子字段名">
          {
            getFieldDecorator('subColumnName', {
              rules: [
                createRichLengthRule({
                  label: '子字段名',
                  min: 0,
                  max: 200,
                }),
                createEnUcNumUlStringRule({ label: '子字段名' }),
              ],
            })(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="顺序">
          {
            getFieldDecorator('seqNo', {
              rules: [
                createRequireRule({ label: '顺序' }),
              ],
            })(
              <InputNumber
                size="small"
                precision={0}
                min={0}
                style={{ width: '100%' }}
              />,
            )
          }
        </FormItem>
        <FormItem label="关联属性名" required>
          {
            getFieldDecorator('linkPropertyName', {
              rules: [
                createRichLengthRule({
                  label: '关联属性名',
                  min: 0,
                  max: 200,
                }),
                createAlphabetOrDigitalRule({ label: '关联属性名' }),
              ],
            })(
              <UiAssociate
                columns={PROPERTY_NAME_ASSOCIATE_COLUMNS}
                labelProp="propertyName"
                valueProp="propertyName"
                labelInit={this.props.form.getFieldValue('linkPropertyName')}
                queryMethod={this.linkPropertyNameQueryMehtod}
                onChange={(value, option) => this.onPropertyNameChange(option, 'linkColumnName', 'columnName')}
              />,
            )
          }
        </FormItem>
        <FormItem label="关联字段名">
          {
            getFieldDecorator('linkColumnName', {
              rules: [
                createRichLengthRule({
                  label: '关联字段名',
                  min: 0,
                  max: 200,
                }),
                createEnUcNumUlStringRule({ label: '关联字段名' }),
              ],
            })(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
      </Form>
    );
  }

  private onPropertyNameChange = (option: any, formProp: string, optionProp: string) => {
    this.props.form.setFieldsValue({
      [formProp]: option?.[optionProp] || null,
    });
  }

  private propertyNameQueryMehtod = async (options: IQueryOptions): Promise<IQueryResult> => {
    const { boMethod } = this.props;
    return queryPropertyNameMethod(options, boMethod?.ipfCcmBoId);
  }

  private subPropertyNameQueryMehtod = async (options: IQueryOptions): Promise<IQueryResult> => {
    const { boMethod } = this.props;
    return querySubPropertyNameMethod(options, boMethod?.subBoName);
  }

  private linkPropertyNameQueryMehtod = async (options: IQueryOptions): Promise<IQueryResult> => {
    const { boMethod } = this.props;
    return querySubPropertyNameMethod(options, boMethod?.linkBoName);
  }
}
