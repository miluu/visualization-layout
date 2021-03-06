import { Button, Drawer, Icon, Input, InputNumber, notification, Select, Table, Tabs } from 'antd';
import * as _ from 'lodash';
import Form, { FormProps, WrappedFormUtils } from 'antd/lib/form/Form';
import { Dispatch, AnyAction } from 'redux';
import { ColumnProps } from 'antd/lib/table';
import React from 'react';
import { IBoRelation, IBoRelationColumn } from 'src/models/relationsModel';
import { UiBoRelationColumnEditDrawer } from './boRelationColumnEditDrawer';

import './style.less';
import { confirm, createId } from 'src/utils';
import { connect } from 'dva';
import { createSaveOrUpdateRelationEffect } from 'src/models/relationsAction';
import { DROPDOWN_ALIGN_PROPS, ROW_STATUS } from 'src/config';
import { isFormDataModified } from 'src/utils/forms';
import produce from 'immer';
import { IAppState, IDictsMap } from 'src/models/appModel';
import { createFirstLetterLowerRule, createNotSpecialCharacterRule, createRequireRule, createRichLengthRule } from 'src/utils/validateRules';
import { UiAssociate } from '../associate';
import { queryBoName } from 'src/services/bo';

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const Option = Select.Option;

interface IUiBoRelationEditDrawerProps {
  dispatch?: Dispatch<AnyAction>;
  params?: any;
  dicts?: IDictsMap;
}

interface IUiBoRelationEditDrawerState {
  boRelation: IBoRelation;
  visible: boolean;
  selectedRelationColumns: string[];
  editingRelationColumn: string[];

  boRelationColumns: IBoRelationColumn[];

  columns: Array<ColumnProps<IBoRelationColumn>>;
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
export class UiBoRelationEditDrawer extends React.PureComponent<IUiBoRelationEditDrawerProps, IUiBoRelationEditDrawerState> {
  state: IUiBoRelationEditDrawerState = {
    boRelation: null,
    boRelationColumns: [],
    visible: false,
    selectedRelationColumns: [],
    editingRelationColumn: null,
    type: 'edit',
    columns: [
      {
        title: '操作',
        dataIndex: 'ipfCcmBoRelationColumnId',
        width: '40px',
        fixed: 'left',
        render: (text: string, record: IBoRelationColumn) => {
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
                onClick={() => this.deleteBoRelationColumn(text)}
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
          <UiBoRelationColumnEditDrawer ref={this.boRelationColumnEditDrawerRef} onSubmit={this.onBoRelationColumnSubmit} />
        </div>
      </Drawer>
    );
  }

  open = (options: any = {}) => {
    this.setState({
      visible: true,
      type: options.type,
      boRelation: options.boRelation,
      boRelationColumns: options.boRelation?.ipfCcmBoRelationColumns,
    });
  }

  close = () => {
    this.setState({
      boRelation: null,
      boRelationColumns: [],
      visible: false,
      selectedRelationColumns: [],
      editingRelationColumn: null,
    });
  }

  private onBoRelationColumnSubmit = ({ type, data }: any) => {
    const { boRelationColumns } = this.state;
    let newBoRelationColumns: IBoRelationColumn[];
    if (type === 'add') {
      newBoRelationColumns = [
        data,
        ...boRelationColumns || [],
      ];
    } else {
      newBoRelationColumns = produce(boRelationColumns, draft => {
        const index = _.findIndex(draft, item => item.ipfCcmBoRelationColumnId === data.ipfCcmBoRelationColumnId);
        if (index >= 0) {
          draft[index] = data;
        }
      });
    }
    this.setState({
      boRelationColumns: newBoRelationColumns,
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
            this.state.boRelation,
            _.keys(form.getFieldsValue()),
          ),
        );
      }
    }
  }

  private save = () => {
    const isRelationModified = this.isDataModified();
    const isRelationColumnsModified = this.isRelationColumnsModified();
    if (!(isRelationModified || isRelationColumnsModified)) {
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
      const data = this.combineBoRelationWithFormValues();
      if (isRelationColumnsModified) {
        data.ipfCcmBoRelationColumns = _.chain(this.state.boRelationColumns).filter(item => {
          return item.rowStatus === ROW_STATUS.ADDED
            || item.rowStatus === ROW_STATUS.MODIFIED
            || item.rowStatus === ROW_STATUS.DELETED;
        })
          .map(item => {
            if (item.rowStatus === ROW_STATUS.ADDED) {
              return {
                ...item,
                ipfCcmBoRelationColumnId: null,
              };
            }
            return item;
          })
          .value();
      }
      this.props.dispatch(createSaveOrUpdateRelationEffect(data, this.state.type, () => {
        this.close();
      }));
    });
  }

