import * as React from 'react';
import * as _ from 'lodash';

import { BaseLayoutComponent, connector } from './BaseLayoutComponent';
import { registGlobalComponentClass, renderPagination } from 'src/utils';

import { ElementListViewColumnComponent } from './ElementListViewColumnComponent';

import './LayoutListViewComponent.less';

/**
 * 布局元素类型: LIST_VIEW
 */
@connector
export class LayoutListViewComponent extends BaseLayoutComponent {

  render() {
    const { layout } = this.props;
    const { cellNameKey } = this.props.config;
    console.log(`[LayoutListViewComponent#render] ${layout ? layout[cellNameKey] : ''}`);
    return (
      <div
        {...this._createRootProps(['editor-layout-list-view'])}
      >
        <div className="list-view">
          <div className="list-view-head">
            <table className="table-head">
              <tbody>
                <tr>
                  <th className="grid-col-index">序号</th>
                  <th className="grid-col-checkbox">
                    <div className="form-clickbox">
                      <a className="fi" />
                    </div>
                  </th>
                  {this._renderListViewColumns()}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="list-view-body" style={{ display: 'block', height: 200, position: 'relative' }}>
            <table className="table-body">
              <tbody />
            </table>
          </div>
        </div>

        {renderPagination()}

        {this._renderLayoutSign()}

        {this._renderSettings()}

        {this._renderRemark()}

      </div>
    );
  }

  private _renderListViewColumns() {
    const { layout, config } = this.props;
    const columns: any[] = layout[config.childrenElementsKey];
    return _.map(columns, (column, i) => {
      return (
        <ElementListViewColumnComponent
          key={column[config.elementIdKey]}
          element={column}
        />
      );
    });
  }

}

registGlobalComponentClass('LayoutListViewComponent', LayoutListViewComponent);
