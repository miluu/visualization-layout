import * as React from 'react';

import {
  BaseElementComponent,
  connector,
} from './BaseElementComponent';
import { registGlobalComponentClass } from 'src/utils';

import './ElementDynamicDrawerButtonComponent.less';
import { createSetRootElementAction, createAddLayoutToParentElementIfEmptyEffect } from 'src/models/layoutsActions';
import { createLayout } from 'src/routes/Visualization/config';

@connector
export class ElementDynamicDrawerButtonComponent extends BaseElementComponent {
  render() {
    return (

      <span
        {...this._createRootProps([
          'editor-element-dynamic-drawer-button',
          'dynamic-drawer-button-group',
        ])}
      >
        <button className="dynamic-drawer-button-main button-default">
          更多查询条件
        </button>
        <button className="dynamic-drawer-button-drop button-default">...</button>

        {this._renderSettings()}
        {this._renderRemark()}
      </span>

    );
  }

  clickSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { dispatch, element } = this.props;
    dispatch(createSetRootElementAction(element, '【高级查询】 配置', true));
    dispatch(createAddLayoutToParentElementIfEmptyEffect(
      createLayout({
        layoutContainerType: 'DIV',
        layoutElementType: 'ELEMENT',
        conditionType: 'G',
        isParent: 'X',
        layoutBoName: element.layoutBoName,
      }),
      element,
    ));
  }

}

registGlobalComponentClass('ElementDynamicDrawerButtonComponent', ElementDynamicDrawerButtonComponent);