  private combineBoRelationWithFormValues = () =>  {
    const isRelationModified = this.isDataModified();
    const formData = this.getForm()?.getFieldsValue?.() || {};
    const rowStatusObj: any = {};
    if (this.state.type === 'add') {
      rowStatusObj.rowStatus = ROW_STATUS.ADDED;
      rowStatusObj.ipfCcmBoRelationId = null;
    } else if (isRelationModified) {
      rowStatusObj.rowStatus = ROW_STATUS.MODIFIED;
    }
    const data: IBoRelation = {
      ...this.state.boRelation,
      ...formData,
      ...rowStatusObj,
    };
    return data;
  }

  private onClose = async () => {
    const isModified = this.isDataModified() || this.isRelationColumnsModified();
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
    const { boRelation } = this.state;
    return isFormDataModified(boRelation, formValues);
  }

  private isRelationColumnsModified = () => {
    const { boRelationColumns } = this.state;
    return !!_.find(boRelationColumns, item => {
      return item.rowStatus === ROW_STATUS.MODIFIED
        || item.rowStatus === ROW_STATUS.DELETED
        || item.rowStatus === ROW_STATUS.ADDED;
    });
  }

  private getForm = () => {
    const form: WrappedFormUtils = this.formRef.current?.getForm();
    return form;
  }

  private editBoRelationColumn = (record: IBoRelationColumn) => {
    this.boRelationColumnEditDrawerRef.current.open({
      boRelationColumn: record,
      type: 'edit',
      boRelation: this.combineBoRelationWithFormValues(),
    });
  }

  private deleteBoRelationColumn = async (id: string) => {
    return this.deleteBoRelationColumns([id]);
  }

  private addBoRelationColumn = () => {
    console.log('addBoRelationColumn');
    this.boRelationColumnEditDrawerRef.current.open({
      boRelationColumn: {
        rowStatus: ROW_STATUS.ADDED,
        ipfCcmBoRelationColumnId: createId(),
        baseViewId: this.state.boRelation.baseViewId || this.props.params.baseViewId,
      } as any,
      type: 'add',
      boRelation: this.combineBoRelationWithFormValues(),
    });
  }

