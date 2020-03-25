import * as React from 'react';
import * as _ from 'lodash';
import classnames from 'classnames';

import {
  BaseElementComponent,
  connector,
} from './BaseElementComponent';
import { registGlobalComponentClass, noop, transformUiType, getLabelText, transformDropdownList } from 'src/utils';

import { Consumer } from './LayoutFormComponent';

import './ElementInputComponent.less';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

@connector
export class ElementInputComponent extends BaseElementComponent {
  render() {
    const { element } = this.props;
    return (
      <div
        {...this._createRootProps(['editor-element-input', 'form-group form-group-padding', '__clearfix'])}
        style={{
          position: 'relative',
          opacity: !element.isVisible || transformUiType(element.uiType) === 'hidden' ? 0.5 : null,
          backgroundColor: this._getDatasourceBgColor(),
        }}
      >
        <Consumer>
          {
            ({ formType }) => formType === 'form' ? this._renderFormItem() : this._renderDefaultFormItem()
          }
        </Consumer>

        {this._renderHitArea(['bottom'])}
        {this._renderRemark()}

      </div>
    );
  }

  private _renderDefaultFormItem(): React.ReactNode {
    const { element } = this.props;
    return (
      <>
        <label className={
          classnames('control-label', this._getLabelColClass())
        }>
          {
            element.isShowLable
              ? <>
                  { element.isNotNull ? <span className="required">*</span> : null }
                  {getLabelText(element)}：
                </>
              : null
          }
        </label>
        <div className={this._getInputDivColClass()}>
          {this._renderInput(element)}
        </div>
      </>
    );
  }

  private _renderFormItem(): React.ReactNode {
    const { element } = this.props;
    return (
      <>
        <label>
          {
            element.isShowLable
              ? <>
                  { element.isNotNull ? <span className="required">*</span> : null }
                  {getLabelText(element)}：
                </>
              : null
          }
        </label>
        {this._renderInput(element)}
      </>
    );
  }

  private _renderInput(element: any) {
    const inputType = transformUiType(element.uiType);
    switch (inputType) {
      case 'textarea':
        return this._renderTextarea(element);
      case 'dropdown':
        return this._renderDropdown(element);
      case 'date':
        return this._renderDate(element);
      case 'associate':
        return this._rennderAssociate(element);
      case 'hidden':
        return this._renderTextInput(element);
      case 'time':
        return this._renderTime(element);
      case 'radio-group':
        return this._renderRadioGroup();
      case 'checkbox-group':
        return this._renderCheckboxGroup();
      case 'uploader':
        return this._renderUploader();
      case 'query-filter':
        return this._renderQueryFilter();
      case 'query-filter-multi':
        return this._renderQueryFilterMulti();
      default:
        return this._renderTextInput(element);
    }
  }

  private _renderTextInput(element: any) {
    let placeholder: string;
    try {
      placeholder = JSON.parse(element.layoutElementAttr).placeholder;
    } catch (e) { /*  */ }
    return <input
      value={this._getDisplayValue()}
      onChange={noop}
      className="input form-control"
      type="text"
      disabled={element.isReadOnly}
      placeholder={placeholder}
    />;
  }

  private _renderTextarea(element: any) {
    let placeholder: string;
    try {
      placeholder = JSON.parse(element.layoutElementAttr).placeholder;
    } catch (e) { /*  */ }
    return <textarea
      rows={element.textLineNum || 3}
      className="form-control textarea-rows"
      value={this._getDisplayValue()}
      onChange={noop}
      disabled={element.isReadOnly}
      placeholder={placeholder}
    />;
  }

  private _renderDropdown(element: any) {
    return (
      <div className="form-dorpdown">
        <input
          type="text"
          className="form-text"
          placeholder="请选择"
          value={this._getDisplayValue()}
          onChange={noop} disabled={element.isReadOnly}
        />
        <a href="javascript:void(0)" type="button" className="btn dropdown-toggle"> <i className="fi fi-caret" /></a>
      </div>
    );
  }

