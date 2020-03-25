import { Action } from 'redux';
import { IDictsMap, ISelectionRange } from './appModel';
import { EditorStatus as EditorStatis } from 'src/config';
import { Location } from 'history';

export const NAMESPACE = 'APP';

export enum ActionTypes {
  // Reducers
  SetIsLoading = 'Set Is Loading',
  SetDicts = 'Set Dicts',
  SetEditorStatus = 'Set Editor Status',
  ZoomTo = 'Zoom To',
  ZoomIn = 'Zoom In',
  ZoomOut = 'Zoom Out',
  SetParams = 'Set Params',
  SetSidebarWidth = 'Set Sidebar Width',
  SetSelectionRange = 'Set Selection Range',
  SetIsOnlyShowMain = 'Set Is Only Show Main',
  SetKeyValue = 'Set Key Value',

  // effects
  LoadDictsEffect = 'Load Dicts Effect',
  UpdateSelectionRangeEffect = 'Update Selection Range Effect',
  DoUpdateSelectionRangeEffect = 'Do Update Selection Range Effect',

  SaveEffect = 'SaveEffect',
  VisualizationSaveEffect = 'Visualization Save Effect',
  PrototypeSaveEffect = 'Prototype Save Effect',
  DatasourceBindingSaveEffect = 'Datasource Binding Save Effect',
  TemplateSaveEffect = 'Template Save Effect',
  LoadTemplateRelationsEffect = 'Load Template Relations Effect',
  SaveAsTemplateEffect = 'Save As Template Effect',
  LoadComponentGroupSourceEffect = 'Load Component Group Source Effect',
  LoadViewListEffect = 'Load View List Effect',
  GetSessionAttrsEffect = 'Get Session Attrs Effect',
  ChangeLocaleEffect = 'Change Language Effect',

  ExportJsonEffect = 'Export Json Effect', // 导出 JSON 数据

  WatchSelectionRangeEffect = 'Watch Selection Range Effect',
}

export function addNamespace(type: string, b: boolean) {
  if (!b) {
    return type;
  }
  return `${NAMESPACE}/${type}`;
}

export interface ISetIsLoadingAction extends Action {
  isLoading: boolean;
}

export function createSetIsLoadingAction(isLoading = true, withNamespace = true): ISetIsLoadingAction {
  const type = addNamespace(ActionTypes.SetIsLoading, withNamespace);
  return {
    type,
    isLoading,
  };
}

export interface ISetSidebarWidthAction extends Action {
  width: number;
  pos: string;
}

export function createSetSidebarWidthAction(width: number, pos = 'left', withNamespace = true): ISetSidebarWidthAction {
  const type = addNamespace(ActionTypes.SetSidebarWidth, withNamespace);
  return {
    type,
    width,
    pos,
  };
}

export interface ISetDictsAction extends Action {
  dicts: IDictsMap;
}

export function createSetDictsAction(dicts: IDictsMap, withNamespace = false): ISetDictsAction {
  const type = addNamespace(ActionTypes.SetDicts, withNamespace);
  return {
    type,
    dicts,
  };
}

export interface ISetSelectionRangeAction extends Action {
  range: ISelectionRange;
}

export function createSetSelectionRangeAction(range: ISelectionRange, withNamespace = false): ISetSelectionRangeAction {
  const type = addNamespace(ActionTypes.SetSelectionRange, withNamespace);
  return {
    type,
    range,
  };
}

export interface ISetEditorStatusAction extends Action {
  status: EditorStatis;
}

export function createSetEditorStatusAction(status: EditorStatis, withNamespace = true): ISetEditorStatusAction {
  const type = addNamespace(ActionTypes.SetEditorStatus, withNamespace);
  return {
    type,
    status,
  };
}

export interface IZoomToAction extends Action {
  zoom: number;
}

export function createZoomToAction(zoom: number, withNamespace = true): IZoomToAction {
  const type = addNamespace(ActionTypes.ZoomTo, withNamespace);
  return {
    type,
    zoom,
  };
}

export interface IZoomInAction extends Action {
}

export function createZoomInAction(withNamespace = true): IZoomInAction {
  const type = addNamespace(ActionTypes.ZoomIn, withNamespace);
  return {
    type,
  };
}

export interface IZoomOutAction extends Action {
}

export function createZoomOutAction(withNamespace = true): IZoomOutAction {
  const type = addNamespace(ActionTypes.ZoomOut, withNamespace);
  return {
    type,
  };
}

export interface ISetParamsAction extends Action {
  params: any;
  location: Location;
}

export function createSetParamsAction(location: Location, params: any, withNamespace = false): ISetParamsAction {
  const type = addNamespace(ActionTypes.SetParams, withNamespace);
  return {
    type,
    params,
    location,
  };
}

export interface ISetIsOnlyShowMainAction extends Action {
  isOnlyShowMain: boolean;
}

export function createSetIsOnlyShowMainAction(isOnlyShowMain: boolean, withNamespace = false): ISetIsOnlyShowMainAction {
  const type = addNamespace(ActionTypes.SetIsOnlyShowMain, withNamespace);
  return {
    type,
    isOnlyShowMain,
  };
}

export interface ISetKeyValueAction extends Action {
  key: string;
  value: any;
}

export function createSetKeyValueAction(key: string, value: any, withNamespace = false): ISetKeyValueAction {
  const type = addNamespace(ActionTypes.SetKeyValue, withNamespace);
  return {
    type,
    key,
    value,
  };
}

export interface ILoadDictsEffect extends Action {
  dictNames: string;
  extDicts: IDictsMap;
}

