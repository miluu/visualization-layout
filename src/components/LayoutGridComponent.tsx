import * as React from 'react';
import * as _ from 'lodash';

import { BaseLayoutComponent, connector, IBaseLayoutComponentState, IBaseLayoutComponentProps } from './BaseLayoutComponent';
import { registGlobalComponentClass, renderPagination, isEqual, createGridSourceFromColumns, getControlDefaultSetting } from 'src/utils';

import { ElementGridColumnComponent } from './ElementGridColumnComponent';

import './LayoutGridComponent.less';
import { openGridSettingsModal, openPrototypeGridSettingsModal } from 'src/utils/modal';
import produce from 'immer';
import { createUpdateLayoutsAction } from 'src/models/layoutsActions';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

/**
 * 布局元素类型: GRID
 */
@connector
export class LayoutGridComponent extends BaseLayoutComponent {
  state: IBaseLayoutComponentState = {
    isCollpased: false,
    scrollLeft: 0,
  };

  render() {
    const { layout } = this.props;
    const { scrollLeft } = this.state;
    const { cellNameKey } = this.props.config;
    console.log(`[LayoutGridComponent#render] ${layout ? layout[cellNameKey] : ''}`);
    return (
      <div
        {...this._createRootProps(['editor-layout-grid'])}
      >
        <div className="grid-container">
          <div className="grid" onScroll={this._onGridScroll}>
            <div className="grid-head">
              <table className="table-head">
                <tbody>
                  <tr>
                    <th className="grid-col-index">{t(I18N_IDS.GRID_INDEX)}</th>
                    <th className="grid-col-checkbox">
                      <div className="form-clickbox">
                        <a className="fi" />
                      </div>
                    </th>
                    {this._renderGridColumns()}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="grid-body" style={{
              display: 'block',
              height: 200,
              left: scrollLeft,
            }}>
              <table className="table-body" style={{
                left: -scrollLeft,
              }}>
                <tbody>
                  {this._renderGridBody()}
                </tbody>
              </table>
            </div>
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

  shouldComponentUpdate(nextProps: IBaseLayoutComponentProps, nextState: IBaseLayoutComponentState) {
    const { scrollLeft } = this.state;
    const { scrollLeft: nextScrollLeft } = nextState;
    return scrollLeft !== nextScrollLeft || super.shouldComponentUpdate(nextProps, nextState);
  }

  private _onGridScroll = (e: React.UIEvent<HTMLDivElement>) => {
    console.log(e);
    const target = e.target as HTMLDivElement;
    const scrollLeft = target.scrollLeft;
    this.setState({
      scrollLeft,
    });
  }

  private _renderGridColumns() {
    const { layout, config } = this.props;
    const columns: any[] = layout[config.childrenElementsKey];
    return _.map(columns, (column, i) => {
      const actionColumns = [];
      if (column.methodName) {
        actionColumns.push(column);
        const preColumn = columns[i - 1];
        if (this._isSameColumn(preColumn, column)) {
          return null;
        }
        let n = i + 1;
        let nextColumn = columns[n];
        while (this._isSameColumn(column, nextColumn)) {
          actionColumns.push(nextColumn);
          n++;
          nextColumn = columns[n];
        }
      }
      return (
        <ElementGridColumnComponent
          key={column[config.elementIdKey]}
          element={column}
          isInReference={this._isChildrenInReference()}
          actionColumns={actionColumns}
        />
      );
    });
  }

  private _renderGridBody = () => {
    const { location, layout, config } = this.props;
    if (location.pathname !== '/prototype') {
      return null;
    }
    const childrenElements = layout[config.childrenElementsKey] || [];
    const source = createGridSourceFromColumns(childrenElements);
    return (
      <>
        {
          _.map(source, (row, rowIndex) => {
            return (
              <tr key={rowIndex}>
                <td className="grid-col-index">{rowIndex + 1}</td>
                <td className="grid-col-checkbox" ng-style="dragStyle">
                    <div className="form-clickbox" outer-scope="grid.scope.$parent">
                      <a href="javascript:void(0);" className="fi" />
                    </div>
                </td>
                {
                  _.map(layout[config.childrenElementsKey], (e, i) => {
                    return (
                      <td key={i} className="align-left" style={{
                        width: e.controlWidth || 150,
                      }}>
                        <span data-role="display">{row[i]}</span>
                      </td>
                    );
                  })
                }
              </tr>
            );
          })
        }
      </>
    );
  }

  private _isSameColumn = (column1: any, column2: any) => {
    return column1 && column2 && column1.methodName && column2.methodName && column1.propertyName === column2.propertyName;
  }
}

registGlobalComponentClass('LayoutGridComponent', LayoutGridComponent);
