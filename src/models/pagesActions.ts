import { Action } from 'redux';
import * as _ from 'lodash';
import { EditingType } from './pagesModel';

const NAMESPACE = 'PAGES';

export enum ActionTypes {
  // reducers
  SetPageList = 'Set Page List',
  SetViewPageList = 'Set View Page List',
  AddPage = 'Add Page',
  DeletePage = 'Delete Page',
  UpdatePage = 'Update Page',
  SetExpandedPages = 'Set Expanded Pages',
  SetCurrentPageId = 'Set Current Page Id',
  ShowForm = 'Show Form',
  HideForm = 'Hide Form',
  SetEditingPage = 'Set Editing Page',
  SetPageInfos = 'Set Page Infos',

  // effects
  LoadPageListEffect = 'Load Page List Effect',
  SelectPageEffect = 'Select Page Effect',
  SelectCachePageEffect = 'Select Cache Page Effect',
  DeletePageEffect = 'Delete Page Effect',
  EditPageEffect = 'Edit Page Effect',
  AddSubPageEffect = 'Add Sub Page Effect',
  CopyPageEffect = 'Copy Page Effect',
  FormSubmitEffect = 'Form Submit Effect',
  MovePageEffect = 'Move Page Effect',
  GenerateCodeEffect = 'Generate Code Effect',

  SelectPageWatcher = 'Select Page Watcher',
  ViewPageListWatcher = 'View Page List Watcher',
}

export function addNamespace(type: string, b: boolean) {
  if (!b) {
    return type;
  }
  return `${NAMESPACE}/${type}`;
}

export interface ISetPageListAction<P> extends Action {
  pageList: P[];
}

export function createSetPageListAction<P>(pageList: P[], withNamespace = false): ISetPageListAction<P> {
  const type = addNamespace(ActionTypes.SetPageList, withNamespace);
  return {
    type,
    pageList,
  };
}

export interface ISetViewPageListAction<P> extends Action {
  viewId: string;
  pageList: P[];
}

export function createSetViewPageListAction<P>(viewId: string, pageList: P[], withNamespace = false): ISetViewPageListAction<P> {
  const type = addNamespace(ActionTypes.SetViewPageList, withNamespace);
  return {
    type,
    pageList,
    viewId,
  };
}

export interface ISetExpandedPagesAction<P> extends Action {
  expandedPageIds: string[];
}

export function createSetExpandedPagesAction<P>(expandedPageIds: string[], withNamespace = false): ISetExpandedPagesAction<P> {
  const type = addNamespace(ActionTypes.SetExpandedPages, withNamespace);
  return {
    type,
    expandedPageIds,
  };
}

export interface ISetCurrentPageIdAction<P> extends Action {
  id: string;
}

export function createSetCurrentPageIdAction<P>(id: string, withNamespace = false): ISetCurrentPageIdAction<P> {
  const type = addNamespace(ActionTypes.SetCurrentPageId, withNamespace);
  return {
    type,
    id,
  };
}

export interface IAddPageAction<P> extends Action {
  page: P;
}

export function createAddPageAction<P>(page: P, withNamespace = false): IAddPageAction<P> {
  const type = addNamespace(ActionTypes.AddPage, withNamespace);
  return {
    type,
    page,
  };
}

export interface IDeletePageAction<P> extends Action {
  id: string;
}

export function createDeletePageAction<P>(id: string, withNamespace = false): IDeletePageAction<P> {
  const type = addNamespace(ActionTypes.DeletePage, withNamespace);
  return {
    type,
    id,
  };
}

export interface IUpdatePageAction<P> extends Action {
  page: P | P[];
}

export function createUpdatePageAction<P>(page: P | P[], withNamespace = false): IUpdatePageAction<P> {
  const type = addNamespace(ActionTypes.UpdatePage, withNamespace);
  return {
    type,
    page,
  };
}

export interface IShowFormAction extends Action {
  title: string;
  editingType: EditingType;
}

export function createShowFormAction(title = '编辑页面信息', editingType = EditingType.EDIT, withNamespace = false): IShowFormAction {
  const type = addNamespace(ActionTypes.ShowForm, withNamespace);
  return {
    type,
    title,
    editingType,
  };
}
export interface IHideFormAction extends Action {
}

export function createHideFormAction(withNamespace = false): IHideFormAction {
  const type = addNamespace(ActionTypes.HideForm, withNamespace);
  return {
    type,
  };
}

export interface ISetEditingPageAction<P> extends Action {
  page: P;
}

