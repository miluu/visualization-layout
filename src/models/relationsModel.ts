import { Model } from 'dva';
import { Action } from 'redux';
import produce from 'immer';
import {
  ActionTypes,
  NAMESPACE,
  ISetBoTreeSourceAction,
  ILoadBoTreeSourceEffect,
  createSetBoTreeSourceAction,
  ISelectBoTreeItemAction,
  ILoadRelationsEffect,
  ISetRelationsAction,
  createSetRelationsAction,
  createLoadRelationsEffect,
  createSelectBoTreeItemWatcher,
  IDeleteRelationsEffect,
  ISaveOrUpdateRelationEffect,
  createSaveOrUpdateRelationWatcher,
  createResetRelationsAction,
  createLoadBoTreeSourceEffect,
  createSelectBoTreeItemAction,
} from './relationsAction';
import { deleteBoRelations, ILoadBoTreeSourceOptions, loadBoRelations, loadBoTreeSource, saveOrUpdateBoRelation } from 'src/services/relations';
import { IAppState } from './appModel';
import { getSelectBoTreeItem } from 'src/utils/boRelations';
import { createSetIsLoadingAction } from './appActions';
import { Modal } from 'antd';

export interface IBoTreeSourceItem {
  appModule: string;
  custom: string;
  description: string;
  name: string;
  id: string;
  pid: string;
  boName: string;
  pidName: string;
  javaPath: string;
  tableName: string;
  [key: string]: any;
}

export interface IBoRelation {
  propertyName?: string;
  subBoName?: string;
  ipfCcmBoRelationId?: string;
  gridEditType?: string;
  description?: string;
  subBoOrderNo?: number;
  subBoRelType?: string;
  ipfCcmBoRelationColumns?: IBoRelationColumn[];
  ipfCcmBoId?: string;
  linkBoName?: string;
  [key: string]: any;
}

export interface IBoRelationColumn {
  baseViewId: string;
  businessType: string;
  columnName: string;
  commitRemark: string;
  configItemCode: string;
  currentViewId: string;
  ipfCcmBoRelationColumnId: string;
  ipfCcmBoRelationId: string;
  ipfFciCustomProjectId: string;
  ipfFciSystemId: string;
  isActive: string;
  isLock: string;
  isQuote: string;
  linkColumnName: string;
  linkPropertyName: string;
  propertyName: string;
  realBaseViewId: string;
  rowStatus: number;
  seqNo: number;
  subColumnName: string;
  subPropertyName: string;
  workFlowTaskId: string;
  [key: string]: any;
}

export interface IRelationsState {
  boTreeSource: IBoTreeSourceItem[];
  selectedBoTreeItem: string;
  relations: _.Dictionary<IBoRelation[]>;
}

const initRelationsState: IRelationsState = {
  boTreeSource: [],
  selectedBoTreeItem: null,
  relations: {},
};

export interface IRelationsModel extends Model {
  state: IRelationsState;
  reducers: {
    [key: string]: (state: IRelationsState, action: Action) => IRelationsState;
  };
}

