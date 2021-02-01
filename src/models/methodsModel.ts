import { Model } from 'dva';
import { Action } from 'redux';
import produce from 'immer';
import {
  ActionTypes,
  NAMESPACE,
  ISetBoTreeSourceAction,
  ISelectBoTreeItemAction,
  ILoadMethodsEffect,
  ISetMethodsAction,
  createSetMethodsAction,
  createLoadMethodsEffect,
  createSelectBoTreeItemWatcher,
  IDeleteMethodsEffect,
  ISaveOrUpdateMethodEffect,
  createSaveOrUpdateMethodWatcher,
  createResetMethodsAction,
  createLoadBoTreeSourceEffect,
  createSelectBoTreeItemAction,
} from './methodsAction';
import { deleteBoMethods, loadBoMethods, saveOrUpdateBoMethod } from 'src/services/methods';
import { IAppState } from './appModel';
import { getSelectBoTreeItem } from 'src/utils/boMethods';
import { createSetIsLoadingAction } from './appActions';
import { Modal, notification } from 'antd';

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

export interface IBoMethod {
  propertyName?: string;
  subBoName?: string;
  ipfCcmBoMethodId?: string;
  gridEditType?: string;
  description?: string;
  subBoOrderNo?: number;
  subBoRelType?: string;
  ipfCcmBoMethodColumns?: IBoMethodColumn[];
  ipfCcmBoId?: string;
  linkBoName?: string;
  [key: string]: any;
}

export interface IBoMethodColumn {
  baseViewId: string;
  method: string;
  columnName: string;
  commitRemark: string;
  configItemCode: string;
  currentViewId: string;
  ipfCcmBoMethodColumnId: string;
  ipfCcmBoMethodId: string;
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

export interface IMethodsState {
  boTreeSource: IBoTreeSourceItem[];
  selectedBoTreeItem: string;
  methods: _.Dictionary<IBoMethod[]>;
}

const initMethodsState: IMethodsState = {
  boTreeSource: [],
  selectedBoTreeItem: null,
  methods: {},
};

export interface IMethodsModel extends Model {
  state: IMethodsState;
  reducers: {
    [key: string]: (state: IMethodsState, action: Action) => IMethodsState;
  };
}

export const methodsModel: IMethodsModel = {

  namespace: NAMESPACE,

  state: initMethodsState,

  reducers: {
    [ActionTypes.SetBoTreeSource](state, { boTreeSource }: ISetBoTreeSourceAction) {
      return produce(state, draft => {
        draft.boTreeSource = boTreeSource;
      });
    },

    [ActionTypes.SetMethods](state, { ipfCcmBoId, methods }: ISetMethodsAction) {
      return produce(state, draft => {
        draft.methods[ipfCcmBoId] = methods;
      });
    },

    [ActionTypes.ResetMethods](state) {
      return produce(state, draft => {
        draft.methods = {};
      });
    },

    [ActionTypes.SelectBoTreeItem](state, { id }: ISelectBoTreeItemAction) {
      return produce(state, draft => {
        draft.selectedBoTreeItem = id;
      });
    },

  },

  effects: {
    *[ActionTypes.LoadMethodsEffect]({ force }: ILoadMethodsEffect, { put, call, select }) {
      const { params }: IAppState = yield select((s: any) => s.APP);
      const methodsState: IMethodsState = yield select((s: any) => s.METHODS);
      let baseViewId: string = params.baseViewId;
      let ipfCcmBoId: string = params.ipfCcmBoId;
      if (methodsState.selectedBoTreeItem) {
        const selectedBoTreeItem = getSelectBoTreeItem(methodsState);
        baseViewId = selectedBoTreeItem?.baseViewId || params.baseViewId;
        ipfCcmBoId = selectedBoTreeItem?.id || params.ipfCcmBoId;
      }

      if (!force && methodsState.methods[ipfCcmBoId]) {
        console.log('[LoadMethodsEffect] 方法定义已加载，不再重复加载:', ipfCcmBoId);
        return;
      }

      const result = yield call(loadBoMethods, { baseViewId, ipfCcmBoId });
      yield put(createSetMethodsAction(ipfCcmBoId, result));
    },

    *[ActionTypes.DeleteMethodsEffect]({ ids }: IDeleteMethodsEffect, { put, call, select }) {
      const { params }: IAppState = yield select((s: any) => s.APP);
      const methodsState: IMethodsState = yield select((s: any) => s.METHODS);
      let baseViewId: string = params.baseViewId;
      if (methodsState.selectedBoTreeItem) {
        const selectedBoTreeItem = getSelectBoTreeItem(methodsState);
        baseViewId = selectedBoTreeItem?.baseViewId || params.baseViewId;
      }
      let result;
      yield put(createSetIsLoadingAction(true, true));
      try {
        result = yield call(deleteBoMethods, { ids, baseViewId });
        notification.success({
          message: '提示',
          description: result?.msg || '删除成功。',
        });
      } catch (e) {
        Modal.error({
          content: e?.msg || '删除失败。',
        });
      } finally {
        yield put(createSetIsLoadingAction(false, true));
      }
      console.log('[DeleteMethodsEffect]', result);
    },

    *[ActionTypes.SaveOrUpdateMethodEffect]({ data, editType, callback }: ISaveOrUpdateMethodEffect, { put, call, select }) {
      const { params }: IAppState = yield select((s: any) => s.APP);
      const methodsState: IMethodsState = yield select((s: any) => s.METHODS);
      let baseViewId: string = params.baseViewId;
      if (methodsState.selectedBoTreeItem) {
        const selectedBoTreeItem = getSelectBoTreeItem(methodsState);
        baseViewId = selectedBoTreeItem?.baseViewId || params.baseViewId;
      }
      yield put(createSetIsLoadingAction(true, true));
      let result;
      try {
        result = yield call(saveOrUpdateBoMethod, { data, baseViewId, type: editType });
        notification.success({
          message: '提示',
          description: result?.msg || '保存成功。',
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
    *[ActionTypes.SaveOrUpdateMethodWatcher](__, { take, put, select }) {
      while (true) {
        yield take([
          `${ActionTypes.SaveOrUpdateMethodEffect}/@@end`,
          `${ActionTypes.DeleteMethodsEffect}/@@end`,
        ]);
        yield put(createLoadBoTreeSourceEffect(false));
        const methodsState: IMethodsState = yield select((s: any) => s.METHODS);
        const selectedBoTreeItem = getSelectBoTreeItem(methodsState);
        yield put(createResetMethodsAction());
        yield put(createSelectBoTreeItemAction(selectedBoTreeItem?.id));
      }
    },

    *[ActionTypes.SelectBoTreeItemWatcher](__, { take, put }) {
      while (true) {
        yield take([
          ActionTypes.SelectBoTreeItem,
        ]);
        yield put(createLoadMethodsEffect(false, false));
      }
    },
  },

  subscriptions: {
    watchActions({ dispatch }) {
      dispatch(createSelectBoTreeItemWatcher());
      dispatch(createSaveOrUpdateMethodWatcher());
    },
  },

};
