import { Action } from 'redux';
import * as _ from 'lodash';

const NAMESPACE = 'LAYOUTS';

export enum ActionTypes {
  SelectLayout = 'Select Layout',
  SelectElement = 'Select Element',
  DisSelect = 'Dis Select',

  ReplaceLayouts = 'Replace Layouts',
  UpdateLayouts = 'Update Layouts',
  // RemoveLayouts = 'Remove Layouts',
  AddLayouts = 'Add Layouts',
  UpdateChildrenLayoutsMap = 'Update Children Layouts Map',
  CacheLayouts = 'Cache Layouts',

  AddLayoutsHistory = 'Add Layouts History',
  InitLayoutsHistory = 'Init Layouts History',

  LayoutsHistoryUndo = 'Layouts History Undo',
  LayoutsHistoryRedo = 'Layouts History Redo',
  ResetLayoutsHistory = 'Reset Layouts History',

  UpdateActiveTabs = 'Update Active Tabs',

  SetRootElement = 'Set Root Element',

  /** 通用设置属性 */
  SetStateValue = 'Set State Value',

  /** 进入临时状态 */
  EnterTemp = 'Enter Temp',
  /** 退出临时状态 */
  QuitTemp = 'Quit Temp',

  LoadLayoutsEffect = 'Load Layouts Effect',
  SelectLayoutEffect = 'Select Layout Effect',
  RemoveLayoutsEffect = 'Remove Layouts Effect',
  RemoveElementEffect = 'Remove Element Effect',
  RemoveSelectedEffect = 'Remove Selected Effect',
  RemoveSelectedLayoutEffect = 'Remove Selected Layouts Effect',
  RemoveSelectedElementEffect = 'Remove Selected Element Effect',
  MoveLayoutToIndexEffect = 'Move Layout To Index Effect',
  MoveLayoutToOtherEffect = 'Move Layout To Other Effect',
  MoveUpSelectedLayoutEffect = 'Move Up Selected Layout Effect',
  MoveDownSelectedLayoutEffect = 'Move Down Selected Layout Effect',
  MoveSelectedLayoutEffect = 'Move Selected Layout Effect',
  MoveSelectedLayoutToIndexEffect = 'Move Selected Layout To Index Effect',
  MoveElementToIndexEffect = 'Move Element To Index Effect',
  MoveUpSelectedEffect = 'Move Up Selected Effect',
  MoveUpSelectedElementEffect = 'Move Up Selected Element Effect',
  MoveDownSelectedEffect = 'Move Down Selected Effect',
  MoveDownSelectedElementEffect = 'Move Down Selected Element Effect',
  MoveSelectedElementEffect = 'Move Selected Element Effect',
  MoveElementToOtherEffect = 'Move Element To Other Effect',
  AddLayoutToParentEffect = 'Add Layout To Parent Effect',
  AddLayoutToParentElementEffect = 'Add Layout To Parent Element Effect',
  /** 如 element 没有子 layout, 则添加子 layout */
  AddLayoutToParentElementIfEmptyEffect = 'Add Layout To Parent Element If Empty Effect',
  AddElementToParentEffect = 'Add Element To Parent Effect',
  UpdateLayoutFieldsEffect = 'Update Layout Fields Effect',
  UpdateSelectedLayoutFieldsEffect = 'Update Selected Layout Fields Effect',
  DoUpdateSelectedLayoutFieldsEffect = 'Do Update Selected Layout Fields Effect',
  UpdateElementFieldsEffect = 'Update Element Fields Effect',
  DoUpdateSelectedElementFieldsEffect = 'Do Update Selected Element Fields Effect',
  JoinLayoutsEffect = 'Join Layouts Effect',
  SplitLayoutEffect = 'Split Layout Effect',
  ClearLayoutEffect = 'Clear Layout Effect',
  AutoBindingEffect = 'Auto Binding Effect',
  UpdateGridColumnsDataEffect = 'Update Grid Columns Data Effect',

