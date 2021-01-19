import { Button, Drawer, Icon, Input, notification, Select, Table, Tabs } from 'antd';
import * as _ from 'lodash';
import Form, { FormProps, WrappedFormUtils } from 'antd/lib/form/Form';
import { Dispatch, AnyAction } from 'redux';
import { ColumnProps } from 'antd/lib/table';
import React from 'react';
import { IBoMethod, IBoMethodColumn } from 'src/models/methodsModel';
import { UiBoMethodColumnEditDrawer } from './boMethodColumnEditDrawer';

import './style.less';
import { confirm, createId } from 'src/utils';
import { connect } from 'dva';
import { createSaveOrUpdateMethodEffect } from 'src/models/methodsAction';
import { DROPDOWN_ALIGN_PROPS, ROW_STATUS } from 'src/config';
import { isFormDataModified } from 'src/utils/forms';
import produce from 'immer';
import { IAppState, IDictsMap } from 'src/models/appModel';
import { createRichLengthRule } from 'src/utils/validateRules';

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
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

  boMethodColumns: IBoMethodColumn[];

  columns: Array<ColumnProps<IBoMethodColumn>>;
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
    boMethodColumns: [],
    visible: false,
    selectedMethodColumns: [],
    editingMethodColumn: null,
    type: 'edit',
    columns: [
      {
        title: '操作',
        dataIndex: 'ipfCcmBoMethodColumnId',
        width: '40px',
        fixed: 'left',
        render: (text: string, record: IBoMethodColumn) => {
          return (
            <>
              <a
                title="编辑"
                onClick={() => this.editBoMethodColumn(record)}
              >
                <Icon type="edit" />
              </a>
              {' '}
              <a
                title="删除"
                onClick={() => this.deleteBoMethodColumn(text)}
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

  boMethodColumnEditDrawerRef = React.createRef<UiBoMethodColumnEditDrawer>();
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
          { this.renderTable() }
          { this.renderFooter() }
          <UiBoMethodColumnEditDrawer ref={this.boMethodColumnEditDrawerRef} onSubmit={this.onBoMethodColumnSubmit} />
        </div>
      </Drawer>
    );
  }

  open = (options: any = {}) => {
    this.setState({
      visible: true,
      type: options.type,
      boMethod: options.boMethod,
      boMethodColumns: options.boMethod?.ipfCcmBoMethodColumns,
    });
  }

  close = () => {
    this.setState({
      boMethod: null,
      boMethodColumns: [],
      visible: false,
      selectedMethodColumns: [],
      editingMethodColumn: null,
    });
  }

  private onBoMethodColumnSubmit = ({ type, data }: any) => {
    const { boMethodColumns } = this.state;
    let newBoMethodColumns: IBoMethodColumn[];
    if (type === 'add') {
      newBoMethodColumns = [
        data,
        ...boMethodColumns || [],
      ];
    } else {
      newBoMethodColumns = produce(boMethodColumns, draft => {
        const index = _.findIndex(draft, item => item.ipfCcmBoMethodColumnId === data.ipfCcmBoMethodColumnId);
        if (index >= 0) {
          draft[index] = data;
        }
      });
    }
    this.setState({
      boMethodColumns: newBoMethodColumns,
    });
  }

  private getTitle = () => {
    const { type } = this.state;
    if (type === 'add') {
      return '新增子对象关系';
    }
    return '编辑子对象关系';
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
    const isMethodColumnsModified = this.isMethodColumnsModified();
    if (!(isMethodModified || isMethodColumnsModified)) {
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
      if (isMethodColumnsModified) {
        data.ipfCcmBoMethodColumns = _.chain(this.state.boMethodColumns).filter(item => {
          return item.rowStatus === ROW_STATUS.ADDED
            || item.rowStatus === ROW_STATUS.MODIFIED
            || item.rowStatus === ROW_STATUS.DELETED;
        })
          .map(item => {
            if (item.rowStatus === ROW_STATUS.ADDED) {
              return {
                ...item,
                ipfCcmBoMethodColumnId: null,
              };
            }
            return item;
          })
          .value();
      }
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
    const isModified = this.isDataModified() || this.isMethodColumnsModified();
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

  private isMethodColumnsModified = () => {
    const { boMethodColumns } = this.state;
    return !!_.find(boMethodColumns, item => {
      return item.rowStatus === ROW_STATUS.MODIFIED
        || item.rowStatus === ROW_STATUS.DELETED
        || item.rowStatus === ROW_STATUS.ADDED;
    });
  }

  private getForm = () => {
    const form: WrappedFormUtils = this.formRef.current?.getForm();
    return form;
  }

  private editBoMethodColumn = (record: IBoMethodColumn) => {
    this.boMethodColumnEditDrawerRef.current.open({
      boMethodColumn: record,
      type: 'edit',
      boMethod: this.combineBoMethodWithFormValues(),
    });
  }

  private deleteBoMethodColumn = (id: string) => {
    this.deleteBoMethodColumns([id]);
  }

  private addBoMethodColumn = () => {
    console.log('addBoMethodColumn');
    this.boMethodColumnEditDrawerRef.current.open({
      boMethodColumn: {
        rowStatus: ROW_STATUS.ADDED,
        ipfCcmBoMethodColumnId: createId(),
        baseViewId: this.state.boMethod.baseViewId || this.props.params.baseViewId,
      } as any,
      type: 'add',
      boMethod: this.combineBoMethodWithFormValues(),
    });
  }

  private deleteBoMethodColumns = (ids?: string[]) => {
    const { selectedMethodColumns, boMethodColumns } = this.state;
    const willDeleteIds = ids ?? selectedMethodColumns;
    const newBoMethodColumns = produce(boMethodColumns, draft => {
      _.forEach(willDeleteIds, id => {
        const item = _.find(draft, _item => _item.ipfCcmBoMethodColumnId === id);
        if (!item) {
          return;
        }
        if (item.rowStatus === ROW_STATUS.ADDED) {
          item.rowStatus = ROW_STATUS.ADDED_REMOVE;
        } else {
          item.rowStatus = ROW_STATUS.DELETED;
        }
      });
    });
    const newSelectedMethodColumns = _.differenceWith(selectedMethodColumns, willDeleteIds);
    this.setState({
      boMethodColumns: newBoMethodColumns,
      selectedMethodColumns: newSelectedMethodColumns,
    });
  }

  private renderForm = () => {
    const { dicts } = this.props;
    return (
      <div className="editor-drawer-form">
        <BoMethodEditForm dicts={dicts} ref={this.formRef} />
      </div>
    );
  }

  private onMethodColumnsSelectionChange = (keys: string[]) => {
    this.setState({
      selectedMethodColumns: keys,
    });
  }

  private renderTable = () => {
    const { selectedMethodColumns, columns, boMethodColumns } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedMethodColumns,
      onChange: this.onMethodColumnsSelectionChange,
      columnWidth: '40px',
    };
    const renderBoMethodColumns = _.filter(boMethodColumns, item => !(item.rowStatus === ROW_STATUS.DELETED || item.rowStatus === ROW_STATUS.ADDED_REMOVE));
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
              onClick={this.addBoMethodColumn}
            >新增</Button>
            {' '}
            <Button
              size="small"
              type="danger"
              onClick={() => this.deleteBoMethodColumns()}
              disabled={!selectedMethodColumns?.length}
            >批量删除</Button>
          </div>
          <div className="editor-common-table">
            <Table
              dataSource={renderBoMethodColumns || []}
              columns={columns}
              size="small"
              rowKey="ipfCcmBoMethodColumnId"
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
        <FormItem label="属性名称" >
          {
            getFieldDecorator('propertyName')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="对象关系类型">
          {
            getFieldDecorator('subBoRelType', {
              rules: [
                createRichLengthRule({
                  label: '对象关系类型',
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
                {_.map((dicts['SubBoRelType']), listItem => (
                  <Option title={listItem.value} key={listItem.key} value={listItem.key}>
                    {listItem.value}
                  </Option>
                ))}
              </Select>,
            )
          }
        </FormItem>
      </Form>
    );
  }
}
