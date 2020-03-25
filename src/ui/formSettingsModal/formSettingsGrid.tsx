import * as React from 'react';
import * as _ from 'lodash';
import classnames from 'classnames';
import {
  Button,
  Select,
  InputNumber,
  Icon,
  Input,
} from 'antd';

import './formSettingsGrid.less';
// import { cellNameManager } from 'src/utils/cellName';
// import { createLayout } from 'src/routes/Visualization/config';
// import { createId } from 'src/utils';
import { IChildrenLayoutsMap, ICreateLayouttsModelOptions } from 'src/models/layoutsModel';
import { Consumer, COLS } from '.';
import { getLabelText, delay } from 'src/utils';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

const { Option } = Select;

export interface IUiFormSettingsGridProps {
  /** 标题文字 */
  title: string;
  /** 布局数据 */
  layouts?: any[];
  layout?: any;
  config?: any;
  childrenLayoutsMap?: IChildrenLayoutsMap<any>;
  acceptCols?: number[];
}

export class UiFormSettingsGrid extends React.PureComponent<IUiFormSettingsGridProps> {

  // static getDerivedStateFromProps(nextProps: IUiFormSettingsGridProps, prevState: IUiFormSettingsGridState) {
    // let layouts = nextProps.layouts;
    // const { config, layout } = nextProps;
    // if (layout && (!layouts || !layouts.length)) {
    //   layouts = [];
    //   _.times(DEFAULT_ROW_COUNT, i => {
    //     const parentCellName = layout[config.cellNameKey];
    //     const cellName = cellNameManager.create(layout[config.cellNameKey]);
    //     layouts.push(createLayout({
    //       layoutContainerType: 'DIV',
    //       styleClass: 'row',
    //       isParent: 'X',
    //       [config.parentCellNameKey]: parentCellName,
    //       [config.cellNameKey]: cellName,
    //       [config.layoutIdKey]: createId(),
    //       [config.orderKey]: i,
    //     }));
    //     _.times(DEFAULT_COL_COUNT, j => {
    //       const colCellName = cellNameManager.create(cellName);
    //       layouts.push(createLayout({
    //         layoutContainerType: 'DIV',
    //         unitCount: COLS / DEFAULT_COL_COUNT,
    //         isParent: '',
    //         [config.parentCellNameKey]: cellName,
    //         [config.cellNameKey]: colCellName,
    //         [config.layoutIdKey]: createId(),
    //         [config.orderKey]: j,
    //       }));
    //     });
    //   });
    // }

    // if (layouts !== prevState.layouts) {
    //   return {
    //     layouts,
    //     history: [] as any[][],
    //     historyIndex: -1,
    //     dragSource: null as any,
    //     dropTarget: null as any,
    //     dropTargetType: null as string,
    //   };
    // }
    // return null;
  // }

  render() {
    return (
      <div className="editor-form-grid">
        {this._renderHead()}
        <div className="editor-grid-body">
          {this._renderToolbar()}
          {this._renderGrid()}
        </div>
      </div>
    );
  }

  componentDidMount() {
    const input = document.querySelector<HTMLInputElement>('.editor-grid-row-col .ant-input-number-input');
    input.setAttribute('disabled', 'disabled');
  }

  private _renderHead = () => {
    const { title } = this.props;
    return (
      <div className="editor-grid-head">
        <h3>{title}</h3>
      </div>
    );
  }

  private _renderToolbar = () => {
    const { acceptCols } = this.props;
    return (
      <Consumer>
        {
          ({
            joinCols,
            splitCol,
            undo,
            redo,
            canRedo,
            canUndo,
            rowCount,
            colCount,
            changeRowCount,
            changeColCount,
            fill,
          }) => (
            <div className="editor-grid-toolbar">
              <div className="editor-grid-row-col">
                <InputNumber
                  min={1}
                  max={Infinity}
                  step={1}
                  size="small"
                  precision={0}
                  style={{
                    width: 60,
                  }}
                  value={rowCount}
                  onChange={value => this._changeRowCount(value, changeRowCount)}
                />
                {' '}{t(I18N_IDS.TEXT_ROWS)}{' '}
                <Select
                  size="small"
                  style={{
                    width: 60,
                  }}
                  value={colCount}
                  onChange={(value: any) => this._changeColCount(value, changeColCount)}
                >
                  {_.map(acceptCols, cols => <Option key={cols} value={cols}>{ cols }</Option>)}
                </Select>
                {' '}{t(I18N_IDS.TEXT_COLUMNS)}
              </div>
              <div className="editor-grid-buttons">
              <Button size="small" onClick={joinCols} >{t(I18N_IDS.TEXT_JOIN)}</Button>
                <Button size="small" onClick={splitCol} >{t(I18N_IDS.TEXT_SPLIT)}</Button>
                <Button size="small" disabled={!canUndo} onClick={undo} >{t(I18N_IDS.UNDO)}</Button>
                <Button size="small" disabled={!canRedo} onClick={redo} >{t(I18N_IDS.REDO)}</Button>
                <Button size="small" onClick={fill} >{t(I18N_IDS.TEXT_FILL)}</Button>
              </div>
            </div>
          )
        }
      </Consumer>
    );
  }

