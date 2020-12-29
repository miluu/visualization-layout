import { Button, Drawer, Input, InputNumber } from 'antd';
import * as _ from 'lodash';
import Form, { FormProps, WrappedFormUtils } from 'antd/lib/form/Form';
import React from 'react';
import { IBoRelation, IBoRelationColumn } from 'src/models/relationsModel';

import './style.less';
import { isFormDataModified } from 'src/utils/forms';
import { confirm } from 'src/utils';
import { ROW_STATUS } from 'src/config';
import { IAssociateColumn, IQueryOptions, IQueryResult, UiAssociate } from '../associate';
import { queryPropertyNameMethod, querySubPropertyNameMethod } from '../../services/relations';

const FormItem = Form.Item;

interface IUiBoRelationColumnEditDrawerProps {
  onSubmit?(data: any): void;
}

interface IUiBoRelationColumnEditDrawerState {
  boRelationColumn: IBoRelationColumn;
  boRelation: IBoRelation;
  type: string;
  visible: boolean;
}

export class UiBoRelationColumnEditDrawer extends React.PureComponent<IUiBoRelationColumnEditDrawerProps, IUiBoRelationColumnEditDrawerState> {
  state: IUiBoRelationColumnEditDrawerState = {
    boRelationColumn: null,
    boRelation: null,
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

  open = ({ boRelationColumn, type, boRelation }: { boRelationColumn: IBoRelationColumn, boRelation: IBoRelation, type: string }) => {
    this.setState({
      visible: true,
      type,
      boRelationColumn,
      boRelation,
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
    const { boRelationColumn } = this.state;
    return isFormDataModified(boRelationColumn, formValues);

  }

  private getTitle = () => {
    const { type } = this.state;
    if (type === 'add') {
      return '新增子对象关系字段';
    }
    return '编辑子对象关系字段';
  }

  private save = () => {
    const { type } = this.state;
    const { boRelationColumn } = this.state;
    const formValues = this.getForm().getFieldsValue();
    const rowStatusObj: any = {};
    if (type === 'add') {
      rowStatusObj.rowStatus = ROW_STATUS.ADDED;
    } else if (boRelationColumn.rowStatus === ROW_STATUS.NOT_MODIFIED) {
      rowStatusObj.rowStatus = ROW_STATUS.MODIFIED;
    }
    this.props.onSubmit({
      type: this.state.type,
      data: {
        ...boRelationColumn,
        ...formValues,
        ...rowStatusObj,
      },
    });
    this.close();
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
        boRelationColumn: null,
      });
    } else if (form) {
      form.setFieldsValue(
        _.pick(
          this.state.boRelationColumn,
          _.keys(form.getFieldsValue()),
        ),
      );
    }
  }

  private renderForm = () => {
    return (
      <div className="editor-drawer-form">
        <BoRelationColumnEditForm boRelation={this.state.boRelation} ref={this.formRef} />
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

interface IBoRelationColumnEditFormProps {
  form?: WrappedFormUtils;
  boRelation?: IBoRelation;
}

const PROPERTY_NAME_ASSOCIATE_COLUMNS: IAssociateColumn[] = [
  { title: '属性名称', field: 'propertyName' },
  { title: '字段名', field: 'columnName' },
  { title: '显示文本', field: 'fieldText' },
  { title: '数据类型', field: 'dataType' },
  { title: '业务对象名称', field: 'boName' },
];

@(Form.create({ name: 'BoRelationColumnEditForm' }) as any)
class BoRelationColumnEditForm extends React.PureComponent<IBoRelationColumnEditFormProps> {
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
            getFieldDecorator('propertyName')(
              <UiAssociate
                columns={PROPERTY_NAME_ASSOCIATE_COLUMNS}
                labelProp="propertyName"
                valueProp="propertyName"
                labelInit={this.props.form.getFieldValue('propertyName')}
                queryMethod={this.propertyNameQueryMehtod}
              />,
            )
          }
        </FormItem>
        {/* <FormItem label="属性名称" required>
          {
            getFieldDecorator('propertyName')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem> */}
        <FormItem label="字段名" required>
          {
            getFieldDecorator('columnName')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="子属性名">
          {
            getFieldDecorator('subPropertyName')(
              <UiAssociate
                columns={PROPERTY_NAME_ASSOCIATE_COLUMNS}
                labelProp="propertyName"
                valueProp="propertyName"
                labelInit={this.props.form.getFieldValue('subPropertyName')}
                queryMethod={this.subPropertyNameQueryMehtod}
              />,
            )
          }
        </FormItem>
        <FormItem label="子字段名">
          {
            getFieldDecorator('subColumnName')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="顺序">
          {
            getFieldDecorator('seqNo')(
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
            getFieldDecorator('linkPropertyName')(
              <UiAssociate
                columns={PROPERTY_NAME_ASSOCIATE_COLUMNS}
                labelProp="propertyName"
                valueProp="propertyName"
                labelInit={this.props.form.getFieldValue('linkPropertyName')}
                queryMethod={this.linkPropertyNameQueryMehtod}
              />,
            )
          }
        </FormItem>
        <FormItem label="关联字段名">
          {
            getFieldDecorator('linkColumnName')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
      </Form>
    );
  }

  private propertyNameQueryMehtod = async (options: IQueryOptions): Promise<IQueryResult> => {
    const { boRelation } = this.props;
    return queryPropertyNameMethod(options, boRelation?.ipfCcmBoId);
  }

  private subPropertyNameQueryMehtod = async (options: IQueryOptions): Promise<IQueryResult> => {
    const { boRelation } = this.props;
    return querySubPropertyNameMethod(options, boRelation?.subBoName);
  }

  private linkPropertyNameQueryMehtod = async (options: IQueryOptions): Promise<IQueryResult> => {
    const { boRelation } = this.props;
    return querySubPropertyNameMethod(options, boRelation?.linkBoName);
  }
}
