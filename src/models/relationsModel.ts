import { Model } from 'dva';
import { Action } from 'redux';
import produce from 'immer';
import { ActionTypes, NAMESPACE, ISetBoTreeSourceAction, ILoadBoTreeSourceEffect, createSetBoTreeSourceAction } from './relationsAction';
import { ILoadBoTreeSourceOptions, loadBoTreeSource } from 'src/services/relations';
import { IAppState } from './appModel';

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

export interface IRelationsState {
  boTreeSource: IBoTreeSourceItem[];
}

const initRelationsState: IRelationsState = {
  boTreeSource: [],
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
  },

};
