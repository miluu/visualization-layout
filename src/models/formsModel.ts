import { Action } from 'redux';
import { Model } from 'dva';
import produce from 'immer';

import {
  ActionTypes,
  ISetPropertyFormOptionsAction,
  createChangePropertyFormWatcherAction,
  createSetPropertyFormOptionsAction,
  ISetLayoutAndElementPropertyFormOptionsAction,
  ISetActiveFormKeyAction,
} from './formsActions';
import { ActionTypes as LayoutsActionTypes } from './layoutsActions';
import { VISUALIZATION_CONFIG } from 'src/routes/Visualization/config';
import { IFormItemOption } from 'src/utils/forms';

export const NAMESPACE = 'FORMS';

export interface IFormsState {
  propertyFormOptions: IFormItemOption[];

  layoutPropertyFormOptions: IFormItemOption[];
  elementPropertyFormOptions: IFormItemOption[];

  activeFormKey: string;
}

export interface IFormsModel extends Model {
  state: IFormsState;
  reducers: {
    [key: string]: (state: IFormsState, action: Action) => IFormsState;
  };
}

const initState: IFormsState = {
  propertyFormOptions: [],
  layoutPropertyFormOptions: [],
  elementPropertyFormOptions: [],
  activeFormKey: 'property',
};

export const formsModel: IFormsModel = {
  namespace: NAMESPACE,

  state: initState,

  reducers: {
    [ActionTypes.SetPropertyFormOptions](state, { options }: ISetPropertyFormOptionsAction) {
      return produce(state, draft => {
        draft.propertyFormOptions = options;
      });
    },

    [ActionTypes.SetLayoutAndElementPropertyFormOptions](state, { layoutPropertyFormOptions, elementPropertyFormOptions }: ISetLayoutAndElementPropertyFormOptionsAction) {
      return produce(state, draft => {
        draft.layoutPropertyFormOptions = layoutPropertyFormOptions;
        draft.elementPropertyFormOptions = elementPropertyFormOptions;
      });
    },

    [ActionTypes.SetActiveFormKey](state, { activeFormKey }: ISetActiveFormKeyAction) {
      return produce(state, draft => {
        draft.activeFormKey = activeFormKey;
      });
    },
  },

  effects: {
    *[ActionTypes.ChangePropertyFormWatcher](__, { take, put }) {
      while (true) {
        const action = yield take([
          `LAYOUTS/${LayoutsActionTypes.SelectLayout}`,
          `LAYOUTS/${LayoutsActionTypes.SelectElement}`,
          `LAYOUTS/${LayoutsActionTypes.DisSelect}`,
        ]);
        switch (action.type) {
          case `LAYOUTS/${LayoutsActionTypes.SelectLayout}`:
            yield put(createSetPropertyFormOptionsAction(VISUALIZATION_CONFIG.layoutPropertyFormOptions));
            break;
          case `LAYOUTS/${LayoutsActionTypes.SelectElement}`:
            yield put(createSetPropertyFormOptionsAction(VISUALIZATION_CONFIG.elementPropertyFormOptions));
            break;
          default:
            yield put(createSetPropertyFormOptionsAction([]));
            break;
        }
      }
    },
  },

  subscriptions: {
    watchActions({ dispatch }) {
      dispatch(createChangePropertyFormWatcherAction());
    },
  },
};
