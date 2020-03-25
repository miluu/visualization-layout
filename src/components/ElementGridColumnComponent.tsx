import * as React from 'react';
import * as _ from 'lodash';
import { Menu, Dropdown, Icon } from 'antd';
import {
  BaseElementComponent,
  IBaseElementComponentProps,
  createConnector,
} from './BaseElementComponent';
import { registGlobalComponentClass, isEqual } from 'src/utils';

import './ElementGridColumnComponent.less';
import { ILayoutsState } from 'src/models/layoutsModel';
import { IDndState } from 'src/models/dndModel';
import { createSelectElementAction } from 'src/models/layoutsActions';
import { EditorStatus } from 'src/config';

@createConnector(
  ({ LAYOUTS }: {LAYOUTS: ILayoutsState<any>, DND: IDndState}, { actionColumns }: IBaseElementComponentProps) => {
    const selectedColumn = _.find(actionColumns, column => column[LAYOUTS.config.elementIdKey] === LAYOUTS.selectedElement);
    return {
      isSelected: !!selectedColumn,
      selectedColumn,
    };
  },
)
export class ElementGridColumnComponent extends BaseElementComponent {
  render() {
    const { element, selectedColumn } = this.props;
    return (
      <th
        {...this._createRootProps(['editor-element-grid-column', 'header-column-cell align-center'])}
        style={{
          position: 'relative',
          width: element['controlWidth'] || 150,
        }}
        id={this._getDomRootId(selectedColumn)}
      >
        {
          element.isShowSort
            ? <div className="grid-head-sort">
                <button className="btn">
                  <span className="caret caret-up" />
                </button>
                <button className="btn">
                  <span className="caret caret-down" />
                </button>
              </div>
            : null
        }

        {element.isNotNull ? <span className="required">*</span> : null}

        <span>
          {this._getColumnTitle()}
          {this._renderDropdown()}
        </span>

        {this._renderRemark()}

      </th>
    );
  }

  shouldComponentUpdate(nextProps: any) {
    const { selectedColumn, actionColumns } = this.props;
    const { selectedColumn: nextSelectedColumn, actionColumns: nextActionColumns, renderLocked } = nextProps;
    return !renderLocked && (
      super.shouldComponentUpdate(nextProps)
        || selectedColumn !== nextSelectedColumn
        || !isEqual(actionColumns, nextActionColumns)
    );
  }

  private _getColumnTitle = () => {
    const { element, actionColumns } = this.props;
    if (actionColumns && actionColumns.length > 1) {
      return '操作';
    }
    return element.fieldText || element.columnName;
  }

  private _renderDropdown = () => {
    if (this.props.editorStatus !== EditorStatus.EDIT) {
      return null;
    }
    const { actionColumns } = this.props;
    if (actionColumns && actionColumns.length <= 1) {
      return null;
    }
    const menu = this._renderMenu();
    return (
      <Dropdown overlay={menu}>
        <div className="editor-grid-column-dropdown" />
      </Dropdown>
    );
  }

  private _renderMenu = () => {
    const { actionColumns, config, selectedColumn } = this.props;
    return (
      <Menu>
        {_.map(actionColumns, column => {
          const text = column['fieldText'] || column['columnName'];
          const { methodName } = column;
          const id = column[config.elementIdKey];
          return (
            <Menu.Item key={id}>
              <a href="javascript:void(0)" onClick={(e) => this._clickItem(e, column)}>
                {
                  <Icon type="check" style={{
                    marginRight: 8,
                    visibility: selectedColumn === column ? 'visible' : 'hidden',
                  }} />
                }
                {`${text} (${methodName})`}
              </a>
            </Menu.Item>
          );
        })}
      </Menu>
    );
  }

  private _clickItem = (e: React.MouseEvent, column: any) => {
    e.stopPropagation();
    const { config, dispatch, isInReference } = this.props;
    dispatch(createSelectElementAction(
      column[config.elementIdKey],
      { isInReference },
      true,
    ));
  }
}

registGlobalComponentClass('ElementGridColumnComponent', ElementGridColumnComponent);