export function createLoadDictsEffect(dictNames: string, extDicts?: IDictsMap, withNamespace = true): ILoadDictsEffect {
  const type = addNamespace(ActionTypes.LoadDictsEffect, withNamespace);
  return { type, dictNames, extDicts };
}

export interface IUpdateSelectionRangeEffect extends Action {
}

export function createUpdateSelectionRangeEffect(withNamespace = true): IUpdateSelectionRangeEffect {
  const type = addNamespace(ActionTypes.UpdateSelectionRangeEffect, withNamespace);
  return { type };
}

export interface IDoUpdateSelectionRangeEffect extends Action {
}

export function createDoUpdateSelectionRangeEffect(withNamespace = true): IDoUpdateSelectionRangeEffect {
  const type = addNamespace(ActionTypes.DoUpdateSelectionRangeEffect, withNamespace);
  return { type };
}

type SaveCallback = (responseData: any) => any;

export interface ISaveEffect extends Action {
  successCallback: SaveCallback;
  failedCallback: SaveCallback;
}

export function createSaveEffect(successCallback: SaveCallback, failedCallback: SaveCallback, withNamespace = true): ISaveEffect {
  const type = addNamespace(ActionTypes.SaveEffect, withNamespace);
  return { type, successCallback, failedCallback };
}
export interface IVisualizationSaveEffect extends Action {
  successCallback: SaveCallback;
  failedCallback: SaveCallback;
}

export function createVisualizationSaveEffect(successCallback: SaveCallback, failedCallback: SaveCallback, withNamespace = true): IVisualizationSaveEffect {
  const type = addNamespace(ActionTypes.VisualizationSaveEffect, withNamespace);
  return { type, successCallback, failedCallback };
}
export interface IPrototypeSaveEffect extends Action {
  successCallback: SaveCallback;
  failedCallback: SaveCallback;
}

export function createPrototypeSaveEffect(successCallback: SaveCallback, failedCallback: SaveCallback, withNamespace = true): IPrototypeSaveEffect {
  const type = addNamespace(ActionTypes.PrototypeSaveEffect, withNamespace);
  return { type, successCallback, failedCallback };
}

export interface IDatasourceBindingSaveEffect extends Action {
  successCallback: SaveCallback;
  failedCallback: SaveCallback;
}

export function createDatasourceBindingSaveEffect(successCallback: SaveCallback, failedCallback: SaveCallback, withNamespace = true): IDatasourceBindingSaveEffect {
  const type = addNamespace(ActionTypes.DatasourceBindingSaveEffect, withNamespace);
  return { type, successCallback, failedCallback };
}

export interface ITemplateSaveEffect extends Action {
  successCallback: SaveCallback;
  failedCallback: SaveCallback;
}

export function createTemplateSaveEffect(successCallback: SaveCallback, failedCallback: SaveCallback, withNamespace = true): ITemplateSaveEffect {
  const type = addNamespace(ActionTypes.TemplateSaveEffect, withNamespace);
  return { type, successCallback, failedCallback };
}

export interface ILoadTemplateRelationsEffect extends Action {
  params: any;
}

export function createLoadTemplateRelationsEffect(params: any, withNamespace = true): ILoadTemplateRelationsEffect {
  const type = addNamespace(ActionTypes.LoadTemplateRelationsEffect, withNamespace);
  return { type, params };
}

export type TemplateType = 'GROUP' | 'TEMPLATE';
export interface ISaveAsTemplateEffect extends Action {
  templateType: TemplateType;
  formValues: any;
}

export function createSaveAsTemplateEffect(templateType: TemplateType, formValues: any, withNamespace = true): ISaveAsTemplateEffect {
  const type = addNamespace(ActionTypes.SaveAsTemplateEffect, withNamespace);
  return { type, templateType, formValues };
}

export interface ILoadComponentGroupSourceEffect extends Action {
}

export function createLoadComponentGroupSourceEffect(withNamespace = true): ILoadComponentGroupSourceEffect {
  const type = addNamespace(ActionTypes.LoadComponentGroupSourceEffect, withNamespace);
  return { type };
}

export interface IWatchSelectionRangeEffect extends Action {
}

export function createWatchSelectionRangeEffect(withNamespace = true): IWatchSelectionRangeEffect {
  const type = addNamespace(ActionTypes.WatchSelectionRangeEffect, withNamespace);
  return { type };
}

export interface ILoadViewListEffect extends Action {
}

export function createLoadViewListEffect(withNamespace = true): ILoadViewListEffect {
  const type = addNamespace(ActionTypes.LoadViewListEffect, withNamespace);
  return { type };
}

export interface IGetSessionAttrsEffect extends Action {
  manual: boolean;
}

export function createGetSessionAttrsEffect(manual = false, withNamespace = true): IGetSessionAttrsEffect {
  const type = addNamespace(ActionTypes.GetSessionAttrsEffect, withNamespace);
  return { type, manual };
}

export interface IChangeLocaleEffect extends Action {
  locale: string;
}

export function createChangeLocaleEffect(locale: string, withNamespace = true): IChangeLocaleEffect {
  const type = addNamespace(ActionTypes.ChangeLocaleEffect, withNamespace);
  return { type, locale };
}

export interface IExportJsonEffect extends Action {
  manual: boolean;
}

export function createExportJsonEffect(manual = false, withNamespace = true): IExportJsonEffect {
  const type = addNamespace(ActionTypes.ExportJsonEffect, withNamespace);
  return { type, manual };
}
