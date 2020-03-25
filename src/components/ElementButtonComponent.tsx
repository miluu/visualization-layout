import * as React from 'react';

import {
  BaseElementComponent,
  connector,
} from './BaseElementComponent';
import { registGlobalComponentClass } from 'src/utils';

import './ElementButtonComponent.less';
import { createLoadPageListEffect } from 'src/models/pagesActions';
import { queryPageList } from 'src/routes/Prototype/service';

@connector
export class ElementButtonComponent extends BaseElementComponent {
  private _pageListLoaded: boolean;

  render() {
    const { element } = this.props;
    return (
      <button
        type="button"
        {...this._createRootProps(['editor-element-button', this._getButtonStyle()])}
      >
        {element['methodDesc'] || element['fieldText'] || element['columnName']}

        {this._renderHitArea(['right'])}

        {this._renderRemark()}

      </button>
    );
  }

  protected _selectElementMethod = (event: React.MouseEvent) => {
    const { element, location, dispatch } = this.props;
    super._selectElementMethod(event);
    if (!this._pageListLoaded && location.pathname === '/prototype' && element.layoutElementAttr) {
      this._pageListLoaded = true;
      const layoutElementAttrObj = JSON.parse(element.layoutElementAttr);
      const {
        baseViewId,
      } = layoutElementAttrObj;
      if (baseViewId) {
        dispatch(createLoadPageListEffect(
          queryPageList,
          [{ baseViewId }],
          baseViewId,
        ));
      }
    }
  }
}

registGlobalComponentClass('ElementButtonComponent', ElementButtonComponent);
