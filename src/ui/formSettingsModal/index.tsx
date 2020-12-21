import * as React from 'react';
import * as _ from 'lodash';
import { message } from 'antd';

import { UiSettingsModal } from '../settingsModal';
import { ITransferListProps } from '../transferModal';

import './style.less';
import { UiColumnList } from '../columnList';
import { UiFormSettingsGrid } from './formSettingsGrid';
import { connect } from 'dva';
import { Dispatch, AnyAction } from 'redux';
import {
  createEnterTempAction,
  createQuitTempEffect,
  createRemoveElementEffect,
  createLayoutsHistoryUndoAction,
  createLayoutsHistoryRedoAction,
  createJoinLayoutsEffect,
  createSplitLayoutEffect,
  createClearLayoutEffect,
  createRemoveLayoutsEffect,
  createAddLayoutToParentEffect,
  createUpdateLayoutsAction,
  createResetLayoutsHistoryAction,
  createUpdateElementFieldsEffect,
  createAddElementToParentEffect,
} from 'src/models/layoutsActions';
import { IPropertiesMap, ICreateLayouttsModelOptions, ILayoutsState, IChildrenLayoutsMap } from 'src/models/layoutsModel';
import { propertiesFilter, confirm, getBigFactor } from 'src/utils';
import { createDropEffect } from 'src/models/dndActions';
import { createElement, createLayout } from 'src/routes/Visualization/config';
import produce, { nothing } from 'immer';
import { delay } from 'rxjs/operators';
import { Location } from 'history';
import { PROTOTYPE_CONFIG } from 'src/routes/Prototype/config';
import { IAppState } from 'src/models/appModel';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

const DEFAULT_ROW_COUNT = 2;
const DEFAULT_COL_COUNT = 4;
export const COLS = 12;
export const ACCEPT_COLS = [1, 2, 3, 4, 6, 12];

interface IFormSettingsContext {
  onToggleSelectedCol?: (pos: number[], isMulti: boolean) => any;
  isSelectedCol?: (pos: number[]) => boolean;
  clearSelectedCol?: () => any;

  onDragStart?: (dragSource: any[], isDragAdd: boolean, e: React.DragEvent) => any;
  onDragEnd?: () => any;
  onDragOver?: (e: React.DragEvent, target: any, targetType: string) => any;
  onDrop?: (e: React.DragEvent) => any;
  onDelete?: (item: any) => any;
  onEdit?: (item: any) => any;
  joinCols?: () => any;
  splitCol?: () => any;
  undo?: () => any;
  redo?: () => any;
  fill?: () => any;
  canUndo?: boolean;
  canRedo?: boolean;
  rowCount?: number;
  colCount?: number;
  changeRowCount?: (n: number) => any;
  changeColCount?: (n: number) => any;

  editable?: boolean;
  editingItem?: any;
  editingValue?: any;
  onEditorChange?: (key: string, value: any) => any;
  onEditorClose?: (apply: boolean) => any;
}

export const { Provider, Consumer } = React.createContext<IFormSettingsContext>({});

export interface IUiFormSettingsModalProps {
  dispatch?: Dispatch<AnyAction>;
  layouts?: any[];
  config?: ICreateLayouttsModelOptions;
  properties?: IPropertiesMap;
  childrenLayoutsMap?: IChildrenLayoutsMap<any>;
  location?: Location;

  canUndo?: boolean;
  canRedo?: boolean;
}

export interface IUiFormSettingsModalState {
  visible?: boolean;
  listProp?: ITransferListProps;
  layout?: any;
  onSubmit?: (...args: []) => any;

  listSource?: any[];

  dragSource?: any[];
  isDragAdd?: boolean;
  dropTarget?: any;
  dropTargetType?: string;

  selectedCols?: number[][];

  rowCount?: number;
  colCount?: number;

  acceptCols?: number[];

  editable?: boolean;
  editingItem?: any;
  editingValue?: any;

