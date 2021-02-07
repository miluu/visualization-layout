import { Button, Drawer, Input, Select, notification, Checkbox } from 'antd';
import * as _ from 'lodash';
import Form, { FormProps, WrappedFormUtils } from 'antd/lib/form/Form';
// import { ColumnProps } from 'antd/lib/table';
import React from 'react';
/*import { IPageList, IPageListColumn } from 'src/models/relationsModel';
import { UiPageListColumnEditDrawer } from './pageListColumnEditDrawer';*/

import './style.less';
import { IIpfCcmPage } from '../../routes/Visualization/types';
import { DROPDOWN_ALIGN_PROPS, ROW_STATUS } from '../../config';
import { isFormDataModified } from '../../utils/forms';
import { createAddBoPageEffect, createUpdateBoPageEffect } from 'src/models/pagesActions';
import { queryBoName, getIpfCcmBo } from '../../services/bo';
import { getIpfCcmBoPage } from '../../services/page';
import { queryBusinessTypeMethod } from '../../services/businessTypes';

import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import { IAppState, IDictsMap } from 'src/models/appModel';
import { createAlphabetOrDigitalRule, createRequireRule, createRichLengthRule, createUniqGlRules } from 'src/utils/validateRules';
import { confirm } from 'src/utils';
import { IAssociateColumn, IQueryOptions, IQueryResult, UiAssociate } from '../associate';

const FormItem = Form.Item;
const Option = Select.Option;
// const TabPane = Tabs.TabPane;

interface IUiPageListEditDrawerProps {
  dispatch?: Dispatch<AnyAction>;
  params?: any;
  dicts?: IDictsMap;
}

interface IUiPageListEditDrawerState {
  page: IIpfCcmPage;
  visible: boolean;
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
export class UiPageListEditDrawer extends React.PureComponent<IUiPageListEditDrawerProps, IUiPageListEditDrawerState> {
  state: IUiPageListEditDrawerState = {
    page: null,
    visible: false,
    type: null,
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
        destroyOnClose
        afterVisibleChange={this.afterVisibleChange}
      >
        <div className="edito-drawer-body-content">
          { this.renderForm() }
          { this.renderFooter() }
        </div>
      </Drawer>
    );
  }

  componentDidMount() {
    // this.props.dispatch(createLoadBusinessTypesEffect());
  }

  // 打开抽屉界面，传入要编辑页面数据
  async open({ type, page }:{ type: any, page: IIpfCcmPage }) {
    let record = page;
    switch (type) {
      case 'add':
        record.rowStatus = ROW_STATUS.ADDED;
        record.baseViewId = this.props.params.baseViewId;
        // 是否需要判断
        record.ipfCcmBoId = this.props.params.ipfCcmBoId;
        const ipfCcmBo = await getIpfCcmBo({
          baseViewId: this.props.params.baseViewId,
          ipfCcmBoId: this.props.params.ipfCcmBoId,
        });
        record.boName = ipfCcmBo?.boName;
        record.ownSourceViewDesc = ipfCcmBo?.ownSourceViewDesc;
        record.ownSourceViewId = ipfCcmBo?.ownSourceViewId;
        break;
      case 'copy':
        record = await getIpfCcmBoPage({
          baseViewId: this.props.params.baseViewId,
          ipfCcmBoPageId: record.ipfCcmBoPageId,
        });
        record.rowStatus = ROW_STATUS.ADDED;
        record.copyPageId = record.ipfCcmBoPageId;
        record.ipfCcmBoPageId = null;
        record.baseViewId = this.props.params.baseViewId;
        break;
      case 'edit':
        record = await getIpfCcmBoPage({
          baseViewId: this.props.params.baseViewId,
          ipfCcmBoPageId: record.ipfCcmBoPageId,
        });
        record.rowStatus = ROW_STATUS.MODIFIED;
        break;
      default:
        alert(`未知的操作类型：${type}`);
    }
    this.setState({
      type,
      page: record,
      visible: true,
    });
  }

  close = () => {
    this.setState({
      page: null,
      visible: false,
      type: null,
    });
  }

  private getTitle = () => {
    const { type } = this.state;
    if (type === 'add') {
      return '新增页面列表';
    }
    if (type === 'copy') {
      return '复制页面列表';
    }
    return '编辑页面列表';
  }

  private afterVisibleChange = (visible: boolean) => {
    if (visible) {
      const form: WrappedFormUtils = this.formRef.current?.getForm();
      if (form) {
        form.setFieldsValue(
          _.pick(
            this.state.page,
            _.keys(form.getFieldsValue()),
          ),
        );
      }
    }
  }

  private save = async () => {
    switch (this.state.type) {
      case 'add':
        await this.saveIpfCcmBoPage(this.state.page);
        break;
      case 'edit':
        await this.updateIpfCcmBoPage(this.state.page);
        break;
      case 'copy':
        await this.copyIpfCcmBoPage(this.state.page);
        break;
    }
    // 重新加载刷新页面列表
    this.props.dispatch({
      type: 'LoadPageListEffect',
    });

  }