  private _changeRowCount = (_rowCount: number, callback: (n: number) => any) => {
    let rowCount = Math.floor(_rowCount) || 1;
    if (rowCount < 1) {
      rowCount = 1;
    }
    if (callback) {
      callback(rowCount);
    }
  }

  private _changeColCount = (colCount: number, callback: (n: number) => any) => {
    if (callback) {
      callback(colCount);
    }
  }

  private _renderGrid() {
    const { layout, config, childrenLayoutsMap } = this.props;
    const rows = childrenLayoutsMap[layout[config.cellNameKey]] || [];

    return (
      <div className="editor-grid-area">
        {_.map(rows, (row, i) => (
          <Row
            key={row[config.cellNameKey]}
            layout={row}
            childrenLayouts={childrenLayoutsMap[row[config.cellNameKey]]}
            config={config}
            childrenLayoutsMap={childrenLayoutsMap}
            rowIndex={i}
          />
        ))}
      </div>
    );
  }
}

interface IRowProps {
  layout: any;
  childrenLayouts: any[];
  childrenLayoutsMap: IChildrenLayoutsMap<any>;
  config: ICreateLayouttsModelOptions;
  rowIndex: number;
}
class Row extends React.PureComponent<IRowProps> {
  render() {
    return (
      <div className="editor-grid-row">
        {this._renderCols()}
      </div>
    );
  }

  private _renderCols = () => {
    const { childrenLayouts, config, rowIndex, childrenLayoutsMap } = this.props;
    return _.map(childrenLayouts, (col, i) => {
      const hasChildrenLayout = !!((childrenLayoutsMap[col[config.cellNameKey]] || []).length);
      return (
        <Col
          key={col[config.cellNameKey]}
          layout={col}
          hasChildrenLayout={hasChildrenLayout}
          config={config}
          rowIndex={rowIndex}
          colIndex={i}
        />
      );
    });
  }
}

interface IColProps {
  layout?: any;
  config: ICreateLayouttsModelOptions;
  hasChildrenLayout?: boolean;
  rowIndex: number;
  colIndex: number;
}

class Col extends React.PureComponent<IColProps> {
  render() {
    const { layout, hasChildrenLayout, rowIndex, colIndex } = this.props;
    return (
      <Consumer>
        {
          ({
            onToggleSelectedCol,
            isSelectedCol,
            onDragOver,
            onDrop,
          }) => (
            <div
              className={classnames('editor-grid-col', {
                'editor-selected': isSelectedCol([rowIndex, colIndex]),
                'editor-is-not-regular': hasChildrenLayout,
              })}
              style={{
                width: `${(layout.unitCount || 12) / COLS * 100}%`,
              }}
              onClick={e => onToggleSelectedCol([rowIndex, colIndex], e.ctrlKey)}
              onDragOver={e => onDragOver(e, layout, 'layout')}
              onDrop={onDrop}
            >
              {this._renderItems()}
            </div>
          )
        }
      </Consumer>
    );
  }

  private _renderItems = () => {
    const { layout, config } = this.props;
    const elements: any[] = layout[config.childrenElementsKey] || [];
    return _.map(elements, e => {
      return <Item key={e[config.elementIdKey]} element={e} />;
    });
  }
}

interface IItemProps {
  element?: any;
}

