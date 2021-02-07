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
  ILoadBusinessTypesEffect,
  ISetBusinessTypesAction,
  createSetBusinessTypesAction,
  createLoadBusinessTypesEffect,
  createSelectBoTreeItemWatcher,
  IDeleteBusinessTypesEffect,
  ISaveOrUpdateBusinessTypeEffect,
  createSaveOrUpdateBusinessTypeWatcher,
  createResetBusinessTypesAction,
  createLoadBoTreeSourceEffect,
  createSelectBoTreeItemAction,
} from './businessTypesAction';
import { deleteBoBusinessTypes, ILoadBoTreeSourceOptions, loadBoBusinessTypes, loadBoTreeSource, saveOrUpdateBoBusinessType, commitBoBusinessType } from 'src/services/businessTypes';
import { IAppState } from './appModel';
import { getSelectBoTreeItem } from 'src/utils/boBusinessTypes';
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

export interface IBoBusinessType {
  propertyName?: string;
  subBoName?: string;
  ipfCcmBoBusinessTypeId?: string;
  gridEditType?: string;
  description?: string;
  subBoOrderNo?: number;
  subBoRelType?: string;
  ipfCcmBoBusinessTypeColumns?: IBoBusinessTypeColumn[];
  ipfCcmBoId?: string;
  linkBoName?: string;
  [key: string]: any;
}

export interface IBoBusinessTypeColumn {
  baseViewId: string;
  businessType: string;
  columnName: string;
  commitRemark: string;
  configItemCode: string;
  currentViewId: string;
  ipfCcmBoBusinessTypeColumnId: string;
  ipfCcmBoBusinessTypeId: string;
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

export interface IBusinessTypesState {
  boTreeSource: IBoTreeSourceItem[];
  selectedBoTreeItem: string;
  businessTypes: _.Dictionary<IBoBusinessType[]>;
}

const initBusinessTypesState: IBusinessTypesState = {
  boTreeSource: [],
  selectedBoTreeItem: null,
  businessTypes: {},
};

export interface IBusinessTypesModel extends Model {
  state: IBusinessTypesState;
  reducers: {
    [key: string]: (state: IBusinessTypesState, action: Action) => IBusinessTypesState;
  };
}

export const businessTypesModel: IBusinessTypesModel = {

  namespace: NAMESPACE,

  state: initBusinessTypesState,

  reducers: {
    [ActionTypes.SetBoTreeSource](state, { boTreeSource }: ISetBoTreeSourceAction) {
      return produce(state, draft => {
        draft.boTreeSource = boTreeSource;
      });
    },

    [ActionTypes.SetBusinessTypes](state, { ipfCcmBoId, businessTypes }: ISetBusinessTypesAction) {
      return produce(state, draft => {
        draft.businessTypes[ipfCcmBoId] = businessTypes;
      });
    },

    [ActionTypes.ResetBusinessTypes](state) {
      return produce(state, draft => {
        draft.businessTypes = {};
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

    *[ActionTypes.LoadBusinessTypesEffect]({ force }: ILoadBusinessTypesEffect, { put, call, select }) {
      const { params }: IAppState = yield select((s: any) => s.APP);
      const businessTypesState: IBusinessTypesState = yield select((s: any) => s.BUSINESS_TYPES);
      let baseViewId: string = params.baseViewId;
      let ipfCcmBoId: string = params.ipfCcmBoId;
      if (businessTypesState.selectedBoTreeItem) {
        const selectedBoTreeItem = getSelectBoTreeItem(businessTypesState);
        baseViewId = selectedBoTreeItem?.baseViewId || params.baseViewId;
        ipfCcmBoId = selectedBoTreeItem?.id || params.ipfCcmBoId;
      }

      if (!force && businessTypesState.businessTypes[ipfCcmBoId]) {
        console.log('[LoadBusinessTypesEffect] 子对象关系已加载，不再重复加载:', ipfCcmBoId);
        return;
      }

      const result = yield call(loadBoBusinessTypes, { baseViewId, ipfCcmBoId });
      yield put(createSetBusinessTypesAction(ipfCcmBoId, result));
    },

    *[ActionTypes.DeleteBusinessTypesEffect]({ ids }: IDeleteBusinessTypesEffect, { put, call, select }) {
      const { params }: IAppState = yield select((s: any) => s.APP);
      const businessTypesState: IBusinessTypesState = yield select((s: any) => s.BUSINESS_TYPES);
      let baseViewId: string = params.baseViewId;
      if (businessTypesState.selectedBoTreeItem) {
        const selectedBoTreeItem = getSelectBoTreeItem(businessTypesState);
        baseViewId = selectedBoTreeItem?.baseViewId || params.baseViewId;
      }
      let result;
      yield put(createSetIsLoadingAction(true, true));
      try {
        result = yield call(deleteBoBusinessTypes, { ids, baseViewId });
        // 删除后自动提交
        /*if (result.success) {
          commitBoBusinessType({
            ids: ids.join(','),
            remark: '系统自动提交',
            baseViewId:  window['__urlParams']?.baseViewId,
          });
        }*/
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
      console.log('[DeleteBusinessTypesEffect]', result);
    },

    *[ActionTypes.SaveOrUpdateBusinessTypeEffect]({ data, editType, callback }: ISaveOrUpdateBusinessTypeEffect, { put, call, select }) {
      const { params }: IAppState = yield select((s: any) => s.APP);
      const businessTypesState: IBusinessTypesState = yield select((s: any) => s.BUSINESS_TYPES);
      let baseViewId: string = params.baseViewId;
      if (businessTypesState.selectedBoTreeItem) {
        const selectedBoTreeItem = getSelectBoTreeItem(businessTypesState);
        baseViewId = selectedBoTreeItem?.baseViewId || params.baseViewId;
      }
      yield put(createSetIsLoadingAction(true, true));
      let result;
      try {
        result = yield call(saveOrUpdateBoBusinessType, { data, baseViewId, type: editType });
        // 修改后自动提交
        debugger;
        if (result['ipfCcmBoBusinessType'] && result['ipfCcmBoBusinessType']['ipfCcmBoBusinessTypeId']) {
          commitBoBusinessType({
            ids: result['ipfCcmBoBusinessType']['ipfCcmBoBusinessTypeId'],
            remark: '系统自动提交',
            baseViewId:  window['__urlParams']?.baseViewId,
          });
        }
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
    *[ActionTypes.SaveOrUpdateBusinessTypeWatcher](__, { take, put, select }) {
      while (true) {
        yield take([
          `${ActionTypes.SaveOrUpdateBusinessTypeEffect}/@@end`,
          `${ActionTypes.DeleteBusinessTypesEffect}/@@end`,
        ]);
        yield put(createLoadBoTreeSourceEffect(false));
        const businessTypesState: IBusinessTypesState = yield select((s: any) => s.BUSINESS_TYPES);
        const selectedBoTreeItem = getSelectBoTreeItem(businessTypesState);
        yield put(createResetBusinessTypesAction());
        yield put(createSelectBoTreeItemAction(selectedBoTreeItem?.id));
      }
    },

    *[ActionTypes.SelectBoTreeItemWatcher](__, { take, put }) {
      while (true) {
        yield take([
          ActionTypes.SelectBoTreeItem,
        ]);
        yield put(createLoadBusinessTypesEffect(false, false));
      }
    },
  },

  subscriptions: {
    watchActions({ dispatch }) {
      dispatch(createSelectBoTreeItemWatcher());
      dispatch(createSaveOrUpdateBusinessTypeWatcher());
    },
  },

};
