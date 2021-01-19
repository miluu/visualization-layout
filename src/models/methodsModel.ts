import { Model } from 'dva';
import { Action } from 'redux';
import produce from 'immer';
import {
  ActionTypes,
  NAMESPACE,
  ILoadMethodsEffect,
  ISetMethodsAction,
  createSetMethodsAction,
  // createLoadMethodsEffect,
  IDeleteMethodsEffect,
  ISaveOrUpdateMethodEffect,
  createSaveOrUpdateMethodWatcher,
  createResetMethodsAction,
  createLoadBoTreeSourceEffect,
} from './methodsAction';
import { deleteBoMethods, loadBoMethods, saveOrUpdateBoMethod } from 'src/services/methods';
import { IAppState } from './appModel';
import { createSetIsLoadingAction } from './appActions';
import { Modal, notification } from 'antd';

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
  businessType: string;
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
  methods: _.Dictionary<IBoMethod[]>;
}

const initMethodsState: IMethodsState = {
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

  },

  effects: {
    *[ActionTypes.LoadMethodsEffect]({ force }: ILoadMethodsEffect, { put, call, select }) {
      const { params }: IAppState = yield select((s: any) => s.APP);
      const methodsState: IMethodsState = yield select((s: any) => s.METHODS);
      const baseViewId: string = params.baseViewId;
      const ipfCcmBoId: string = params.ipfCcmBoId;

      if (!force && methodsState.methods[ipfCcmBoId]) {
        console.log('[LoadMethodsEffect] 子对象关系已加载，不再重复加载:', ipfCcmBoId);
        return;
      }

      const result = yield call(loadBoMethods, { baseViewId, ipfCcmBoId });
      yield put(createSetMethodsAction(ipfCcmBoId, result));
    },

    *[ActionTypes.DeleteMethodsEffect]({ ids }: IDeleteMethodsEffect, { put, call, select }) {
      const { params }: IAppState = yield select((s: any) => s.APP);
      // const methodsState: IMethodsState = yield select((s: any) => s.METHODS);
      const baseViewId: string = params.baseViewId;
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
      // const methodsState: IMethodsState = yield select((s: any) => s.METHODS);
      const baseViewId: string = params.baseViewId;
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
        yield put(createResetMethodsAction());
      }
    },
  },

  subscriptions: {
    watchActions({ dispatch }) {
      dispatch(createSaveOrUpdateMethodWatcher());
    },
  },

};
