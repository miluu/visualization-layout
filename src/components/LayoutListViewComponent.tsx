import * as React from 'react';
import * as _ from 'lodash';

import { BaseLayoutComponent, connector } from './BaseLayoutComponent';
import { registGlobalComponentClass, renderPagination, isEqual, getControlDefaultSetting } from 'src/utils';

import { ElementListViewColumnComponent } from './ElementListViewColumnComponent';

import './LayoutListViewComponent.less';
import produce from 'immer';
import { createUpdateLayoutsAction } from 'src/models/layoutsActions';
import { openPrototypeGridSettingsModal, openGridSettingsModal } from 'src/utils/modal';

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

  clickSettings = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const { config, layout, properties, methods, location, defaultSetting } = this.props;

    const onSubmit = (list: any[]) => {
      const childrenElements = layout[config.childrenElementsKey];
      if (isEqual(childrenElements, list)) {
        console.log('[openGridSettingsModal onSubmit] 没有变化。');
        return;
      }
      const newChildrenElements = _.map(list, (item, i) => {
        const isNew = !_.find(childrenElements, column => column[config.elementIdKey] === item[config.elementIdKey]);
        return produce(item, draft => {
          draft[config.elementOrderKey] = i + config.elementStartIndex;
          if (isNew) {
            const gridDefaultSetting = getControlDefaultSetting(defaultSetting, 'G', item.uiType);
            _.assign(draft, gridDefaultSetting);
          }
        });
      });
      const newLayout = produce(layout, draft => {
        draft[config.childrenElementsKey] = newChildrenElements;
      });
      this.props.dispatch(createUpdateLayoutsAction(
        [newLayout],
        true,
        true,
      ));
    };

    if (location.pathname === '/prototype') {
      openPrototypeGridSettingsModal({
        config,
        layout,
        gridColumns: layout[config.childrenElementsKey] || [],
        onSubmit: (__, list) => {
          onSubmit(list);
        },
      });
      return;
    }

    openGridSettingsModal({
      config,
      layout,
      properties,
      methods,
      onSubmit: (__, ___, list) => {
        onSubmit(list);
      },
    });
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
