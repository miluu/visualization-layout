import * as React from 'react';

import {
  BaseElementComponent,
  connector,
} from './BaseElementComponent';
import { registGlobalComponentClass, noop } from 'src/utils';

import './ElementDynamicSearchBarComponent.less';
import { createSetRootElementAction, createAddLayoutToParentElementIfEmptyEffect } from 'src/models/layoutsActions';
import { createLayout } from 'src/routes/Visualization/config';

@connector
export class ElementDynamicSearchBarComponent extends BaseElementComponent {
  render() {
    return (
      <div
        {...this._createRootProps([
          'editor-element-dynamic-search-bar',
          'dynamic-search-bar',
        ])}
      >
        <div className="dynamic-search-bar-form">
           <div className="dynamic-search-bar-drop">
               <div className="form-dorpdown">
                <input
                  type="text"
                  className="form-text"
                  value="请选择"
                  onChange={noop}
                />
                <a
                  href="javascript:void(0)"
                  type="button"
                  className="btn dropdown-toggle"
                >
                  <i className="fi fi-caret" />
                </a>
              </div>
           </div>
           <div className="dynamic-search-bar-control">
            <input className="input form-control" type="text" />
          </div>
        </div>
        <div className="dynamic-search-bar-buttons">
          <button className="button-primary">查询</button>
          <button className="button-default">重置</button>
        </div>

        {this._renderSettings()}
        {this._renderRemark()}

      </div>
    );
  }

  clickSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { dispatch, element } = this.props;
    dispatch(createSetRootElementAction(element, '【组合查询】 配置', true));
    dispatch(createAddLayoutToParentElementIfEmptyEffect(
      createLayout({
        layoutContainerType: 'DIV',
        layoutElementType: 'ELEMENT',
        conditionType: 'G',
        isParent: '',
        layoutBoName: element.layoutBoName,
      }),
      element,
    ));
  }

}

registGlobalComponentClass('ElementDynamicSearchBarComponent', ElementDynamicSearchBarComponent);
