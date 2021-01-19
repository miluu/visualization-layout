import { Action } from 'redux';
import * as _ from 'lodash';
import { IBoProperty } from './propertiesModel';
import { IBoTreeSourceItem } from './relationsModel';
import { noop } from 'src/utils';

export const NAMESPACE = 'PROPERTIES';

export enum ActionTypes {
  // Actions
  SetProperties = 'Set Properties',
  ResetProperties = 'Reset Properties',
  AddProperty = 'Add Property',
  SetEditingProperty = 'Set Editing Property',
  SetBoTreeSource = 'Set Bo Tree Source',
  SelectBoTreeItem = 'Select Bo Tree Item',

  // Effects
  LoadPropertiesEffect = 'Load Properties Effect',
  AddPropertyEffect = 'Add Property Effect',
  EditPropertyEffect = 'Edit Property Effect',
  SaveOrUpdatePropertyEffect = 'Save Or Update Property Effect',
  DeletePropertiesEffect = 'Delete Properties Effect',
  LoadBoTreeSourceEffect = 'Load Bo Tree Source Effect',

  // Watchers
  SelectBoTreeItemWatcher = 'Select Bo Tree Item Watcher',
  SaveOrUpdatePropertyWatcher = 'Save Or Update Property Watcher',
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

export interface ISetPropertiesAction extends Action {
  ipfCcmBoId: string;
  properties: IBoProperty[];
}

export function createSetPropertiesAction(ipfCcmBoId: string, properties: IBoProperty[], withNamespace = false): ISetPropertiesAction {
  const type = addNamespace(ActionTypes.SetProperties, withNamespace);
  return {
    type,
    ipfCcmBoId,
    properties,
  };
}

export interface IResetPropertiesAction extends Action {
}

export function createResetPropertiesAction(withNamespace = false): IResetPropertiesAction {
  const type = addNamespace(ActionTypes.ResetProperties, withNamespace);
  return {
    type,
  };
}

// Effects

export interface ILoadPropertiesEffect extends Action {
  force: boolean;
}

export function createLoadPropertiesEffect(force = false, withNamespace = true): ILoadPropertiesEffect {
  const type = addNamespace(ActionTypes.LoadPropertiesEffect, withNamespace);
  return {
    force,
    type,
  };
}

export interface IDeletePropertiesEffect extends Action {
  ids: string[];
}

export function createDeletePropertiesEffect(ids: string[], withNamespace = true): IDeletePropertiesEffect {
  const type = addNamespace(ActionTypes.DeletePropertiesEffect, withNamespace);
  return {
    type,
    ids,
  };
}

export interface ISaveOrUpdatePropertyEffect extends Action {
  data: IBoProperty;
  editType: string;
  callback(): void;
}

export function createSaveOrUpdatePropertyEffect(data: IBoProperty, editType = 'edit', callback = noop, withNamespace = true): ISaveOrUpdatePropertyEffect {
  const type = addNamespace(ActionTypes.SaveOrUpdatePropertyEffect, withNamespace);
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

export interface ISaveOrUpdatePropertyWatcher extends Action {
}

export function createSaveOrUpdatePropertyWatcher(withNamespace = false): ISaveOrUpdatePropertyWatcher {
  const type = addNamespace(ActionTypes.SaveOrUpdatePropertyWatcher, withNamespace);
  return {
    type,
  };
}