  UpdateSelectedItemEventEffect = 'Update Selected Item Event Effect',
  UpdateEventEffect = 'Update Event Effect',
  UpdateLayoutEventEffect = 'Update Layout Event Effect',
  UpdateElementEventEffect = 'Update Element Event Effect',
  ImportLayoutsEffect = 'Import Layouts Effect',

  LoadReferencePageLayoutsEffect = 'Load Reference Page Layouts Effect',
  UpdateInnerDatasourceEffect = 'Update Inner Datasource Effect',

  UpdateChildrenLayoutsMapWatcher = 'Update Children Layouts Map Watcher',
  AddLayoutsHistoryWatcher = 'Add Layouts History Watcher',
  HistoryUndoRedoWatcher = 'History Undo Redo Watcher',
  UpdateSelectedLayoutFieldsWatcher = 'Update Selected Layout Fields Watcher',

  QuitTempEffect = 'Quit Temp Effect',

  GetBoListEffect = 'Get Bo List Effect',
}

function addNamespace(type: string, b: boolean) {
  if (!b) {
    return type;
  }
  return `${NAMESPACE}/${type}`;
}

export interface IReadonlyAction {
  readonly type: string;
}

export interface IAddHistory {
  readonly addHistory: boolean | 'INIT';
}

export interface IReplaceLayouts<L> extends Action, IAddHistory {
  readonly layouts: L[];
}
export function createReplaceLayoutsAction<L>(layouts: L[], addHistory: boolean | 'INIT' = true, withNamespace = false): IReplaceLayouts<L> {
  const type = addNamespace(ActionTypes.ReplaceLayouts, withNamespace);
  return {
    type,
    layouts,
    addHistory,
  };
}

export interface ICacheLayouts<L> extends Action {
  readonly key: string;
}
export function createCacheLayoutsAction<L>(key: string, withNamespace = false): ICacheLayouts<L> {
  const type = addNamespace(ActionTypes.CacheLayouts, withNamespace);
  return {
    type,
    key,
  };
}

export interface IUpdateLayouts<L> extends Action, IAddHistory {
  readonly layouts: L[];
}
export function createUpdateLayoutsAction<L>(layouts: L[], addHistory = true, withNamespace = false): IUpdateLayouts<L> {
  const type = addNamespace(ActionTypes.UpdateLayouts, withNamespace);
  return {
    type,
    layouts,
    addHistory,
  };
}

export interface IAddLayouts<L> extends Action, IAddHistory {
  readonly layouts: L[];
}
export function createAddLayoutsAction<L>(layouts: L[], addHistory = true, withNamespace = false): IAddLayouts<L> {
  const type = addNamespace(ActionTypes.AddLayouts, withNamespace);
  return {
    type,
    layouts,
    addHistory,
  };
}

export interface IUpdateChildrenLayoutsMap extends Action {
}
export function createUpdateChildrenLayoutsMapAction(withNamespace = false): IUpdateChildrenLayoutsMap {
  const type = addNamespace(ActionTypes.UpdateChildrenLayoutsMap, withNamespace);
  return { type };
}

export interface IAddLayoutsHistory extends Action {
}
export function createAddLayoutsHistoryAction(withNamespace = false): IAddLayoutsHistory {
  const type = addNamespace(ActionTypes.AddLayoutsHistory, withNamespace);
  return { type };
}

export interface IInitLayoutsHistory extends Action {
}
export function createInitLayoutsHistoryAction(withNamespace = false): IInitLayoutsHistory {
  const type = addNamespace(ActionTypes.InitLayoutsHistory, withNamespace);
  return { type };
}

export interface ILayoutsHistoryUndo extends Action {
}
export function createLayoutsHistoryUndoAction(withNamespace = false): ILayoutsHistoryUndo {
  const type = addNamespace(ActionTypes.LayoutsHistoryUndo, withNamespace);
  return { type };
}

