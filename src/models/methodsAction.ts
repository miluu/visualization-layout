import { Action } from 'redux';
import * as _ from 'lodash';
import { IBoMethod, IBoTreeSourceItem } from './methodsModel';
import { noop } from 'src/utils';

export const NAMESPACE = 'METHODS';

export enum ActionTypes {
  // Actions
  SetMethods = 'Set Methods',
  ResetMethods = 'Reset Methods',
  AddMethod = 'Add Method',
  SetEditingMethod = 'Set Editing Method',
  SetBoTreeSource = 'Set Bo Tree Source',
  SelectBoTreeItem = 'Select Bo Tree Item',

  // Effects
  LoadMethodsEffect = 'Load Methods Effect',
  AddMethodEffect = 'Add Method Effect',
  EditMethodEffect = 'Edit Method Effect',
  SaveOrUpdateMethodEffect = 'Save Or Update Method Effect',
  DeleteMethodsEffect = 'Delete Methods Effect',
  LoadBoTreeSourceEffect = 'Load Bo Tree Source Effect',

  // Watchers
  SelectBoTreeItemWatcher = 'Select Bo Tree Item Watcher',
  SaveOrUpdateMethodWatcher = 'Save Or Update Method Watcher',
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

export interface ISetMethodsAction extends Action {
  ipfCcmBoId: string;
  methods: IBoMethod[];
}

export function createSetMethodsAction(ipfCcmBoId: string, methods: IBoMethod[], withNamespace = false): ISetMethodsAction {
  const type = addNamespace(ActionTypes.SetMethods, withNamespace);
  return {
    type,
    ipfCcmBoId,
    methods,
  };
}

export interface IResetMethodsAction extends Action {
}

export function createResetMethodsAction(withNamespace = false): IResetMethodsAction {
  const type = addNamespace(ActionTypes.ResetMethods, withNamespace);
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

export interface ILoadMethodsEffect extends Action {
  force: boolean;
}

export function createLoadMethodsEffect(force = false, withNamespace = true): ILoadMethodsEffect {
  const type = addNamespace(ActionTypes.LoadMethodsEffect, withNamespace);
  return {
    force,
    type,
  };
}

export interface IDeleteMethodsEffect extends Action {
  ids: string[];
}

export function createDeleteMethodsEffect(ids: string[], withNamespace = true): IDeleteMethodsEffect {
  const type = addNamespace(ActionTypes.DeleteMethodsEffect, withNamespace);
  return {
    type,
    ids,
  };
}

export interface ISaveOrUpdateMethodEffect extends Action {
  data: IBoMethod;
  editType: string;
  callback(): void;
}

export function createSaveOrUpdateMethodEffect(data: IBoMethod, editType = 'edit', callback = noop, withNamespace = true): ISaveOrUpdateMethodEffect {
  const type = addNamespace(ActionTypes.SaveOrUpdateMethodEffect, withNamespace);
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
export interface ISaveOrUpdateMethodWatcher extends Action {
}

export function createSaveOrUpdateMethodWatcher(withNamespace = false): ISaveOrUpdateMethodWatcher {
  const type = addNamespace(ActionTypes.SaveOrUpdateMethodWatcher, withNamespace);
  return {
    type,
  };
}
