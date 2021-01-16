import { Action } from 'redux';
import * as _ from 'lodash';
import { IBoBusinessType, IBoTreeSourceItem } from './businessTypesModel';
import { noop } from 'src/utils';

export const NAMESPACE = 'BUSINESS_TYPES';

export enum ActionTypes {
  // Actions
  SetBusinessTypes = 'Set BusinessTypes',
  ResetBusinessTypes = 'Reset BusinessTypes',
  AddBusinessType = 'Add BusinessType',
  SetEditingBusinessType = 'Set Editing BusinessType',
  SetBoTreeSource = 'Set Bo Tree Source',
  SelectBoTreeItem = 'Select Bo Tree Item',

  // Effects
  LoadBusinessTypesEffect = 'Load BusinessTypes Effect',
  AddBusinessTypeEffect = 'Add BusinessType Effect',
  EditBusinessTypeEffect = 'Edit BusinessType Effect',
  SaveOrUpdateBusinessTypeEffect = 'Save Or Update BusinessType Effect',
  DeleteBusinessTypesEffect = 'Delete BusinessTypes Effect',
  LoadBoTreeSourceEffect = 'Load Bo Tree Source Effect',

  // Watchers
  SelectBoTreeItemWatcher = 'Select Bo Tree Item Watcher',
  SaveOrUpdateBusinessTypeWatcher = 'Save Or Update BusinessType Watcher',
}

export function addNamespace(type: string, b: boolean) {
  if (!b) {
    return type;
  }
  return `${NAMESPACE}/${type}`;
}

// Actions

export interface ISetBoTreeSourceAction extends Action {
  boTreeSource: IBoTreeSourceItem[];
}

export function createSetBoTreeSourceAction(boTreeSource: IBoTreeSourceItem[], withNamespace = false): ISetBoTreeSourceAction {
  const type = addNamespace(ActionTypes.SetBoTreeSource, withNamespace);
  return {
    type,
    boTreeSource,
  };
}

export interface ISelectBoTreeItemAction extends Action {
  id: string;
}

export function createSelectBoTreeItemAction(id: string, withNamespace = false): ISelectBoTreeItemAction {
  const type = addNamespace(ActionTypes.SelectBoTreeItem, withNamespace);
  return {
    type,
    id,
  };
}

export interface ISetBusinessTypesAction extends Action {
  ipfCcmBoId: string;
  businessTypes: IBoBusinessType[];
}

export function createSetBusinessTypesAction(ipfCcmBoId: string, businessTypes: IBoBusinessType[], withNamespace = false): ISetBusinessTypesAction {
  const type = addNamespace(ActionTypes.SetBusinessTypes, withNamespace);
  return {
    type,
    ipfCcmBoId,
    businessTypes,
  };
}

export interface IResetBusinessTypesAction extends Action {
}

export function createResetBusinessTypesAction(withNamespace = false): IResetBusinessTypesAction {
  const type = addNamespace(ActionTypes.ResetBusinessTypes, withNamespace);
  return {
    type,
  };
}

// Effects
export interface ILoadBoTreeSourceEffect extends Action {
}

export function createLoadBoTreeSourceEffect(withNamespace = true): ILoadBoTreeSourceEffect {
  const type = addNamespace(ActionTypes.LoadBoTreeSourceEffect, withNamespace);
  return {
    type,
  };
}

export interface ILoadBusinessTypesEffect extends Action {
  force: boolean;
}

export function createLoadBusinessTypesEffect(force = false, withNamespace = true): ILoadBusinessTypesEffect {
  const type = addNamespace(ActionTypes.LoadBusinessTypesEffect, withNamespace);
  return {
    force,
    type,
  };
}

export interface IDeleteBusinessTypesEffect extends Action {
  ids: string[];
}

export function createDeleteBusinessTypesEffect(ids: string[], withNamespace = true): IDeleteBusinessTypesEffect {
  const type = addNamespace(ActionTypes.DeleteBusinessTypesEffect, withNamespace);
  return {
    type,
    ids,
  };
}

export interface ISaveOrUpdateBusinessTypeEffect extends Action {
  data: IBoBusinessType;
  editType: string;
  callback(): void;
}

export function createSaveOrUpdateBusinessTypeEffect(data: IBoBusinessType, editType = 'edit', callback = noop, withNamespace = true): ISaveOrUpdateBusinessTypeEffect {
  const type = addNamespace(ActionTypes.SaveOrUpdateBusinessTypeEffect, withNamespace);
  return {
    type,
    data,
    editType,
    callback,
  };
}

export interface ISelectBoTreeItemWatcher extends Action {
}

export function createSelectBoTreeItemWatcher(withNamespace = false): ISelectBoTreeItemWatcher {
  const type = addNamespace(ActionTypes.SelectBoTreeItemWatcher, withNamespace);
  return {
    type,
  };
}
export interface ISaveOrUpdateBusinessTypeWatcher extends Action {
}

export function createSaveOrUpdateBusinessTypeWatcher(withNamespace = false): ISaveOrUpdateBusinessTypeWatcher {
  const type = addNamespace(ActionTypes.SaveOrUpdateBusinessTypeWatcher, withNamespace);
  return {
    type,
  };
}