export interface ILayoutsHistoryRedo extends Action {
}
export function createLayoutsHistoryRedoAction(withNamespace = false): ILayoutsHistoryRedo {
  const type = addNamespace(ActionTypes.LayoutsHistoryRedo, withNamespace);
  return { type };
}

export interface IResetLayoutsHistory extends Action {
}
export function createResetLayoutsHistoryAction(withNamespace = false): IResetLayoutsHistory {
  const type = addNamespace(ActionTypes.ResetLayoutsHistory, withNamespace);
  return { type };
}

export interface IUpdateActiveTabs extends Action {
  tabs: string;
  tab: string;
}
export function createUpdateActiveTabsAction(tabs: string, tab: string, withNamespace = false): IUpdateActiveTabs {
  const type = addNamespace(ActionTypes.UpdateActiveTabs, withNamespace);
  return {
    type,
    tabs,
    tab,
  };
}

export interface ISetRootElement extends Action {
  rootElement: any;
  rootTitle: string;
}
export function createSetRootElementAction(rootElement?: any, rootTitle?: string, withNamespace = false): ISetRootElement {
  const type = addNamespace(ActionTypes.SetRootElement, withNamespace);
  return {
    type,
    rootTitle,
    rootElement,
  };
}

export interface ISetStateValue extends Action {
  values: object;
}
export function createSetStateValueAction(values: object, withNamespace = false): ISetStateValue {
  const type = addNamespace(ActionTypes.SetStateValue, withNamespace);
  return {
    type,
    values,
  };
}

export interface IEnterTemp extends Action {
}
export function createEnterTempAction(withNamespace = false): IEnterTemp {
  const type = addNamespace(ActionTypes.EnterTemp, withNamespace);
  return {
    type,
  };
}

export interface IQuitTemp extends Action {
}
export function createQuitTempAction(withNamespace = false): IQuitTemp {
  const type = addNamespace(ActionTypes.QuitTemp, withNamespace);
  return {
    type,
  };
}

export interface IAddLayoutsHistoryWatcher extends Action {
}
export function createAddLayoutsHistoryWatcherAction(withNamespace = false): IAddLayoutsHistoryWatcher {
  const type = addNamespace(ActionTypes.AddLayoutsHistoryWatcher, withNamespace);
  return { type };
}

export interface IHistoryUndoRedoWatcher extends Action {
}
export function createHistoryUndoRedoWatcherAction(withNamespace = false): IHistoryUndoRedoWatcher {
  const type = addNamespace(ActionTypes.HistoryUndoRedoWatcher, withNamespace);
  return { type };
}

export interface IUpdateChildrenLayoutsMapWatcher extends Action {
}
export function createUpdateChildrenLayoutsMapWatcherAction(withNamespace = false): IUpdateChildrenLayoutsMapWatcher {
  const type = addNamespace(ActionTypes.UpdateChildrenLayoutsMapWatcher, withNamespace);
  return { type };
}

export interface ISelectLayout extends Action {
  readonly cellName: string;
  readonly options: any;
}
export function createSelectLayoutAction(cellName: string, options?: any, withNamespace = false): ISelectLayout {
  const type = addNamespace(ActionTypes.SelectLayout, withNamespace);
  return {
    type,
    cellName,
    options,
  };
}

export interface IDisSelect extends Action {
}
export function createDisSelectAction(withNamespace = false): IDisSelect {
  const type = addNamespace(ActionTypes.DisSelect, withNamespace);
  return {
    type,
  };
}

export interface ISelectElement extends Action {
  readonly id: string;
  readonly options: any;
}
export function createSelectElementAction(id: string, options?: any, withNamespace = false): ISelectElement {
  const type = addNamespace(ActionTypes.SelectElement, withNamespace);
  return {
    type,
    id,
    options,
  };
}

export interface ISelectLayoutEffect extends Action {
  cellName: string;
  options?: any;
}

export function createSelectLayoutEffect(cellName: string, options?: any, withNamespace = true): ISelectLayoutEffect {
  const type = addNamespace(ActionTypes.SelectLayoutEffect, withNamespace);
  return { type, cellName, options };
}

