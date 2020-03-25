import { Model } from 'dva';
import { Action } from 'redux';
import { message } from 'antd';
import produce from 'immer';
import * as _ from 'lodash';

import {
  NAMESPACE,
  ActionTypes,
  IDragStartAction,
  IDragOverAction,
  createDragEndAction,
  IDropEffect,
} from './dndActions';
import { ILayoutsState } from './layoutsModel';
import {
  createMoveLayoutToIndexEffect,
  createMoveLayoutToOtherEffect,
  createMoveElementToIndexEffect,
  createMoveElementToOtherEffect,
  createAddLayoutToParentEffect,
  createAddElementToParentEffect,
  createUpdateElementFieldsEffect,
} from './layoutsActions';
import { delay } from 'rxjs/operators';
import { findElementLayout, isRootLayout, needBinding } from 'src/utils';

export interface IDndState {
  readonly dragSource: any;
  readonly dragSourceType: string;
  readonly isAdd: boolean;

  readonly target: any;
  readonly targetParent: any;
  readonly targetType: string;
  readonly position: number;
}

export interface IDndModel extends Model {
  state: IDndState;
  reducers: {
    [key: string]: (state: IDndState, action: Action) => IDndState;
  };
}

const initState: IDndState = {
  dragSource: null,
  dragSourceType: null,
  isAdd: false,

  target: null,
  targetParent: null,
  targetType: null,
  position: null,
};

