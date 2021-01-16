import { Button, Drawer, Input, Select, notification } from 'antd';
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
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import { IAppState, IDictsMap } from 'src/models/appModel';
import { createRequireRule, createRichLengthRule } from 'src/utils/validateRules';
import { confirm } from 'src/utils';

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
  open({ type, page }:{ type: any, page: IIpfCcmPage }) {
    switch (type) {
      case 'add':
        page.rowStatus = ROW_STATUS.ADDED;
        page.baseViewId = this.props.params.baseViewId;
        page.ipfCcmBoId = this.props.params.ipfCcmBoId;
        page.boName = 'JwTest';
        break;
      case 'copy':
        page.rowStatus = ROW_STATUS.ADDED;
        page.copyPageId = page.ipfCcmBoPageId;
        page.ipfCcmBoPageId = null;
        page.baseViewId = this.props.params.baseViewId;
        break;
      case 'edit':
        page.rowStatus = ROW_STATUS.MODIFIED;
        break;
    }
    this.setState({
      type,
      page,
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
      this.formRef.current.getForm().setFieldsValue(this.state.page);
    }
  }

  private save = async () => {
    console.log('保存。');
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
        <PageListEditForm dicts={dicts} ref={this.formRef} />
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
    return data;
  }

  private isDataModified = () => {
    const form = this.getForm();
    if (!form) {
      return false;
    }
    const formValues = form.getFieldsValue();
    const { page } = this.state;
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
    console.log('copyIpfCcmBoPage');
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
}

interface IPageListEditFormProps {
  form?: WrappedFormUtils;
  dicts?: IDictsMap;
}

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
            getFieldDecorator('boName')(
              <Input
                size="small"
                value="JwTest"
              />,
            )
          }
        </FormItem>
        <FormItem label="业务对象id">
          {
            getFieldDecorator('ipfCcmBoId')(
              <Input
                size="small"
                value={'a488d838550b4a2f8c80f051cd9192f8'}
              />,
            )
          }
        </FormItem>
        <FormItem label="业务类型">
          {
            getFieldDecorator('businessType')(
              <Input
                size="small"
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
            getFieldDecorator('isPageDispSetting')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="支持数据穿透">
          {
            getFieldDecorator('isDataPenetration')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="自定义文件名称">
          {
            getFieldDecorator('linkBoName')(
              <Input
                disabled
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="业务对象视图">
          {
            getFieldDecorator('baseViewId')(
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
}
