import * as React from 'react';
import * as _ from 'lodash';
import {
  Modal,
  Form,
  Input,
  // Checkbox,
  TreeSelect,
} from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { Dispatch, AnyAction } from 'redux';
import { createHideFormAction, createFormSubmitEffect } from 'src/models/pagesActions';
import { connect } from 'dva';
import { IPagesState, EditingType } from 'src/models/pagesModel';
import I18N_IDS from 'src/i18n/ids';
import { t } from 'src/i18n';
import { IView, IAppState } from 'src/models/appModel';

const FormItem = Form.Item;

export interface IUiPageFormProps {
  visible?: boolean;
  title?: string;
  form?: WrappedFormUtils;
  wrappedComponentRef?: (ref: UiPageForm) => void;
  dispatch?: Dispatch<AnyAction>;
  type?: EditingType;
  viewList?: IView[];
}

@connect(
  ({ PAGES, APP }: {
    PAGES: IPagesState<any>,
    APP: IAppState,
  }) => ({
    visible: PAGES.isShowForm,
    title: PAGES.formTitle,
    type: PAGES.editingType,
    viewList: APP.viewList,
  }),
)
@(Form.create({ name: 'page_form' }) as any)
export class UiPageForm extends React.PureComponent<IUiPageFormProps> {
  render() {
    const {
      visible,
      form,
      title,
    } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        visible={visible}
        title={title}
        onOk={this._onSubmit}
        onCancel={this._onCancle}
        afterClose={this._afterClose}
        okText={t(I18N_IDS.TEXT_OK)}
        cancelText={t(I18N_IDS.TEXT_CANCEL)}
      >
        <Form
          labelCol={{
            xs: 6,
          }}
          wrapperCol={{
            xs: 18,
          }}
        >
          <FormItem label={t(I18N_IDS.TEXT_PAGE_NAME)}>
            {getFieldDecorator('originName', {
              rules: [{ required: true, message: '请输入页面名称' }],
            })(
              <Input />,
            )}
          </FormItem>
          {/* <FormItem label="公共页面">
            {getFieldDecorator('isPublic', {})(
              <Checkbox />,
            )}
          </FormItem> */}
          { this._renderBaseViewIdFormItem() }
        </Form>
      </Modal>
    );
  }

  private _renderBaseViewIdFormItem = () => {
    const { form, type, viewList } = this.props;
    if (type !== EditingType.COPY) {
      return null;
    }
    const { getFieldDecorator } = form;
    const treeData = _.map(viewList, v => {
      return {
        id: v.id,
        pid: v.pid || '',
        title: v.name,
        value: v.id,
      };
    });
    return (
      <FormItem
        label={t(I18N_IDS.LABEL_BASE_VIEW_ID)}
        help={'如需跨视图复制页面，请选择一个视图名称。本视图内复制可留空。'}
      >
        {getFieldDecorator('baseViewId')(
          <TreeSelect
            allowClear
            style={{ width: '100%' }}
            treeDefaultExpandAll
            treeDataSimpleMode={{
              id: 'id',
              pId: 'pid',
              rootPId: '',
            }}
            dropdownClassName="editor-tree-select"
            treeData={treeData}
          />,
        )}
      </FormItem>
    );
  }

  private _onSubmit = () => {
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        return;
      }
      console.log('[PageForm#_onSubmit]', values);
      this.props.dispatch(createFormSubmitEffect(values));
    });
  }
  private _onCancle = () => {
    this.props.dispatch(createHideFormAction(true));
  }
  private _afterClose = () => {
    this._reset();
  }
  private _reset = () => {
    this.props.form.resetFields();
  }
}
