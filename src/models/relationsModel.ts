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

export interface IBoRelation {
  propertyName?: string;
  subBoName?: string;
  ipfCcmBoRelationId?: string;
  gridEditType?: string;
  description?: string;
  subBoOrderNo?: number;
  subBoRelType?: string;
  ipfCcmBoRelationColumns?: IBoRelationColumn[];
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
  rowStatus: string;
  seqNo: number;
  subColumnName: string;
  subPropertyName: string;
  workFlowTaskId: string;
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
