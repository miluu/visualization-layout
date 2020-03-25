import * as React from 'react';
import * as _ from 'lodash';

import { BaseLayoutComponent, connector } from './BaseLayoutComponent';
import { registGlobalComponentClass } from 'src/utils';

import './LayoutTabComponent.less';

/**
 * 容器类型: TAB
 */
@connector
export class LayoutTabComponent extends BaseLayoutComponent {

  render() {
    const { layout } = this.props;
    const { cellNameKey } = this.props.config;
    console.log(`[LayoutTabComponent#render] ${layout ? layout[cellNameKey] : ''}`);
    return (
      <div
        {...this._createRootProps(['editor-layout-tab', 'tab-body-html', 'active'], false)}
        style={{
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {this._renderChildren()}

        {this._renderLayoutSign()}

        {this._renderHitArea()}

        {this._renderRemark()}

      </div>
    );
  }
}

registGlobalComponentClass('LayoutTabComponent', LayoutTabComponent);
