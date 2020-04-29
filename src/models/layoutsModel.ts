import { Model } from 'dva';
import produce, { original, isDraft } from 'immer';
import * as _ from 'lodash';
import { message } from 'antd';

import {
  ActionTypes,
  // IIncrementLayoutClickTimes,
  // IIncrementElementClickTimes,
  IReplaceLayouts,
  createReplaceLayoutsAction,
  ISelectLayout,
  ISelectElement,
  ISelectLayoutEffect,
  createSelectLayoutAction,
  IRemoveLayoutsEffect,
  createRemoveLayoutsEffect,
  IMoveLayoutToIndexEffect,
  IUpdateLayouts,
  createUpdateLayoutsAction,
  createMoveLayoutToIndexEffect,
  IMoveSelectedLayoutEffect,
  createMoveSelectedLayoutEffect,
  createUpdateChildrenLayoutsMapAction,
  createUpdateChildrenLayoutsMapWatcherAction,
  createAddLayoutsHistoryWatcherAction,
  IAddHistory,
  createAddLayoutsHistoryAction,
  createHistoryUndoRedoWatcherAction,
  IMoveLayoutToOtherEffect,
  createAddLayoutsAction,
  IAddLayouts,
  IRemoveElementEffect,
  createRemoveElementEffect,
  createRemoveSelectedElementEffect,
  createRemoveSelectedLayoutEffect,
  IMoveElementToIndexEffect,
  createMoveSelectedElementEffect,
  IMoveSelectedElementEffect,
  createMoveElementToIndexEffect,
  createMoveDownSelectedLayoutEffect,
  createMoveDownSelectedElementEffect,
  createMoveUpSelectedElementEffect,
  createMoveUpSelectedLayoutEffect,
  IMoveElementToOtherEffect,
  IAddLayoutToParentEffect,
  IAddElementToParentEffect,
  IUpdateLayoutFieldsEffect,
  IUpdateSelectedLayoutFieldsEffect,
  createUpdateLayoutFieldsEffect,
  createUpdateElementFieldsEffect,
  IUpdateElementFieldsEffect,
  IUpdateSelectedItemEventEffect,
  createUpdateEventEffect,
  IUpdateEventEffect,
  createUpdateLayoutEventEffect,
  createUpdateElementEventEffect,
  IUpdateLayoutEventEffect,
  IUpdateElementEventEffect,
  IUpdateActiveTabs,
  ISetRootElement,
  IAddLayoutToParentElementEffect,
  IAddLayoutToParentElementIfEmptyEffect,
  createAddLayoutToParentElementEffect,
  ISetStateValue,
  IQuitTempEffect,
  createQuitTempAction,
  IJoinLayoutsEffect,
  ISplitLayoutEffect,
  createAddLayoutToParentEffect,
  IClearLayoutEffect,
  IAutoBindingEffect,
  createInitLayoutsHistoryAction,
  ICacheLayouts,
  IGetBoListEffect,
  IUpdateGridColumnsDataEffect,
  IMoveUpSelectedElementEffect,
  IMoveDownSelectedElementEffect,
  IMoveUpSelectedLayoutEffect,
  IMoveDownSelectedLayoutEffect,
  ILoadReferencePageLayoutsEffect,
  createClearLayoutEffect,
  IImportLayoutsEffect,
  IUpdateInnerDatasourceEffect,
} from './layoutsActions';
import {
  delay,
  updateChildrenLayoutsMap,
  findChildren,
  isEqual,
  changeCellName,
  findElementLayout,
  createId,
  findLayoutByCellName,
  getLayoutChildrenByParentElement,
  findMethodByFieldText,
  findPropertyByFieldText,
  showListMessage,
  needBinding,
  createFormElementNameFromCellName,
  initGridColumnData,
  getClosestElementType,
  getControlDefaultSetting,
  getClosestLayout,
} from 'src/utils';
import { Action } from 'redux';
import { MAX_UNDO_COUNT, ROW_STATUS } from 'src/config';
import { cellNameManager } from 'src/utils/cellName';
import { createLayout } from 'src/routes/Visualization/config';
import { IPagesState } from './pagesModel';
import { formatLayouts } from 'src/routes/DatasourceBinding/formatSaveData';
import { queryPage } from 'src/routes/Prototype/service';
import { formatInputData } from 'src/routes/Prototype/formatInputData';
import { createSetIsLoadingAction } from './appActions';
import { IAppState } from './appModel';

export interface IElement {
  readonly cellName?: string;
  readonly id?: string;
  readonly clickTimes?: number;
}

export interface ILayout {
  readonly cellName?: string;
  readonly layoutContainerType?: string;
  readonly parentCellName?: string;
  readonly seqNo?: number;
  readonly childrenElements?: IElement[];
  readonly clickTimes?: number;
  readonly styleClass?: string;
}

export interface IPropertiesMap {
  [boname: string]: any[];
}

export interface IMehtodsMap {
  [boname: string]: any[];
}

export interface ILayoutsHistory<L = any> {
  readonly currentIndex: number;
  readonly layoutHistory: L[][];
}

export interface IChildrenLayoutsMap<L = any> {
  [parentCellName: string]: L[];
}

export interface ILayoutsState<L = any> {
  readonly layouts: L[];
  readonly selectedLayout: string;
  readonly selectedElement: string;
  readonly selectionOptions: any;
  readonly childrenLayoutsMap: IChildrenLayoutsMap<L>;
  readonly history: ILayoutsHistory<L>;
  readonly initLayouts: L[];
  readonly activeTabs: {
    [key: string]: string;
  };

  readonly rootElement: any;
  readonly rootTitle: string;

  readonly properties: IPropertiesMap;
  readonly methods: IMehtodsMap;
  readonly defaultSetting: any;

  readonly config: ICreateLayouttsModelOptions;
  readonly cacheLayouts: { [key: string]: L[] };
  readonly isOnlyShowSelectedLayoutOutline: boolean;

  /** 是否临时状态 */
  readonly isTemp: boolean;
  /** 临时历史记录 */
  readonly tempHistory: ILayoutsHistory<L>;

  readonly referencePageLayouts: {
    [key: string]:  any | 'LOADING',
  };

  readonly [key: string]: any;
}

export interface ILayoutsModel<L> extends Model {
  state: ILayoutsState<L>;
  reducers: {
    [key: string]: (state: ILayoutsState<L>, action: Action) => ILayoutsState<L>;
  };
}

