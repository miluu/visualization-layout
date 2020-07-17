import * as React from 'react';
import * as _ from 'lodash';
import {
  Form,
} from 'antd';

import './style.less';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { connect } from 'dva';
import { IDictsMap, IAppState } from 'src/models/appModel';
import { IFormsState } from 'src/models/formsModel';
import { ILayoutsState, ICreateLayouttsModelOptions } from 'src/models/layoutsModel';
import { findElementById, findLayoutByCellName, delay } from 'src/utils';
import { Dispatch, AnyAction } from 'redux';
import { createDoUpdateSelectedLayoutFieldsEffect, createDoUpdateSelectedElementFieldsEffect } from 'src/models/layoutsActions';
import { createValues, transformOutputValue } from 'src/utils/valueFransformers';
import { IFormItemOption, renderFormItem } from 'src/utils/forms';
import { IPagesState } from 'src/models/pagesModel';
import { TEMPLATE_CONFIG } from 'src/routes/Template/config';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

function createConnector(type: string) {
  return connect(
    ({ APP, FORMS, LAYOUTS }: {
      APP: IAppState,
      FORMS: IFormsState,
      LAYOUTS: ILayoutsState<any>,
    }) => {
      const formItemsOpts = FORMS && FORMS[`${type}PropertyFormOptions`] || [];
      const dicts =  APP && APP.dicts || {};
      const params = APP.params;
      const selectedItemType = LAYOUTS.selectedElement ? 'element' : (LAYOUTS.selectedLayout ? 'layout' : null);
      const isInReference = _.get(LAYOUTS, 'selectionOptions.isInReference');
      let isGridColumn = false;
      const selectedItem = (() => {
        const { layouts, selectedElement, selectedLayout, config } = LAYOUTS;
        if (type === 'element' && selectedElement) {
          const result = findElementById(layouts, selectedElement, config.childrenElementsKey, config.elementIdKey, true);
          if (result && result.parentLayout && result.parentLayout.layoutElementType === 'GRID') {
            isGridColumn = true;
          }
          return result && result.element;
        }
        if (type === 'layout' && selectedLayout) {
          return findLayoutByCellName(layouts, selectedLayout, config.cellNameKey);
        }
        return null;
      })();
      return {
        type,
        formItemsOpts,
        dicts,
        params,
        selectedItemType,
        activeFormKey: FORMS.activeFormKey,
        renderLocked: LAYOUTS.isTemp,
        selectedItem,
        isGridColumn,
        isInReference,
        config: LAYOUTS.config,
        isMultiLanguage: LAYOUTS.defaultSetting?.settings?.isMulLanguage ?? false,
      };
    },
  );
}

function createForm(type: string) {
  return Form.create({
    name: `${type}_property_form`,
  }) as any;
}

interface IPropertyFormProps {
  dispatch?: Dispatch<AnyAction>;

  formItemsOpts?: IFormItemOption[];
  dicts?: IDictsMap;
  params?: any;
  form?: WrappedFormUtils;
  selectedItem?: any;
  selectedItemType?: string;
  activeFormKey?: string;
  isGridColumn?: boolean;
  isInReference?: boolean;
  config?: ICreateLayouttsModelOptions;

  type?: string;
  isMultiLanguage?: boolean;

  renderLocked?: boolean;
}

class PropertyForm extends React.Component<IPropertyFormProps> {
  render() {
    const { selectedItem, dicts, params, formItemsOpts, form, selectedItemType, type, isGridColumn, isInReference, config, dispatch, isMultiLanguage } = this.props;
    const values = selectedItem ? createValues(formItemsOpts, selectedItem, isGridColumn, isInReference) : null;
    if (selectedItem && selectedItem.layoutElementType === 'GRID') {
      values.__gridColumns = selectedItem[config.childrenElementsKey];
    }
    console.log('[PropertyForm#rendervi]', this.props['type']);
    return (
      <div style={{
        display: (selectedItemType === type || !selectedItemType && type === 'layout') ? 'block' : 'none',
      }}>
        <div style={{ display: !values ? 'block' : 'none' }}>
          <p className="editor-no-select">{t(I18N_IDS.PANEL_TEXT_NOTHING_SELECTED)}</p>
        </div>

        <Form style={{ display: values ? 'block' : 'none' }} autoComplete="off">
          {_.map(formItemsOpts, item => renderFormItem({
            form,
            item,
            values,
            dicts,
            urlParams: params,
            onChangeCallback: this._onValueChange,
            dispatch,
            info: { isMultiLanguage },
          }))}
        </Form>
      </div>
    );
  }

