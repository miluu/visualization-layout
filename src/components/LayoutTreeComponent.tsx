import * as React from 'react';
import * as _ from 'lodash';

import { BaseLayoutComponent, connector, IBaseLayoutComponentState } from './BaseLayoutComponent';
import { registGlobalComponentClass } from 'src/utils';

import './LayoutTreeComponent.less';

/**
 * 布局元素类型: TREE_VIEW / TREE_VIEW_NEW
 */
@connector
export class LayoutTreeComponent extends BaseLayoutComponent {
  state: IBaseLayoutComponentState = {
    isCollpased: false,
  };

  render() {
    const { layout } = this.props;
    const { cellNameKey } = this.props.config;
    console.log(`[LayoutTreeComponent#render] ${layout ? layout[cellNameKey] : ''}`);
    return (
      <div
        {...this._createRootProps(['editor-layout-tree', 'row'], true, false)}
      >

        {this._renderTree()}

        {this._renderLayoutSign()}

        {this._renderRemark()}

      </div>
    );
  }

  private _renderTree() {
    return (
      <div
        className="tree"
        style={{ height: 300 }}
      >
        <div
          className="tree-head"
        >
          <ul className="tree-head-selecteds">
            <li>选择：</li>
          </ul>
          <button className="btn tree-btn-reset">重选</button>
        </div>
        <div className="tree-body">
          {/*  */}
        </div>
      </div>
    );
  }

}

registGlobalComponentClass('LayoutTreeComponent', LayoutTreeComponent);
