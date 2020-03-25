import * as React from 'react';
import * as _ from 'lodash';
import classnames from 'classnames';

import { BaseLayoutComponent, connector } from './BaseLayoutComponent';
import { registGlobalComponentClass, renderPagination, getJsonObj } from 'src/utils';

import './LayoutFluidViewComponent.less';
import { createSetRootElementAction } from 'src/models/layoutsActions';

/**
 * 布局元素类型类型：FLUID_VIEW
 */
@connector
export class LayoutFluidViewComponent extends BaseLayoutComponent {

  render() {
    const { layout } = this.props;
    const { cellNameKey } = this.props.config;
    console.log(`[LayoutFluidViewComponent#render] ${layout ? layout[cellNameKey] : ''}`);
    const columnArr = this._getColumnArr();
    return (
      <div
        {...this._createRootProps(['editor-layout-fluid-view'])}
      >
        <div className="fluid-view row">
          {
            _.map(columnArr, (col, i) => (
              <div key={i} className={classnames('editor-col', col.className)}>
                {/* .. */}
              </div>
            ))
          }
        </div>

        {renderPagination()}

        {this._renderLayoutSign()}

        {this._renderSettings()}

        {this._renderHitArea()}

        {this._renderRemark()}

      </div>
    );
  }

  clickSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { dispatch, layout, config } = this.props;
    const childrenElements: any[] = layout[config.childrenElementsKey] || [];
    if (!childrenElements.length) {
      return;
    }
    dispatch(createSetRootElementAction(
      childrenElements[0],
      'FLUID_VIEW Item 配置',
      true,
    ));
  }

  private _getColumnCount() {
    const { layout } = this.props;
    let n: number = getJsonObj(layout.pageLayoutAttr)['columnCount'];
    if (!_.includes([1, 2, 3, 4, 6, 12], n)) {
      n = 3;
    }
    return n;
  }

  private _getColumnArr() {
    const arr: any[] = [];
    const columnCount = this._getColumnCount();
    _.times(columnCount, () => {
      arr.push({
        className: `col-xs-${12 / columnCount}`,
      });
    });
    return arr;
  }
}

registGlobalComponentClass('LayoutFluidViewComponent', LayoutFluidViewComponent);
