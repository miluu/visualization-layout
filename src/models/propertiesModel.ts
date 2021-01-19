import { Model } from 'dva';
import { Action } from 'redux';
import produce from 'immer';
import {
  ActionTypes,
  NAMESPACE,
  ILoadPropertiesEffect,
  ISetPropertiesAction,
  ISetBoTreeSourceAction,
  ISelectBoTreeItemAction,
  createSetPropertiesAction,
  createLoadPropertiesEffect,
  IDeletePropertiesEffect,
  ISaveOrUpdatePropertyEffect,
  createSaveOrUpdatePropertyWatcher,
  createSelectBoTreeItemWatcher,
  createResetPropertiesAction,
} from './propertiesAction';
// import { createSelectBoTreeItemWatcher } from './relationsAction';
import { IBoTreeSourceItem } from './relationsModel';
import { deleteBoProperties, loadBoProperties, saveOrUpdateBoProperty } from 'src/services/properties';
import { IAppState } from './appModel';
import { createSetIsLoadingAction } from './appActions';
import { Modal, notification } from 'antd';

export interface IBoProperty {
  propertyName?: string;
  columnName?: string;
  propertyType?: string;
  isKey?: string;
  tableName?: string;
  tableAliasName?: string;
  physicalColumnName?: string;
  isNotNull?: string;

  elementCode?: string;
  fieldText?: string;
  dataType?: string;
  fieldLength?: number;
  decimals?: number;
  uiType?: string;

  searchHelp?: string;
  refProName?: string;
  searchHelpViewDesc?: string;

  dictTableName?: string;
  dictGroupValue?: string;

  ipfCcmBoPropertyId?: string;
  ipfCcmBoId?: string;
  ipfCcmBoPropertyCass?: IBoPropertyCas[];
  linkBoName?: string;
  [key: string]: any;
}

export interface IBoPropertyCas {
  ipfCcmBoPropertyCasId: string;
  ipfCcmBoPropertyId: string;
  targetPropertyName: string;
  operation: string;
  cascadePropertyName: string;
  type: string;
  baseViewId: string;
  rowStatus: number;
  [key: string]: any;
}

export interface IPropertiesState {
  boTreeSource: IBoTreeSourceItem[];
  selectedBoTreeItem: string;
  properties: _.Dictionary<IBoProperty[]>;
}

const initPropertiesState: IPropertiesState = {
  boTreeSource: [],
  selectedBoTreeItem: null,
  properties: {},
};

export interface IPropertiesModel extends Model {
  state: IPropertiesState;
  reducers: {
    [key: string]: (state: IPropertiesState, action: Action) => IPropertiesState;
  };
}

export const propertiesModel: IPropertiesModel = {

  namespace: NAMESPACE,

  state: initPropertiesState,

  reducers: {
    [ActionTypes.SetBoTreeSource](state, { boTreeSource }: ISetBoTreeSourceAction) {
      return produce(state, draft => {
        draft.boTreeSource = boTreeSource;
      });
    },

    [ActionTypes.SetProperties](state, { ipfCcmBoId, properties }: ISetPropertiesAction) {
      return produce(state, draft => {
        draft.properties[ipfCcmBoId] = properties;
      });
    },

    [ActionTypes.ResetProperties](state) {
      return produce(state, draft => {
        draft.properties = {};
      });
    },

    [ActionTypes.SelectBoTreeItem](state, { id }: ISelectBoTreeItemAction) {
      return produce(state, draft => {
        draft.selectedBoTreeItem = id;
      });
    },
  },

  effects: {

    *[ActionTypes.LoadPropertiesEffect]({ force }: ILoadPropertiesEffect, { put, call, select }) {
      const { params }: IAppState = yield select((s: any) => s.APP);
      const propertiesState: IPropertiesState = yield select((s: any) => s.PROPERTIES);
      const baseViewId: string = params.baseViewId;
      const ipfCcmBoId: string = params.ipfCcmBoId;

      if (!force && propertiesState.properties[ipfCcmBoId]) {
        console.log('[LoadPropertiesEffect] 属性定义已加载，不再重复加载:', ipfCcmBoId);
        return;
      }

      const result = yield call(loadBoProperties, { baseViewId, ipfCcmBoId });
      yield put(createSetPropertiesAction(ipfCcmBoId, result));
    },

    *[ActionTypes.DeletePropertiesEffect]({ ids }: IDeletePropertiesEffect, { put, call, select }) {
      const { params }: IAppState = yield select((s: any) => s.APP);
      // const propertiesState: IPropertiesState = yield select((s: any) => s.PROPERTIES);
      const baseViewId: string = params.baseViewId;

      let result;
      yield put(createSetIsLoadingAction(true, true));
      try {
        result = yield call(deleteBoProperties, { ids, baseViewId });
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
      console.log('[DeletePropertiesEffect]', result);
    },

    *[ActionTypes.SaveOrUpdatePropertyEffect]({ data, editType, callback }: ISaveOrUpdatePropertyEffect, { put, call, select }) {
      const { params }: IAppState = yield select((s: any) => s.APP);
      // const propertiesState: IPropertiesState = yield select((s: any) => s.RELATIONS);
      const baseViewId: string = params.baseViewId;
      yield put(createSetIsLoadingAction(true, true));
      let result;
      try {
        result = yield call(saveOrUpdateBoProperty, { data, baseViewId, type: editType });
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
    *[ActionTypes.SaveOrUpdatePropertyWatcher](__, { take, put, select }) {
      while (true) {
        yield take([
          `${ActionTypes.SaveOrUpdatePropertyEffect}/@@end`,
          `${ActionTypes.DeletePropertiesEffect}/@@end`,
        ]);
        // yield put(createLoadBoTreeSourceEffect(false));
        // const propertiesState: IPropertiesState = yield select((s: any) => s.PROPERTIES);
        yield put(createResetPropertiesAction());
        yield put(createLoadPropertiesEffect(false, false));
      }
    },

    *[ActionTypes.SelectBoTreeItemWatcher](__, { take, put }) {
      while (true) {
        yield take([
          ActionTypes.SelectBoTreeItem,
        ]);
        yield put(createLoadPropertiesEffect(false, false));
      }
    },
  },

  subscriptions: {
    watchActions({ dispatch }) {
      dispatch(createSelectBoTreeItemWatcher());
      dispatch(createSaveOrUpdatePropertyWatcher());
    },
  },

};