  selectValue?: any;
}

@connect(
  ({ LAYOUTS, APP }: {
    LAYOUTS: ILayoutsState<any>,
    APP: IAppState;
  }) => {
    const history = LAYOUTS.tempHistory;
    const canUndo = history.currentIndex > 0;
    const canRedo = history.currentIndex < history.layoutHistory.length - 1;
    return {
      layouts: LAYOUTS.layouts,
      config: LAYOUTS.config,
      properties: LAYOUTS.properties,
      childrenLayoutsMap: LAYOUTS.childrenLayoutsMap,
      canUndo,
      canRedo,
      location: APP.location,
    };
  },
  null,
  null,
  {
    withRef: true,
  },
)
export class UiFormSettingsModal extends React.PureComponent<IUiFormSettingsModalProps, IUiFormSettingsModalState> {
  listRef = React.createRef<UiColumnList>();

  constructor(props: any) {
    super(props);
    this.state = {
      visible: false,

      dragSource: null,
      isDragAdd: false,
      dropTarget: null,
      dropTargetType: null,

      selectedCols: [],

      listSource: [],
      rowCount: DEFAULT_ROW_COUNT,
      colCount: DEFAULT_COL_COUNT,

      editable: false,
      editingItem: null,
      editingValue: {},
    };
  }

  render() {
    const { visible, rowCount, colCount, editable, editingItem, editingValue } = this.state;
    return (
      <Provider value={{
        onToggleSelectedCol: this._onToggleSelectCol,
        isSelectedCol: this._isSelectedCol,
        clearSelectedCol :this._clearSelectedCol,
        onDragStart: this._onDragStart,
        onDragEnd: this._onDragEnd,
        onDragOver: this._onDragOver,
        onDrop: this._onDrop,
        onDelete: this._onDelete,
        onEdit: this._onEdit,
        joinCols: this._joinCols,
        splitCol: this._splitCol,
        undo: this._undo,
        redo: this._redo,
        fill: this._fill,
        canUndo: this.props.canUndo,
        canRedo: this.props.canRedo,
        rowCount,
        colCount,
        changeRowCount: this._changeRowCount,
        changeColCount: this._changeColCount,
        editable,
        editingItem,
        editingValue,
        onEditorChange: this._onEditorChange,
        onEditorClose: this._onEditorClose,
      }}>
        <UiSettingsModal
          visible={visible}
          onCancel={this._onCancel}
          onOk={this._onSubmit}
          wrapClassName="editor-form-settings-modal"
          afterClose={this._afterClose}
        >
          <div className="editor-form-settings-content">
            {this._renderList()}
            {this._renderGrid()}
          </div>
        </UiSettingsModal>
      </Provider>
    );
  }

  open = (options: IUiFormSettingsModalState) => {
    this.props.dispatch(createEnterTempAction(true));
    const { properties } = this.props;
    const { layout } = options;
    let listSource: any[] = [];
    if (this._isPrototype()) {
      listSource = PROTOTYPE_CONFIG.draggableItems_tools[3].listSource.slice(3);
    } else {
      listSource = propertiesFilter(properties, layout) || [];
    }
    const state = _.assign({}, options, {
      visible: true,
      listSource,
    });
    this.setState(state);
    this._delayUpdateRowColInfo();
  }

  close = () => {
    this.setState({
      visible: false,
      layout: null,
      listSource: [],
      dragSource: null,
      isDragAdd: false,
      dropTarget: null,
      dropTargetType: null,
      selectedCols: [],
      rowCount: DEFAULT_ROW_COUNT,
      colCount: DEFAULT_COL_COUNT,
    });
  }

  private _onEditorChange = (key: string, value: any) => {
    this.setState({
      editingValue: _.assign({}, this.state.editingValue, {
        [key]: value,
      }),
    });
  }

