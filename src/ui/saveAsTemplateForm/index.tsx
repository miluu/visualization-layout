import * as React from 'react';
import * as _ from 'lodash';
import {
  Modal,
  Form,
  Input,
  Select,
  // Checkbox,
} from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import { layoutCodeUniqValidator } from 'src/routes/Visualization/service';
import { TemplateType } from 'src/models/appActions';
import { IDictsMap, IAppState } from 'src/models/appModel';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

const FormItem = Form.Item;
const { Option } = Select;

export interface IUiSaveAsTemplateFormProps {
  form?: WrappedFormUtils;
  dicts?: IDictsMap;
  wrappedComponentRef?: (ref: UiSaveAsTemplateForm) => void;
  dispatch?: Dispatch<AnyAction>;
  templateType?: TemplateType;
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
      dicts: APP.dicts,
    };
  },
)
@(Form.create({ name: 'saveAsTemplateForm' }) as any)
export class UiSaveAsTemplateForm extends React.PureComponent<IUiSaveAsTemplateFormProps> {
  render() {
    const {
      form,
      templateType,
      dicts,
    } = this.props;
    let title: string;
    let layoutCodeLable: string;
    let layoutNameLable: string;
    let layoutTypeLable: string;
    const visible = !!templateType;
    switch (templateType) {
      case 'GROUP':
        title = t(I18N_IDS.TEXT_CONTROLS_GROUP_TEMPLATE);
        layoutCodeLable = t(I18N_IDS.TEXT_GROUP_CODE);
        layoutNameLable = t(I18N_IDS.TEXT_GROUP_NAME);
        layoutTypeLable = t(I18N_IDS.TEXT_GROUP_TYPE);
        break;
      default:
        title = t(I18N_IDS.TEXT_PAGE_TEMPLATE);
        layoutCodeLable = t(I18N_IDS.TEXT_LAYOUT_CODE);
        layoutNameLable = t(I18N_IDS.TEXT_LAYOUT_NAME);
        layoutTypeLable = t(I18N_IDS.TEXT_LAYOUT_TYPE);
        break;
    }
    const { getFieldDecorator } = form;
    return (
      <Modal
        visible={visible}
        title={title}
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
          <FormItem label={layoutCodeLable}>
            {getFieldDecorator('layoutCode', {
              // validateTrigger: 'onBlur',
              rules: [
                { required: true, message: `请输入${layoutCodeLable}` },
                { pattern: /^([A-Z]|[0-9]|_)+$/, message: `${layoutCodeLable}只能包含大写字母、数字和下划线` },
                {
                  validator: layoutCodeUniqValidator,
                },
              ],
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem label={layoutNameLable}>
            {getFieldDecorator('layoutName', {
              // validateTrigger: 'onBlur',
              rules: [{ required: true, message: `请输入${layoutNameLable}` }],
            })(
              <Input />,
            )}
          </FormItem>
          <FormItem label={layoutTypeLable}>
            {getFieldDecorator('layoutType', {
              // validateTrigger: 'onBlur',
              rules: [{ required: true, message: `请选择${layoutTypeLable}` }],
            })(
              <Select allowClear >
                  {_.map(dicts && dicts['ModelTableLayoutType'], listItem => (
                    <Option title={listItem.value} key={listItem.key} value={listItem.key}>
                      {listItem.value}
                    </Option>
                  ))}
              </Select>,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }

  private _onSubmit = () => {
    const { onSubmit, templateType } = this.props;
    if (onSubmit) {
      this.props.form.validateFields((errors, values) => {
        if (errors) {
          return;
        }
        console.log('[PageForm#_onSubmit]', values);
        this.props.onSubmit({
          templateType,
          values,
        });
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