  // 关闭弹窗前进行修改状态的判断
  private onClose = async () => {
    const isModified = this.isDataModified();
    if (isModified) {
      const b = await confirm({ content: '数据已修改，确定关闭？' });
      if (!b) {
        return;
      }
    }
    this.close();
  }

  private renderForm = () => {
    const { dicts } = this.props;
    return (
      <div className="editor-drawer-form">
        <PageListEditForm dicts={dicts} ref={this.formRef} page={this.state.page} />
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

  private combineBoPageWithFormValues = () =>  {
    const isPageModified = this.isDataModified();
    const formData = this.getForm()?.getFieldsValue?.() || {};
    const rowStatusObj: any = {};
    if (this.state.type === 'add' || this.state.type === 'copy') {
      rowStatusObj.rowStatus = ROW_STATUS.ADDED;
      rowStatusObj.ipfCcmBoPageId = null;
    } else if (isPageModified) {
      rowStatusObj.rowStatus = ROW_STATUS.MODIFIED;
    }
    const data: IIpfCcmPage = {
      ...this.state.page,
      ...formData,
      ...rowStatusObj,
    };
    if (data.isDataPenetration && data.isDataPenetration.toString() === 'true') {
      data.isDataPenetration = 'Y';
    } else {
      data.isDataPenetration = 'N';
    }
    if (data.isPageDispSetting && data.isPageDispSetting.toString() === 'true') {
      data.isPageDispSetting = 'X';
    } else {
      data.isPageDispSetting = '';
    }
    return data;
  }

  private isDataModified = () => {
    const form = this.getForm();
    if (!form) {
      return false;
    }
    const formValues = form.getFieldsValue();
    const { page } = this.state;
    if (!page) {
      return false;
    }
    return isFormDataModified(page, formValues);
  }

  private getForm = () => {
    const form: WrappedFormUtils = this.formRef.current?.getForm();
    return form;
  }

  private saveIpfCcmBoPage = (page: IIpfCcmPage) => {
    console.log(page);
    const isPageModified = this.isDataModified();
    if (!isPageModified) {
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
      const data = this.combineBoPageWithFormValues();
      this.props.dispatch(createAddBoPageEffect(data, () => {
        this.close();
      }));
    });
  }

  private updateIpfCcmBoPage = (page: IIpfCcmPage) => {
    console.log('updateIpfCcmBoPage');
    console.log(page);
    const isPageModified = this.isDataModified();
    if (!isPageModified) {
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
      const data = this.combineBoPageWithFormValues();
      this.props.dispatch(createUpdateBoPageEffect(data, () => {
        this.close();
      }));
    });
  }

  private copyIpfCcmBoPage = (page: IIpfCcmPage) => {
    this.getForm().validateFields(null, { force: true }, (err) => {
      if (err) {
        return;
      }
      const isPageModified = this.isDataModified();
      if (!isPageModified) {
        notification.info({
          message: '提示',
          description: '数据未修改，无需保存。',
        });
        return;
      }
      const data = this.combineBoPageWithFormValues();
      this.props.dispatch(createAddBoPageEffect(data, () => {
        this.close();
      }));
    });
  }
}

interface IPageListEditFormProps {
  form?: WrappedFormUtils;
  page?: IIpfCcmPage;
  dicts?: IDictsMap;
}

const BO_NAME_ASSOCIATE_COLUMNS: IAssociateColumn[] = [
  { title: '业务对象名称', field: 'boName' },
  { title: '源视图名称', field: 'ownSourceViewDesc' },
  { title: '描述', field: 'description' },
];

const BUSINESS_TYPE_ASSOCIATE_COLUMNS: IAssociateColumn[] = [
  { title: '业务类型', field: 'businessType' },
  { title: '描述', field: 'description' },
];