  private _onEditorClose = (apply: boolean) => {
    const { editingItem, editingValue } = this.state;
    const { config } = this.props;
    this.setState({
      editingItem: null,
      editingValue: {},
    });
    if (!apply) {
      return;
    }
    this.props.dispatch(createUpdateElementFieldsEffect(
      editingItem[config.elementIdKey],
      editingValue,
    ));
  }

  private _onCancel = () => {
    this.props.dispatch(createQuitTempEffect(false));
    this.close();
  }

  private _onSubmit = () => {
    const { onSubmit } = this.state;
    this._removeEmptyCols();
    if (onSubmit) {
      onSubmit();
    }
    this.props.dispatch(createQuitTempEffect(true));
    this.close();
  }

  private _removeEmptyCols = () => {
    const rows = this._getRows();
    const willRemoveLayouts: any[] = [];
    const { childrenLayoutsMap, config } = this.props;
    _.forEach(rows, row => {
      const cols = childrenLayoutsMap[row[config.cellNameKey]];
      _.forEachRight(cols, (col, i) => {
        const elements = col[config.childrenElementsKey];
        if (elements && elements.length) {
          return false;
        }
        willRemoveLayouts.push(col);
        if (i === 0) {
          willRemoveLayouts.push(row);
        }
        return true;
      });
    });
    if (willRemoveLayouts.length) {
      this.props.dispatch(createRemoveLayoutsEffect(_.map(willRemoveLayouts, l => l[config.cellNameKey])));
    }
  }

  private _renderList = () => {
    const { listProp, layout } = this.state;
    const { properties } = this.props;
    const prototypeListProp = {
      keyProp: 'title',
      displayFunc: (item: any) => `${item.title}`,
    };
    let _listProp: ITransferListProps = {} as any;
    if (this._isPrototype()) {
      _listProp = prototypeListProp as any;
    } else {
      _listProp = listProp;
    }
    if (!(layout && properties)) {
      return null;
    }
    const list = this.state.listSource;
    return (
      <div className="editor-form-settings-list">
        <UiColumnList
          ref={this.listRef}
          title={t(I18N_IDS.TEXT_ALL_FIELDS)}
          list={list}
          {..._listProp}
          onDragItems={(e, listInstance) => {
            e.stopPropagation();
            const selectedItems = listInstance.getSelectedItems(false);
            this._onDragStart(selectedItems, true, e);
          }}
          onDragItemsEnd={this._onDragEnd}
          onSelectChange={this._delayUpdateDisabledItems}
        />
      </div>
    );
  }

  private _renderGrid = () => {
    const { layouts, config, childrenLayoutsMap } = this.props;
    const { layout } = this.state;
    const acceptCols = this.state.acceptCols || ACCEPT_COLS;
    if (!(layouts && config && layout)) {
      return null;
    }
    return (
      <div className="editor-form-settings-grid-wrap">
        <UiFormSettingsGrid
          {...{ layouts, layout, config, childrenLayoutsMap }}
          title={t(I18N_IDS.TEXT_SELECTED_FIELDS)}
          acceptCols={acceptCols}
        />
      </div>
    );
  }

  private _onDragStart = (dragSource: any[], isDragAdd = false, e?: React.DragEvent) => {
    const { editingItem } = this.state;
    if (editingItem) {
      if (e) {
        e.preventDefault();
      }
      return;
    }
    this.setState({
      dragSource,
      isDragAdd,
    });
  }

  private _onDragOver = (e: React.DragEvent, target: any, targetType: string) => {
    e.stopPropagation();
    const { dragSource } = this.state;
    if (dragSource) {
      e.preventDefault();
      this.setState({
        dropTarget: target,
        dropTargetType: targetType,
      });
    }
  }

  private _onDragEnd = () => {
    this.setState({
      dragSource: null,
      isDragAdd: false,
      dropTarget: null,
      dropTargetType: null,
    });
  }

