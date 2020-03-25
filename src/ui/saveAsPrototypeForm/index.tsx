import * as React from 'react';
import * as _ from 'lodash';
import {
  Modal,
  Form,
  Input,
  TreeSelect,
} from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import { IAppState, IView } from 'src/models/appModel';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

const FormItem = Form.Item;

export interface IUiSaveAsPrototypeFormProps {
  form?: WrappedFormUtils;
  wrappedComponentRef?: (ref: UiSaveAsPrototypeForm) => void;
  dispatch?: Dispatch<AnyAction>;
  visible?: boolean;
  views?: IView[];
  onSubmit?: (values?: any) => void;
  onCancle?: () => void;
}

@connect(
  ({
    APP,
  }: {
    APP: IAppState,
  }) => {
    return {
      views: APP.viewList,
    };
  },
)
@(Form.create({ name: 'saveAsPrototypeForm' }) as any)
export class UiSaveAsPrototypeForm extends React.PureComponent<IUiSaveAsPrototypeFormProps> {
  render() {
    const {
      form,
      visible,
      views,
    } = this.props;
    const { getFieldDecorator } = form;
    const treeData = _.map(views, v => {
      return {
        id: v.id,
        pid: v.pid || '',
        title: v.name,
        value: v.id,
      };
    });
    return (
      <Modal
        visible={visible}
        title={t(I18N_IDS.SAVE_AS_PROTOTYPE)}
        onOk={this._onSubmit}
        onCancel={this._onCancle}
        afterClose={this._afterClose}
        okText={t(I18N_IDS.SAVE)}
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
          <FormItem label={'视图'}>
            {getFieldDecorator('baseViewId', {
              rules: [{ required: true, message: '请选择视图' }],
            })(
              <TreeSelect
                allowClear
                style={{ width: '100%' }}
                treeData={treeData}
                treeDefaultExpandAll
                treeDataSimpleMode={{
                  id: 'id',
                  pId: 'pid',
                  rootPId: '',
                }}
                dropdownClassName="editor-tree-select"
              />,
            )}
          </FormItem>

          <FormItem label={'页面名称'}>
            {getFieldDecorator('pageName', {
              rules: [
                { required: true, message: `请输入${'页面名称'}` },
              ],
            })(
              <Input />,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }

  private _onSubmit = () => {
    const { onSubmit } = this.props;
    if (onSubmit) {
      this.props.form.validateFields((errors, values) => {
        if (errors) {
          return;
        }
        this.props.onSubmit(values);
      });
    }
  }
  private _onCancle = () => {
    const { onCancle } = this.props;
    if (onCancle) {
      onCancle();
    }
  }
  private _afterClose = () => {
    this._reset();
  }
  private _reset = () => {
    this.props.form.resetFields();
  }
}
