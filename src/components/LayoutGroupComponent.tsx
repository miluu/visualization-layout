import * as React from 'react';
import { BaseLayoutComponent, connector } from './BaseLayoutComponent';
import { registGlobalComponentClass } from 'src/utils';

import './LayoutGroupComponent.less';

@connector
export class LayoutGroupComponent extends BaseLayoutComponent {
  constructor(props: any) {
    super(props);
    console.log(':::LayoutGroupComponent');
  }

  render() {
    const { layout } = this.props;
    console.log(`[LayoutGroupComponent#render] ${layout ? layout.cellName : ''}`);
    return (
      <fieldset
        {...this._createRootProps(['editor-layout-group'])}
      >
        <legend>
          {layout.groupTitle}
        </legend>
        {this._renderChildren()}
        {this._renderLayoutSign()}
        {this._renderHitArea()}
        {this._renderRemark()}
      </fieldset>
    );
  }
}

registGlobalComponentClass('LayoutGroupComponent', LayoutGroupComponent);
