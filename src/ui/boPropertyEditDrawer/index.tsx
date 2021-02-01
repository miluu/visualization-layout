import { Button, Drawer, Input, notification, Select, Collapse } from 'antd';
import * as _ from 'lodash';
import Form, { FormProps, WrappedFormUtils } from 'antd/lib/form/Form';
import { Dispatch, AnyAction } from 'redux';
import React from 'react';
import { IBoProperty, IBoPropertyCas } from 'src/models/propertiesModel';
import { UiBoPropertyCasEditDrawer } from './boPropertyCasEditDrawer';

import './style.less';
import { confirm } from 'src/utils';
import { connect } from 'dva';
import { createSaveOrUpdatePropertyEffect } from 'src/models/propertiesAction';
import { DROPDOWN_ALIGN_PROPS, ROW_STATUS } from 'src/config';
import { isFormDataModified } from 'src/utils/forms';
// import produce from 'immer';
import { IAppState, IDictsMap } from 'src/models/appModel';
import { createRequireRule, createRichLengthRule, createFirstLetterLowerRule, createAlphabetOrDigitalRule, createEnUcNumUlStringRule } from 'src/utils/validateRules';
import { IAssociateColumn, IQueryOptions, IQueryResult, UiAssociate } from '../associate';
import { UiCheckbox } from '../checkbox';
import { queryElementCodeMethod, querySearchHelpMethod, queryDictTableMethod } from '../../services/properties';

const { Panel } = Collapse;
const FormItem = Form.Item;
const Option = Select.Option;

interface IUiBoPropertyEditDrawerProps {
  dispatch?: Dispatch<AnyAction>;
  params?: any;
  dicts?: IDictsMap;
}

interface IUiBoPropertyEditDrawerState {
  boProperty: IBoProperty;
  visible: boolean;
  selectedPropertyCass: string[];
  editingPropertyCas: string[];

  boPropertyCass: IBoPropertyCas[];
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
export class UiBoPropertyEditDrawer extends React.PureComponent<IUiBoPropertyEditDrawerProps, IUiBoPropertyEditDrawerState> {
  state: IUiBoPropertyEditDrawerState = {
    boProperty: null,
    boPropertyCass: [],
    visible: false,
    selectedPropertyCass: [],
    editingPropertyCas: null,
    type: 'edit',
  };