export const dndModel: IDndModel = {
  namespace: NAMESPACE,
  state: initState,
  reducers: {
    [ActionTypes.DragStart](state, { dragSource, dragSourceType, isAdd }: IDragStartAction) {
      return produce(state, draft => {
        draft.dragSource = dragSource;
        draft.dragSourceType = dragSourceType;
        draft.isAdd = isAdd;
      });
    },

    [ActionTypes.DragOver](state, { target, targetType, position }: IDragOverAction) {
      return produce(state, draft => {
        draft.target = target;
        draft.targetType = targetType;
        draft.position = position;
      });
    },

    [ActionTypes.DragEnd](state, __) {
      return initState;
    },

    [ActionTypes.ClearTarget](state, __) {
      return produce(state, draft => {
        draft.target = null;
        draft.targetType = null;
        draft.position = null;
      });
    },
  },
  effects: {
    *[ActionTypes.DropEffect]({ options }: IDropEffect, { select, put, call }) {
      const dndState: IDndState = yield select((s: any) => s['DND']);
      const layoutsState: ILayoutsState<any> = yield select((s: any) => s['LAYOUTS']);
      console.log('[DropEffect]', dndState);
      const {
        dragSource,
        dragSourceType,
        isAdd,
        target,
        targetType,
        position,
      } = (options || dndState);
      const {
        layouts,
        childrenLayoutsMap,
        config,
      } = layoutsState;
      // 拖到自身上，不处理
      if (dragSource === target) {
        return;
      }
      let list: any[];
      let index: number;
      const targetIsRoot = isRootLayout(target, config.cellNameKey);
      if (dragSourceType === 'property' && targetType === 'element') {
        // 拖拽属性到 element 上，更新 element 信息
        const bindingType = needBinding(target);
        if (bindingType !== 'property') {
          message.error('无法在该元素上绑定属性。');
          return;
        }
        const values: any = {
          propertyName: dragSource.propertyName,
        };
        if (dragSource.layoutBoName) {
          values.layoutBoName = dragSource.layoutBoName;
        }
        if (target.layoutElementType !== 'BUTTON') {
          values.columnName = dragSource.fieldText;
          values.fieldText = dragSource.fieldText;
        }
        yield put(createUpdateElementFieldsEffect(
          target[config.elementIdKey],
          values,
        ));
        message.success(`已绑定属性：${dragSource.fieldText}(${dragSource.propertyName})`);
        return;
      }
      if (dragSourceType === 'method' && targetType === 'element') {
        // 拖拽方法到 element 上，更新 element 信息
        const bindingType = needBinding(target);
        if (bindingType !== 'method') {
          message.error('无法在该元素上绑定方法。');
          return;
        }
        const values: any = {
          methodName: dragSource.methodName,
        };
        if (dragSource.layoutBoName) {
          values.layoutBoName = dragSource.layoutBoName;
        }
        if (target.layoutElementType === 'BUTTON') {
          values.columnName = dragSource.methodDesc;
          values.fieldText = dragSource.fieldText;
        }
        yield put(createUpdateElementFieldsEffect(
          target[config.elementIdKey],
          values,
        ));
        return;
      }
      if (dragSourceType === 'layout' && targetType === 'layout') {
        // 拖拽与放置是同一个布局时，不处理
        if (!target || target === dragSource) {
          return;
        }
        // 移动 layout 到兄弟位置，更新位置信息
        if (
          !isAdd &&
          (
            (!targetIsRoot && (target[config.parentCellNameKey] || '') === (dragSource[config.parentCellNameKey] || '') && position !== 0)
            || (target[config.cellNameKey] === dragSource[config.parentCellNameKey] && position === 0)
            || (targetIsRoot && !dragSource[config.parentCellNameKey] && position === 0)
          )
        ) {
          list = childrenLayoutsMap[dragSource[config.parentCellNameKey] || ''] || [];
          if (position === 0) {
            index = list.length - 1;
          } else {
            index = _.findIndex(list, l => l === target);
            index += position === 1 ? 1 : 0;
            index += target[config.orderKey] > dragSource[config.orderKey] ? -1 : 0;
          }
          // if (isAdd) {
          //   yield put(createAddLayoutToIndexEffect());
          //   return;
          // }
          yield put(createMoveLayoutToIndexEffect(
            dragSource[config.cellNameKey],
            index,
          ));
          return;
        }
        // 移动到其它位置，更新父栅格名称，和相应位置的序号
        let dropTarget: string = position === 0 ? target[config.cellNameKey] : target[config.parentCellNameKey];
        if (dropTarget === 'ROOT' || dropTarget === 'ROOT_E') {
          dropTarget = '';
        }
        list = childrenLayoutsMap[dropTarget || ''] || [];
        if (position === 0) {
          index = list.length;
        } else {
          index = _.findIndex(list, l => l === target);
          index += position === 1 ? 1 : 0;
        }
        if (isAdd) {
          // 拖拽新增的 Layout
          yield put(createAddLayoutToParentEffect(
            dragSource,
            dropTarget,
            index,
          ));
        } else {
          yield put(createMoveLayoutToOtherEffect(
            dragSource[config.cellNameKey],
            dropTarget,
            index,
          ));
          yield call(delay, 0);
          yield put(createDragEndAction(false));
        }
        return;
      }
      // 移动 Element
      if (dragSourceType === 'element') {
        if (targetIsRoot) {
          return;
        }
        // 拖拽的 element 所在的 layout
        const dragSourceElementLayout = isAdd ? null : findElementLayout(dragSource[config.elementIdKey], layouts, config.childrenElementsKey, config.elementIdKey);
        let targetLayout;
        if (targetType === 'element') {
          targetLayout = findElementLayout(target[config.elementIdKey], layouts, config.childrenElementsKey, config.elementIdKey);
        } else {
          targetLayout = target;
        }
        // 拖拽源与释放目标是否在同一个 Layout 中
        const isInSameLayout = dragSourceElementLayout === targetLayout;
        if (isInSameLayout) {
          // 处理兄弟位置的 element 的移动
          list = dragSourceElementLayout[config.childrenElementsKey] || [];
          if (targetType === 'layout') {
            index = list.length - 1;
          } else {
            index = _.findIndex(list, e => e === target);
            index += position > 0 ? 1 : 0;
            index += target[config.elementOrderKey] > dragSource[config.elementOrderKey] ? -1 : 0;
          }
          const currentIndex = _.findIndex(list, e => e === dragSource);
          // 目标序号与当前序号一致，不处理
          if (currentIndex === index) {
            return;
          }
          yield put(createMoveElementToIndexEffect(dragSource[config.elementIdKey], index));
        } else {
          // 移动到其它位置
          list = targetLayout[config.childrenElementsKey] || [];
          if (targetType === 'layout') {
            index = list.length;
          } else {
            index = _.findIndex(list, e => e === target);
            index += position > 0 ? 1 : 0;
          }
          if (isAdd) {
            // 拖拽新增 Element
            console.log('[DropEffect] 拖拽新增 element...');
            yield put(createAddElementToParentEffect(
              dragSource,
              targetLayout,
              index,
            ));
          } else {
            yield put(createMoveElementToOtherEffect(dragSource, targetLayout, index));
            yield call(delay, 0);
            yield put(createDragEndAction(false));
          }
        }
      }
    },
  },
};