@(Form.create({ name: 'PageListEditForm' }) as any)
class PageListEditForm extends React.PureComponent<IPageListEditFormProps> {
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
        <FormItem label="页面类型" required>
          {
            getFieldDecorator('pageType', {
              rules: [
                createRequireRule({ label: '页面类型' }),
                createRichLengthRule({
                  label: '页面类型',
                  min: 0,
                  max: 50,
                }),
                createUniqGlRules({
                  label: ['页面类型', '业务类型', '业务对象名称'],
                  boName: 'IpfCcmBoPage',
                  entityName: 'com.gillion.platform.implement.metadata.domain.IpfCcmBoPage',
                  fields: ['pageType', 'businessType', 'boName'],
                  form: this.props.form,
                  property: 'pageType',
                  url: '/ipf/validation/uniqueGl',
                  baseViewId: window['__urlParams']?.baseViewId,
                  pkValue: this.props.form.getFieldValue('ipfCcmBoPageId'),
                }),
              ],
            })(
              <Select
                size="small"
                allowClear
                {...DROPDOWN_ALIGN_PROPS}
              >
                {_.map((dicts['PageType']), listItem => (
                  <Option title={listItem.value} key={listItem.key} value={listItem.key}>
                    {listItem.value}
                  </Option>
                ))}
              </Select>,
            )
          }
        </FormItem>
        <FormItem label="页面名称">
          {
            getFieldDecorator('pageName')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="业务对象名称">
          {
            getFieldDecorator('boName', {
              rules: [
                createRichLengthRule({
                  label: '业务对象名称',
                  min: 0,
                  max: 200,
                }),
                createUniqGlRules({
                  label: ['页面类型', '业务类型', '业务对象名称'],
                  boName: 'IpfCcmBoPage',
                  entityName: 'com.gillion.platform.implement.metadata.domain.IpfCcmBoPage',
                  fields: ['pageType', 'businessType', 'boName'],
                  form: this.props.form,
                  property: 'pageType',
                  url: '/ipf/validation/uniqueGl',
                  baseViewId: window['__urlParams']?.baseViewId,
                  pkValue: this.props.form.getFieldValue('ipfCcmBoPageId'),
                }),
              ],
            })(
              <UiAssociate
                columns={BO_NAME_ASSOCIATE_COLUMNS}
                labelProp="boName"
                valueProp="boName"
                labelInit={this.props.form.getFieldValue('boName')}
                queryMethod={this.boNameQueryMehtod}
                onChange={(value, option) => this.onBoNameChange(option)}
              />,
            )
          }
        </FormItem>
        <FormItem label="业务对象id" style={{ display: 'none' }} >
          {
            getFieldDecorator('ipfCcmBoId')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="业务类型">
          {
            getFieldDecorator('businessType', {
              rules: [
                createRichLengthRule({
                  label: '业务类型',
                  min: 0,
                  max: 200,
                }),
                createAlphabetOrDigitalRule({ label: '业务类型' }),
                createUniqGlRules({
                  label: ['页面类型', '业务类型', '业务对象名称'],
                  boName: 'IpfCcmBoPage',
                  entityName: 'com.gillion.platform.implement.metadata.domain.IpfCcmBoPage',
                  fields: ['pageType', 'businessType', 'boName'],
                  form: this.props.form,
                  property: 'pageType',
                  url: '/ipf/validation/uniqueGl',
                  baseViewId: window['__urlParams']?.baseViewId,
                  pkValue: this.props.form.getFieldValue('ipfCcmBoPageId'),
                }),
              ],
            })(
              <UiAssociate
                columns={BUSINESS_TYPE_ASSOCIATE_COLUMNS}
                labelProp="businessType"
                valueProp="businessType"
                labelInit={this.props.form.getFieldValue('businessType')}
                queryMethod={this.businessTypeQueryMehtod}
              />,
            )
          }
        </FormItem>
        <FormItem label="设备类型">
          {
            getFieldDecorator('deviceType', {
              rules: [
                createRichLengthRule({
                  label: '设备类型',
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
                {_.map((dicts['DeviceType']), listItem => (
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
            getFieldDecorator('description')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="页面隐藏">
          {
            getFieldDecorator('isPageDispSetting', {
              valuePropName: 'checked',
            })(
              <Checkbox/>,
            )
          }
        </FormItem>
        <FormItem label="支持数据穿透">
          {
            getFieldDecorator('isDataPenetration', {
              valuePropName: 'checked',
            })(
              <Checkbox/>,
            )
          }
        </FormItem>
        <FormItem label="自定义文件名称">
          {
            getFieldDecorator('linkBoName')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="业务对象视图id" style={{ display: 'none' }}>
          {
            getFieldDecorator('layoutBoViewId')(
              <Input
                disabled
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="业务对象视图">
          {
            getFieldDecorator('layoutBoViewDesc')(
              <Input
                disabled
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="页面列表id" style={{ display: 'none' }}>
          {
            getFieldDecorator('ipfCcmBoPageId')(
              <Input
                disabled
                size="small"
              />,
            )
          }
        </FormItem>
      </Form>
    );
  }

  private onBoNameChange = (option: any) => {
    this.props.form.setFieldsValue({
      ['layoutBoViewId']: option?.['ownSourceViewId'] || null,
    });
    this.props.form.setFieldsValue({
      ['layoutBoViewDesc']: option?.['ownSourceViewDesc'] || null,
    });
    this.props.form.setFieldsValue({
      ['businessType']: null,
    });
  }

  private boNameQueryMehtod = async (options: IQueryOptions): Promise<IQueryResult> => {
    return queryBoName(options);
  }

  private businessTypeQueryMehtod = async (options: IQueryOptions): Promise<IQueryResult> => {
    const { page } = this.props;
    const boName = this.props.form.getFieldValue('boName');
    if (boName) {
      return queryBusinessTypeMethod(options, null, boName);
    }
    return queryBusinessTypeMethod(options, page?.ipfCcmBoId);
  }

}