class Item extends React.PureComponent<IItemProps, any> {
  state = {
    editorCancel: false,
  };
  private _ref = React.createRef<HTMLDivElement>();
  private _inputContainerRef = React.createRef<HTMLDivElement>();
  render() {
    const { element } = this.props;
    const display = getLabelText(element);
    const propertyNameDisplay = element.propertyName ? `(${element.propertyName})` : '';
    return (
      <Consumer>
        {
          ({
            onDragStart,
            onDragEnd,
            onDragOver,
            onDrop,
            onDelete,
            editable,
            onEdit,
            editingItem,
            editingValue,
            onEditorChange,
            onEditorClose,
          }) => {
            return (
              <div
                className="editor-grid-item"
                title={display + propertyNameDisplay}
                draggable
                {...this.props}
                onClick={e => e.stopPropagation()}
                onDragStart={(e) => onDragStart([element], false, e)}
                onDragEnd={onDragEnd}
                onDragOver={(e) => onDragOver(e, element, 'element')}
                onDrop={onDrop}
                ref={this._ref}
              >
                <span className="editor-grid-item-text" onDoubleClick={e => this._onEdit(e, onEdit)}>
                  {display}
                </span>
                <div className="editor-grid-item-actions" style={editingItem === element ? {
                  display: 'none',
                } : null} >
                  {
                    editable
                      ? (
                        <a href="javascript:void(0)" title="编辑" className="editor-grid-item-edit" onClick={e => this._onEdit(e, onEdit)}>
                          <Icon type="edit" theme="twoTone" twoToneColor="#d9534f" />
                        </a>
                      )
                      : null
                  }
                  <a href="javascript:void(0)" title="删除" className="editor-grid-item-delete" onClick={e => this._onDelete(e, onDelete)}>
                    <Icon type="close-circle" theme="twoTone" twoToneColor="#d9534f" />
                  </a>
                </div>
                {
                  editingItem === element
                    ? this._renderEditor(editingValue, onEditorChange, onEditorClose)
                    : null
                }
              </div>
            );
          }
        }
      </Consumer>
    );
  }

  private _onEdit = (e: React.MouseEvent, callback?: (item: any) => any) => {
    e.stopPropagation();
    const { element } = this.props;
    this.setState({
      editorCancel: false,
    });
    if (callback) {
      callback(element);
    }
    this._delayFocusInput();
  }

  private _onDelete = (e: React.MouseEvent, callback?: (item: any) => any) => {
    e.stopPropagation();
    const { element } = this.props;
    if (callback) {
      callback(element);
    }
  }

  private _renderEditor = (
    editingValue: any,
    onEditorChange: (key: string, value: any) => any,
    onEditorClose: (apply: boolean) => any,
  ) => {
    const elementDiv = this._ref.current;
    const colDiv = elementDiv.parentElement;
    const rowDiv = colDiv.parentElement;
    const rightAreaWidth = rowDiv.offsetWidth - colDiv.offsetLeft - elementDiv.offsetLeft;
    const editorWidth = 160;
    const alignRight = rightAreaWidth < editorWidth;
    return (
      <div className={classnames('editor-settings-item-editor', {
        'editor-settings-item-editor-right': alignRight,
      })}>
        <div className="editor-settings-item-editor-input" ref={this._inputContainerRef}>
          <Input
            value={editingValue.fieldText}
            onChange={e => onEditorChange('fieldText', e.target.value)}
            onBlur={e => {
              if (!this.state.editorCancel) {
                onEditorClose(true);
              }
              this.setState({
                editorCancel: false,
              });
            }}
            size="small"
          />
        </div>
        <div className="editor-settings-item-editor-actions">
          <a
            title={t(I18N_IDS.TEXT_OK)} href="javascript:void(0)"
            >
            <Icon type="check" />
          </a>
          <a
            title={t(I18N_IDS.TEXT_CANCEL)} href="javascript:void(0)"
            onMouseDown={() => this.setState({
              editorCancel: true,
            })}
            onClick={() => onEditorClose(false)}
          >
            <Icon type="close" />
          </a>
        </div>
      </div>
    );
  }

  private _focusInput = () => {
    const ref = this._inputContainerRef;
    const inputContainer = ref.current;
    if (!inputContainer) {
      return;
    }
    const input = inputContainer.querySelector('input');
    input.select();
    input.focus();
  }

  private _delayFocusInput = async () => {
    await delay();
    this._focusInput();
  }

}
