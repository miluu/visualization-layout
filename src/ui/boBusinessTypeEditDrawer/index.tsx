import { Button, Drawer, Input, notification } from 'antd';
import * as _ from 'lodash';
import Form, { FormProps, WrappedFormUtils } from 'antd/lib/form/Form';
import { Dispatch, AnyAction } from 'redux';
import React from 'react';
import { IBoBusinessType } from 'src/models/businessTypesModel';

import './style.less';
import { confirm } from 'src/utils';
import { connect } from 'dva';
import { createSaveOrUpdateBusinessTypeEffect } from 'src/models/businessTypesAction';
import { ROW_STATUS } from 'src/config';
import { isFormDataModified } from 'src/utils/forms';
import { IAppState, IDictsMap } from 'src/models/appModel';
import { createFirstLetterUpperRule, createNotSpecialCharacterRule, createRequireRule, createRichLengthRule, createAlphabetOrDigitalRule, createUniqGlRules } from 'src/utils/validateRules';

const FormItem = Form.Item;

interface IUiBoBusinessTypeEditDrawerProps {
  dispatch?: Dispatch<AnyAction>;
  params?: any;
  dicts?: IDictsMap;
}

interface IUiBoBusinessTypeEditDrawerState {
  boBusinessType: IBoBusinessType;
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
  };
}, null, null, { withRef: true })
export class UiBoBusinessTypeEditDrawer extends React.PureComponent<IUiBoBusinessTypeEditDrawerProps, IUiBoBusinessTypeEditDrawerState> {
  state: IUiBoBusinessTypeEditDrawerState = {
    boBusinessType: null,
    visible: false,
    type: 'add',
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

  open = (options: any = {}) => {
    this.setState({
      visible: true,
      type: options.type,
      boBusinessType: options.boBusinessType,
    });
  }

  close = () => {
    this.setState({
      boBusinessType: null,
      visible: false,
    });
  }

  private getTitle = () => {
    const { type } = this.state;
    if (type === 'add') {
      return '新增业务类型';
    }
    return '编辑业务类型';
  }

  private afterVisibleChange = (visible: boolean) => {
    if (visible) {
      const form: WrappedFormUtils = this.formRef.current?.getForm();
      if (form) {
        form.setFieldsValue(
          _.pick(
            this.state.boBusinessType,
            _.keys(form.getFieldsValue()),
          ),
        );
      }
    }
  }

  private save = () => {
    const isBusinessTypeModified = this.isDataModified();
    if (!(isBusinessTypeModified)) {
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
      const data = this.combineBoBusinessTypeWithFormValues();
      this.props.dispatch(createSaveOrUpdateBusinessTypeEffect(data, this.state.type, () => {
        this.close();
      }));
    });
  }

  private combineBoBusinessTypeWithFormValues = () =>  {
    const isBusinessTypeModified = this.isDataModified();
    const formData = this.getForm()?.getFieldsValue?.() || {};
    const rowStatusObj: any = {};
    if (this.state.type === 'add') {
      rowStatusObj.rowStatus = ROW_STATUS.ADDED;
      rowStatusObj.ipfCcmBoBusinessTypeId = null;
    } else if (isBusinessTypeModified) {
      rowStatusObj.rowStatus = ROW_STATUS.MODIFIED;
    }
    const data: IBoBusinessType = {
      ...this.state.boBusinessType,
      ...formData,
      ...rowStatusObj,
    };
    return data;
  }

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

  private isDataModified = () => {
    const form = this.getForm();
    if (!form) {
      return false;
    }
    const formValues = form.getFieldsValue();
    const { boBusinessType } = this.state;
    if (!boBusinessType) {
      return false;
    }
    return isFormDataModified(boBusinessType, formValues);
  }

  private getForm = () => {
    const form: WrappedFormUtils = this.formRef.current?.getForm();
    return form;
  }

  private renderForm = () => {
    const { dicts } = this.props;
    return (
      <div className="editor-drawer-form">
        <BoBusinessTypeEditForm dicts={dicts} ref={this.formRef} />
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

interface IBoBusinessTypeEditFormProps {
  form?: WrappedFormUtils;
  dicts?: IDictsMap;
}

@(Form.create({ name: 'BoBusinessTypeEditForm' }) as any)
class BoBusinessTypeEditForm extends React.PureComponent<IBoBusinessTypeEditFormProps> {
  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout: Partial<FormProps> = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
      labelAlign: 'left',
      autoComplete: 'off',
    };
    return (
      <Form {...formItemLayout} >
        <FormItem label="业务类型" >
          {
            getFieldDecorator('businessType', {
              rules: [
                createRequireRule({ label: '业务类型' }),
                createFirstLetterUpperRule({ label: '业务类型' }),
                createAlphabetOrDigitalRule({ label: '业务类型' }),
                createRichLengthRule({
                  label: '业务类型',
                  min: 0,
                  max: 50,
                }),
                createUniqGlRules({
                  label: ['业务类型', '业务对象id'],
                  boName: 'IpfCcmBoBusinessType',
                  entityName: 'com.gillion.platform.implement.metadata.domain.IpfCcmBoBusinessType',
                  fields: ['businessType', 'ipfCcmBoId'],
                  form: this.props.form,
                  property: 'businessType',
                  url: '/ipf/validation/uniqueGl',
                  baseViewId: window['__urlParams']?.baseViewId,
                  pkValue: this.props.form.getFieldValue('ipfCcmBoBusinessTypeId'),
                }),
              ],
            })(
              <Input
                size="small"
              />,
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
        <FormItem label="业务对象id" style={{ display: 'none' }} >
          {
            getFieldDecorator('ipfCcmBoId')(
              <Input
                size="small"
              />,
            )
          }
        </FormItem>
        <FormItem label="主键" style={{ display: 'none' }} >
          {
            getFieldDecorator('ipfCcmBoBusinessTypeId')(
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
