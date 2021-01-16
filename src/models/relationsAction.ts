import { Action } from 'redux';
import * as _ from 'lodash';
import { IBoCheck, IBoRelation, IBoTreeSourceItem } from './relationsModel';
import { noop } from 'src/utils';

export const NAMESPACE = 'RELATIONS';

export enum ActionTypes {
  // Actions
  SetRelations = 'Set Relations',
  ResetRelations = 'Reset Relations',
  AddRelation = 'Add Relation',
  SetEditingRelation = 'Set Editing Relation',
  SetBoTreeSource = 'Set Bo Tree Source',
  SelectBoTreeItem = 'Select Bo Tree Item',
  SetBoChecks = 'Set Bo Checks',
  ResetBoChecks = 'Reset Bo Checks',

  // Effects
  LoadRelationsEffect = 'Load Relations Effect',
  AddRelationEffect = 'Add Relation Effect',
  EditRelationEffect = 'Edit Relation Effect',
  SaveOrUpdateRelationEffect = 'Save Or Update Relation Effect',
  DeleteRelationsEffect = 'Delete Relations Effect',
  LoadBoTreeSourceEffect = 'Load Bo Tree Source Effect',
  LoadBoChecksEffect = 'Load Bo Checks Effect',

  // Watchers
  SelectBoTreeItemWatcher = 'Select Bo Tree Item Watcher',
  SaveOrUpdateRelationWatcher = 'Save Or Update Relation Watcher',
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

export interface ISetRelationsAction extends Action {
  ipfCcmBoId: string;
  relations: IBoRelation[];
}

export function createSetRelationsAction(ipfCcmBoId: string, relations: IBoRelation[], withNamespace = false): ISetRelationsAction {
  const type = addNamespace(ActionTypes.SetRelations, withNamespace);
  return {
    type,
    ipfCcmBoId,
    relations,
  };
}

export interface IResetRelationsAction extends Action {
}

export function createResetRelationsAction(withNamespace = false): IResetRelationsAction {
  const type = addNamespace(ActionTypes.ResetRelations, withNamespace);
  return {
    type,
  };
}

export interface ISetBoChhecksAction extends Action {
  ipfCcmBoId: string;
  boChecks: IBoCheck[];
}

export function createSetBoChecksAction(ipfCcmBoId: string, boChecks: IBoCheck[], withNamespace = false): ISetBoChhecksAction {
  const type = addNamespace(ActionTypes.SetBoChecks, withNamespace);
  return {
    type,
    ipfCcmBoId,
    boChecks,
  };
}

export interface IResetBoChecksAction extends Action {
}

export function createResetBoChecksAction(withNamespace = false): IResetRelationsAction {
  const type = addNamespace(ActionTypes.ResetBoChecks, withNamespace);
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

export interface ILoadRelationsEffect extends Action {
  force: boolean;
}

export function createLoadRelationsEffect(force = false, withNamespace = true): ILoadRelationsEffect {
  const type = addNamespace(ActionTypes.LoadRelationsEffect, withNamespace);
  return {
    force,
    type,
  };
}

export interface IDeleteRelationsEffect extends Action {
  ids: string[];
}

export function createDeleteRelationsEffect(ids: string[], withNamespace = true): IDeleteRelationsEffect {
  const type = addNamespace(ActionTypes.DeleteRelationsEffect, withNamespace);
  return {
    type,
    ids,
  };
}

export interface ISaveOrUpdateRelationEffect extends Action {
  data: IBoRelation;
  editType: string;
  callback(): void;
}

export function createSaveOrUpdateRelationEffect(data: IBoRelation, editType = 'edit', callback = noop, withNamespace = true): ISaveOrUpdateRelationEffect {
  const type = addNamespace(ActionTypes.SaveOrUpdateRelationEffect, withNamespace);
  return {
    type,
    data,
    editType,
    callback,
  };
}

export interface ILoadBoChecksEffect extends Action {
  force: boolean;
}

export function createLoadBoChecksEffect(force = false, withNamespace = true): ILoadBoChecksEffect {
  const type = addNamespace(ActionTypes.LoadBoChecksEffect, withNamespace);
  return {
    force,
    type,
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
export interface ISaveOrUpdateRelationWatcher extends Action {
}

export function createSaveOrUpdateRelationWatcher(withNamespace = false): ISaveOrUpdateRelationWatcher {
  const type = addNamespace(ActionTypes.SaveOrUpdateRelationWatcher, withNamespace);
  return {
    type,
  };
}
