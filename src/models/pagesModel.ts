import { Action } from 'redux';
import { Model } from 'dva';
import produce from 'immer';
import * as _ from 'lodash';

import {
  ActionTypes,
  ISetPageListAction,
  IAddPageAction,
  IDeletePageAction,
  IUpdatePageAction,
  createSetPageListAction,
  ISetExpandedPagesAction,
  createSetExpandedPagesAction,
  ISetCurrentPageIdAction,
  ISelectPageEffect,
  createSetCurrentPageIdAction,
  IDeletePageEffect,
  createDeletePageAction,
  IShowFormAction,
  ISetEditingPageAction,
  IEditPageEffect,
  createSetEditingPageAction,
  createShowFormAction,
  IAddSubPageEffect,
  IFormSubmitEffect,
  createHideFormAction,
  IMovePageEffect,
  ILoadPageListEffect,
  createSelectPageWatcherAction,
  ISetPageInfosAction,
  createSetPageInfosAction,
  createLoadPageListEffect,
  ISelectCachePageEffect,
  IGenerateCodeEffect,
  createSetViewPageListAction,
  ISetViewPageListAction,
} from './pagesActions';
import { createSetIsLoadingAction } from './appActions';
import { delay, groupPages, confirm, isFtpUpload } from 'src/utils';
import { Modal, message } from 'antd';
import { ILayoutsState } from './layoutsModel';
import { cellNameManager } from 'src/utils/cellName';
import { savePrototypePageInfo, queryPageList, generateCode, copyPage } from 'src/routes/Prototype/service';
import { ROW_STATUS } from 'src/config';
import { createCacheLayoutsAction, createReplaceLayoutsAction, createDisSelectAction } from './layoutsActions';
import { ModalFuncProps } from 'antd/lib/modal';
import { IAppState } from './appModel';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

export enum EditingType {
  EDIT,
  ADD,
  COPY,
}

export interface IPagesState<P = any> {
  /** 页面列表 */
  readonly pageList: P[];
  /** 当前页面 ID */
  readonly currentPageId: string;
  /** 已展开的节点 ID */
  readonly expandedPageIds: string[];

  /** 是否打开表单弹窗 */
  readonly isShowForm: boolean;
  /** 表单弹窗标题 */
  readonly formTitle: string;
  /** 当前编辑中的页面 */
  readonly editingPage: P;
  /** 编辑类型：编辑当前页面/新增子页面 */
  readonly editingType: EditingType;

  readonly viewPageList: {
    [viewId: string]: P[],
  };

  /** 其它页面信息 */
  readonly pageInfos: any;
}

export interface IPagesModel<P = any> extends Model {
  state: IPagesState<P>;
  reducers: {
    [key: string]: (state: IPagesState<P>, action: Action) => IPagesState<P>;
  };
}

export interface ICreatePagesModelOptions {
  namespace: string;
  pageIdKey: string;
  parentPageIdKey: string;
  orderKey: string;
}

