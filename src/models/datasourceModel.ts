import * as _ from 'lodash';
import {
  NAMESPACE,
  ActionTypes,
  ISetSourceAction,
  IUpdateItemAction,
  IRemoveItemAction,
  IAddItemAction,
  IAddSubItemEffect,
  createAddItemAction,
  createSetSourceAction,
  ISetInitSourceAction,
  IOnDropEffect,
  createUpdateItemAction,
} from './datasourceActions';
import { Model } from 'dva';
import { Action } from 'redux';
import produce from 'immer';
import { createId } from 'src/utils';
import { IPagesState } from './pagesModel';
import { message } from 'antd';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';
import { DEFAULT_COLORS } from 'src/config';

export const ID_KEY = 'dataSourceId';
export const PID_KEY = 'dataSourcePid';
export const TITLE_KEY = 'dataSourceName';
export const BG_KEY = 'backgroundColor';
export const ORDER_KEY = 'seqNo';
export const PAGE_ID_KEY = 'ipfCcmOriginPageId';
export interface IDatasource {
  [BG_KEY]: string;
  [TITLE_KEY]: string;
  [ID_KEY]: string;
  [PID_KEY]: string;
  [PAGE_ID_KEY]: string;
  [ORDER_KEY]: number;
  rowStatus?: number;
}

export interface IDatasourceState {
  source: IDatasource[];
  initSource: IDatasource[];
}

const initDatasource: IDatasourceState = {
  source: [],
  initSource: [],
};

export interface IDatasourceModel extends Model {
  state: IDatasourceState;
  reducers: {
    [key: string]: (state: IDatasourceState, action: Action) => IDatasourceState;
  };
}

export const DatasourceModel: IDatasourceModel = {
  namespace: NAMESPACE,

  state: initDatasource,

  reducers: {
    [ActionTypes.SetSource](state: IDatasourceState, { source }: ISetSourceAction) {
      return produce(state, draft => {
        draft.source = source;
      });
    },
    [ActionTypes.SetInitSource](state: IDatasourceState, { source }: ISetInitSourceAction) {
      return produce(state, draft => {
        draft.initSource = source;
      });
    },
    [ActionTypes.UpdateItem](state: IDatasourceState, { values }: IUpdateItemAction) {
      const arr = _.isArray(values) ? values : [values];
      return produce(state, draft => {
        _.forEach(arr, _values => {
          const item = _.find(draft.source, i => i[ID_KEY] === _values[ID_KEY]);
          _.assign(item, _values);
        });
      });
    },
    [ActionTypes.AddItem](state: IDatasourceState, { item }: IAddItemAction) {
      return produce(state, draft => {
        draft.source.push(item);
      });
    },
    [ActionTypes.RemoveItem](state: IDatasourceState, { id }: IRemoveItemAction) {
      return produce(state, draft => {
        const source = draft.source;
        const groupedSource = _.groupBy(source, PID_KEY);
        const ids = [id];
        findChildrenIds(id);
        console.log('[RemoveItem]', ids);
        draft.source = _.filter(draft.source, item => {
          return !_.includes(ids, item[ID_KEY]);
        });
        function findChildrenIds(pid: string) {
          const childrenIds = _.map(groupedSource[pid] || [], item => item[ID_KEY]);
          ids.push(...childrenIds);
          _.forEach(childrenIds, findChildrenIds);
        }
      });
    },
  },

  effects: {
    *[ActionTypes.AddSubItemEffect]({ parentItem, callback }: IAddSubItemEffect, { put, select }) {
      const pagesState: IPagesState<any> = yield select((s: any) => s.PAGES);
      const { source }: IDatasourceState = yield select((s: any) => s.DATASOURCE);
      const { currentPageId } = pagesState;
      const id = createId('', true);
      const groupedSource = _.groupBy(source, s => s[PID_KEY] || '');
      const childrenSources = groupedSource[parentItem[ID_KEY]];
      const lastChild = _.maxBy(childrenSources, ORDER_KEY);
      const order = lastChild ? lastChild[ORDER_KEY] + 1 : 0;
      const newItem = {
        [PID_KEY]: parentItem[ID_KEY],
        [TITLE_KEY]: t(I18N_IDS.TEXT_DEFAULT_SUB_DATASOURCE_NAME),
        [BG_KEY]: DEFAULT_COLORS[_.random(DEFAULT_COLORS.length - 3)],
        [ID_KEY]: id,
        [PAGE_ID_KEY]: currentPageId,
        [ORDER_KEY]: order,
      };
      yield put(createAddItemAction(newItem));
      if (callback) {
        callback(newItem);
      }
    },
    *[ActionTypes.InitSourceEffect](__: IAddSubItemEffect, { put, select }) {
      const pagesState: IPagesState<any> = yield select((s: any) => s.PAGES);
      const { currentPageId } = pagesState;
      const source: IDatasource[] = [
        {
          [PID_KEY]: null,
          [TITLE_KEY]: t(I18N_IDS.TEXT_DEFAULT_MAIN_DATASOURCE_NAME),
          [BG_KEY]: null,
          [ID_KEY]: createId('', true),
          [PAGE_ID_KEY]: currentPageId,
          [ORDER_KEY]: 0,
        },
      ];
      yield put(createSetSourceAction(source));
    },
    *[ActionTypes.OnDropEffect]({ dropId, dragId, position }: IOnDropEffect, { put, select }) {
      const { source }: IDatasourceState = yield select((s: any) => s.DATASOURCE);
      const groupedSource = _.chain(source)
        .orderBy(ORDER_KEY)
        .groupBy(s => s[PID_KEY] || '')
        .value();
      const dropSource = _.find(source, s => s[ID_KEY] === dropId);
      const dragSource = _.find(source, s => s[ID_KEY] === dragId);
      let list: IDatasource[];
      let pid: string;
      if (!dropSource[PID_KEY] && position !== 0) {
        message.warn('不能移动到此位置。');
        return;
      }
      if (position === 0) {
        list = (groupedSource[dropSource[ID_KEY]] || []);
        list = _.filter(list, item => item !== dragSource);
        list = list.concat(dragSource);
        pid = dropSource[ID_KEY];
      } else {
        list = (groupedSource[dropSource[PID_KEY]] || []).concat();
        list = _.filter(list, item => item !== dragSource);
        let dropSourceIndex = _.findIndex(list, item => item === dropSource);
        if (position > 0) {
          dropSourceIndex++;
        }
        list.splice(dropSourceIndex, 0, dragSource);
        pid = dropSource[PID_KEY];
      }
      const willUpdateItems: Array<Partial<IDatasource>> = [];
      _.forEach(list, (item, index) => {
        if (item[ORDER_KEY] !== index || item[PID_KEY] !== pid) {
          willUpdateItems.push({
            [ID_KEY]: item[ID_KEY],
            [PID_KEY]: pid,
            [ORDER_KEY]: index,
          });
        }
      });
      if (willUpdateItems.length) {
        yield put(createUpdateItemAction(willUpdateItems));
      }
    },
  },

};
