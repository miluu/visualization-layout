import { Button, Drawer, Icon, Input, Table, Tabs } from 'antd';
import Form, { FormProps, WrappedFormUtils } from 'antd/lib/form/Form';
import { ColumnProps } from 'antd/lib/table';
import React from 'react';
import { IBoRelation, IBoRelationColumn } from 'src/models/relationsModel';
import { UiBoRelationColumnEditDrawer } from './boRelationColumnEditDrawer';

import './style.less';

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

interface IUiBoRelationEditDrawerProps {

}

interface IUiBoRelationEditDrawerState {
  boRelation: IBoRelation;
  visible: boolean;
  selectedRelationColumns: string[];
  editingRelationColumn: string[];
  columns: Array<ColumnProps<IBoRelationColumn>>;
}

export class UiBoRelationEditDrawer extends React.PureComponent<IUiBoRelationEditDrawerProps, IUiBoRelationEditDrawerState> {
  state: IUiBoRelationEditDrawerState = {
    boRelation: null,
    visible: false,
    selectedRelationColumns: [],
    editingRelationColumn: null,
    columns: [
      {
        title: '操作',
        dataIndex: 'ipfCcmBoRelationColumnId',
        width: '40px',
        fixed: 'left',
        render: (text: string, record: IBoRelationColumn, index: number) => {
          return (
            <>
              <a
                title="编辑"
                onClick={() => this.editBoRelationColumn(record)}
              >
                <Icon type="edit" />
              </a>
              {' '}
              <a
                title="删除"
                onClick={() => this.deleteBoRelationColumn(record)}
              >
                <Icon type="delete" />
              </a>
            </>
          );
        },
      },
      { title: '属性名称', dataIndex: 'propertyName', width: '140px' },
      { title: '字段名', dataIndex: 'columnName', width: '140px' },
      { title: '子属性名', dataIndex: 'subPropertyName', width: '140px' },
      { title: '子字段名', dataIndex: 'subColumnName', width: '140px' },
      { title: '顺序', dataIndex: 'seqNo', width: '140px' },
      { title: '关联属性名', dataIndex: 'linkPropertyName', width: '140px' },
      { title: '关联字段名', dataIndex: 'linkColumnName', width: '140px' },
    ],
  };

  boRelationColumnEditDrawerRef = React.createRef<UiBoRelationColumnEditDrawer>();

  render() {
    const { visible } = this.state;
    return (
      <Drawer
        title="编辑子对象关系"
        className="editor-drawer-common"
        visible={visible}
        onClose={this.onClose}
        width={400}
        destroyOnClose
      >
        <div className="edito-drawer-body-content">
          { this.renderForm() }
          { this.renderTable() }
          { this.renderFooter() }
          <UiBoRelationColumnEditDrawer ref={this.boRelationColumnEditDrawerRef} />
        </div>
      </Drawer>
    );
  }

  open = (options: any) => {
    this.setState({
      visible: true,
    });
  }

  close = () => {
    this.setState({
      boRelation: null,
      visible: false,
      selectedRelationColumns: [],
      editingRelationColumn: null,
    });
  }

  private save = () => {
    console.log('保存。');
  }

  private onClose = () => {
    this.close();
  }

  private editBoRelationColumn = (record: IBoRelationColumn) => {
    console.log(record);
    this.boRelationColumnEditDrawerRef.current.open();
  }

  private deleteBoRelationColumn = (record: IBoRelationColumn) => {
    console.log(record);
  }

  private addBoRelationColumn = () => {
    console.log('addBoRelationColumn');
    this.boRelationColumnEditDrawerRef.current.open();
  }

  private deleteBoRelationColumns = () => {
    console.log('deleteBoRelationColumns', this.state.selectedRelationColumns);
  }

  private renderForm = () => {
    return (
      <div className="editor-drawer-form">
        <BoRelationEditForm />
      </div>
    );
  }

  private onRelationColumnsSelectionChange = (keys: string[]) => {
    this.setState({
      selectedRelationColumns: keys,
    });
  }

  private renderTable = () => {
    const { selectedRelationColumns, columns } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRelationColumns,
      onChange: this.onRelationColumnsSelectionChange,
      columnWidth: '40px',
    };
    return (
      <Tabs defaultActiveKey="1" size="small">
        <TabPane
          tab="子对象关系字段"
          key="1"
        >
          <div className="editor-ui-buttons">
            <Button
              size="small"
              type="primary"
              onClick={this.addBoRelationColumn}
            >新增</Button>
            {' '}
            <Button
              size="small"
              type="danger"
              onClick={this.deleteBoRelationColumns}
            >批量删除</Button>
          </div>
          <div className="editor-common-table">
            <Table
              dataSource={[
                { ipfCcmBoRelationColumnId: '1' },
                { ipfCcmBoRelationColumnId: '2' },
                { ipfCcmBoRelationColumnId: '3' },
                { ipfCcmBoRelationColumnId: '4' },
                { ipfCcmBoRelationColumnId: '5' },
                { ipfCcmBoRelationColumnId: '6' },
              ] as any}
              columns={columns}
              size="small"
              rowKey="ipfCcmBoRelationColumnId"
              rowSelection={rowSelection}
              scroll={{ x: 500, y: 300 }}
              bordered
              pagination={false}
            />
          </div>
        </TabPane>
      </Tabs>
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

interface IBoRelationEditFormProps {
  form?: WrappedFormUtils;
}

@(Form.create({ name: 'BoRelationEditForm' }) as any)
class BoRelationEditForm extends React.PureComponent<IBoRelationEditFormProps> {
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
        <FormItem label="子对象名称" required>
          {
            getFieldDecorator('subBoName')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="对象关系类型">
          {
            getFieldDecorator('subBoRelType')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="对象类型">
          {
            getFieldDecorator('objectType')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="描述">
          {
            getFieldDecorator('description')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="子业务对象保存方式">
          {
            getFieldDecorator('persistentSaveType')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="子业务对象的排序号" required>
          {
            getFieldDecorator('subBoOrderNo')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="表格维护方式">
          {
            getFieldDecorator('gridEditType')(
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
        <FormItem label="页签生成方式">
          {
            getFieldDecorator('tabBuildType')(
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