export function createPagesModel<P = any>({ namespace, pageIdKey, parentPageIdKey, orderKey }: ICreatePagesModelOptions): IPagesModel<P> {
  const initPagesState: IPagesState<P> = {
    pageList: [],
    viewPageList: {},
    currentPageId: null,
    expandedPageIds: [],
    formTitle: '',
    isShowForm: false,
    editingPage: null,
    editingType: null,
    pageInfos: {},
  };

  return {
    namespace,

    state: initPagesState,

    reducers: {

      [ActionTypes.SetPageList](state, { pageList }: ISetPageListAction<P>) {
        return produce(state, draft => {
          draft.pageList = pageList as any;
        });
      },

      [ActionTypes.SetViewPageList](state, { pageList, viewId }: ISetViewPageListAction<P>) {
        return produce(state, draft => {
          draft.viewPageList[viewId] = pageList as any;
        });
      },

      [ActionTypes.SetExpandedPages](state, { expandedPageIds }: ISetExpandedPagesAction<P>) {
        return produce(state, draft => {
          draft.expandedPageIds = expandedPageIds as any;
        });
      },

      [ActionTypes.AddPage](state, { page }: IAddPageAction<P>) {
        return produce(state, draft => {
          (draft as any).pageList.push(page);
          draft.expandedPageIds.push(page[pageIdKey]);
        });
      },

      [ActionTypes.DeletePage](state, { id }: IDeletePageAction<P>) {
        return produce(state, draft => {
          draft.pageList = _.filter(draft.pageList, p => p[pageIdKey] !== id) as any;
          _.forEach(draft.pageList, p => {
            if (p[parentPageIdKey] === id) {
              p[parentPageIdKey] = null;
            }
          });
        });
      },

      [ActionTypes.UpdatePage](state, { page }: IUpdatePageAction<P>) {
        return produce(state, draft => {
          const pages = _.isArray(page) ? page : [page];
          _.forEach(pages, pp => {
            const index = _.findIndex(draft.pageList, p => p[pageIdKey] === pp[pageIdKey]);
            draft.pageList[index] = pp as any;
          });
        });
      },

      [ActionTypes.SetCurrentPageId](state, { id }: ISetCurrentPageIdAction<P>) {
        return produce(state, draft => {
          draft.currentPageId = id;
        });
      },

      [ActionTypes.ShowForm](state, { title, editingType }: IShowFormAction) {
        return produce(state, draft => {
          draft.isShowForm = true;
          draft.formTitle = title;
          draft.editingType = editingType;
        });
      },

      [ActionTypes.HideForm](state, __) {
        return produce(state, draft => {
          draft.isShowForm = false;
          draft.editingPage = null;
          draft.editingType = null;
          draft.formTitle = '';
        });
      },

      [ActionTypes.SetEditingPage](state, { page }: ISetEditingPageAction<P>) {
        return produce(state, draft => {
          draft.editingPage = page as any;
        });
      },

      [ActionTypes.SetPageInfos](state, { info }: ISetPageInfosAction) {
        return produce(state, draft => {
          draft.pageInfos = info;
        });
      },
    },

    effects: {

      *[ActionTypes.LoadPageListEffect]({ loadPageService, loadPageArgs, viewId }: ILoadPageListEffect<P>, { select, put, call, all }) {
        const appState: IAppState = yield select((s: any) => s.APP);
        const { viewPageList }: IPagesState<P> = yield select((s: any) => s.PAGES);
        const { params } = appState;
        const baseViewId = viewId ? viewId : (params && params.baseViewId);
        if (!_.isUndefined(viewId) && viewPageList[baseViewId]) {
          console.log('[LoadPageListEffect] return.');
          return;
        }
        yield put(createSetIsLoadingAction());
        let pageList: P[] = [];
        try {
          pageList = yield call(loadPageService, ...loadPageArgs);
        } catch (e) {
          yield put(createSetIsLoadingAction(false));
          console.error(e);
          Modal.error({
            title: t(I18N_IDS.TEXT_TIPS),
            content: '页面列表加载失败。',
          });
          return;
        }
        pageList = _.sortBy(pageList as any[], p => p[pageIdKey] || '');
        const ids = _.map(pageList, p => p[pageIdKey]);
        yield all([
          put(createSetIsLoadingAction(false)),
          baseViewId === params.baseViewId ? put(createSetPageListAction<P>(pageList)) : null,
          put(createSetViewPageListAction(baseViewId, pageList)),
          baseViewId === params.baseViewId ? put(createSetExpandedPagesAction(ids)) : null,
        ]);
      },

      *[ActionTypes.SelectPageEffect]({ id, queryPageArgs, queryPageService, callback, forceQuery }: ISelectPageEffect, { put, call, select }) {
        const pageState: IPagesState<P> = yield select((s: {PAGES: IPagesState<P>}) => s.PAGES);
        const { initLayouts, layouts }: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        if (!(id !== pageState.currentPageId || forceQuery)) {
          return;
        }
        if (!forceQuery && layouts !== initLayouts) {
          const b: boolean = yield call(confirm, {
            content: t(I18N_IDS.MESSAGE_MODIFIED_CHANGE_PAGE),
            okText: t(I18N_IDS.TEXT_CONTINUE),
          });
          if (!b) {
            return;
          }
        }
        yield put(createDisSelectAction(true));
        yield put(createSetIsLoadingAction());
        let data: any;
        try {
          data = yield call(queryPageService, ...queryPageArgs);
        } catch (e) {
          console.error(e);
          Modal.error({
            title: '加载页面数据出错',
            content: e.msg || null,
          });
          yield put(createReplaceLayoutsAction([], 'INIT', true));
          yield put(createSetCurrentPageIdAction(null));
          yield put(createSetIsLoadingAction(false));
          return;
        }
        console.log('[SelectPageEffect]', data);
        yield put(createSetPageInfosAction(data));
        callback(data);
        yield put(createSetCurrentPageIdAction(id));
        yield put(createSetIsLoadingAction(false));
      },

      *[ActionTypes.SelectCachePageEffect]({ id }: ISelectCachePageEffect, { put, call, select }) {
        const prePageState: IPagesState<P> = yield select((s: {PAGES: IPagesState<P>}) => s.PAGES);
        if (id === prePageState.currentPageId) {
          return;
        }
        yield put(createDisSelectAction(true));
        if (prePageState.currentPageId) {
          yield put['resolve'](createCacheLayoutsAction(prePageState.currentPageId, true));
        }
        const pageState: IPagesState<P> = yield select((s: {PAGES: IPagesState<P>}) => s.PAGES);
        const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
        const { cacheLayouts } = layoutsState;
        const { pageList } = pageState;
        const page = _.find(pageList, p => p[pageIdKey] === id);
        const originLayouts = page && page['ipfCcmBoPageLayouts'] || [];
        const willUseLayouts = cacheLayouts[id] || originLayouts;
        yield put(createReplaceLayoutsAction(willUseLayouts, 'INIT', true));
        cellNameManager.init(willUseLayouts);
        yield put(createSetCurrentPageIdAction(id));
      },

      *[ActionTypes.DeletePageEffect]({ id }: IDeletePageEffect, { put, call, select }) {
        const pageState: IPagesState<P> = yield select((s: {PAGES: IPagesState<P>}) => s.PAGES);
        if (id === pageState.currentPageId) {
          return;
        }
        yield put(createSetIsLoadingAction());
        yield call(delay, 500); // TODO: 加载页面数据
        yield put(createDeletePageAction(id));
        yield put(createSetIsLoadingAction(false));
      },

      *[ActionTypes.EditPageEffect]({ page }: IEditPageEffect<P>, { put, all }) {
        yield all([
          put(createSetEditingPageAction<P>(page)),
          put(createShowFormAction(t(I18N_IDS.TEXT_EDIT_PAGE))),
        ]);
      },

      *[ActionTypes.AddSubPageEffect]({ page }: IAddSubPageEffect<P>, { put, all }) {
        const title = page && page['pageName']
          ? `${t(I18N_IDS.TEXT_ADD_SUB_PAGE)} [${page['pageName']}]`
          : t(I18N_IDS.ADD_PAGE);
        yield all([
          put(createSetEditingPageAction<P>(page)),
          put(createShowFormAction(title, EditingType.ADD)),
        ]);
      },

      *[ActionTypes.AddSubPageEffect]({ page }: IAddSubPageEffect<P>, { put, all }) {
        const title = page && page['pageName']
          ? `${t(I18N_IDS.TEXT_ADD_SUB_PAGE)} [${page['pageName']}]`
          : t(I18N_IDS.ADD_PAGE);
        yield all([
          put(createSetEditingPageAction<P>(page)),
          put(createShowFormAction(title, EditingType.ADD)),
        ]);
      },

      *[ActionTypes.CopyPageEffect]({ page }: IAddSubPageEffect<P>, { put, all }) {
        const title = t(I18N_IDS.TEXT_COPY_PAGE);
        yield all([
          put(createSetEditingPageAction<P>(page)),
          put(createShowFormAction(title, EditingType.COPY)),
        ]);
      },

      *[ActionTypes.FormSubmitEffect]({ values }: IFormSubmitEffect, { put, select, call }) {
        const pagesState: IPagesState<P> = yield select((s: any) => s.PAGES);
        const appState: IAppState = yield select((s: any) => s.APP);
        const {
          editingPage,
          editingType,
          pageList,
        } = pagesState;
        const groupedPageList = groupPages<any>(pageList, parentPageIdKey, orderKey);
        switch (editingType) {
          case EditingType.EDIT:
            const mp: P = _.assign({}, editingPage, values, {
              rowStatus: ROW_STATUS.MODIFIED,
            });
            yield put(createSetIsLoadingAction());
            try {
              const result = yield call(savePrototypePageInfo, mp);
              if (result.success) {
                // Modal.success({
                //   content: result.msg || '保存成功。',
                // });
                message.success(result.msg || '保存成功。');
                yield put(createLoadPageListEffect(
                  queryPageList,
                  [{
                    baseViewId: appState.params['baseViewId'],
                  }],
                ));
              } else {
                Modal.error({
                  content: result.msg || '保存失败。',
                });
              }
            } catch (e) {
              Modal.error({
                content: e.msg || '保存失败。',
              });
            }
            yield put(createSetIsLoadingAction(false));
            break;
          case EditingType.ADD:
            const parentPageId = editingPage && editingPage[pageIdKey] || null;
            const last = _.last(groupedPageList[parentPageId || '']) || { };
            const seqNo = (last[orderKey] || -1) + 1;
            const np: P = _.assign({}, values, {
              [parentPageIdKey]: editingPage && editingPage[pageIdKey] || null,
              rowStatus: ROW_STATUS.ADDED,
              [orderKey]: seqNo,
              baseViewId: appState.params.baseViewId,
            }) as any;
            yield put(createSetIsLoadingAction());
            try {
              const result = yield call(savePrototypePageInfo, np);
              if (result.success) {
                // Modal.success({
                //   content: result.msg || '保存成功。',
                // });
                message.success(result.msg || '保存成功。');
                yield put(createLoadPageListEffect(
                  queryPageList,
                  [{
                    baseViewId: appState.params['baseViewId'],
                  }],
                ));
              } else {
                Modal.error({
                  content: result.msg || '保存失败。',
                });
              }
            } catch (e) {
              Modal.error({
                content: e.msg || '保存失败。',
              });
            }
            yield put(createSetIsLoadingAction(false));
            break;
          case EditingType.COPY:
            const params = {
              originName: values['originName'],
              baseViewId: values['baseViewId'] || undefined,
              ipfCcmOriginPageId: editingPage['ipfCcmOriginPageId'],
            };
            yield put(createSetIsLoadingAction());
            try {
              const result = yield call(copyPage, params);
              if (result.success) {
                message.success(result.msg || '复制成功。');
                yield put(createLoadPageListEffect(
                  queryPageList,
                  [{
                    baseViewId: appState.params['baseViewId'],
                  }],
                ));
              }
            } catch (e) {
              Modal.error({
                content: e.msg || '保存失败。',
              });
            }
            yield put(createSetIsLoadingAction(false));
            break;
          default:
            break;
        }
        yield put(createHideFormAction());
      },

      *[ActionTypes.MovePageEffect]({ sourceId, targetId, pos }: IMovePageEffect, { select, put, call, all }) {
        const pagesState: IPagesState<P> = yield select((s: any) => s.PAGES);
        const appState: IAppState = yield select((s: any) => s.APP);
        const { pageList } = pagesState;
        const groupedPages = groupPages<P>(pageList, parentPageIdKey, orderKey);
        console.log('[MovePageEffect]', groupedPages);
        console.log('[MovePageEffect]', sourceId, '->', targetId, pos);
        const sourcePage = _.find(pageList, p => p[pageIdKey] === sourceId);
        const targetPage = _.find(pageList, p => p[pageIdKey] === targetId);
        console.log(sourcePage, targetPage);
        const willUpdatePages: P[] = [];
        let newPid: string;
        if (pos === 0) {
          newPid = targetPage[pageIdKey] || '';
        } else {
          newPid = targetPage[parentPageIdKey] || '';
        }
        const list = groupedPages[newPid || ''] || [];
        if (pos === 0) {
          _.pull(list, sourcePage);
          list.push(sourcePage);
        } else {
          _.pull(list, sourcePage);
          let targetIndex = _.findIndex(list, p => p[pageIdKey] === targetId);
          if (pos === 1) {
            targetIndex++;
          }
          list.splice(targetIndex, 0, sourcePage);
        }
        _.forEach(list, (p, i) => {
          if (p[parentPageIdKey] !== newPid || p[orderKey] !== i) {
            willUpdatePages.push(produce(p, draft => {
              draft[parentPageIdKey] = newPid;
              draft[orderKey] = i;
              draft['rowStatus'] = ROW_STATUS.MODIFIED;
            }));
          }
        });
        console.log('[MovePageEffect] willUpdatePages:', willUpdatePages);
        if (!willUpdatePages.length) {
          return;
        }
        yield put(createSetIsLoadingAction());
        // 目前发送多个请求单独更新，后面要替换成批量更新接口
        yield _.map(willUpdatePages, p => call(savePrototypePageInfo, p));
        yield put(createSetIsLoadingAction(false));
        yield put(createLoadPageListEffect(
          queryPageList,
          [{
            baseViewId: appState.params['baseViewId'],
          }],
        ));
      },

      *[ActionTypes.GenerateCodeEffect]({ pageIds }: IGenerateCodeEffect, { select, call, put }) {
        const pagesState: IPagesState<P> = yield select((s: any) => s.PAGES);
        const appState: IAppState = yield select((s: any) => s.APP);
        const { pageList } = pagesState;
        const pages = _.filter(pageList, p => _.includes(pageIds, p[pageIdKey]));
        if (!pages.length) {
          Modal.warn({
            content: '请选择页面进行生成。',
          });
          return;
        }
        const b = yield call(confirm, {
          content: '确认生成页面原型代码？',
        } as ModalFuncProps);
        if (!b) {
          return;
        }
        const params = {
          originIdNameTexts: _.map(pages, p => ({
            originPageId: p[pageIdKey],
            originName: p['originName'],
            originText: p['description'],
          })),
          t: new Date().getTime(),
          ftpUpload: isFtpUpload(),
          // ftpUpload: true,
          codeGenBathNo: (new Date().getTime()) + Math.random() * 16,
          codeGenConfigItemTypes: ['FRONT'],
          codeGenElapsedTime: 'N',
          isDelPath: true,
          baseViewId: appState.params.baseViewId,
        };
        yield put(createSetIsLoadingAction(true));
        try {
          const result = yield call(generateCode, params);
          yield put(createSetIsLoadingAction(false));
          const doDownload = yield call(confirm, {
            title: t(I18N_IDS.TEXT_TIPS),
            content: `${result.msg || ''}\r\n是否进行下载?`,
          });
          if (doDownload) {
            window.location.href = `${result.eletronInfo}`;
          }
        } catch (e) {
          yield put(createSetIsLoadingAction(false));
          Modal.error({
            title: '生成代码失败',
            content: e.msg || null,
          });
        }
      },

      *[ActionTypes.SelectPageWatcher](__, { take, put, select }) {
        while (true) {
          yield take([
            `${ActionTypes.SelectPageEffect}/@@end`,
          ]);
          const layoutsState: ILayoutsState<any> = yield select((s: any) => s.LAYOUTS);
          const pagesState: IPagesState<P> = yield select((s: any) => s.PAGES);
          const { layouts, config } = layoutsState;
          const { pageInfos } = pagesState;
          cellNameManager.init(
            layouts,
            pageInfos['configName'],
            config.cellNameKey,
          );
        }
      },

    },

    subscriptions: {
      watchActions({ dispatch }) {
        dispatch(createSelectPageWatcherAction());
      },
    },
  };

}