export const relationsModel: IRelationsModel = {

  namespace: NAMESPACE,

  state: initRelationsState,

  reducers: {
    [ActionTypes.SetBoTreeSource](state, { boTreeSource }: ISetBoTreeSourceAction) {
      return produce(state, draft => {
        draft.boTreeSource = boTreeSource;
      });
    },

    [ActionTypes.SetRelations](state, { ipfCcmBoId, relations }: ISetRelationsAction) {
      return produce(state, draft => {
        draft.relations[ipfCcmBoId] = relations;
      });
    },

    [ActionTypes.ResetRelations](state) {
      return produce(state, draft => {
        draft.relations = {};
      });
    },

    [ActionTypes.SelectBoTreeItem](state, { id }: ISelectBoTreeItemAction) {
      return produce(state, draft => {
        draft.selectedBoTreeItem = id;
      });
    },

  },

  effects: {
    *[ActionTypes.LoadBoTreeSourceEffect]({}: ILoadBoTreeSourceEffect, { put, call, select }) {
      const { params }: IAppState = yield select((s: any) => s.APP);
      const boTreeSource: IBoTreeSourceItem[] = yield call(loadBoTreeSource, {
        baseViewId: params.baseViewId,
        ipfCcmBoId: params.ipfCcmBoId,
      } as ILoadBoTreeSourceOptions);
      yield put(createSetBoTreeSourceAction(boTreeSource));
    },

    *[ActionTypes.LoadRelationsEffect]({ force }: ILoadRelationsEffect, { put, call, select }) {
      const { params }: IAppState = yield select((s: any) => s.APP);
      const relationsState: IRelationsState = yield select((s: any) => s.RELATIONS);
      let baseViewId: string = params.baseViewId;
      let ipfCcmBoId: string = params.ipfCcmBoId;
      if (relationsState.selectedBoTreeItem) {
        const selectedBoTreeItem = getSelectBoTreeItem(relationsState);
        baseViewId = selectedBoTreeItem?.baseViewId || params.baseViewId;
        ipfCcmBoId = selectedBoTreeItem?.id || params.ipfCcmBoId;
      }

      if (!force && relationsState.relations[ipfCcmBoId]) {
        console.log('[LoadRelationsEffect] 子对象关系已加载，不再重复加载:', ipfCcmBoId);
        return;
      }

      const result = yield call(loadBoRelations, { baseViewId, ipfCcmBoId });
      yield put(createSetRelationsAction(ipfCcmBoId, result));
    },

    *[ActionTypes.DeleteRelationsEffect]({ ids }: IDeleteRelationsEffect, { put, call, select }) {
      const { params }: IAppState = yield select((s: any) => s.APP);
      const relationsState: IRelationsState = yield select((s: any) => s.RELATIONS);
      let baseViewId: string = params.baseViewId;
      if (relationsState.selectedBoTreeItem) {
        const selectedBoTreeItem = getSelectBoTreeItem(relationsState);
        baseViewId = selectedBoTreeItem?.baseViewId || params.baseViewId;
      }
      let result;
      yield put(createSetIsLoadingAction(true, true));
      try {
        result = yield call(deleteBoRelations, { ids, baseViewId });
        Modal.success({
          content: result?.msg || '删除成功。',
        });
      } catch (e) {
        Modal.error({
          content: e?.msg || '删除失败。',
        });
      } finally {
        yield put(createSetIsLoadingAction(false, true));
      }
      console.log('[DeleteRelationsEffect]', result);
    },

    *[ActionTypes.SaveOrUpdateRelationEffect]({ data, editType, callback }: ISaveOrUpdateRelationEffect, { put, call, select }) {
      const { params }: IAppState = yield select((s: any) => s.APP);
      const relationsState: IRelationsState = yield select((s: any) => s.RELATIONS);
      let baseViewId: string = params.baseViewId;
      if (relationsState.selectedBoTreeItem) {
        const selectedBoTreeItem = getSelectBoTreeItem(relationsState);
        baseViewId = selectedBoTreeItem?.baseViewId || params.baseViewId;
      }
      yield put(createSetIsLoadingAction(true, true));
      let result;
      try {
        result = yield call(saveOrUpdateBoRelation, { data, baseViewId, type: editType });
        Modal.success({
          content: result?.msg || '保存成功。',
        });
      } catch (e) {
        Modal.error({
          content: e?.msg || '保存失败。',
        });
      } finally {
        yield put(createSetIsLoadingAction(false, true));
      }
      callback();
    },

    // Watchers
    *[ActionTypes.SaveOrUpdateRelationWatcher](__, { take, put, select }) {
      while (true) {
        yield take([
          `${ActionTypes.SaveOrUpdateRelationEffect}/@@end`,
          `${ActionTypes.DeleteRelationsEffect}/@@end`,
        ]);
        yield put(createLoadBoTreeSourceEffect(false));
        const relationsState: IRelationsState = yield select((s: any) => s.RELATIONS);
        const selectedBoTreeItem = getSelectBoTreeItem(relationsState);
        yield put(createResetRelationsAction());
        yield put(createSelectBoTreeItemAction(selectedBoTreeItem?.id));
      }
    },

    *[ActionTypes.SelectBoTreeItemWatcher](__, { take, put }) {
      while (true) {
        yield take([
          ActionTypes.SelectBoTreeItem,
        ]);
        yield put(createLoadRelationsEffect(false, false));
      }
    },
  },

  subscriptions: {
    watchActions({ dispatch }) {
      dispatch(createSelectBoTreeItemWatcher());
      dispatch(createSaveOrUpdateRelationWatcher());
    },
  },

};