export interface IRemoveLayoutsEffect extends Action {
  layouts: string | string[];
  _addHistory: boolean;
}

export function createRemoveLayoutsEffect(layouts: string | string[], addHistory = true, withNamespace = true): IRemoveLayoutsEffect {
  const type = addNamespace(ActionTypes.RemoveLayoutsEffect, withNamespace);
  return { type, layouts, _addHistory: addHistory };
}

export interface IRemoveElementEffect extends Action {
  element: string | string[];
  _addHistory: boolean;
}

export function createRemoveElementEffect(element: string, addHistory = true, withNamespace = true): IRemoveElementEffect {
  const type = addNamespace(ActionTypes.RemoveElementEffect, withNamespace);
  return { type, element, _addHistory: addHistory };
}

export interface IRemoveSelectedLayoutEffect extends Action {
}

export function createRemoveSelectedLayoutEffect(withNamespace = true): IRemoveSelectedLayoutEffect {
  const type = addNamespace(ActionTypes.RemoveSelectedLayoutEffect, withNamespace);
  return { type };
}

export interface IRemoveSelectedElementEffect extends Action {
}

export function createRemoveSelectedElementEffect(withNamespace = true): IRemoveSelectedElementEffect {
  const type = addNamespace(ActionTypes.RemoveSelectedElementEffect, withNamespace);
  return { type };
}

export interface IRemoveSelectedEffect extends Action {
}

export function createRemoveSelectedEffect(withNamespace = true): IRemoveSelectedEffect {
  const type = addNamespace(ActionTypes.RemoveSelectedEffect, withNamespace);
  return { type };
}

export interface IMoveLayoutToIndexEffect extends Action {
  layout: string;
  index: number;
}

export function createMoveLayoutToIndexEffect(layout: string, index: number, withNamespace = true): IMoveLayoutToIndexEffect {
  const type = addNamespace(ActionTypes.MoveLayoutToIndexEffect, withNamespace);
  return { type, layout, index };
}

export interface IMoveLayoutToOtherEffect extends Action {
  source: string;
  target: string;
  index: number;
}

export function createMoveLayoutToOtherEffect(source: string, target: string, index: number, withNamespace = true): IMoveLayoutToOtherEffect {
  const type = addNamespace(ActionTypes.MoveLayoutToOtherEffect, withNamespace);
  return { type, source, target, index };
}

export interface IMoveUpSelectedLayoutEffect extends Action {
  layoutCellName?: string;
}

export function createMoveUpSelectedLayoutEffect(layoutCellName?: string, withNamespace = true): IMoveUpSelectedLayoutEffect {
  const type = addNamespace(ActionTypes.MoveUpSelectedLayoutEffect, withNamespace);
  return { type, layoutCellName };
}

export interface IMoveDownSelectedLayoutEffect extends Action {
  layoutCellName?: string;
}

export function createMoveDownSelectedLayoutEffect(layoutCellName?: string, withNamespace = true): IMoveDownSelectedLayoutEffect {
  const type = addNamespace(ActionTypes.MoveDownSelectedLayoutEffect, withNamespace);
  return { type, layoutCellName };
}

export interface IMoveSelectedLayoutEffect extends Action {
  position: number;
  layoutCellName: string;
}

export function createMoveSelectedLayoutEffect(position: number, layoutCellName?: string, withNamespace = true): IMoveSelectedLayoutEffect {
  const type = addNamespace(ActionTypes.MoveSelectedLayoutEffect, withNamespace);
  return { type, position, layoutCellName };
}

export interface IMoveSelectedLayoutToIndexEffect extends Action {
  index: number;
}

export function createMoveSelectedLayoutToIndexEffect(index: number, withNamespace = true): IMoveSelectedLayoutToIndexEffect {
  const type = addNamespace(ActionTypes.MoveSelectedLayoutToIndexEffect, withNamespace);
  return { type, index };
}

