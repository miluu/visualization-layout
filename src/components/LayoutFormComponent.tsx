import * as React from 'react';
import * as _ from 'lodash';

import { BaseLayoutComponent, connector } from './BaseLayoutComponent';
import { registGlobalComponentClass } from 'src/utils';

import './LayoutFormComponent.less';

export const { Provider, Consumer } = React.createContext<{formType?: string}>({});

/**
 * 容器类型：DIV
 */
@connector
export class LayoutFormComponent extends BaseLayoutComponent {

  render() {
    const { layout } = this.props;
    const { cellNameKey } = this.props.config;
    console.log(`[LayoutFormComponent#render] ${layout ? layout[cellNameKey] : ''}`);
    return (
      <form
        {...this._createRootProps(['editor-layout-form'])}
      >
        <Provider
          value={{
            formType: layout.formType,
          }}
        >
          {this._renderChildren()}
        </Provider>

        {this._renderLayoutSign()}

        {this._renderHitArea()}

        {this._renderRemark()}

      </form>
    );
  }
}

registGlobalComponentClass('LayoutFormComponent', LayoutFormComponent);