  shouldComponentUpdate(nextProps: IPropertyFormProps) {
    const { renderLocked } = this.props;
    const { renderLocked: nextRenderLocked } = nextProps;
    return (renderLocked && !nextRenderLocked) || (
      !nextRenderLocked && (
        nextProps.activeFormKey === 'property' && !_.isEqual(nextProps, this.props)
      )
    );
  }

  componentWillReceiveProps(nextProps: IPropertyFormProps) {
    const nextValues = nextProps.selectedItem;
    const values = this.props.selectedItem;
    if (!_.eq(nextValues, values)) {
      this.props.form.resetFields();
    }
  }

  private _onValueChange = async (opt: IFormItemOption | IFormItemOption[], _value?: any | any[], forceChange = false) => {
    console.log('[_onValueChange]');
    await delay(0);
    const opts = _.isArray(opt) ? opt : [opt];
    const values: any[] = _.isArray(opt) ? _value : [_value];
    const { selectedItemType } = this.props;
    const updateObj: any = {};
    const changeExt = opts[0].changeExt;
    const extObj = changeExt ? changeExt(values) : {};
    _.forEach(extObj, (v, k) => {
      opts.push({ property: k, __isExt: true });
      values.push(v);
    });
    _.forEach(opts, (_opt, i) => {
      const __value = values[i];
      let property = _opt.property;
      if (!forceChange && !this.props.form.isFieldTouched(_opt.property) && !_opt.__isExt) {
        return;
      }
      let value: any;
      if (_.isUndefined(__value)) {
        value = this.props.form.getFieldValue(_opt.property);
      } else {
        value = __value;
      }
      value = transformOutputValue(value, _opt);
      console.log('[_onValueChange] value:', value);
      if (_.includes(_opt.property, '#')) {
        const path = _opt.property.split('#');
        property = path[0];
        const field = path[1];
        const oldValue = updateObj[property]
          ? updateObj[property]
          : this.props.form.getFieldValue(property);
        let valueObj: any;
        try {
          valueObj = oldValue ? JSON.parse(oldValue) || {} : {};
        } catch (e) {
          valueObj = {};
          console.warn('[_onValueChange]', e);
        }
        if (valueObj[field] === value
          || valueObj[field] == null && value == null
        ) {
          return;
        }
        if (!value && value !== 0) {
          value = undefined;
        }
        valueObj[field] = value;
        try {
          value = JSON.stringify(valueObj);
        } catch (e) {
          value = '';
          console.warn('[_onValueChange]', e);
        }
      }
      updateObj[property] = value;
    });
    if (selectedItemType === 'layout') {
      this.props.dispatch(createDoUpdateSelectedLayoutFieldsEffect(updateObj));
    } else {
      this.props.dispatch(createDoUpdateSelectedElementFieldsEffect(updateObj));
    }
  }
}

function createPropertyForm(type: string) {
  return createConnector(type)(createForm(type)(PropertyForm));
}

const LayoutPropertyForm = createPropertyForm('layout');
const ElementPropertyForm = createPropertyForm('element');

export class UiPropertyForm extends React.PureComponent {
  render() {
    return (
      <div className="editor-property-form">
        <LayoutPropertyForm />
        <ElementPropertyForm />
      </div>
    );
  }
}

interface IUiPagePropertyForm {
  dispatch?: Dispatch<AnyAction>;
  form?: WrappedFormUtils;

  formItemsOpts?: IFormItemOption[];
  dicts?: IDictsMap;
  page?: any;
}

@connect(
  ({ PAGES, APP }: {
    APP: IAppState,
    PAGES: IPagesState<any>,
  }) => {
    const {
      currentPageId,
      pageList,
    } = PAGES;
    const page = _.find(pageList, p => p[TEMPLATE_CONFIG.pageIdKey] === currentPageId);
    const { dicts } = APP;
    return {
      page,
      dicts,
      formItemsOpts: TEMPLATE_CONFIG.pagePropertyFormOptions,
    };
  },
)
@createForm('page')
export class UiPagePropertyForm extends React.PureComponent<IUiPagePropertyForm> {
  render() {
    const { formItemsOpts, dicts, form, page, dispatch } = this.props;
    return (
      <div className="editor-property-form">
        <Form autoComplete="off">
          {_.map(formItemsOpts, item => renderFormItem({
            form,
            item,
            values: page,
            dicts,
            onChangeCallback: () => undefined,
            dispatch,
          }))}
        </Form>
      </div>
    );
  }
}