  private _onDrop = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const {
      dragSource,
      isDragAdd,
      dropTarget,
      dropTargetType,
      layout,
    } = this.state;
    const {
      childrenLayoutsMap,
      config,
    } = this.props;
    let source: any;
    if (isDragAdd) {
      if (this._isPrototype()) {
        source = _.map(dragSource, s => {
          return _.assign({}, s.source, {
            conditionType: layout.conditionType,
            dataSourceId: layout.dataSourceId,
          });
        });
      } else {
        const rangeType = this.listRef.current.state.selectValue;
        source = _.map(dragSource, p => {
          return createElement({
            columnName: p.fieldText,
            conditionType: rangeType ? 'R' : layout.conditionType,
            isShowLable: 'X',
            isVisible: 'X',
            layoutBoName: layout.layoutBoName,
            layoutBoViewName: layout.layoutBoViewName,
            layoutBoViewId: layout.layoutBoViewId,
            layoutElementType: layout.layoutElementType,
            propertyName: p.propertyName,
            uiType: p.uiType,
            dataElementCode: p.elementCode,
            dataElementText: p.fieldText,
            fieldText: p.fieldText,
            rangeType,
          });
        });
      }
    } else {
      source = dragSource[0];
    }
    /** 是否不规则布局 */
    const isNotRegularCol = dropTargetType === 'layout' &&
      !!(childrenLayoutsMap[dropTarget[config.cellNameKey]] || []).length;
    if (isNotRegularCol) {
      const b = await confirm({
        content: '此操作导致不规则布局数据丢失，是否继续?',
      });
      if (!b) {
        return;
      }
      // 清除不规则布局数据，不增加历史记录
      this.props.dispatch(createClearLayoutEffect(
        dropTarget,
        false,
      ));
    }
    this._clearSelectedCol();
    this.props.dispatch(createDropEffect({
      dragSource: source,
      dragSourceType: 'element',
      target: dropTarget,
      targetType: dropTargetType,
      isAdd: isDragAdd,
      position: dropTargetType === 'layout' ? 0 : -1,
    }));
    this._delayUpdateDisabledItems();
  }

  private _onToggleSelectCol = (pos: number[], isMulti = false) => {
    const { selectedCols } = this.state;
    let newSelectedCols = [...selectedCols];
    if (isMulti) {
      if (this._isSelectedCol(pos)) {
        newSelectedCols = _.filter(newSelectedCols, colPos => !this._isSameColPos(colPos, pos));
      } else {
        newSelectedCols.push(pos);
      }
    } else {
      newSelectedCols = [];
      if (!(selectedCols.length === 1 && this._isSelectedCol(pos))) {
        newSelectedCols.push(pos);
      }
    }
    this.setState({
      selectedCols: newSelectedCols,
    });
  }

  private _onDelete = (item: any) => {
    const { dispatch, config } = this.props;
    dispatch(createRemoveElementEffect(item[config.elementIdKey]));
    this._delayUpdateDisabledItems();
  }

  private _onEdit = (item: any) => {
    this.setState({
      editingItem: item,
      editingValue: {
        fieldText: item.fieldText || item.columnName,
      },
    });
  }

  private _clearSelectedCol = () => {
    if (this.state.editingItem) {
      this._onEditorClose(false);
    }
    if (!this.state.selectedCols.length) {
      return;
    }
    this.setState({
      selectedCols: [],
    });
  }

  private _isSelectedCol = (colPos: number[]) => {
    const { selectedCols } = this.state;
    return !!_.find(selectedCols, pos => this._isSameColPos(pos, colPos));
  }

  private _joinCols = () => {
    const { selectedCols } = this.state;
    const sortedCols = this._isSerialCols(selectedCols);
    if (!sortedCols) {
      message.warning('请选择2个以上连续的单元格进行合并');
      return;
    }
    const cols = this._getColsByPos(sortedCols);
    console.log('[_joinCols]', cols);
    this.props.dispatch(createJoinLayoutsEffect(cols));
    this._clearSelectedCol();
  }

  private _splitCol = () => {
    const { selectedCols, colCount } = this.state;
    if (selectedCols.length !== 1) {
      message.warning('请选择1个单元格进行拆分');
      return;
    }
    const unitPerCol = COLS / colCount;
    const col = this._getColsByPos(selectedCols)[0];
    if (col.unitCount === unitPerCol) {
      message.warning('该单元格无法拆分');
      return;
    }
    this.props.dispatch(createSplitLayoutEffect(col, unitPerCol));
    this._clearSelectedCol();
  }

  private _undo = () => {
    this.props.dispatch(createLayoutsHistoryUndoAction(true));
    this._clearSelectedCol();
    this._delayUpdateRowColInfo();
  }

  private _redo = () => {
    this.props.dispatch(createLayoutsHistoryRedoAction(true));
    this._clearSelectedCol();
    this._delayUpdateRowColInfo();
  }

  private _isSameColPos(a: number[], b: number[]) {
    return a[0] === b[0] && a[1] === b[1];
  }

  private _fill = () => {
    const selectedItems = this.listRef.current.getSelectedItems();
    const { selectedCols, layout } = this.state;
    if (!selectedItems.length || !selectedCols.length) {
      message.warn('请在左侧列表选择控件，并选中至少一个单元格。');
      return;
    }
    const elements = _.map(selectedItems, s => {
      return _.assign({}, s.source, {
        conditionType: layout.conditionType,
        dataSourceId: layout.dataSourceId,
      });
    });
    const colLayouts = _.map(selectedCols, this._getColLayout);
    this.props.dispatch(createAddElementToParentEffect(
      elements,
      colLayouts,
      null,
    ));
    this._clearSelectedCol();
    this._delayUpdateDisabledItems();
  }

  /**
   * 是否是连续的列
   * @param colPosList 列位置列表
   * @return 不是返回 false, 是则返回排序后的列表
   */
  private _isSerialCols(colPosList: number[][]) {
    if (colPosList.length < 2) {
      return false;
    }
    if (_.find(colPosList, pos => pos[0] !== colPosList[0][0])) {
      return false;
    }
    const sortedCols = _.sortBy(colPosList, 1);
    for (let i = 1; i < sortedCols.length; i++) {
      const pos = sortedCols[i];
      const prePos = sortedCols[i - 1];
      if (pos[1] - prePos[1] !== 1) {
        return false;
      }
    }
    return sortedCols;
  }

  /**
   * 根据位置信息获取列的 Layout 数据
   * @param colPosList 位置列表
   * @return {any[]} 列 Layout 数组
   */
  private _getColsByPos(colPosList: number[][]) {
    const { childrenLayoutsMap, config } = this.props;
    const { layout } = this.state;
    const rows = childrenLayoutsMap[layout[config.cellNameKey]] || [];
    const cols = _.map(rows, row => childrenLayoutsMap[row[config.cellNameKey]]);
    const matchCols = _.map(colPosList, pos => cols[pos[0]][pos[1]]);
    return matchCols;
  }

  /**
   * 获取所有行 Layout 数据
   */
  private _getRows() {
    const { childrenLayoutsMap, config } = this.props;
    const { layout } = this.state;
    const rows = childrenLayoutsMap[layout[config.cellNameKey]] || [];
    return rows;
  }

  /** 根据 col 坐标信息获取 */
  private _getColLayout = (col: number[]) => {
    const { childrenLayoutsMap, config } = this.props;
    const rows = this._getRows();
    const row = rows[col[0]];
    const cols = childrenLayoutsMap[row[config.cellNameKey]] || [];
    return cols[col[1]];
  }

  /**
   * 改变行数
   * @param n 新的行数
   */
  private _changeRowCount = (n: number) => {
    this.setState({
      rowCount: n,
    });
    const { config } = this.props;
    const { layout } = this.state;
    const rows = this._getRows();
    this._clearSelectedCol();
    // 当前行数大于设置的行数，删除多的行数据
    if (rows.length > n) {
      const willRemoveRows = _.map(rows.slice(n), row => row[config.cellNameKey]);
      this.props.dispatch(createRemoveLayoutsEffect(willRemoveRows));
    } else if (rows.length < n) {
      // 当前行数小于设置的行数，则新增行
      const willAddRows = _.fill(Array(n - rows.length), this._createRow());
      this.props.dispatch(createAddLayoutToParentEffect(
        willAddRows,
        layout[config.cellNameKey],
        rows.length,
      ));
    }
  }

  /**
   * 改变列数
   * @param n 新的列数
   */
  private _changeColCount = (n: number) => {
    const preColCount = this.state.colCount;
    const preUnitPerCol = COLS / preColCount;
    const unitPerCol = COLS / n;
    const rows = this._getRows();
    const { config, childrenLayoutsMap } = this.props;
    const willUpdateCols: any[] = [];
    const willRemoveCols: any[] = [];
    this._clearSelectedCol();
    this.setState({
      colCount: n,
    });
    if (n > preColCount) {
      _.forEach(rows, row => {
        const rowCellName = row[config.cellNameKey];
        const cols = childrenLayoutsMap[rowCellName] || [];
        const willAddCols: any[] = [];
        _.times(n - preColCount, () => {
          {
            willAddCols.push(createLayout({
              layoutContainerType: 'DIV',
              unitCount: unitPerCol,
              isParent: '',
            }));
          }
        });
        willUpdateCols.push(..._.map(cols, col => produce(col, draft => {
          const preUnitCount: number = draft.unitCount || COLS;
          const spans = preUnitCount / preUnitPerCol;
          const unitCount = unitPerCol * spans;
          draft.unitCount = unitCount;
        })));
        this.props.dispatch(createAddLayoutToParentEffect(
          willAddCols,
          rowCellName,
          cols.length,
          false,
        ));
      });
    } else if (n < preColCount) {
      _.forEach(rows, row => {
        const rowCellName = row[config.cellNameKey];
        const cols = childrenLayoutsMap[rowCellName] || [];
        let totalUnitCount = 0;
        willUpdateCols.push(..._.map(cols, col => produce(col, draft => {
          if (totalUnitCount >= COLS) {
            willRemoveCols.push(col);
            return nothing;
          }
          const preUnitCount: number = draft.unitCount || COLS;
          const spans = preUnitCount / preUnitPerCol;
          let unitCount = unitPerCol * spans;
          totalUnitCount += unitCount;
          if (totalUnitCount > COLS) {
            unitCount -= totalUnitCount - COLS;
          }
          draft.unitCount = unitCount;
          return undefined;
        })));
      });
    }
    if (willRemoveCols.length) {
      this.props.dispatch(createRemoveLayoutsEffect(
        _.map(willRemoveCols, col => col[config.cellNameKey]),
        false,
      ));
    }
    this.props.dispatch(createUpdateLayoutsAction(
      _.compact(willUpdateCols),
      true,
      true,
    ));
  }

  /**
   * 创建新行数据
   */
  private _createRow = (_colCount?: number) => {
    const { config } = this.props;
    const colCount = _colCount || this.state.colCount;
    const unitPerCol = COLS / colCount;
    const row = createLayout({
      layoutContainerType: 'DIV',
      styleClass: 'row',
      [config.tempChildrenLayoutsKey]: _.fill(Array(colCount), createLayout({
        layoutContainerType: 'DIV',
        unitCount: unitPerCol,
        isParent: '',
      })),
    });
    return row;
  }

  /**
   * 根据布局数据获取行数和列数
   */
  private _getRowColInfo = () => {
    const { config, childrenLayoutsMap } = this.props;
    const rows = this._getRows();
    const rowCount = rows.length;
    const cols = _.chain(rows)
      .map(row => (childrenLayoutsMap[row[config.cellNameKey]] || []))
      .flatten()
      .value();
    const spans = _.chain(cols)
      .map(col => ((col.unitCount as number) || COLS))
      .uniq()
      .reduce(getBigFactor, COLS)
      .value();
    const colCount = COLS / spans;
    return {
      /** 行数 */
      rowCount,
      /** 列数 */
      colCount,
      /** 每列栅格数 */
      spans,
      /** 所有列 Layout 数据 */
      cols,
    };
  }

  private _updateRowColInfo = () => {
    const acceptCols = this.state.acceptCols || ACCEPT_COLS;
    const info = this._getRowColInfo();
    let {
      rowCount,
      colCount,
    } = info;
    const { cols } = info;
    this._updateDisabledItems(cols);
    if (rowCount === 0) {
      // 行数为 0, 初始化 2 行 4 列布局数据
      rowCount = DEFAULT_ROW_COUNT;
      colCount = _.includes(acceptCols, DEFAULT_COL_COUNT) ? DEFAULT_COL_COUNT : acceptCols[0];
      this._createInitLayouts(rowCount, colCount);
    } else {
      const { childrenLayoutsMap, config, dispatch } = this.props;
      const rows = this._getRows();
      _.forEach(rows, row => {
        const willAddCols: any[] = [];
        const rowCellName = row[config.cellNameKey];
        const childrenCols = childrenLayoutsMap[rowCellName] || [];
        const colsSpans = COLS - _.sumBy(childrenCols, col => (col.unitCount || 12));
        if (colsSpans > 0) {
          const unitCount = COLS / colCount;
          const willAddColCount = colsSpans / unitCount;
          _.times(willAddColCount, i => {
            willAddCols.push(createLayout({
              layoutContainerType: 'DIV',
              unitCount,
              isParent: '',
            }));
          });
          dispatch(createAddLayoutToParentEffect(
            willAddCols,
            row[config.cellNameKey],
            childrenCols.length,
          ));
        }
      });
      dispatch(createResetLayoutsHistoryAction(true));
    }
    this.setState({
      rowCount,
      colCount,
    });
  }

  private _updateDisabledItems = (_cols?: any[]) => {
    const { config } = this.props;
    const { selectValue } = this.listRef.current.state;
    if (this._isPrototype()) {
      return;
    }
    const cols = _cols || this._getRowColInfo().cols;
    const elements = _.chain(cols)
      .map(col => (col[config.childrenElementsKey] || []))
      .flatten()
      .value();
    const { listSource } = this.state;
    const disabledItems = _.filter(listSource, listItem => {
      return !!_.find(elements, e => {
        return e.propertyName === listItem.propertyName
          && (selectValue === e.rangeType || _.isEmpty(selectValue) && _.isEmpty(e.rangeType));
      });
    });
    const disabledItemsSet = new Set(disabledItems);
    this.listRef.current.setDisabledItems(disabledItemsSet);
  }

  private _delayUpdateDisabledItems = async () => {
    await delay(0);
    this._updateDisabledItems();
  }

  private _delayUpdateRowColInfo = async () => {
    await delay(0);
    this._updateRowColInfo();
  }

  /**
   * 当前没有布局数据时，创建布局数据
   * @param rowCount 行数
   * @param colCount 列数
   */
  private _createInitLayouts = (rowCount: number, colCount: number) => {
    const row = this._createRow(colCount);
    const rows = Array(rowCount).fill(row);
    const { layout } = this.state;
    const { config, dispatch } = this.props;
    dispatch(createAddLayoutToParentEffect(
      rows,
      layout[config.cellNameKey],
      0,
    ));
    dispatch(createResetLayoutsHistoryAction(true));
  }

  private _isPrototype = () => {
    const { location } = this.props;
    return location.pathname === '/prototype';
  }

  private _afterClose = () => {
    this.setState({
      editingItem: null,
      editingValue: {},
    });
  }

}