export interface IMoveElementToIndexEffect extends Action {
  index: number;
  elementId: string;
}

export function createMoveElementToIndexEffect(elementId: string, index: number, withNamespace = true): IMoveElementToIndexEffect {
  const type = addNamespace(ActionTypes.MoveElementToIndexEffect, withNamespace);
  return { type, elementId, index };
}

export interface IMoveUpSelectedEffect extends Action {
}

export function createMoveUpSelectedEffect(withNamespace = true): IMoveUpSelectedEffect {
  const type = addNamespace(ActionTypes.MoveUpSelectedEffect, withNamespace);
  return { type };
}

export interface IMoveUpSelectedElementEffect extends Action {
  elementId?: string;
}

export function createMoveUpSelectedElementEffect(elementId: string, withNamespace = true): IMoveUpSelectedElementEffect {
  const type = addNamespace(ActionTypes.MoveUpSelectedElementEffect, withNamespace);
  return { type, elementId };
}

export interface IMoveDownSelectedEffect extends Action {
}

export function createMoveDownSelectedEffect(withNamespace = true): IMoveDownSelectedEffect {
  const type = addNamespace(ActionTypes.MoveDownSelectedEffect, withNamespace);
  return { type };
}

export interface IMoveDownSelectedElementEffect extends Action {
  elementId?: string;
}

export function createMoveDownSelectedElementEffect(elementId: string, withNamespace = true): IMoveDownSelectedElementEffect {
  const type = addNamespace(ActionTypes.MoveDownSelectedElementEffect, withNamespace);
  return { type, elementId };
}

export interface IMoveSelectedElementEffect extends Action {
  elementId?: string;
  position: number;
}

export function createMoveSelectedElementEffect(position: number, elementId?: string, withNamespace = true): IMoveSelectedElementEffect {
  const type = addNamespace(ActionTypes.MoveSelectedElementEffect, withNamespace);
  return { type, position, elementId };
}

export interface IMoveElementToOtherEffect extends Action {
  element: any;
  layout: any;
  index: number;
}

export function createMoveElementToOtherEffect(element: any, layout: any, index: number, withNamespace = true): IMoveElementToOtherEffect {
  const type = addNamespace(ActionTypes.MoveElementToOtherEffect, withNamespace);
  return { type, element, layout, index };
}

export interface IAddLayoutToParentEffect extends Action {
  layout: any | any[];
  parentCellName: string;
  index: number;
  _addHistory: boolean;
}

export function createAddLayoutToParentEffect(layout: any | any[], parentCellName: string, index: number, _addHistory = true, withNamespace = true): IAddLayoutToParentEffect {
  const type = addNamespace(ActionTypes.AddLayoutToParentEffect, withNamespace);
  return { type, layout, parentCellName, index, _addHistory };
}

export interface IAddLayoutToParentElementEffect extends Action {
  layout: any;
  parentElement: any;
  index: number;
}

export function createAddLayoutToParentElementEffect(layout: any, parentElement: any, index: number, withNamespace = true): IAddLayoutToParentElementEffect {
  const type = addNamespace(ActionTypes.AddLayoutToParentElementEffect, withNamespace);
  return { type, layout, parentElement, index };
}

export interface IAddLayoutToParentElementIfEmptyEffect extends Action {
  layout: any;
  parentElement: any;
}

export function createAddLayoutToParentElementIfEmptyEffect(layout: any, parentElement: any, withNamespace = true): IAddLayoutToParentElementIfEmptyEffect {
  const type = addNamespace(ActionTypes.AddLayoutToParentElementIfEmptyEffect, withNamespace);
  return { type, layout, parentElement };
}

export interface IAddElementToParentEffect extends Action {
  element: any;
  parentLayout: any;
  index: number;
}

export function createAddElementToParentEffect(element: any, parentLayout: any, index: number, withNamespace = true): IAddElementToParentEffect {
  const type = addNamespace(ActionTypes.AddElementToParentEffect, withNamespace);
  return { type, element, parentLayout, index };
}

