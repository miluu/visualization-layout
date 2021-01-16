import { Button, Drawer, Input } from 'antd';
import Form, { FormProps, WrappedFormUtils } from 'antd/lib/form/Form';
import React from 'react';
import { IBoRelationColumn } from 'src/models/relationsModel';

import './style.less';

const FormItem = Form.Item;

interface IUiBoRelationColumnEditDrawerProps {

}

interface IUiBoRelationColumnEditDrawerState {
  boRelationColumn: IBoRelationColumn;
  visible: boolean;
}

export class UiBoRelationColumnEditDrawer extends React.PureComponent<IUiBoRelationColumnEditDrawerProps, IUiBoRelationColumnEditDrawerState> {
  state: IUiBoRelationColumnEditDrawerState = {
    boRelationColumn: null,
    visible: false,
  };
  render() {
    const { visible } = this.state;
    return (
      <Drawer
        title="编辑子对象关系字段"
        className="editor-drawer-common"
        visible={visible}
        onClose={this.onClose}
        width={400}
      >
        <div className="edito-drawer-body-content">
          { this.renderForm() }
          { this.renderFooter() }
        </div>
      </Drawer>
    );
  }

  open = () => {
    this.setState({
      visible: true,
    });
  }

  close = () => {
    this.setState({
      boRelationColumn: null,
      visible: false,
    });
  }

  private save = () => {
    console.log('保存。');
  }

  private onClose = () => {
    this.close();
  }

  private renderForm = () => {
    return (
      <div className="editor-drawer-form">
        <BoRelationColumnEditForm />
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