  private _renderDate(element: any) {
    return (
      <div className="form-date">
        <input
          type="text"
          className="form-text date-text-input"
          value={this._getDisplayValue()}
          onChange={noop} disabled={element.isReadOnly}
        />
        <a href="javascript:void(0)" type="button" className="btn">
          <i className="fi fi-date" />
        </a>
      </div>
    );
  }

  private _rennderAssociate(element: any) {
    return (
      <div>
        <input className="form-text form-suggestbox" value={this._getDisplayValue()} onChange={noop} disabled={element.isReadOnly} />
      </div>
    );
  }

  private _renderTime(element: any) {
    return (
      <div className="form-time">
        <input type="text" className="form-text" value={this._getDisplayValue()} onChange={noop} disabled={element.isReadOnly} />
        <a href="javascript:void(0)" type="button" className="btn"> <i className="fi fi-time" /> </a>
      </div>
    );
  }

  private _renderRadioGroup() {
    const source = this._getDropdownSource();
    return (
      <div>
        {
          _.map(source, (item, i) => {
            return (
              <div key={i} className="form-clickbox" {...{ mode: 'radio' }} style={{ margin: 5 }}>
                <a href="javascript:void(0);" className="fi" />
                <label>{ item.value }</label>
              </div>
            );
          })
        }
      </div>
    );
  }

  private _renderCheckboxGroup() {
    const source = this._getDropdownSource();
    return (
      <div g-checkbox-group="">
        {
          _.map(source, (item, i) => {
            return (
              <div className="form-clickbox" key={i} >
                <a href="javascript:void(0);" className="fi" />
                <label>{ item.value }</label>
              </div>
            );
          })
        }
      </div>
    );
  }

  private _getDropdownSource() {
    const { location, element } = this.props;
    let source = [
      { key: `${t(I18N_IDS.TEXT_OPTION)}-1`, value: `${t(I18N_IDS.TEXT_OPTION)}-1` },
      { key: `${t(I18N_IDS.TEXT_OPTION)}-2`, value: `${t(I18N_IDS.TEXT_OPTION)}-2` },
    ];
    if (location.pathname === '/prototype') {
      source = transformDropdownList(element.dropdownList);
      if (!source || !source.length) {
        source = [{ key: '未配置选项', value: '未配置选项' }];
      }
    }
    return source;
  }

  private _renderUploader() {
    return (
      <div className="form-upload ng-isolate-scope ng-pristine ng-valid">
        <div className="form-upload-item">
          <button className="btn form-upload-btn-add" type="button">
            <i className="fi fi-add" />
            <span>上传文件</span>
          </button>
        </div>
      </div>
    );
  }

  private _renderQueryFilter() {
    return (
      <div>
        <ul className="query-filter">
          <li>{t(I18N_IDS.TEXT_ALL)}</li>
          <li className="current">{`${t(I18N_IDS.TEXT_OPTION)}-1`}</li>
          <li>{`${t(I18N_IDS.TEXT_OPTION)}-2`}</li>
          <li>{`${t(I18N_IDS.TEXT_OPTION)}-3`}</li>
        </ul>
      </div>
    );
  }

  private _renderQueryFilterMulti() {
    return (
      <div>
        <ul className="query-filter">
          <li>{t(I18N_IDS.TEXT_ALL)}</li>
          <li className="current">{`${t(I18N_IDS.TEXT_OPTION)}-1`}</li>
          <li className="current">{`${t(I18N_IDS.TEXT_OPTION)}-2`}</li>
          <li>{`${t(I18N_IDS.TEXT_OPTION)}-3`}</li>
          <li>{`${t(I18N_IDS.TEXT_OPTION)}-4`}</li>
        </ul>
      </div>
    );
  }
}

registGlobalComponentClass('ElementInputComponent', ElementInputComponent);