export interface IUpdateLayoutFieldsEffect extends Action {
  cellName: string;
  changes: any;
}

export function createUpdateLayoutFieldsEffect(cellName: string, changes: any, withNamespace = true): IUpdateLayoutFieldsEffect {
  const type = addNamespace(ActionTypes.UpdateLayoutFieldsEffect, withNamespace);
  return { type, cellName, changes };
}

export interface IUpdateElementFieldsEffect extends Action {
  elementId: string;
  changes: any;
}

export function createUpdateElementFieldsEffect(elementId: string, changes: any, withNamespace = true): IUpdateElementFieldsEffect {
  const type = addNamespace(ActionTypes.UpdateElementFieldsEffect, withNamespace);
  return { type, elementId, changes };
}

export interface IUpdateSelectedLayoutFieldsEffect extends Action {
  changes: any;
}

export function createUpdateSelectedLayoutFieldsEffect(changes: any, withNamespace = true): IUpdateSelectedLayoutFieldsEffect {
  const type = addNamespace(ActionTypes.UpdateSelectedLayoutFieldsEffect, withNamespace);
  return { type, changes };
}

export interface IDoUpdateSelectedLayoutFieldsEffect extends Action {
  changes: any;
}

export function createDoUpdateSelectedLayoutFieldsEffect(changes: any, withNamespace = true): IDoUpdateSelectedLayoutFieldsEffect {
  const type = addNamespace(ActionTypes.DoUpdateSelectedLayoutFieldsEffect, withNamespace);
  return { type, changes };
}

export interface IDoUpdateSelectedElementFieldsEffect extends Action {
  changes: any;
}

export function createDoUpdateSelectedElementFieldsEffect(changes: any, withNamespace = true): IDoUpdateSelectedElementFieldsEffect {
  const type = addNamespace(ActionTypes.DoUpdateSelectedElementFieldsEffect, withNamespace);
  return { type, changes };
}

export interface IJoinLayoutsEffect extends Action {
  layouts: any[];
}

export function createJoinLayoutsEffect(layouts: any[], withNamespace = true): IJoinLayoutsEffect {
  const type = addNamespace(ActionTypes.JoinLayoutsEffect, withNamespace);
  return { type, layouts };
}

export interface ISplitLayoutEffect extends Action {
  layout: any;
  unit: number;
}

export function createSplitLayoutEffect(layout: any, unit: number, withNamespace = true): ISplitLayoutEffect {
  const type = addNamespace(ActionTypes.SplitLayoutEffect, withNamespace);
  return { type, layout, unit };
}

export interface IClearLayoutEffect extends Action {
  layout: any;
  _addHistory: boolean;
}

export function createClearLayoutEffect(layout: any, _addHistory = true, withNamespace = true): IClearLayoutEffect {
  const type = addNamespace(ActionTypes.ClearLayoutEffect, withNamespace);
  return { type, layout, _addHistory };
}

export interface IAutoBindingEffect extends Action {
  _addHistory: boolean;
}

export function createAutoBindingEffect(_addHistory = true, withNamespace = true): IAutoBindingEffect {
  const type = addNamespace(ActionTypes.AutoBindingEffect, withNamespace);
  return {
    type,
    _addHistory,
  };
}

export interface IUpdateGridColumnsDataEffect extends Action {
  columnsData: string[][];
  _addHistory: boolean;
}

export function createUpdateGridColumnsDataEffect(columnsData: string[][], _addHistory = true, withNamespace = true): IUpdateGridColumnsDataEffect {
  const type = addNamespace(ActionTypes.UpdateGridColumnsDataEffect, withNamespace);
  return {
    type,
    columnsData,
    _addHistory,
  };
}

export interface IUpdateEventEffect extends Action {
  /** 更改的字段 */
  changes: any;
  /** 事件类型 */
  eventType: string;
  /** 事件所属类型： layout | element */
  eventItemType: string;
  /** 事件所属的 layout(cellname) 或 element(elementId) */
  eventItem: string;
}