export interface ICreateLayouttsModelOptions {
  namespace: string;
  cellNameKey: string;
  parentCellNameKey: string;
  layoutIdKey: string;
  childrenElementsKey: string;
  layoutElementIdKey?: string;
  elementIdKey: string;
  elementParentLayoutKey: string;
  orderKey: string;
  elementOrderKey: string;
  elementStartIndex: number;
  layoutEventsKey: string;
  layoutEventsCopyKey: string;
  elementEventsKey: string;
  elementEventsCopyKey: string;
  tempChildrenLayoutsKey: string;

  getLayoutComponentKey: (layout: any) => string;
  getElementComponentKey: (element: any, layout?: any) => string;

  fieldDomain?: string;

  [key: string]: any;
}

export function createLayoutsModel<L = any, E = any>({
  namespace,
  cellNameKey,
  parentCellNameKey,
  layoutIdKey,
  childrenElementsKey,
  elementIdKey,
  layoutElementIdKey,
  elementParentLayoutKey,
  orderKey,
  elementStartIndex,
  elementOrderKey,
  layoutEventsKey,
  layoutEventsCopyKey,
  elementEventsKey,
  elementEventsCopyKey,
  getLayoutComponentKey,
  getElementComponentKey,
  tempChildrenLayoutsKey,
  elementParentLayoutIdKey,
}: ICreateLayouttsModelOptions): ILayoutsModel<L> {
  const initLayouts: L[] = [];
  const initLayoutsHistoryState: ILayoutsHistory<L> = {
    currentIndex: -1,
    layoutHistory: [],
  };

  const initChildrenLayoutsMap = {};

  const initLayoutState: ILayoutsState<L> = {
    layouts: initLayouts,
    initLayouts,
    selectedLayout: null,
    selectedElement: null,
    selectionOptions: null,
    childrenLayoutsMap: initChildrenLayoutsMap,
    history: initLayoutsHistoryState,

    rootElement: null,
    rootTitle: null,

    activeTabs: {},

    properties: {},
    methods: {},
    defaultSetting: {},

    config: {
      namespace,
      cellNameKey,
      parentCellNameKey,
      layoutIdKey,
      childrenElementsKey,
      elementIdKey,
      layoutElementIdKey,
      elementParentLayoutKey,
      orderKey,
      elementStartIndex,
      elementOrderKey,
      layoutEventsKey,
      layoutEventsCopyKey,
      elementEventsKey,
      elementEventsCopyKey,
      getLayoutComponentKey,
      getElementComponentKey,
      tempChildrenLayoutsKey,
    },

    isTemp: false,
    tempHistory: initLayoutsHistoryState,
    cacheLayouts: {},
    isOnlyShowSelectedLayoutOutline: false,

    referencePageLayouts: {},
  };

  const layoutsModel: ILayoutsModel<L> = {
    namespace,
    state: initLayoutState,

    reducers: {

      [ActionTypes.ReplaceLayouts](state, { layouts, addHistory }: IReplaceLayouts<L>) {
        return produce(state, draft => {
          let _layouts = layouts;
          if (addHistory === 'INIT') {
            _layouts = initGridColumnData(layouts, childrenElementsKey);
            console.log('...... INIT');
          }
          draft.layouts = _layouts as any;
        });
      },

      [ActionTypes.CacheLayouts](state, { key }: ICacheLayouts<L>) {
        return produce(state, draft => {
          draft.cacheLayouts[key] = state.layouts as any;
        });
      },

      [ActionTypes.UpdateLayouts](state, { layouts }: IUpdateLayouts<L>) {
        return produce(state, draft => {
          _.forEach(layouts, l => {
            const index = _.findIndex(draft.layouts, l2 => l[cellNameKey] === l2[cellNameKey]);
            if (index < 0) {
              console.warn('[UpdateLayouts] 找不到要更新的 Layout:', l[cellNameKey]);
              return;
            }
            draft.layouts[index] = l as any;
          });
        });
      },

      [ActionTypes.AddLayouts](state, { layouts }: IAddLayouts<L>) {
        return produce(state, draft => {
          draft.layouts = (draft as any).layouts.concat(layouts as any) as any;
        });
      },

      [ActionTypes.UpdateChildrenLayoutsMap](state) {
        const rootElement = state.rootElement;
        return produce(state, draft => {
          draft.childrenLayoutsMap = updateChildrenLayoutsMap(
            draft.layouts as any[],
            rootElement,
            elementIdKey,
            layoutElementIdKey,
            parentCellNameKey,
            orderKey,
          ) as any;
        });
      },

      [ActionTypes.AddLayoutsHistory](state) {
        const { isTemp } = state;
        const historyKey = isTemp ? 'tempHistory' : 'history';
        const { currentIndex, layoutHistory } = state[historyKey];
        const currentLayouts = state.layouts;
        if (isEqual(layoutHistory[currentIndex], currentLayouts)) {
          console.log('[AddLayoutsHistory] 没有变化，不增加历史记录。');
          return state;
        }
        return produce(state, draft => {
          const layouts = draft.layouts;
          const lastIndex = ++draft[historyKey].currentIndex;
          draft[historyKey].layoutHistory.length = lastIndex + 1;
          draft[historyKey].layoutHistory[lastIndex] = layouts;
          if (draft[historyKey].layoutHistory.length > MAX_UNDO_COUNT) {
            const deleteCount = draft[historyKey].layoutHistory.length - MAX_UNDO_COUNT;
            draft[historyKey].layoutHistory.splice(0, deleteCount);
            draft[historyKey].currentIndex -= deleteCount;
          }
        });
      },

      [ActionTypes.InitLayoutsHistory](state) {
        const { isTemp } = state;
        const historyKey = isTemp ? 'tempHistory' : 'history';
        return produce(state, draft => {
          const layouts = draft.layouts;

          draft[historyKey].layoutHistory = [layouts];
          draft[historyKey].currentIndex = 0;
          draft.initLayouts = layouts;

        });
      },

      [ActionTypes.LayoutsHistoryUndo](state) {
        const { isTemp } = state;
        const historyKey = isTemp ? 'tempHistory' : 'history';

        return produce(state, draft => {
          if (draft[historyKey].currentIndex > 0) {
            draft[historyKey].currentIndex--;
          }
        });
      },

      [ActionTypes.LayoutsHistoryRedo](state) {
        const { isTemp } = state;
        const historyKey = isTemp ? 'tempHistory' : 'history';

        return produce(state, draft => {
          if (draft[historyKey].currentIndex < draft[historyKey].layoutHistory.length - 1) {
            draft[historyKey].currentIndex++;
          }
        });
      },

      [ActionTypes.ResetLayoutsHistory](state) {
        const { isTemp } = state;
        const historyKey = isTemp ? 'tempHistory' : 'history';

        return produce(state, draft => {
          draft[historyKey].currentIndex = 0;
          draft[historyKey].layoutHistory = [state.layouts as any];
        });
      },

      [ActionTypes.SelectLayout](state, { cellName, options }: ISelectLayout) {
        return produce(state, draft => {
          draft.selectedLayout = cellName;
          draft.selectedElement = null;
          draft.selectionOptions = options;
        });
      },

      [ActionTypes.DisSelect](state, __) {
        return produce(state, draft => {
          draft.selectedLayout = null;
          draft.selectedElement = null;
          draft.selectionOptions = null;
        });
      },

      [ActionTypes.SelectElement](state, { id, options }: ISelectElement) {
        return produce(state, draft => {
          draft.selectedElement = id;
          draft.selectedLayout = null;
          draft.selectionOptions = options;
        });
      },

      [ActionTypes.UpdateActiveTabs](state, { tabs, tab }: IUpdateActiveTabs) {
        return produce(state, draft => {
          draft.activeTabs[tabs] = tab;
        });
      },

      [ActionTypes.SetRootElement](state, { rootElement, rootTitle }: ISetRootElement) {
        return produce(state, draft => {
          draft.rootElement = rootElement;
          draft.rootTitle = rootTitle;
        });
      },

      [ActionTypes.SetStateValue](state, { values }: ISetStateValue) {
        return produce(state, draft => {
          _.forEach(values, (value, key) => draft[key] = value);
        });
      },

      [ActionTypes.EnterTemp](state) {
        const { layouts } = state;
        return produce(state, draft => {
          draft.isTemp = true;
          draft.tempHistory = {
            currentIndex: 0,
            layoutHistory: [layouts as any],
          };
        });
      },

      [ActionTypes.QuitTemp](state) {
        return produce(state, draft => {
          draft.isTemp = false;
          draft.tempHistory = initLayoutsHistoryState as any;
        });
      },

    },

    effects: {
      *[ActionTypes.LoadLayoutsEffect](__, { call, put }) {
        const layouts: L[] = [] as any[];
        yield call(delay, 1000);
        yield put(
          createReplaceLayoutsAction(layouts),
        );
      },

      *[ActionTypes.SelectLayoutEffect]({ cellName, options }: ISelectLayoutEffect, { put, call }) {
        yield put(createSelectLayoutAction(cellName, options));
      },

      *[ActionTypes.RemoveLayoutsEffect]({ layouts: _layouts, _addHistory }: IRemoveLayoutsEffect, { put, select }) {
        const layouts = _.isArray(_layouts) ? _layouts : [_layouts];
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        let storeLayouts = layoutsState.layouts;
        const willRemoveLayouts = findChildren(
          storeLayouts,
          layouts,
          cellNameKey,
          parentCellNameKey,
          childrenElementsKey,
          elementIdKey,
          layoutElementIdKey || elementIdKey,
        );
        storeLayouts = _.difference(storeLayouts, willRemoveLayouts);
        yield put(createReplaceLayoutsAction(storeLayouts, _addHistory));
      },

      *[ActionTypes.RemoveElementEffect]({ element, _addHistory }: IRemoveElementEffect, { put, select }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const layouts = layoutsState.layouts;
        const allLayoutElements: any[][] = _.map(layouts, l => (l[childrenElementsKey] || []));
        const allElements = _.reduce(allLayoutElements, (prev, curr) => prev.concat(curr));
        const elementObj = _.find(allElements, e => e[elementIdKey] === element);
        if (!elementObj) {
          console.warn('[RemoveElementEffect] 找不到对应的 Element.');
          return;
        }
        // ####
        // const cellName = elementObj[elementParentLayoutKey];
        // const layout = _.find(layouts, l => l[cellNameKey] === cellName);
        const layout = findElementLayout(elementObj[elementIdKey], layouts, childrenElementsKey, elementIdKey);
        if (!layout) {
          console.warn('[RemoveElementEffect] 找不到对应的 Layout.');
          return;
        }
        const changedLayout = produce(layout, draft => {
          draft[childrenElementsKey] = _.filter(draft[childrenElementsKey], e => e[elementIdKey] !== element);
        });
        const removedLayouts = _.chain(layouts).filter(l => l[layoutElementIdKey || elementIdKey] === element).map(l => l[cellNameKey]).value();
        yield put(createRemoveLayoutsEffect(removedLayouts, true, false));
        yield put(createUpdateLayoutsAction([changedLayout], _addHistory));
        // yield put(createReplaceLayoutsAction(storeLayouts, _addHistory));
      },

      *[ActionTypes.RemoveSelectedEffect](__, { put, select }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { selectedElement, selectedLayout } = layoutsState;
        if (selectedElement) {
          yield put(createRemoveSelectedElementEffect(false));
          return;
        }
        if (selectedLayout) {
          yield put(createRemoveSelectedLayoutEffect(false));
        }
      },

      *[ActionTypes.RemoveSelectedElementEffect](__, { put, select }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const selectedElement = layoutsState.selectedElement;
        yield put(createRemoveElementEffect(selectedElement, true, false));
      },

      *[ActionTypes.RemoveSelectedLayoutEffect](__, { put, select }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const selectedLayout = layoutsState.selectedLayout;
        yield put(createRemoveLayoutsEffect(selectedLayout, true, false));
      },

      *[ActionTypes.MoveLayoutToIndexEffect]({ layout, index } : IMoveLayoutToIndexEffect, { put, select }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { layouts, childrenLayoutsMap } = layoutsState;
        const layoutItem = _.find(layouts, l => l[cellNameKey] === layout);
        if (!layoutItem) {
          return;
        }
        let list = childrenLayoutsMap[layoutItem[parentCellNameKey] || ''] || [];
        list = _.filter(list, l => l[cellNameKey] !== layout);
        list.splice(index, 0, layoutItem);
        const willUpdateItems: any[] = [];
        _.forEach(list, (item, i) => {
          if (item[orderKey] !== i) {
            willUpdateItems.push(produce(item, draft => {
              draft[orderKey] = i;
            }));
          }
        });
        yield put(createUpdateLayoutsAction(willUpdateItems));
      },

      *[ActionTypes.MoveLayoutToOtherEffect]({ source, target, index } : IMoveLayoutToOtherEffect, { put, select }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { layouts, childrenLayoutsMap } = layoutsState;
        const sourceLayout = _.find(layouts, l => l[cellNameKey] === source);
        // const targetLayout = _.find(layouts, l => l[cellNameKey] === target);
        if (!sourceLayout) {
          return;
        }
        const list = (childrenLayoutsMap[target || ''] || []).concat();
        list.splice(index, 0, sourceLayout);
        const willUpdateItems: any[] = [];
        const willAddItems: any[] = [];
        _.forEach(list, (item, i) => {
          if (item === sourceLayout) {
            const newCellName = cellNameManager.create(target);
            willAddItems.push(produce(item, draft => {
              draft[orderKey] = i;
              draft[parentCellNameKey] = target;
              draft[cellNameKey] = newCellName;
              _.forEach(draft[childrenElementsKey], e => {
                e[elementParentLayoutKey] = newCellName;
              });
            }));
            willAddItems.push(...changeCellName(
              layouts,
              item,
              newCellName,
              cellNameKey,
              parentCellNameKey,
              childrenElementsKey,
              elementParentLayoutKey,
            ));
          } else if (item[orderKey] !== i) {
            willUpdateItems.push(produce(item, draft => {
              draft[orderKey] = i;
            }));
          }
        });
        yield put(createUpdateLayoutsAction(willUpdateItems, false));
        yield put(createAddLayoutsAction(willAddItems, false));
        yield put(createRemoveLayoutsEffect(source, true, false));
      },

      *[ActionTypes.MoveUpSelectedLayoutEffect]({ layoutCellName }: IMoveUpSelectedLayoutEffect, { put }) {
        yield put(createMoveSelectedLayoutEffect(-1, layoutCellName, false));
      },

      *[ActionTypes.MoveDownSelectedLayoutEffect]({ layoutCellName }: IMoveDownSelectedLayoutEffect, { put }) {
        yield put(createMoveSelectedLayoutEffect(1, layoutCellName, false));
      },

      *[ActionTypes.MoveSelectedLayoutEffect]({ position, layoutCellName }: IMoveSelectedLayoutEffect, { put, select }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { childrenLayoutsMap, selectedLayout: currentSelectedLayout, layouts } = layoutsState;
        const selectedLayout =  layoutCellName ? layoutCellName : currentSelectedLayout;
        const layout = _.find(layouts, l => l[cellNameKey] === selectedLayout);
        if (!layout) {
          console.warn('[MoveUpSelectedLayoutEffect] 找不到要更新的 Layout:', selectedLayout);
          return;
        }
        const list = childrenLayoutsMap[layout[parentCellNameKey] || ''];
        let index = _.findIndex(list, l => l[cellNameKey] === selectedLayout);
        if (index < 0) {
          console.warn('[MoveUpSelectedLayoutEffect] 找不到要更新的 Layout:', selectedLayout);
        }
        if (position < 0) {
          index--;
        } else {
          index++;
        }
        if (index < 0) {
          index = 0;
        } else if (index > list.length - 1) {
          index = list.length - 1;
        }
        yield put(createMoveLayoutToIndexEffect(selectedLayout, index, false));
      },

      *[ActionTypes.MoveDownSelectedEffect](__, { put, select }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { selectedElement, selectedLayout } = layoutsState;
        if (selectedElement) {
          yield put(createMoveDownSelectedElementEffect(null, false));
        } else if (selectedLayout) {
          yield put(createMoveDownSelectedLayoutEffect(null, false));
        }
      },

      *[ActionTypes.MoveUpSelectedEffect](__, { put, select }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { selectedElement, selectedLayout } = layoutsState;
        if (selectedElement) {
          yield put(createMoveUpSelectedElementEffect(null, false));
        } else if (selectedLayout) {
          yield put(createMoveUpSelectedLayoutEffect(null, false));
        }
      },

      *[ActionTypes.MoveUpSelectedElementEffect]({ elementId }: IMoveUpSelectedElementEffect, { put }) {
        yield put(createMoveSelectedElementEffect(-1, elementId, false));
      },

      *[ActionTypes.MoveDownSelectedElementEffect]({ elementId }: IMoveDownSelectedElementEffect, { put }) {
        yield put(createMoveSelectedElementEffect(1, elementId, false));
      },

      *[ActionTypes.MoveSelectedElementEffect]({ position, elementId }: IMoveSelectedElementEffect, { put, select }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { layouts, selectedElement: currentSelectedElement } = layoutsState;
        const selectedElement: string = elementId ? elementId : currentSelectedElement;
        const layout = findElementLayout(selectedElement, layouts, childrenElementsKey, elementIdKey);
        if (!layout) {
          console.warn('[MoveSelectedElementEffect] 找不到要更新的 Layout.');
          return;
        }
        const list = layout[childrenElementsKey] || [];
        let index = _.findIndex(list, e => e[elementIdKey] === selectedElement);
        if (index < 0) {
          console.warn('[MoveSelectedElementEffect] 找不到要更新的 Element:', selectedElement);
        }
        if (position < 0) {
          index--;
        } else {
          index++;
        }
        if (index < 0 || index > list.length - 1) {
          return;
        }
        yield put(createMoveElementToIndexEffect(selectedElement, index, false));

      },

      *[ActionTypes.MoveElementToIndexEffect]({ elementId, index }: IMoveElementToIndexEffect, { put, select }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { layouts } = layoutsState;
        const layout = findElementLayout(elementId, layouts, childrenElementsKey, elementIdKey);
        if (!layout) {
          console.warn('[MoveElementToIndexEffect] 找不到 Layout.');
          return;
        }
        const changedLayout = produce(layout, draft => {
          let childrenElements: any[] = draft[childrenElementsKey];
          const element = _.find(childrenElements, e => e[elementIdKey] === elementId);
          childrenElements = _.filter(childrenElements, e => e[elementIdKey] !== elementId);
          childrenElements.splice(index, 0, element);
          _.forEach(childrenElements, (e, i) => {
            e[elementOrderKey] = i + elementStartIndex;
          });
          draft[childrenElementsKey] = childrenElements;
        });
        console.log(changedLayout);
        yield put(createUpdateLayoutsAction([changedLayout]));
      },

      *[ActionTypes.MoveElementToOtherEffect]({ element, layout, index }: IMoveElementToOtherEffect, { put, select }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { layouts } = layoutsState;
        const willUpdateLayouts: any[] = [];
        const sourceLayout = findElementLayout(element[elementIdKey], layouts, childrenElementsKey, elementIdKey);
        willUpdateLayouts.push(produce(sourceLayout, draft => {
          _.remove(draft[childrenElementsKey], e => e[elementIdKey] === element[elementIdKey]);
        }));
        willUpdateLayouts.push(produce(layout, draft => {
          if (!draft[childrenElementsKey]) {
            draft[childrenElementsKey] = [];
          }
          draft[childrenElementsKey].splice(index, 0, produce(element, elementDraft => {
            elementDraft[elementOrderKey] = index + elementStartIndex;
            elementDraft[elementParentLayoutKey] = layout[cellNameKey];
          }));
          _.forEach(draft[childrenElementsKey], (e, i) => {
            if (e[elementIdKey] !== element[elementIdKey]) {
              e[elementOrderKey] = i + elementStartIndex;
            }
          });
        }));
        yield put(createUpdateLayoutsAction(willUpdateLayouts));
      },

      *[ActionTypes.AddLayoutToParentEffect]({ layout, index, parentCellName, _addHistory }: IAddLayoutToParentEffect, { put, select }) {
        const layouts = _.isArray(layout) ? layout  : [layout];
        const count = layouts.length;
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { childrenLayoutsMap, rootElement } = layoutsState;
        const list = childrenLayoutsMap[parentCellName || ''] || [];
        const newLayouts = _.chain(layouts)
          .map((l, i) => {
            return createWillAddLayouts(l, parentCellName, index + i);
          })
          .flatten().value();
        const willAddLayouts = newLayouts;
        const willUpdateLayouts: any[] = [];
        const newList = produce(list, draft => {
          draft.splice(index, 0, ...Array(count));
        });
        _.forEach(newList, (l, i) => {
          if (l && l[orderKey] !== i) {
            willUpdateLayouts.push(produce(l, draft => {
              draft[orderKey] = i;
            }));
          }
        });
        yield put(createAddLayoutsAction(willAddLayouts, false));
        yield put(createUpdateLayoutsAction(willUpdateLayouts, _addHistory));

        function createWillAddLayouts(source: any, _parentCellName: string, i: number) {
          const WillAddLayouts: any[] = [];
          const willAddLayout = produce(source, draft => {
            const cellName = cellNameManager.create(rootElement && !_parentCellName ? 'ROOT_E' : _parentCellName);
            draft[parentCellNameKey] = _parentCellName;
            draft[cellNameKey] = cellName;
            draft[layoutIdKey] = createId();
            draft[orderKey] = i;
            if (rootElement) {
              draft[layoutElementIdKey || elementIdKey] = rootElement[elementIdKey];
            }
            _.forEach(draft[childrenElementsKey], (e, j) => {
              e[elementIdKey] = createId();
              e[elementOrderKey] = j + elementStartIndex;
            });
            const childrenLayouts: any[] = draft[tempChildrenLayoutsKey];
            delete draft[tempChildrenLayoutsKey];
            _.forEach(childrenLayouts, (childLayout, j) => {
              WillAddLayouts.push(...createWillAddLayouts(childLayout, cellName, j));
            });
            if (draft.layoutContainerType === 'FORM' && !draft.elementName) {
              draft.elementName = createFormElementNameFromCellName(cellName);
            }
            if (draft.layoutElementType === 'TEMPLATE' && !draft.elementName) {
              draft.elementName = createFormElementNameFromCellName(cellName, 'TEMPLATE_');
            }
          });
          WillAddLayouts.push(willAddLayout);
          return WillAddLayouts;
        }
      },

      *[ActionTypes.AddLayoutToParentElementEffect]({ layout, index, parentElement }: IAddLayoutToParentElementEffect, { put, select }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { layouts, config } = layoutsState;
        const childrenLayouts = getLayoutChildrenByParentElement(
          layouts,
          parentElement,
          config.elementIdKey,
          config.layoutElementIdKey,
          config.parentCellNameKey,
          config.orderKey,
        );
        const newLayout = produce(layout, draft => {
          draft[parentCellNameKey] = null;
          draft[cellNameKey] = cellNameManager.create('ROOT_E');
          draft[layoutElementIdKey || elementIdKey] = parentElement[elementIdKey];
          draft[layoutIdKey] = createId();
          draft[orderKey] = index;
          _.forEach(draft[childrenElementsKey], e => {
            e[elementIdKey] = createId();
          });
        });
        const willAddLayouts = [newLayout];
        const willUpdateLayouts: any[] = [];
        const newChildrenLayouts = produce(childrenLayouts, draft => {
          draft.splice(index, 0, newLayout);
        });
        _.forEach(newChildrenLayouts, (l, i) => {
          if (i !== index && l[orderKey] !== i) {
            willUpdateLayouts.push(produce(l, draft => {
              draft[orderKey] = i;
            }));
          }
        });
        yield put(createAddLayoutsAction(willAddLayouts, false));
        yield put(createUpdateLayoutsAction(willUpdateLayouts, true));
      },

      *[ActionTypes.AddLayoutToParentElementIfEmptyEffect]({ layout, parentElement }: IAddLayoutToParentElementIfEmptyEffect, { put, select }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { layouts, config } = layoutsState;
        const childrenLayouts = getLayoutChildrenByParentElement(
          layouts,
          parentElement,
          config.elementIdKey,
          config.layoutElementIdKey,
          config.parentCellNameKey,
          config.orderKey,
        );
        if (!childrenLayouts || !childrenLayouts.length) {
          yield put(createAddLayoutToParentElementEffect(
            layout,
            parentElement,
            0,
            false,
          ));
        }
      },

      *[ActionTypes.AddElementToParentEffect]({ element, index, parentLayout }: IAddElementToParentEffect, { put, select }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { layouts, defaultSetting, config } = layoutsState;
        const parentLayouts: any[] = _.isArray(parentLayout) ? parentLayout : [parentLayout];
        const willUpdateLayouts = _.map(parentLayouts, layout => {
          const defaultSettingType = getClosestElementType(layouts, layout, config);
          const list: any[] = layout[childrenElementsKey] || [];
          const elements = _.isArray(element) ? element : [element];
          const count = elements.length;
          const _index = _.isNumber(index) ? index : list.length;
          const newElements = _.map(elements, (e, i) => produce(e, draft => {
            const uiType = e.uiType;
            const defaultSettings = getControlDefaultSetting(defaultSetting, defaultSettingType, uiType);
            draft[elementParentLayoutKey] = layout[cellNameKey];
            draft[elementIdKey] = createId();
            draft[elementOrderKey] = _index + i + elementStartIndex;
            _.assign(draft, defaultSettings);
          }));
          const newList = produce(list, draft => {
            draft.splice(_index, 0, ...newElements);
            _.forEach(draft, (e, i) => {
              if (i < _index || i > _index + count - 1) {
                if (isDraft(e)) {
                  e[elementOrderKey] = i + elementStartIndex;
                } else {
                  draft[i] = _.assign({
                    [elementOrderKey]: i + elementStartIndex,
                  }, e);
                }
              }
            });
          });
          const willUpdateLayout = produce(layout, draft => {
            draft[childrenElementsKey] = newList;
          });
          return willUpdateLayout;
        });
        yield put(createUpdateLayoutsAction(willUpdateLayouts));
      },

      *[ActionTypes.UpdateLayoutFieldsEffect]({ cellName, changes }: IUpdateLayoutFieldsEffect, { put, select }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { layouts, config } = layoutsState;
        const layout = findLayoutByCellName(layouts, cellName, config.cellNameKey);
        if (!layout) {
          return;
        }
        const newLayout = produce(layout, draft => {
          _.assign(draft, changes);
        });
        yield put(createUpdateLayoutsAction([newLayout]));
      },

      *[ActionTypes.UpdateElementFieldsEffect]({ elementId, changes }: IUpdateElementFieldsEffect, { put, select }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { layouts } = layoutsState;
        const layout = findElementLayout(elementId, layouts, childrenElementsKey, elementIdKey);
        if (!layout) {
          return;
        }
        const newLayout = produce(layout, draft => {
          const element = _.find(draft[childrenElementsKey], e => e[elementIdKey] === elementId);
          if (element) {
            _.assign(element, changes);
          }
        });
        yield put(createUpdateLayoutsAction([newLayout]));
      },

      *[ActionTypes.DoUpdateSelectedLayoutFieldsEffect]({ changes }: IUpdateSelectedLayoutFieldsEffect, { put, select }) {
        // console.log('[DoUpdateSelectedLayoutFieldsEffect]', changes);
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { selectedLayout } = layoutsState;
        if (selectedLayout) {
          yield put(createUpdateLayoutFieldsEffect(
            selectedLayout,
            changes,
            false,
          ));
        }
      },

      *[ActionTypes.DoUpdateSelectedElementFieldsEffect]({ changes }: IUpdateSelectedLayoutFieldsEffect, { put, select }) {
        // console.log('[DoUpdateSelectedLayoutFieldsEffect]', changes);
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { selectedElement } = layoutsState;
        if (selectedElement) {
          yield put(createUpdateElementFieldsEffect(
            selectedElement,
            changes,
            false,
          ));
        }
      },

      *[ActionTypes.JoinLayoutsEffect]({ layouts }: IJoinLayoutsEffect, { put, select }) {
        const firstLayout = layouts[0];
        const willRemoveLayouts = _.tail(layouts);
        const willRemoveLayoutsCellNames = _.map(willRemoveLayouts, l => l[cellNameKey]);
        const elements = _.chain(layouts)
          .map(l => l[childrenElementsKey] || [])
          .flatten()
          .map((e, i) => produce(e, draft => {
            draft[elementOrderKey] = i + elementStartIndex;
          }))
          .value();
        const unitCount = _.reduce(layouts, (memo, l) => memo + (+(l.unitCount) || 0), 0);
        const willUpdateLayout = produce(firstLayout, draft => {
          draft[childrenElementsKey] = elements;
          draft.unitCount = unitCount;
        });
        yield put['resolve'](createRemoveLayoutsEffect(willRemoveLayoutsCellNames, false, false));
        yield put(createUpdateLayoutsAction([willUpdateLayout], true));
      },

      *[ActionTypes.SplitLayoutEffect]({ layout, unit }: ISplitLayoutEffect, { put, select, call }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { childrenLayoutsMap } = layoutsState;
        const unitCount: number = layout.unitCount;
        const parentCellName: string = layout[parentCellNameKey];
        const count = Math.floor(unitCount / unit);
        const childrenLayouts = childrenLayoutsMap[parentCellName];
        const index = _.findIndex(childrenLayouts, l => l === layout);
        const newLayouts: any[] = [];
        _.times(count - 1, () => {
          newLayouts.push(createLayout({ // TODO ...
            layoutContainerType: 'DIV',
            isParent: '',
            unitCount: unit,
          }));
        });
        yield put['resolve'](createAddLayoutToParentEffect(newLayouts, parentCellName, index + 1, false, false));
        const willUpdateLayout = produce(layout, draft => {
          draft.unitCount = unit;
        });
        yield put(createUpdateLayoutsAction([willUpdateLayout]));
      },

      *[ActionTypes.ClearLayoutEffect]({ layout, _addHistory }: IClearLayoutEffect, { select, put }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { childrenLayoutsMap } = layoutsState;
        const childrenLayouts = _.map(childrenLayoutsMap[layout[cellNameKey]], l => l[cellNameKey]);
        if (childrenLayouts.length) {
          yield put(createRemoveLayoutsEffect(
            childrenLayouts,
            _addHistory,
          ));
        }
      },

      *[ActionTypes.AutoBindingEffect]({ _addHistory }: IAutoBindingEffect, { select, put }) {
        interface IBindingResult {
          element: any;
          method?: any;
          property?: any;
          tipType?: string;
        }
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { layouts, methods, properties, config } = layoutsState;
        const results: IBindingResult[] = [];
        const newLayouts = produce(layouts, draft => {
          _.forEach(draft, l => {
            const elements = l[childrenElementsKey];
            _.forEach(elements, e => {
              const fieldText = e.fieldText || e.columnName;
              let boName = e.layoutBoName;
              if (!boName) {
                const closestBoNameLayout = getClosestLayout(layouts, l, (_l: any) => _l.layoutBoName, config, true);
                if (closestBoNameLayout) {
                  boName = closestBoNameLayout.layoutBoName;
                }
              }
              const needBindingType = needBinding(e);
              if (needBinding && !boName) {
                const result: IBindingResult = {
                  element: original(e),
                  tipType: 'No BoName',
                };
                results.push(result);
                return;
              }
              if (needBindingType === 'method' && !e.methodName) {
                // 按钮，绑定方法
                const method = findMethodByFieldText(boName, fieldText, methods);
                const result: IBindingResult = {
                  element: original(e),
                };
                if (method) {
                  e.layoutBoName = method.layoutBoName;
                  e.methodName = method.methodName;
                  result.method = method;
                }
                results.push(result);
              } else if (needBindingType === 'property' && !e.propertyName) {
                // 其它控件，绑定属性
                const result: IBindingResult = {
                  element: original(e),
                };
                const property = findPropertyByFieldText(boName, fieldText, properties);
                if (property) {
                  e.layoutBoName = property.layoutBoName;
                  e.propertyName = property.propertyName;
                  result.property = property;
                }
                results.push(result);
              }
            });
          });
        });
        if (!results.length) {
          message.info('没有需要绑定的控件。');
          return;
        }
        yield put(createReplaceLayoutsAction(
          newLayouts,
          _addHistory,
        ));
        console.log('[AutoBindingEffect]', results);
        showListMessage(
          '绑定结果：',
          _.map(results, result => {
            const { element, property, method, tipType } = result;
            let tip: string;
            if (property) {
              tip = `${element.fieldText || element.columnName} 已绑定属性 ${property.propertyName}`;
            } else if (method) {
              tip = `${element.fieldText || element.columnName} 已绑定方法 ${method.methodName}`;
            } else if (tipType === 'No BoName') {
              tip = `${element.fieldText || element.columnName} 请先指定业务对象名称再进行绑定。`;
            } else {
              tip = `${element.fieldText || element.columnName} 未匹配到对应的属性或方法`;
            }
            return tip;
          },
        ));
      },

      *[ActionTypes.UpdateGridColumnsDataEffect]({ columnsData, _addHistory }: IUpdateGridColumnsDataEffect, { select, put }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { selectedLayout, layouts } = layoutsState;
        const grid = _.find(layouts, l => l[cellNameKey] === selectedLayout);
        if (!grid) {
          return;
        }
        const newGrid = produce(grid, draft => {
          const columns = draft[childrenElementsKey];
          _.forEach(columns, (c, i) => {
            c.__data = columnsData[i];
          });
        });
        yield put(createUpdateLayoutsAction<L>([newGrid], _addHistory));
      },

      *[ActionTypes.UpdateSelectedItemEventEffect]({ eventType, changes }: IUpdateSelectedItemEventEffect, { select, put }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { selectedElement, selectedLayout } = layoutsState;
        const selectedItem = selectedElement || selectedLayout;
        const selectItemType = selectedElement ? 'element' : (selectedLayout ? 'layout' : null);
        if (!selectItemType) {
          return;
        }
        yield put(
          createUpdateEventEffect(
            changes,
            eventType,
            selectItemType,
            selectedItem,
            false,
          ),
        );
      },

      *[ActionTypes.UpdateEventEffect]({ eventType, changes, eventItem, eventItemType }: IUpdateEventEffect, { select, put }) {
        switch (eventItemType) {
          case 'layout':
            yield put(createUpdateLayoutEventEffect(
              changes,
              eventType,
              eventItem,
              false,
            ));
            break;
          case 'element':
            yield put(createUpdateElementEventEffect(
              changes,
              eventType,
              eventItem,
              false,
            ));
          default:
            break;
        }
      },

      *[ActionTypes.UpdateLayoutEventEffect]({ changes, layoutCellName, eventType }: IUpdateLayoutEventEffect, { select, put }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { layouts, config } = layoutsState;
        const layout = findLayoutByCellName(layouts, layoutCellName, config.cellNameKey);
        const newLayout = produce(layout, draft => {
          let events = draft[config.layoutEventsKey];
          const event = _.find(events, e => e.eventType === eventType);
          if (event) {
            _.assign(event, changes);
          } else {
            if (!events) {
              events = [];
              draft[config.layoutEventsKey] = events;
            }
            events.push(_.assign({
              eventType,
            }, changes));
          }
        });
        if (newLayout !== layout) {
          yield put(createUpdateLayoutsAction([newLayout]));
        }
      },

      *[ActionTypes.UpdateElementEventEffect]({ changes, elementId, eventType }: IUpdateElementEventEffect, { select, put }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { layouts, config } = layoutsState;
        const layout = findElementLayout(elementId, layouts, config.childrenElementsKey, config.elementIdKey);
        const newLayout = produce(layout, draft => {
          const element = _.find(draft[childrenElementsKey], e => e[elementIdKey] === elementId);
          if (!element) {
            return;
          }
          let events = element[config.elementEventsKey];
          const event = _.find(events, e => e.eventType === eventType);
          if (event) {
            _.assign(event, changes);
          } else {
            if (!events) {
              events = [];
              element[config.elementEventsKey] = events;
            }
            events.push(_.assign({
              eventType,
            }, changes));
          }
        });
        if (newLayout !== layout) {
          console.log('[UpdateElementEventEffect]', newLayout);
          yield put(createUpdateLayoutsAction([newLayout]));
        }
      },

      *[ActionTypes.LoadReferencePageLayoutsEffect]({ referencePageId, referenceLayoutCellName }: ILoadReferencePageLayoutsEffect, { call, put, select }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const pagesState: IPagesState<any> = yield select((s: any) => s.PAGES);
        if (pagesState.currentPageId === referencePageId) {
          message.error('不能引用当前页面!');
          return;
        }
        const { referencePageLayouts } = layoutsState;
        const referencePageLayoutsInfo = _.get(referencePageLayouts, referenceLayoutCellName);
        if (referencePageLayoutsInfo) {
          return;
        }
        yield put(createSetIsLoadingAction(true, true));
        let success = true;
        let result: any;
        yield put['resolve'](createClearLayoutEffect({ cellName: referenceLayoutCellName }, false, false));
        yield put['resolve'](createUpdateLayoutFieldsEffect(
          referenceLayoutCellName,
          { __referenceLoadStatus: 'LOADING' },
          false,
        ));
        try {
          result = yield call(queryPage, {
            ipfCcmOriginPageId: referencePageId,
          });
        } catch (e) {
          success = false;
          console.error(e);
        }
        yield put['resolve'](createUpdateLayoutFieldsEffect(
          referenceLayoutCellName,
          { __referenceLoadStatus: success ? 'LOADED' : 'ERROR' },
          false,
        ));
        yield put(createSetIsLoadingAction(false, true));
        const { boPageLayout } = formatInputData(result);
        _.forEach(boPageLayout, l => {
          l[cellNameKey] = `$REF_${referenceLayoutCellName}_${l[cellNameKey]}`;
          l[parentCellNameKey] = l[parentCellNameKey]
            ? `$REF_${referenceLayoutCellName}_${l[parentCellNameKey]}`
            : referenceLayoutCellName;
        });
        console.log('LoadReferencePageLayoutsEffect', boPageLayout);
        yield put(createAddLayoutsAction(boPageLayout));
      },

      *[ActionTypes.UpdateInnerDatasourceEffect]({ cellName, datasourceId } : IUpdateInnerDatasourceEffect, { select, put }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { layouts } = layoutsState;
        const childrenLayouts = findChildren(
          layouts,
          [cellName],
          cellNameKey,
          parentCellNameKey,
          childrenElementsKey,
          elementIdKey,
          layoutElementIdKey || elementIdKey,
          true,
        );
        const willUpdateLayouts = produce(childrenLayouts, draft => {
          _.forEach(draft, lDraft => {
            _.forEach(lDraft[childrenElementsKey], eDraft => {
              eDraft.dataSourceId = datasourceId;
            });
          });
        });
        if (willUpdateLayouts.length) {
          yield put(createUpdateLayoutsAction(willUpdateLayouts));
        }
        message.info('已同步');
      },

      *[ActionTypes.QuitTempEffect]({ apply }: IQuitTempEffect, { select, put }) {
        yield put(createQuitTempAction());
        if (apply) {
          yield put({
            addHistory: true,
            type: 'Add History',
          });
        } else {
          const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
          const { history } = layoutsState;
          /** 最近的正式 layouts 记录 */
          const lastFormalLayouts = history.layoutHistory[history.currentIndex];
          yield put(createReplaceLayoutsAction(lastFormalLayouts, false));
        }
      },

      *[ActionTypes.ImportLayoutsEffect]({ layouts }: IImportLayoutsEffect, { select, put }) {
        // const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        // const pagesState: IPagesState<any> = yield select((s: any) => s.PAGES);
        const appState: IAppState = yield select((s: any) => s.APP);
        const { location } = appState;
        const isPrototype = location.pathname === '/prototyp';
        const elementIdMap: any = {};
        const createElementId = (oldId: string) => {
          const cacheId = elementIdMap[oldId];
          if (cacheId) {
            return cacheId;
          }
          const newId = createId();
          elementIdMap[oldId] = newId;
          return newId;
        };
        const _layouts = produce(layouts, draft => {
          _.forEach(draft, l => {
            delete l['baseViewId'];
            delete l['ipfCcmOriginPageId'];
            delete l['ipfCcmBoPageId'];
            delete l['ipfCcmPageId'];
            delete l['ipfCcmPageId'];
            const lId = createId();
            if (isPrototype) {
              l[layoutIdKey] = lId;
              if (l[layoutElementIdKey]) {
                l[layoutElementIdKey] = createElementId(l[layoutElementIdKey]);
              }
            }
            _.forEach(l[childrenElementsKey], e => {
              const eId = createElementId(e[elementIdKey]);
              delete e['baseViewId'];
              delete e['ipfCcmOriginPageId'];
              delete e['ipfCcmBoPageId'];
              delete e['ipfCcmPageId'];
              delete e['ipfCcmPageId'];
              if (isPrototype) {
                e[elementIdKey] = eId;
                e[elementParentLayoutIdKey] = lId;
              }
            });
          });
        });
        yield put(createReplaceLayoutsAction(_layouts));
      },

      *[ActionTypes.GetBoListEffect]({ callback }: IGetBoListEffect, { select }) {
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const pagesState: IPagesState<any> = yield select((s: any) => s.PAGES);
        const { originData, layouts, cacheLayouts, config } = layoutsState;
        const { currentPageId } = pagesState;
        const boListClone: any[] = JSON.parse(JSON.stringify(originData));
        _.forEach(boListClone, bo => {
          if (bo.ipfCcmBoPages) {
            bo.ipfCcmBoClassicCasePages = [];
          }
          _.forEach(bo.ipfCcmBoPages, p => {
            const { ipfCcmPageId } = p;
            const pageLayouts = ipfCcmPageId === currentPageId
              ? layouts
              : cacheLayouts[ipfCcmPageId] || p['ipfCcmBoPageLayouts'] || [];
            delete p['ipfCcmBoPageLayouts'];
            p.rowStatus = ROW_STATUS.ADDED;
            p.ipfCcmBoPageId = ipfCcmPageId;
            const formatedLayouts = formatLayouts(
              pageLayouts,
              config.childrenElementsKey,
              config.cellNameKey,
              config.layoutEventsKey,
              config.elementEventsKey,
            );
            const pageData = {
              isPage: 'true',
              isClassicCase: 'true',
              isFromMenuOfPage: 'false',
              isSaveToModelTable: 'false',
              id: ipfCcmPageId,
              ...formatedLayouts,
            };
            bo.ipfCcmBoClassicCasePages.push(pageData);
          });
        });
        callback(boListClone);
      },

      *[ActionTypes.UpdateChildrenLayoutsMapWatcher](__, { take, put }) {
        while (true) {
          yield take([
            ActionTypes.ReplaceLayouts,
            ActionTypes.UpdateLayouts,
            ActionTypes.AddLayouts,
            ActionTypes.SetRootElement,
          ]);
          yield put(createUpdateChildrenLayoutsMapAction());
        }
      },

      *[ActionTypes.AddLayoutsHistoryWatcher](__, { take, put }) {
        while (true) {
          const takeAction: IAddHistory = yield take((action: IAddHistory) => {
            if (action.addHistory) {
              console.log('[AddLayoutsHistoryWatcher]', action);
            }
            return !!action.addHistory;
          });
          if (takeAction.addHistory === true) {
            yield put(createAddLayoutsHistoryAction());
          } else if (takeAction.addHistory === 'INIT') {
            yield put(createInitLayoutsHistoryAction());
          }
        }
      },

      *[ActionTypes.HistoryUndoRedoWatcher](__, { take, put, select }) {
        while (true) {
          yield take([
            ActionTypes.LayoutsHistoryUndo,
            ActionTypes.LayoutsHistoryRedo,
          ]);
          const layoutsState: ILayoutsState<L> = yield select((s: any) => s[namespace]);
          const { isTemp } = layoutsState;
          const historyKey = isTemp ? 'tempHistory' : 'history';
          const { currentIndex, layoutHistory } = layoutsState[historyKey];
          const layouts = layoutHistory[currentIndex];
          yield put(createReplaceLayoutsAction(layouts, false));
        }
      },

      // *[ActionTypes.UpdateSelectedLayoutFieldsWatcher](__, { take, put, select }) {
      //   let isFirst = true;
      //   let changes: any = {};
      //   let time: Date;
      //   let preSelectedLayout: string;
      //   let preSelectedElement: string;
      //   while (true) {
      //     const action: IUpdateSelectedLayoutFieldsEffect = yield take([
      //       ActionTypes.UpdateSelectedLayoutFieldsEffect,
      //     ]);
      //     const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
      //     const { selectedLayout, selectedElement } = layoutsState;
      //     const now = new Date();
      //     if (isFirst) {
      //       time = now;
      //       preSelectedLayout = selectedLayout;
      //       preSelectedElement = selectedElement;
      //       isFirst = false;
      //     }
      //     changes = _.assign({}, changes, action.changes);
      //     if (
      //       now.getTime() - time.getTime() >= 500
      //     ) {
      //       time = now;
      //       preSelectedLayout = selectedLayout;
      //       preSelectedElement = selectedElement;
      //       console.log(preSelectedLayout, preSelectedElement);
      //       console.log('[UpdateSelectedLayoutFieldsWatcher]', changes);
      //       yield put(createDoUpdateSelectedLayoutFieldsEffect(changes, false));
      //       changes = {};
      //     }
      //   }
      // },

    },

    subscriptions: {
      watchActions({ dispatch }) {
        dispatch(createUpdateChildrenLayoutsMapWatcherAction());
        dispatch(createAddLayoutsHistoryWatcherAction());
        dispatch(createHistoryUndoRedoWatcherAction());
        // dispatch(createUpdateSelectedLayoutFieldsWatcherAction());
      },
    },

  };

  return layoutsModel;

}