  private deleteBoRelationColumns = async (ids?: string[]) => {
    const b = await confirm({ content: '确认删除?' });
    if (!b) {
      return;
    }
    const { selectedRelationColumns, boRelationColumns } = this.state;
    const willDeleteIds = ids ?? selectedRelationColumns;
    const newBoRelationColumns = produce(boRelationColumns, draft => {
      _.forEach(willDeleteIds, id => {
        const item = _.find(draft, _item => _item.ipfCcmBoRelationColumnId === id);
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
    const newSelectedRelationColumns = _.differenceWith(selectedRelationColumns, willDeleteIds);
    this.setState({
      boRelationColumns: newBoRelationColumns,
      selectedRelationColumns: newSelectedRelationColumns,
    });
  }

  private renderForm = () => {
    const { dicts } = this.props;
    return (
      <div className="editor-drawer-form">
        <BoRelationEditForm dicts={dicts} ref={this.formRef} />
      </div>
    );
  }

  private onRelationColumnsSelectionChange = (keys: string[]) => {
    this.setState({
      selectedRelationColumns: keys,
    });
  }

  private renderTable = () => {
    const { selectedRelationColumns, columns, boRelationColumns } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRelationColumns,
      onChange: this.onRelationColumnsSelectionChange,
      columnWidth: '40px',
    };
    const renderBoRelationColumns = _.filter(boRelationColumns, item => !(item.rowStatus === ROW_STATUS.DELETED || item.rowStatus === ROW_STATUS.ADDED_REMOVE));
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
              onClick={() => this.deleteBoRelationColumns()}
              disabled={!selectedRelationColumns?.length}
            >批量删除</Button>
          </div>
          <div className="editor-common-table">
            <Table
              dataSource={renderBoRelationColumns || []}
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

const BO_NAME_COLUMNS = [
  { title: '业务对象名称', field: 'boName' },
  { title: '视图名称', field: 'ownSourceViewDesc' },
  { title: '视图ID', field: 'ownSourceViewId' },
];

interface IBoRelationEditFormProps {
  form?: WrappedFormUtils;
  dicts?: IDictsMap;
}

@(Form.create({ name: 'BoRelationEditForm' }) as any)
class BoRelationEditForm extends React.PureComponent<IBoRelationEditFormProps> {
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
            getFieldDecorator('propertyName', {
              rules: [
                createRequireRule({ label: '属性名称' }),
                createFirstLetterLowerRule({ label: '属性名称' }),
                createRichLengthRule({
                  label: '属性名称',
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
        <FormItem label="子对象名称" >
          {
            getFieldDecorator('subBoName', {
              rules: [
                createRequireRule({ label: '子对象名称' }),
                createRichLengthRule({
                  label: '子对象名称',
                  min: 0,
                  max: 200,
                }),
              ],
            })(
              <UiAssociate
                columns={BO_NAME_COLUMNS}
                labelProp="boName"
                valueProp="boName"
                labelInit={this.props.form.getFieldValue('subBoName')}
                queryMethod={queryBoName}
                onChange={this.onSubBoNameChange}
              />,
            )
          }
        </FormItem>
        <FormItem label="子对象视图" >
          {
            getFieldDecorator('subBoViewDesc')(
              <Input
                size="small"
                disabled={true}
              />,
            )
          }
        </FormItem>
        <FormItem label="子对象视图Id" style={{ display: 'none' }} >
          {
            getFieldDecorator('subBoViewId')(
              <Input
                size="small"
                disabled={true}
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
        <FormItem label="对象类型">
          {
            getFieldDecorator('objectType', {
              rules: [
                createRichLengthRule({
                  label: '对象类型',
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
                {_.map((dicts['ObjectType']), listItem => (
                  <Option title={listItem.value} key={listItem.key} value={listItem.key}>
                    {listItem.value}
                  </Option>
                ))}
              </Select>,
            )
          }
        </FormItem>
        <FormItem label="描述">
          {
            getFieldDecorator('description', {
              rules: [
                createRichLengthRule({
                  label: '描述',
                  min: 0,
                  max: 1000,
                }),
                createNotSpecialCharacterRule({ label: '描述' }),
              ],
            })(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="子业务对象保存方式">
          {
            getFieldDecorator('persistentSaveType', {
              rules: [
                createRichLengthRule({
                  label: '子业务对象保存方式',
                  min: 0,
                  max: 50,
                }),
                ...this.props.form.getFieldValue('objectType') === '0' ? [
                  createRequireRule({ label: '子业务对象保存方式' }),
                ] : [],
              ],
            })(
              <Select
                size="small"
                allowClear
                {...DROPDOWN_ALIGN_PROPS}
              >
                {_.map((dicts['PersistentSaveType']), listItem => (
                  <Option title={listItem.value} key={listItem.key} value={listItem.key}>
                    {listItem.value}
                  </Option>
                ))}
              </Select>,
            )
          }
        </FormItem>
        <FormItem label="子业务对象的排序号" >
          {
            getFieldDecorator('subBoOrderNo')(
              <InputNumber
                size="small"
                precision={0}
                min={0}
                style={{ width: '100%' }}
              />,
            )
          }
        </FormItem>
        <FormItem label="表格维护方式">
          {
            getFieldDecorator('gridEditType', {
              rules: [
                createRichLengthRule({
                  label: '表格维护方式',
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
                {_.map((dicts['gridEditType']), listItem => (
                  <Option title={listItem.value} key={listItem.key} value={listItem.key}>
                    {listItem.value}
                  </Option>
                ))}
              </Select>,
            )
          }
        </FormItem>
        <FormItem label="关联对象名称">
          {
            getFieldDecorator('linkBoName', {
              rules: [
                createRichLengthRule({
                  label: '关联对象名称',
                  min: 0,
                  max: 200,
                }),
              ],
            })(
              <UiAssociate
                columns={BO_NAME_COLUMNS}
                labelProp="boName"
                valueProp="boName"
                labelInit={this.props.form.getFieldValue('linkBoName')}
                queryMethod={queryBoName}
                onChange={this.onLinkBoNameChange}
              />,
            )
          }
        </FormItem>

        <FormItem label="关联对象视图" >
          {
            getFieldDecorator('linkBoViewDesc')(
              <Input
                size="small"
                disabled={true}
              />,
            )
          }
        </FormItem>
        <FormItem label="关联对象视图Id" style={{ display: 'none' }}>
          {
            getFieldDecorator('linkBoViewId')(
              <Input
                size="small"
                disabled={true}
              />,
            )
          }
        </FormItem>

        <FormItem label="页签生成方式">
          {
            getFieldDecorator('tabBuildType', {
              rules: [
                createRichLengthRule({
                  label: '页签生成方式',
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
                {_.map((dicts['tabBuildType']), listItem => (
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
  onSubBoNameChange = (value: string, option: any) => {
    this.props.form.setFieldsValue({
      subBoViewDesc: option?.ownSourceViewDesc,
      subBoViewId: option?.ownSourceViewId,
    });
  }
  onLinkBoNameChange = (value: string, option: any) => {
    this.props.form.setFieldsValue({
      linkBoViewDesc: option?.ownSourceViewDesc,
      linkBoViewId: option?.ownSourceViewId,
    });
  }
}
