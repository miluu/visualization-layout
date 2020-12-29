import { Button, Drawer, Input } from 'antd';
import * as _ from 'lodash';
import Form, { FormProps, WrappedFormUtils } from 'antd/lib/form/Form';
import React from 'react';
import { IBoRelationColumn } from 'src/models/relationsModel';

import './style.less';
import { isFormDataModified } from 'src/utils/forms';
import { confirm } from 'src/utils';
import { ROW_STATUS } from 'src/config';

const FormItem = Form.Item;

interface IUiBoRelationColumnEditDrawerProps {
  onSubmit?(data: any): void;
}

interface IUiBoRelationColumnEditDrawerState {
  boRelationColumn: IBoRelationColumn;
  type: string;
  visible: boolean;
}

export class UiBoRelationColumnEditDrawer extends React.PureComponent<IUiBoRelationColumnEditDrawerProps, IUiBoRelationColumnEditDrawerState> {
  state: IUiBoRelationColumnEditDrawerState = {
    boRelationColumn: null,
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

  open = ({ boRelationColumn, type }: { boRelationColumn: IBoRelationColumn, type: string }) => {
    this.setState({
      visible: true,
      type,
      boRelationColumn,
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
        <BoRelationColumnEditForm ref={this.formRef} />
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
}

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
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
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
              <Input
                size="small"
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
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="关联属性名" required>
          {
            getFieldDecorator('linkPropertyName')(
              <Input
                size="small"
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
        <FormItem label="关联对象名称">
          {
            getFieldDecorator('linkBoName')(
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