export function createUpdateEventEffect(changes: any, eventType: string, eventItemType: string, eventItem: string, withNamespace = true): IUpdateEventEffect {
  const type = addNamespace(ActionTypes.UpdateEventEffect, withNamespace);
  return { type, changes, eventItemType, eventType, eventItem };
}

export interface IUpdateSelectedItemEventEffect extends Action {
  /** 更改的字段 */
  changes: any;
  /** 事件类型 */
  eventType: string;
}

export function createUpdateSelectedItemEventEffect(changes: any, eventType: string, withNamespace = true): IUpdateSelectedItemEventEffect {
  const type = addNamespace(ActionTypes.UpdateSelectedItemEventEffect, withNamespace);
  return { type, changes, eventType };
}

export interface IUpdateLayoutEventEffect extends Action {
  /** 更改的字段 */
  changes: any;
  /** 事件类型 */
  eventType: string;
  /** Layout 的 cellName */
  layoutCellName: string;
}

export function createUpdateLayoutEventEffect(changes: any, eventType: string, layoutCellName: string, withNamespace = true): IUpdateLayoutEventEffect {
  const type = addNamespace(ActionTypes.UpdateLayoutEventEffect, withNamespace);
  return { type, changes, eventType, layoutCellName };
}

export interface IUpdateElementEventEffect extends Action {
  /** 更改的字段 */
  changes: any;
  /** 事件类型 */
  eventType: string;
  /** element id */
  elementId: string;
}

export function createUpdateElementEventEffect(changes: any, eventType: string, elementId: string, withNamespace = true): IUpdateElementEventEffect {
  const type = addNamespace(ActionTypes.UpdateElementEventEffect, withNamespace);
  return { type, changes, eventType, elementId };
}

export interface ILoadReferencePageLayoutsEffect extends Action {
  referencePageId: string;
  referenceLayoutCellName: string;
}

export function createLoadReferencePageLayoutsEffect(referencePageId: string, referenceLayoutCellName: string, withNamespace = true): ILoadReferencePageLayoutsEffect {
  const type = addNamespace(ActionTypes.LoadReferencePageLayoutsEffect, withNamespace);
  return { type, referencePageId, referenceLayoutCellName };
}

export interface IUpdateInnerDatasourceEffect extends Action {
  cellName: string;
  datasourceId: string;
}

export function createUpdateInnerDatasourceEffect(cellName: string, datasource: string, withNamespace = true): IUpdateInnerDatasourceEffect {
  const type = addNamespace(ActionTypes.UpdateInnerDatasourceEffect, withNamespace);
  return { type, cellName, datasourceId: datasource };
}

export interface IImportLayoutsEffect extends Action {
  layouts: any[];
}

export function createImportLayoutsEffect(layouts: any[], withNamespace = true): IImportLayoutsEffect {
  const type = addNamespace(ActionTypes.ImportLayoutsEffect, withNamespace);
  return { type, layouts };
}

export interface IQuitTempEffect extends Action {
  apply: boolean;
}

export function createQuitTempEffect(apply: boolean, withNamespace = true): IQuitTempEffect {
  const type = addNamespace(ActionTypes.QuitTempEffect, withNamespace);
  return { type, apply };
}

export interface IUpdateSelectedLayoutFieldsWatcher extends Action {
}
export function createUpdateSelectedLayoutFieldsWatcherAction(withNamespace = false): IUpdateSelectedLayoutFieldsWatcher {
  const type = addNamespace(ActionTypes.UpdateSelectedLayoutFieldsWatcher, withNamespace);
  return { type };
}

export interface IGetBoListEffect extends Action {
  callback: (data: any) => void;
}

export function createGetBoListEffect(callback: (data: any) => void, withNamespace = true): IGetBoListEffect {
  const type = addNamespace(ActionTypes.GetBoListEffect, withNamespace);
  return { type, callback };
}