export function createSetEditingPageAction<P>(page: P, withNamespace = false): ISetEditingPageAction<P> {
  const type = addNamespace(ActionTypes.SetEditingPage, withNamespace);
  return {
    type,
    page,
  };
}

export interface ISetPageInfosAction extends Action {
  info: any;
}

export function createSetPageInfosAction(info: any, withNamespace = false): ISetPageInfosAction {
  const type = addNamespace(ActionTypes.SetPageInfos, withNamespace);
  return {
    type,
    info,
  };
}

export interface ILoadPageListEffect<P> extends Action {
  loadPageService: (...args: any[]) => (Promise<P[]> | P[]);
  viewId: string;
  loadPageArgs: any[];
}

export function createLoadPageListEffect<P>(loadPageService: (...args: any[]) => (Promise<P[]> | P[]), loadPageArgs: any[] = [], viewId?: string,  withNamespace = true): ILoadPageListEffect<P> {
  const type = addNamespace(ActionTypes.LoadPageListEffect, withNamespace);
  return { type, loadPageService, loadPageArgs, viewId };
}

export interface ISelectPageEffect extends Action {
  id: string;
  queryPageService: (...args: any[]) => Promise<any>;
  queryPageArgs: any[];
  callback: (data?: any) => void;
  forceQuery: boolean;
}

export function createSelectPageEffect(
  id: string,
  queryPageService: (...args: any[]) => Promise<any>,
  queryPageArgs: any[] = [],
  callback: (data?: any) => void = () => void 0,
  forceQuery = false,
  withNamespace = true,
): ISelectPageEffect {
  const type = addNamespace(ActionTypes.SelectPageEffect, withNamespace);
  return { type, id, queryPageService, queryPageArgs, callback, forceQuery };
}
export interface ISelectCachePageEffect extends Action {
  id: string;
}

export function createSelectCachePageEffect(
  id: string,
  withNamespace = true,
): ISelectCachePageEffect {
  const type = addNamespace(ActionTypes.SelectCachePageEffect, withNamespace);
  return { type, id };
}

export interface IDeletePageEffect extends Action {
  id: string;
}

export function createDeletePageEffect(id: string, withNamespace = true): IDeletePageEffect {
  const type = addNamespace(ActionTypes.DeletePageEffect, withNamespace);
  return { type, id };
}

export interface IEditPageEffect<P> extends Action {
  page: P;
}

export function createEditPageEffect<P>(page: P, withNamespace = true): IEditPageEffect<P> {
  const type = addNamespace(ActionTypes.EditPageEffect, withNamespace);
  return { type, page };
}

export interface IAddSubPageEffect<P> extends Action {
  page: P;
}

export function createAddSubPageEffect<P>(page: P, withNamespace = true): IAddSubPageEffect<P> {
  const type = addNamespace(ActionTypes.AddSubPageEffect, withNamespace);
  return { type, page };
}

export interface ICopyPageEffect<P> extends Action {
  page: P;
}

export function createCopyPageEffect<P>(page: P, withNamespace = true): ICopyPageEffect<P> {
  const type = addNamespace(ActionTypes.CopyPageEffect, withNamespace);
  return { type, page };
}

export interface IFormSubmitEffect extends Action {
  values: object;
}

export function createFormSubmitEffect(values: object, withNamespace = true): IFormSubmitEffect {
  const type = addNamespace(ActionTypes.FormSubmitEffect, withNamespace);
  return { type, values };
}

export interface IMovePageOptions {
  /* 移动的节点 */
  sourceId: string;
  /* 目标节点 */
  targetId: string;
  /** 位置: -1 前面， 1 后面， 0 里面 */
  pos: number;
}

export interface IMovePageEffect extends Action, IMovePageOptions {
}

export function createMovePageEffect(opts: IMovePageOptions, withNamespace = true): IMovePageEffect {
  const type = addNamespace(ActionTypes.MovePageEffect, withNamespace);
  return { type, ...opts };
}

export interface IGenerateCodeEffect extends Action {
  pageIds: string[];
}

export function createGenerateCodeEffect(pageIds: string[], withNamespace = true): IGenerateCodeEffect {
  const type = addNamespace(ActionTypes.GenerateCodeEffect, withNamespace);
  return { type, pageIds };
}

export interface ISelectPageWatcher extends Action {
}

export function createSelectPageWatcherAction(withNamespace = false): ISelectPageWatcher {
  const type = addNamespace(ActionTypes.SelectPageWatcher, withNamespace);
  return { type };
}