  boPropertyCasEditDrawerRef = React.createRef<UiBoPropertyCasEditDrawer>();
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
          {this.renderForm()}
          {this.renderFooter()}
        </div>
      </Drawer>
    );
  }

  open = (options: any = {}) => {
    this.setState({
      visible: true,
      type: options.type,
      boProperty: options.boProperty,
      boPropertyCass: options.boProperty ?.ipfCcmBoPropertyCass,
    });
  }

  close = () => {
    this.setState({
      boProperty: null,
      boPropertyCass: [],
      visible: false,
      selectedPropertyCass: [],
      editingPropertyCas: null,
    });
  }

  // private onBoPropertyCasSubmit = ({ type, data }: any) => {
  //   const { boPropertyCass } = this.state;
  //   let newBoPropertyCass: IBoPropertyCas[];
  //   if (type === 'add') {
  //     newBoPropertyCass = [
  //       data,
  //       ...boPropertyCass || [],
  //     ];
  //   } else {
  //     newBoPropertyCass = produce(boPropertyCass, draft => {
  //       const index = _.findIndex(draft, item => item.ipfCcmBoPropertyCasId === data.ipfCcmBoPropertyCasId);
  //       if (index >= 0) {
  //         draft[index] = data;
  //       }
  //     });
  //   }
  //   this.setState({
  //     boPropertyCass: newBoPropertyCass,
  //   });
  // }

  private getTitle = () => {
    const { type } = this.state;
    if (type === 'add') {
      return '新增属性';
    }
    return '编辑属性';
  }

  private afterVisibleChange = (visible: boolean) => {
    if (visible) {
      const form: WrappedFormUtils = this.formRef.current ?.getForm();
      if (form) {
        form.setFieldsValue(
          _.pick(
            this.state.boProperty,
            _.keys(form.getFieldsValue()),
          ),
        );
      }
    }
  }

  private save = () => {
    const isPropertyModified = this.isDataModified();
    const isPropertyCassModified = this.isPropertyCassModified();
    if (!(isPropertyModified || isPropertyCassModified)) {
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
      const data = this.combineBoPropertyWithFormValues();
      if (isPropertyCassModified) {
        data.ipfCcmBoPropertyCass = _.chain(this.state.boPropertyCass).filter(item => {
          return item.rowStatus === ROW_STATUS.ADDED
            || item.rowStatus === ROW_STATUS.MODIFIED
            || item.rowStatus === ROW_STATUS.DELETED;
        })
          .map(item => {
            if (item.rowStatus === ROW_STATUS.ADDED) {
              return {
                ...item,
                ipfCcmBoPropertyCasId: null,
              };
            }
            return item;
          })
          .value();
      }
      this.props.dispatch(createSaveOrUpdatePropertyEffect(data, this.state.type, () => {
        this.close();
      }));
    });
  }

  private combineBoPropertyWithFormValues = () => {
    const isPropertyModified = this.isDataModified();
    const formData = this.getForm()?.getFieldsValue?.() || {};
    const rowStatusObj: any = {};
    if (this.state.type === 'add') {
      rowStatusObj.rowStatus = ROW_STATUS.ADDED;
      rowStatusObj.ipfCcmBoPropertyId = null;
    } else if (isPropertyModified) {
      rowStatusObj.rowStatus = ROW_STATUS.MODIFIED;
    }
    const data: IBoProperty = {
      ...this.state.boProperty,
      ...formData,
      ...rowStatusObj,
    };
    return data;
  }

  private onClose = async () => {
    const isModified = this.isDataModified() || this.isPropertyCassModified();
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
    const { boProperty } = this.state;
    return isFormDataModified(boProperty, formValues);
  }

  private isPropertyCassModified = () => {
    const { boPropertyCass } = this.state;
    return !!_.find(boPropertyCass, item => {
      return item.rowStatus === ROW_STATUS.MODIFIED
        || item.rowStatus === ROW_STATUS.DELETED
        || item.rowStatus === ROW_STATUS.ADDED;
    });
  }

  private getForm = () => {
    const form: WrappedFormUtils = this.formRef.current ?.getForm();
    return form;
  }

  // private editBoPropertyCas = (record: IBoPropertyCas) => {
  //   this.boPropertyCasEditDrawerRef.current.open({
  //     boPropertyCas: record,
  //     type: 'edit',
  //     boProperty: this.combineBoPropertyWithFormValues(),
  //   });
  // }

  // private deleteBoPropertyCas = (id: string) => {
  //   this.deleteBoPropertyCass([id]);
  // }

  // private addBoPropertyCas = () => {
  //   console.log('addBoPropertyCas');
  //   this.boPropertyCasEditDrawerRef.current.open({
  //     boPropertyCas: {
  //       rowStatus: ROW_STATUS.ADDED,
  //       ipfCcmBoPropertyCasId: createId(),
  //       baseViewId: this.state.boProperty.baseViewId || this.props.params.baseViewId,
  //     } as any,
  //     type: 'add',
  //     boProperty: this.combineBoPropertyWithFormValues(),
  //   });
  // }

  // private deleteBoPropertyCass = (ids?: string[]) => {
  //   const { selectedPropertyCass, boPropertyCass } = this.state;
  //   const willDeleteIds = ids ?? selectedPropertyCass;
  //   const newBoPropertyCass = produce(boPropertyCass, draft => {
  //     _.forEach(willDeleteIds, id => {
  //       const item = _.find(draft, _item => _item.ipfCcmBoPropertyCasId === id);
  //       if (!item) {
  //         return;
  //       }
  //       if (item.rowStatus === ROW_STATUS.ADDED) {
  //         item.rowStatus = ROW_STATUS.ADDED_REMOVE;
  //       } else {
  //         item.rowStatus = ROW_STATUS.DELETED;
  //       }
  //     });
  //   });
  //   const newSelectedPropertyCass = _.differenceWith(selectedPropertyCass, willDeleteIds);
  //   this.setState({
  //     boPropertyCass: newBoPropertyCass,
  //     selectedPropertyCass: newSelectedPropertyCass,
  //   });
  // }

  private renderForm = () => {
    const { dicts } = this.props;
    return (
      <div className="editor-drawer-form">
        <BoPropertyEditForm dicts={dicts} ref={this.formRef} />
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

interface IBoPropertyEditFormProps {
  form?: WrappedFormUtils;
  dicts?: IDictsMap;
}

const ELEMENT_CODE_ASSOCIATE_COLUMNS: IAssociateColumn[] = [
  { title: '数据元素代码', field: 'elementCode' },
  { title: '显示文本', field: 'fieldText' },
  { title: '数据类型', field: 'dataType' },
  { title: '字段长度', field: 'fieldLength' },
  { title: '小数位', field: 'decimals' },
  { title: '数据库类型', field: 'dbType' },
];

const SEARCH_HELP_ASSOCIATE_COLUMNS: IAssociateColumn[] = [
  { title: '搜索帮助名称', field: 'shlpName' },
];

const DICT_TABLE_ASSOCIATE_COLUMNS: IAssociateColumn[] = [
  { title: '数据字典代码', field: 'dictCode' },
  { title: '数据字典名称', field: 'dictName' },
];

@(Form.create({ name: 'BoPropertyEditForm' }) as any)
class BoPropertyEditForm extends React.PureComponent<IBoPropertyEditFormProps> {
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
        <Panel
          key="1"
          header="基本信息"
        />
        <FormItem label="属性名" >
          {
            getFieldDecorator('propertyName', {
              rules: [
                createRequireRule({ label: '属性名称' }),
                createFirstLetterLowerRule({ label: '属性名称' }),
                createAlphabetOrDigitalRule({ label: '属性名称' }),
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
        <FormItem label="字段名" >
          {
            getFieldDecorator('columnName', {
              rules: [
                createRequireRule({ label: '字段名' }),
                createEnUcNumUlStringRule({ label: '字段名' }),
                createRichLengthRule({
                  label: '字段名',
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
        <FormItem label="属性类型">
          {
            getFieldDecorator('propertyType', {
              rules: [
                createRequireRule({ label: '属性类型' }),
                createRichLengthRule({
                  label: '属性类型',
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
                {_.map((dicts['IpfCcmBoPropertyType']), listItem => (
                  <Option title={listItem.value} key={listItem.key} value={listItem.key}>
                    {listItem.value}
                  </Option>
                ))}
              </Select>,
            )
          }
        </FormItem>
        <FormItem label="KEY">
          {
            getFieldDecorator('isKey')(
              <UiCheckbox
                trueValue="X"
                falseValue=""
              />,
            )
          }
        </FormItem>
        <FormItem label="表名" >
          {
            getFieldDecorator('tableName', {
              rules: [
                createRequireRule({ label: '表名' }),
                createEnUcNumUlStringRule({ label: '表名' }),
                createRichLengthRule({
                  label: '表名',
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
        <FormItem label="表别名" >
          {
            getFieldDecorator('tableAliasName')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="物理字段名" >
          {
            getFieldDecorator('physicalColumnName', {
              rules: [
                createEnUcNumUlStringRule({ label: '物理字段名' }),
                createRichLengthRule({
                  label: '物理字段名',
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
        <FormItem label="非空">
          {
            getFieldDecorator('isNotNull')(
              <UiCheckbox
                trueValue="X"
                falseValue=""
              />,
            )
          }
        </FormItem>
        <Panel
          key="2"
          header="属性信息"
        />
        <FormItem label="数据元素代码" >
          {
            getFieldDecorator('elementCode', {
              rules: [
                createRequireRule({ label: '数据元素代码' }),
                createRichLengthRule({
                  label: '数据元素代码',
                  min: 0,
                  max: 50,
                }),
              ],
            })(
              <UiAssociate
                columns={ELEMENT_CODE_ASSOCIATE_COLUMNS}
                labelProp="elementCode"
                valueProp="elementCode"
                labelInit={this.props.form.getFieldValue('elementCode')}
                queryMethod={this.elementCodeQueryMehtod}
                onChange={(value, option) => this.onElementCodeChange(option, 'columnName', 'columnName')}
              />,
            )
          }
        </FormItem>
        <FormItem label="显示文本" >
          {
            getFieldDecorator('fieldText')(
              <Input
                size="small"
                disabled
              />,
            )
          }
        </FormItem>
        <FormItem label="数据类型" >
          {
            getFieldDecorator('dataType')(
              <Select
                size="small"
                allowClear
                disabled
                {...DROPDOWN_ALIGN_PROPS}
              >
                {_.map((dicts['DataTypeCode']), listItem => (
                  <Option title={listItem.value} key={listItem.key} value={listItem.key}>
                    {listItem.value}
                  </Option>
                ))}
              </Select>,
            )
          }
        </FormItem>
        <FormItem label="字段长度" >
          {
            getFieldDecorator('fieldLength')(
              <Input
                size="small"
                disabled
              />,
            )
          }
        </FormItem>
        <FormItem label="小数位" >
          {
            getFieldDecorator('decimals')(
              <Input
                size="small"
                disabled
              />,
            )
          }
        </FormItem>
        <FormItem label="UI组件类型" >
          {
            getFieldDecorator('uiType')(
              <Select
                size="small"
                allowClear
                {...DROPDOWN_ALIGN_PROPS}
              >
                {_.map((dicts['IpfCcmBoUIType']), listItem => (
                  <Option title={listItem.value} key={listItem.key} value={listItem.key}>
                    {listItem.value}
                  </Option>
                ))}
              </Select>,
            )
          }
        </FormItem>
        <Panel
          key="3"
          header="搜索帮助"
        />
        <FormItem label="搜索帮助名" >
          {
            getFieldDecorator('searchHelp')(
              <UiAssociate
                columns={SEARCH_HELP_ASSOCIATE_COLUMNS}
                labelProp="shlpName"
                valueProp="shlpName"
                labelInit={this.props.form.getFieldValue('searchHelp')}
                queryMethod={this.searchHelpQueryMehtod}
                onChange={(value, option) => this.onSearchHelpChange(option, 'searchHelp', 'shlpName')}
              />,
            )
          }
        </FormItem>
        <FormItem label="搜索帮助关联属性" >
          {
            getFieldDecorator('refProName')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="搜索帮助视图" >
          {
            getFieldDecorator('searchHelpViewDesc')(
              <Input
                size="small"
                disabled
              />,
            )
          }
        </FormItem>
        <Panel
          key="4"
          header="数据字典"
        />
        <FormItem label="字典表" >
          {
            getFieldDecorator('dictCode')(
              <UiAssociate
                columns={DICT_TABLE_ASSOCIATE_COLUMNS}
                labelProp="dictCode"
                valueProp="dictCode"
                labelInit={this.props.form.getFieldValue('dictCode')}
                queryMethod={this.dictTableQueryMehtod}
                onChange={(value, option) => this.onSearchHelpChange(option, 'dictCode', 'dictCode')}
              />,
            )
          }
        </FormItem>
        <FormItem label="字典分组值" >
          {
            getFieldDecorator('dictGroupValue')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
      </Form>
    );
  }

  private onElementCodeChange = (option: any, formProp: string, optionProp: string) => {
    this.onSearchHelpChange(option, formProp, optionProp);
    this.props.form.setFieldsValue({
      fieldText: option?.['fieldText'] || null,
      dataType: option?.['dataType'] || null,
      fieldLength: option?.['fieldLength'] || null,
      decimals: option?.['decimals'] || null,
    });
  }

  private onSearchHelpChange = (option: any, formProp: string, optionProp: string) => {
    this.props.form.setFieldsValue({
      [formProp]: option?.[optionProp] || null,
    });
  }

  private searchHelpQueryMehtod = async (options: IQueryOptions): Promise<IQueryResult> => {
    return querySearchHelpMethod(options);
  }

  private dictTableQueryMehtod = async (options: IQueryOptions): Promise<IQueryResult> => {
    return queryDictTableMethod(options);
  }

  private elementCodeQueryMehtod = async (options: IQueryOptions): Promise<IQueryResult> => {
    return queryElementCodeMethod(options);
  }
}
