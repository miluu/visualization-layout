import * as React from 'react';
import { Model } from 'dva';
import { Action } from 'redux';
import produce from 'immer';
import { Modal, message } from 'antd';
import qs from 'qs';
import { Location } from 'history';
import * as _ from 'lodash';
import * as moment from 'moment';

import {
  NAMESPACE,
  ActionTypes,
  ISetIsLoadingAction,
  ISetDictsAction,
  ILoadDictsEffect,
  createSetIsLoadingAction,
  createSetDictsAction,
  ISetEditorStatusAction,
  IZoomToAction,
  createSetParamsAction,
  ISetParamsAction,
  ISetSidebarWidthAction,
  ISetSelectionRangeAction,
  createSetSelectionRangeAction,
  createUpdateSelectionRangeEffect,
  ISetIsOnlyShowMainAction,
  createDoUpdateSelectionRangeEffect,
  createVisualizationSaveEffect,
  createPrototypeSaveEffect,
  createDatasourceBindingSaveEffect,
  ISetKeyValueAction,
  createSetKeyValueAction,
  ISaveEffect,
  IPrototypeSaveEffect,
  IVisualizationSaveEffect,
  createTemplateSaveEffect,
  ITemplateSaveEffect,
  ILoadTemplateRelationsEffect,
  ISaveAsTemplateEffect,
  createLoadComponentGroupSourceEffect,
  createGetSessionAttrsEffect,
  IGetSessionAttrsEffect,
  IChangeLocaleEffect,
  createChangeLocaleEffect,
  // createExportJsonEffect,
} from './appActions';
import { queryDicts, queryComponentGroup, queryViews, getSessionAttrsAndNoPermits, exportJsonFile } from '../services';
import { ROUTER_TITLES, EditorStatus, ZOOMS, DeviceType, SIDEBAR_SPLIT_WIDTH, DEFAULT_SIDEBAR_WIDTH_RIGHT, DEFAULT_SIDEBAR_WIDTH, ROW_STATUS } from '../config';
import {
  /* getOffset,  */
  delay,
  getFieldsJsonObj,
  diffLayoutsRowStatus,
  findLayoutByCellName,
  findElementById,
  transformUiType,
  checkUiType,
  checkExactMatch,
  confirm,
  findChildren,
  createGridSourceFromColumns,
  diffDatasourcesRowStatus,
} from 'src/utils';
import { ILayoutsState } from './layoutsModel';
import { ActionTypes as LayoutsActionTypes, createSelectElementAction } from './layoutsActions';
import { IPagesState } from './pagesModel';
import { savePrototypePage, savePrototypePageInfoById } from 'src/routes/Prototype/service';
import { PROTOTYPE_CONFIG } from 'src/routes/Prototype/config';
import { createSetPageListAction } from './pagesActions';
import { VISUALIZATION_CONFIG } from 'src/routes/Visualization/config';
import { formatSaveData } from 'src/routes/Visualization/formatSaveData';
import { formatSaveData as formateTemplateSaveData, formatLayoutsFromVisualization, createTemplateTableSaveData, createRelationsTreeFromDatasource } from 'src/routes/Template/formatSaveData';
import { saveVisualizationPage } from 'src/routes/Visualization/service';
import { ModalFuncProps } from 'antd/lib/modal';
import { TEMPLATE_CONFIG } from 'src/routes/Template/config';
import { saveTemplatePage, queryRelations, saveAsTemplate } from 'src/routes/Template/service';
import { validLayouts, IValidResult, validDataSourceBindingLayouts } from 'src/utils/validation';
import { IDatasourceState, TITLE_KEY } from './datasourceModel';
import { i18n, t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';
// import { UiLink } from 'src/ui/link';

export interface IDictItem {
  key: string;
  value: string;
}

export interface IDictsMap {
  [dictName: string]: IDictItem[];
}

export interface IDeviceInfo {
  type: DeviceType;
  width?: number;
  height?: number;
}

export interface ISelectionRange {
  width: number;
  height: number;
  top: number;
  left: number;

  isHorizontal?: boolean;
}

/**
 * 视图
 */
export interface IView {
  id: string;
  pid: string;
  name: string;
  [key: string]: any;
}

export interface IAppState {
  isLoading: boolean;
  loadingCount: number;
  dicts: IDictsMap;
  editorStatus: EditorStatus;
  zoom: number;
  deviceInfo: IDeviceInfo;
  title: string;

  sessionAttrs: any;
  showSessionModal: boolean;
  closeTime: Date;

  viewList: IView[];
  viewListLoadingStatus: 'LOADING' | 'LOADED' | 'ERROR';

  params: any;
  location: Location;
  isOnlyShowMain?: boolean;
  locale: string;

  sidebarWidthLeft: number;
  sidebarWidthRight: number;
  sidebarSplitWidth: number;

  selectionRange: ISelectionRange;

  isSaveing: boolean; // 保存中

  [key: string]: any;
}

const initDeviceInfo: IDeviceInfo = {
  type: DeviceType.WEB,
};

const initAppState: IAppState = {
  isLoading: false,
  loadingCount: 0,
  dicts: {},
  editorStatus: EditorStatus.EDIT,
  zoom: ZOOMS['default'],
  deviceInfo: initDeviceInfo,
  params: {},
  location: {} as any,
  isOnlyShowMain: true,
  title: '',
  locale: null,

  sessionAttrs: null,
  showSessionModal: false,
  closeTime: null,

  /** 视图列表 */
  viewList: [],
  viewListLoadingStatus: null,

  sidebarSplitWidth: SIDEBAR_SPLIT_WIDTH,
  sidebarWidthLeft: DEFAULT_SIDEBAR_WIDTH,
  sidebarWidthRight: DEFAULT_SIDEBAR_WIDTH_RIGHT,

  selectionRange: null,
  isSaveing: false,
};

export interface IAppModel extends Model {
  state: IAppState;
  reducers: {
    [key: string]: (state: IAppState, action: Action) => IAppState;
  };
}

export const appModel: IAppModel = {

  namespace: NAMESPACE,

  state: initAppState,

  reducers: {
    [ActionTypes.SetIsLoading](state, { isLoading }: ISetIsLoadingAction) {
      return produce(state, draft => {
        draft.loadingCount += isLoading ? 1 : -1;
        if (draft.loadingCount > 0) {
          draft.isLoading = true;
        } else {
          draft.isLoading = false;
        }
      });
    },

    [ActionTypes.SetSidebarWidth](state, { width, pos }: ISetSidebarWidthAction) {
      return produce(state, draft => {
        const key = pos === 'right' ? 'sidebarWidthRight' : 'sidebarWidthLeft';
        draft[key] = width;
      });
    },

    [ActionTypes.SetDicts](state, { dicts }: ISetDictsAction) {
      return produce(state, draft => {
        draft.dicts = _.assign({}, state.dicts, dicts);
      });
    },

    [ActionTypes.SetEditorStatus](state, { status }: ISetEditorStatusAction) {
      return produce(state, draft => {
        draft.editorStatus = status;
      });
    },

    [ActionTypes.ZoomTo](state, { zoom }: IZoomToAction) {
      return produce(state, draft => {
        let _zoom = zoom;
        if (_zoom < ZOOMS.min) {
          _zoom = ZOOMS.min;
        } else if (_zoom > ZOOMS.max) {
          _zoom = ZOOMS.max;
        }
        draft.zoom = _zoom;
      });
    },

    [ActionTypes.SetParams](state, { params, location }: ISetParamsAction) {
      return produce(state, draft => {
        draft.params = params;
        draft.location = location;
      });
    },

    [ActionTypes.SetSelectionRange](state, { range }: ISetSelectionRangeAction) {
      return produce(state, draft => {
        draft.selectionRange = range;
      });
    },

    [ActionTypes.SetIsOnlyShowMain](state, { isOnlyShowMain }: ISetIsOnlyShowMainAction) {
      return produce(state, draft => {
        draft.isOnlyShowMain = isOnlyShowMain;
      });
    },

    [ActionTypes.SetKeyValue](state, { key, value }: ISetKeyValueAction) {
      return produce(state, draft => {
        draft[key] = value;
      });
    },

  },

  effects: {
    *[ActionTypes.LoadDictsEffect]({ dictNames, extDicts }: ILoadDictsEffect, { call, put }) {
      let dicts: IDictsMap = {};
      const _extDicts = extDicts || {};
      yield put(createSetIsLoadingAction(true, false));
      try {
        dicts = yield call(queryDicts, dictNames);
      } catch (e) {
        console.log('[LoadDictsEffect]', e);
        Modal.error({
          title: t(I18N_IDS.TEXT_TIPS),
          content: '数据字典加载失败。',
        });
        yield put(createSetIsLoadingAction(false, false));
        return;
      }
      yield put(createSetIsLoadingAction(false, false));
      if (dicts['success']) {
        yield put(createSetDictsAction({
          ...dicts,
          ..._extDicts,
        }));
        console.log('[LoadDictsEffect]', dicts);
      } else {
        Modal.error({
          title: t(I18N_IDS.TEXT_TIPS),
          content: '数据字典加载失败。',
        });
      }
    },

    *[ActionTypes.DoUpdateSelectionRangeEffect](__, { put, select }) {
      console.log('[DoUpdateSelectionRangeEffect]');
      const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
      if (!layoutsState) {
        console.log('[DoUpdateSelectionRangeEffect] layoutsState is not ready.');
        return;
      }
      const { selectedLayout, selectedElement, layouts, config }: ILayoutsState<any> = layoutsState;
      let selectedDomId: string;
      let isHorizontal = false;
      if (selectedLayout) {
        selectedDomId = `editor-layout-${selectedLayout}`;
        const selectedLayoutObj = findLayoutByCellName(layouts, selectedLayout, config.cellNameKey);
        // TAB / COL 为水平方向
        if (selectedLayoutObj && (
          selectedLayoutObj.layoutContainerType === 'TAB'
          || selectedLayoutObj.layoutContainerType === 'DIV' && selectedLayoutObj.unitCount > 0 && selectedLayoutObj.unitCount < 12
        )) {
          isHorizontal = true;
        }
      } else if (selectedElement) {
        selectedDomId = `editor-element-${selectedElement}`;
        const findResult = findElementById(layouts, selectedElement, config.childrenElementsKey, config.elementIdKey, true);
        if (findResult) {
          const {
            element: selectedElementObj,
            parentLayout,
          } = findResult;
          if (
            selectedElementObj.layoutElementType === 'BUTTON'
            || selectedElementObj.layoutElementType === 'BUTTON_GROUP'
            || selectedElementObj.layoutElementType === 'DYNA_COMB_QUERY'
            || selectedElementObj.layoutElementType === 'DYNA_MORE_QUERY'
            || selectedElementObj.layoutElementType === 'DYNA_MORE_QUERY'
            || parentLayout.layoutElementType === 'GRID'
            || parentLayout.layoutElementType === 'LIST_VIEW'
          ) {
            isHorizontal = true;
          }
        }
      }
      let range = null;
      const selectedDom = document.getElementById(selectedDomId);
      if (selectedDom) {
        range = selectedDom.getBoundingClientRect();
      }
      if (range) {
        if (selectedLayout) {
          const selectedLayoutObj = findLayoutByCellName(layouts, selectedLayout, config.cellNameKey);
          // TAB / COL 为水平方向
          if (selectedLayoutObj && (
            selectedLayoutObj.layoutContainerType === 'TAB'
            || selectedLayoutObj.layoutContainerType === 'DIV' && selectedLayoutObj.unitCount > 0 && selectedLayoutObj.unitCount < 12
          )) {
            isHorizontal = true;
          }
        } else if (selectedElement) {
          const findResult = findElementById(layouts, selectedElement, config.childrenElementsKey, config.elementIdKey, true);
          if (findResult) {
            const {
              element: selectedElementObj,
              parentLayout,
            } = findResult;
            const uiTypeStr = transformUiType(selectedElementObj.uiType);
            if (
              selectedElementObj.layoutElementType === 'BUTTON'
              || selectedElementObj.layoutElementType === 'BUTTON_GROUP'
              || selectedElementObj.layoutElementType === 'DYNA_COMB_QUERY'
              || selectedElementObj.layoutElementType === 'DYNA_MORE_QUERY'
              || selectedElementObj.layoutElementType === 'DYNA_MORE_QUERY'
              || parentLayout.layoutElementType === 'GRID'
              || parentLayout.layoutElementType === 'LIST_VIEW'
              || uiTypeStr === 'button'
              || uiTypeStr === 'checkbox'
              || uiTypeStr === 'static'
            ) {
              isHorizontal = true;
            }
          }
        }
      }
      yield put(createSetSelectionRangeAction(range && {
        isHorizontal,
        left: range.left,
        top: range.top,
        width: range.width,
        height: range.height,
      }));
    },

    [ActionTypes.UpdateSelectionRangeEffect]: [function* (__, { put }) {
      yield put(createDoUpdateSelectionRangeEffect(false));
    }, {
      type: 'throttle',
      ms: 300,
    } as any],

    *[ActionTypes.SaveEffect] ({ successCallback, failedCallback }: ISaveEffect, { put, select }) {
      const { location, isSaveing }: IAppState = yield select((s: any) => s.APP);
      const { initLayouts, layouts }: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
      const datasourceState: IDatasourceState = yield select((s: any) => s.DATASOURCE);
      let isModified = false;

      if (isSaveing) {
        message.warn('保存操作尚未完成, 请勿重复操作。');
        return;
      }
      if (
        layouts !== initLayouts
        || datasourceState && datasourceState.source !== datasourceState.initSource
      ) {
        isModified = true;
      }
      if (!isModified) {
        Modal.info({
          content: '布局未修改，无需保存。',
        });
        return;
      }
      yield put(createSetKeyValueAction('isSaveing', true));
      switch (location.pathname) {
        case '/':
          yield put['resolve'](createVisualizationSaveEffect(successCallback, failedCallback, false));
          break;
        case '/prototype':
          yield put['resolve'](createPrototypeSaveEffect(successCallback, failedCallback, false));
          break;
        case '/datasourceBinding':
          yield put['resolve'](createDatasourceBindingSaveEffect(successCallback, failedCallback, false));
          break;
        case '/template':
          yield put['resolve'](createTemplateSaveEffect(successCallback, failedCallback, false));
        default:
          break;
      }
      yield put(createSetKeyValueAction('isSaveing', false));
    },

    /**
     * 对象建模可视化保存
     */
    *[ActionTypes.VisualizationSaveEffect] ({ successCallback, failedCallback }: IVisualizationSaveEffect, { put, select, call }) {
      const { params, location }: IAppState = yield select((s: any) => s.APP);
      const { layouts, initLayouts, originData, properties, config }: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
      const { currentPageId }: IPagesState<any> = yield select((s: any) => s.PAGES);
      console.log('[VisualizationSaveEffect]', params, layouts);

      const validResults = validDataSourceBindingLayouts(layouts, config);
      console.log('_validLayouts', validResults);
      if (validResults.length) {
        const checkDataSourceBindingConfirm: boolean =  yield call(confirm, {
          okText: '仍然保存',
          content: (function () {
            return (
              <>
                {
                  _.map(validResults, (r, i) => {
                    return (
                      <React.Fragment key={i}>
                        {
                          _.map(r.messages, (m, j) => {
                            return (
                              <React.Fragment key={j}>
                                { m }
                                <br />
                              </React.Fragment>
                            );
                          })
                        }
                      </React.Fragment>
                    );
                  })
                }
                <br />
                是否继续保存？
              </>
            );
          })(),
        } as ModalFuncProps);
        if (!checkDataSourceBindingConfirm) {
          return;
        }
      }

      // 校验联想控件是否有配置搜索帮助
      const checkUiTypeResult = checkUiType(layouts, properties, config.childrenElementsKey);
      if (!checkUiTypeResult.valid) {
        const checkUiTypeConfirm: boolean = yield call(confirm, {
          content: (
            <>
              {_.map(checkUiTypeResult.msgs, msg => {
                return (
                  <>
                    {msg}
                    <br />
                  </>
                );
              })}
              <br />
              是否继续保存？
            </>
          ),
          okText: '仍然保存',
        } as ModalFuncProps);
        if (!checkUiTypeConfirm) {
          yield put(createSelectElementAction(checkUiTypeResult.element[config.elementIdKey], {}, true));
          return;
        }
      }

      // 校验精确匹配控件
      const checkExactMatchResult = checkExactMatch(layouts, config.childrenElementsKey);
      if (!checkExactMatchResult.valid) {
        const checkExactMatchConfirm: boolean = yield call(confirm, {
          content: (
            <>
              {_.map(checkExactMatchResult.msgs, (msg, i) => {
                return (
                  <React.Fragment key={i}>
                    {msg}
                    <br />
                  </React.Fragment>
                );
              })}
              <br />
              是否继续保存？
            </>
          ),
          okText: '仍然保存',
        } as ModalFuncProps);
        if (!checkExactMatchConfirm) {
          yield put(createSelectElementAction(checkExactMatchResult.element[config.elementIdKey], {}, true));
          return;
        }
      }

      yield put(createSetIsLoadingAction(true, false));
      const diff = diffLayoutsRowStatus(layouts, initLayouts, currentPageId, VISUALIZATION_CONFIG as any, location.pathname);
      console.log(diff);
      const formtedData = formatSaveData(_.cloneDeep({
        boPageLayout: diff.layouts,
        boPgLoElement: diff.elements,
      }), {
        originData,
        ipfCcmBoPageId: currentPageId,
        ipfCcmBoId: params.ipfCcmBoId,
        configName: originData.configName,
        isPage: originData.isPage,
        baseViewId: params.baseViewId,
        // isClassicCase: 'false',
        // isSaveToModelTable: 'false',
      });
      formtedData['isFromMenuOfPage'] = params.isFromMenuOfPage,
      console.log('[VisualizationSaveEffect]', formtedData);
      try {
        const result = yield call(saveVisualizationPage, formtedData);
        if (result.success) {
          successCallback(result);
          console.log('[VisualizationSaveEffect]', result);
        } else {
          // yield put(createExportJsonEffect());
          failedCallback(result);
          console.warn('[VisualizationSaveEffect]', result);
        }
      } catch (e) {
        // yield put(createExportJsonEffect());
        failedCallback(e);
        console.warn('[VisualizationSaveEffect]', e);
      } finally {
        yield put(createSetIsLoadingAction(false, false));
      }
    },

    /**
     * 页面原型可视化保存
     */
    *[ActionTypes.PrototypeSaveEffect] ({ successCallback, failedCallback }: IPrototypeSaveEffect, { put, select, call }) {
      const { params, location }: IAppState = yield select((s: any) => s.APP);
      const { currentPageId, pageList }: IPagesState<any> = yield select((s: any) => s.PAGES);
      const { layouts, config, initLayouts }: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
      const { source: datasources, initSource }: IDatasourceState = yield select((s: any) => s.DATASOURCE);
      const validResults = validLayouts(layouts, config);
      if (validResults.length) {
        console.log('校验未通过', validResults);
        failedCallback({ validResults });
        return;
      }
      // 校验数据源
      if (_.find(datasources, s => !_.trim(s[TITLE_KEY]))) {
        failedCallback({
          validResults: [{
            messages: ['数据源名称不能为空。'],
            valid: false,
          } as IValidResult],
        });
        return;
      }
      if ((() => {
        const grouped = _.groupBy(datasources, s => _.trim(s[TITLE_KEY]));
        return _.find(grouped, arr => arr.length > 1);
      })()) {
        failedCallback({
          validResults: [{
            messages: ['数据源名称重复。'],
            valid: false,
          } as IValidResult],
        });
        return;
      }
      const json = getFieldsJsonObj(layouts, config);
      const currentPageIndex = _.findIndex(pageList, p => p[PROTOTYPE_CONFIG.pageIdKey] === currentPageId);
      const currentPage = pageList[currentPageIndex];
      if (currentPage) {
        // 保存页面信息(字段收集)
        try {
          const newPage = produce(currentPage, draft => {
            draft.collectioninfo = JSON.stringify(json);
            draft.rowStatus = ROW_STATUS.MODIFIED;
          });
          const result = yield call(savePrototypePageInfoById, newPage);
          if (result.ipfCcmOriginPage) {
            const newPageList = produce(pageList, draft => {
              draft[currentPageIndex] = result.ipfCcmOriginPage;
            });
            yield put(createSetPageListAction(newPageList, true));
          }
          console.log(result);
        } catch (e) {
          console.warn('[PrototypeSaveEffect]', e);
        }
      }
      const _dataSources = diffDatasourcesRowStatus(datasources, initSource);
      const _layouts = produce(layouts, draft => {
        _.forEach(draft, l => {
          if (l.layoutElementType === 'GRID') {
            const columns = l[config.childrenElementsKey];
            const titles = _.map(columns, c => c.fieldText);
            const source = createGridSourceFromColumns(columns);
            l.dropdownList = JSON.stringify({
              title: titles,
              source,
            });
          }
        });
      });
      let diff = diffLayoutsRowStatus(_layouts, initLayouts, currentPageId, PROTOTYPE_CONFIG as any, location.pathname, true, true);
      // 添加 baseViewId
      if (params.baseViewId) {
        diff = produce(diff, draft => {
          _.forEach(draft.elements, e => {
            if (!e.baseViewId) {
              e.baseViewId = params.baseViewId;
            }
          });
          _.forEach(draft.layouts, l => {
            if (!l.baseViewId) {
              l.baseViewId = params.baseViewId;
            }
          });
        });
      }

      console.log('[PrototypeSaveEffect]', json, diff);
      yield put(createSetIsLoadingAction(true, false));
      try {
        const result = yield call(savePrototypePage, {
          ipfCcmOriginPageLayouts: diff.layouts,
          ipfCcmOriginPgLoEles: diff.elements,
          originDataSources: _dataSources,
        });
        if (result.success) {
          successCallback(result);
          console.log('[PrototypeSaveEffect]', result);
        } else {
          // yield put(createExportJsonEffect());
          failedCallback(result);
          console.warn('[PrototypeSaveEffect]', result);
        }
      } catch (e) {
        // yield put(createExportJsonEffect());
        failedCallback(e);
        console.warn('[PrototypeSaveEffect]', e);
      } finally {
        yield put(createSetIsLoadingAction(false, false));
      }
    },

    /**
     * 经典案例向导可视化保存
     */
    *[ActionTypes.DatasourceBindingSaveEffect] (__, { select }) {
      const { params }: IAppState = yield select((s: any) => s.APP);
      const { layouts }: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
      console.log('[DatasourceBindingSaveEffect]', params, layouts);
    },

    /**
     * 模板保存
     */
    *[ActionTypes.TemplateSaveEffect] ({ successCallback, failedCallback }: ITemplateSaveEffect, { put, select, call }) {
      const { params, location }: IAppState = yield select((s: any) => s.APP);
      const { layouts, initLayouts, originData }: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
      const { currentPageId }: IPagesState<any> = yield select((s: any) => s.PAGES);
      console.log('[TemplateSaveEffect]', params, layouts);

      yield put(createSetIsLoadingAction(true, false));
      const diff = diffLayoutsRowStatus(layouts, initLayouts, currentPageId, TEMPLATE_CONFIG as any, location.pathname);
      console.log(diff);
      const formtedData = formateTemplateSaveData(_.cloneDeep({
        boPageLayout: diff.layouts,
        boPgLoElement: diff.elements,
      }), {
        originData,
        ipfCcmBoPageId: currentPageId,
        ipfCcmBoId: params.ipfCcmBoId,
        configName: originData.configName,
        isPage: originData.isPage,
        urlParams: params,
        // isClassicCase: 'false',
        // isSaveToModelTable: 'false',
      });
      formtedData['baseViewId'] = params.baseViewId;
      formtedData['isPage'] = 'true';
      formtedData['isFromMenuOfPage'] = 'false';
      formtedData['isClassicCase'] = 'false';
      formtedData['isSaveToModelTable'] = 'false';
      formtedData['id'] = currentPageId;

      console.log('[TemplateSaveEffect]', formtedData);
      try {
        const result = yield call(saveTemplatePage, formtedData);
        if (result.success) {
          successCallback(result);
          console.log('[TemplateSaveEffect]', result);
        } else {
          failedCallback(result);
          console.warn('[TemplateSaveEffect]', result);
        }
      } catch (e) {
        failedCallback(e);
        console.warn('[TemplateSaveEffect]', e);
      } finally {
        yield put(createSetIsLoadingAction(false, false));
      }
    },

    *[ActionTypes.LoadTemplateRelationsEffect]({ params }: ILoadTemplateRelationsEffect, { call, put }) {
      yield put(createSetIsLoadingAction(true, false));
      try {
        const result = yield call(queryRelations, params);
        const relations = result.IpfCcmRelationTrees || [];
        yield put(createSetKeyValueAction('relations', relations));
        yield put(createSetDictsAction({
          _Relations: _.map(relations, r => {
            return {
              key: r.subBoName,
              value: r.subBoName,
            };
          }),
        }, false));
      } catch (e) {
        console.error(e);
      } finally {
        yield put(createSetIsLoadingAction(false, false));
      }
    },

    *[ActionTypes.SaveAsTemplateEffect]({ templateType, formValues }: ISaveAsTemplateEffect, { call, select, put }) {
      const { params, location }: IAppState = yield select((s: any) => s.APP);
      const { layouts, selectedLayout, config }: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
      const datasourceState: IDatasourceState = yield select((s: any) => s.DATASOURCE);
      const { currentPageId, pageList }: IPagesState<any> = yield select((s: any) => s.PAGES);
      const page = _.find(pageList, p => p[VISUALIZATION_CONFIG.pageIdKey] === currentPageId);
      const willSaveLayouts = templateType === 'TEMPLATE'
        ? layouts
        : findChildren(
          layouts,
          [selectedLayout],
          config.cellNameKey,
          config.parentCellNameKey,
          config.childrenElementsKey,
          config.elementIdKey,
          config.layoutElementIdKey || config.elementIdKey,
          true,
        );
      console.log('[SaveAsTemplateEffect] willSaveLayouts:', willSaveLayouts);
      const datasource = datasourceState && datasourceState.source || [];
      const isOriginPage = location.pathname === '/prototype';
      const formatedData = formatLayoutsFromVisualization(
        _.cloneDeep(willSaveLayouts),
        params,
        templateType === 'TEMPLATE' ? null : selectedLayout,
        isOriginPage,
        datasource,
      );
      const ipfCcmRelations = createRelationsTreeFromDatasource(datasource);
      console.log('[SaveAsTemplateEffect] formatedData:', formatedData);
      formatedData['baseViewId'] = params.baseViewId;
      formatedData['isPage'] = 'true';
      formatedData['isFromMenuOfPage'] = 'false';
      formatedData['isClassicCase'] = 'false';
      formatedData['isSaveToModelTable'] = 'false';
      formatedData['id'] = null;
      const { queryCriteriaLayout, lableLayout } = formatedData;
      formatedData.lableLayout = undefined;
      formatedData.queryCriteriaLayout = undefined;
      const postData = {
        groupPageLayout: formatedData,
        ipfCcmBoPageLayoutTable: createTemplateTableSaveData({
          layoutCode: formValues.values.layoutCode,
          layoutName: formValues.values.layoutName,
          layoutType: formValues.values.layoutType,
          baseViewId: params.baseViewId,
          pageType: page && page.pageType,
          pageName: page && page.pageName,
          description: page && page.description,
          componentType: templateType === 'TEMPLATE' ? '' : 'X',
          queryCriteriaLayout,
          lableLayout,
          ipfCcmRelations,
        }),
        baseViewId: params.baseViewId,
        ipfCcmBoId: params.ipfCcmBoId,
        ipfCcmBoPageId: currentPageId,
        isOriginPage,
      };
      let result: any;
      try {
        result = yield call(saveAsTemplate, postData);
        if (result.success) {
          Modal.success({
            content: result.msg || '保存成功',
          });
          yield put(createLoadComponentGroupSourceEffect(true));
        } else {
          Modal.error({
            content: result.errMsg || result.msg || '保存失败',
          });
        }
      } catch (e) {
        Modal.error({
          content: (e && e.errMsg || e.msg) || e || '保存失败',
        });
      }
    },

    *[ActionTypes.LoadComponentGroupSourceEffect](__, { put, call }) {
      yield put(createSetKeyValueAction('isLoadingComponentGroup', true));
      let result: any;
      try {
        result = yield call(queryComponentGroup, VISUALIZATION_CONFIG);
        yield put(createSetKeyValueAction('componentGroupSource', result));
      } catch (e) {
        console.warn('[LoadComponentGroupSourceEffect]', e);
      } finally {
        yield put(createSetKeyValueAction('isLoadingComponentGroup', false));
      }
      console.log('[LoadComponentGroupSourceEffect]', result);
    },

    *[ActionTypes.ChangeLocaleEffect]({ locale }: IChangeLocaleEffect, { put, call }) {
      localStorage.setItem('locale', locale);
      i18n.setLng(locale);
      yield put(createSetKeyValueAction('locale', locale));
    },

    *[ActionTypes.LoadViewListEffect](__, { put, call }) {
      try {
        yield put(createSetKeyValueAction('viewListLoadingStatus', 'LOADING'));
        const views: IView[] = yield call(queryViews);
        yield put(createSetKeyValueAction('viewListLoadingStatus', 'LOADED'));
        yield put(createSetKeyValueAction('viewList', views));
      } catch (e) {
        console.warn(e);
        yield put(createSetKeyValueAction('viewListLoadingStatus', 'ERROR'));
      }
    },

    *[ActionTypes.GetSessionAttrsEffect]({ manual }: IGetSessionAttrsEffect, { call, put, select }) {
      const { showSessionModal, closeTime, sessionAttrs }: IAppState = yield select((s: any) => s.APP);
      // if (showSessionModal) {
      //   return;
      // }
      if (!manual && closeTime && +new Date() - +closeTime < 1000 * 60) {
        return;
      }
      if (closeTime) {
        yield put(createSetKeyValueAction('closeTime', null));
      }
      try {
        const result = yield call(getSessionAttrsAndNoPermits);
        if (!sessionAttrs) {
          yield put(createSetKeyValueAction('sessionAttrs', result));
          window['__sessionAttrs'] = result;
        }
        if (showSessionModal) {
          yield put(createSetKeyValueAction('showSessionModal', false));
        }
      } catch (e) {
        yield put(createSetKeyValueAction('sessionAttrs', null));
        window['__sessionAttrs'] = null;
        if (e === 'NOT_LOGIN' && !showSessionModal) {
          yield put(createSetKeyValueAction('showSessionModal', true));
        }
      }
    },

    *[ActionTypes.ExportJsonEffect](__, { select, call }) {
      const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
      const datasourceState: IDatasourceState = yield select((s: any) => s.DATASOURCE);
      const pagesState: IPagesState<any> = yield select((s: any) => s.PAGES);
      const appState: IAppState = yield select((s: any) => s.APP);
      const { currentPageId } = pagesState;
      const { layouts } = layoutsState;
      const source = datasourceState && datasourceState.source;
      const { params, location } = appState;
      const { baseViewId, ipfCcmBoId } = params;
      const now = new Date();
      const filename = `GLPAAS EXPORT ${moment(now).format('YYYY-MM-DD HH-mm-ss')}`;
      exportJsonFile(filename, {
        info: {
          baseViewId,
          ipfCcmBoId,
          pageId: currentPageId,
          type: location.pathname,
          exportTime: now,
        },
        layouts,
        datasource: source,
      });
      yield call(delay, 1000);
      message.info(`当前页面布局已导出为 [ ${filename}.json ], 请查看浏览器下载目录.`);
    },

    *[ActionTypes.WatchSelectionRangeEffect](__, { put, take, call }) {
      while (true) {
        yield take([
          `${ActionTypes.SetSidebarWidth}`,
          `LAYOUTS/${LayoutsActionTypes.SelectLayout}`,
          `LAYOUTS/${LayoutsActionTypes.SelectElement}`,
          `LAYOUTS/${LayoutsActionTypes.DisSelect}`,
          `LAYOUTS/${LayoutsActionTypes.ReplaceLayouts}`,
          // `LAYOUTS/${LayoutsActionTypes.SetRootElementId}`,
        ]);
        yield call(delay, 0);
        yield put(createUpdateSelectionRangeEffect(false));
      }
    },

  },

  subscriptions: {
    routerChange(api) {
      return api.history.listen(history => {
        // 读取语言
        const local = localStorage.getItem('locale') || 'zh-cn';
        api.dispatch(createChangeLocaleEffect(local, false));

        const title = t(ROUTER_TITLES[history.pathname] || ROUTER_TITLES['*']);
        const glpaasTitle = t(ROUTER_TITLES['*']);
        let urlParams: any;
        if (history.pathname === '/datasourceBinding') {
          urlParams = qs.parse(window.parent.location.search, { ignoreQueryPrefix: true });
        } else {
          urlParams = qs.parse(history.search, { ignoreQueryPrefix: true });
        }
        console.log('[routerChange] params:', urlParams);
        api.dispatch(createSetParamsAction(history, urlParams));

        // 设置标题
        document.title = `${glpaasTitle} - ${title}`;
        api.dispatch(createSetKeyValueAction('title', title));

      });
    },

    resize(api) {
      window.addEventListener('resize', resizeCb);

      return function () {
        window.removeEventListener('resize', resizeCb);
      };

      function resizeCb() {
        api.dispatch(createUpdateSelectionRangeEffect(false));
      }
    },

    checkLogin(api) {
      api.dispatch(createGetSessionAttrsEffect(true, false));
      const timmer = setInterval(() => {
        api.dispatch(createGetSessionAttrsEffect(false, false));
      }, 15000);
      return function () {
        clearInterval(timmer);
      };
    },
  },
};
