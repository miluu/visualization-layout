import { Action } from 'redux';
import { IDatasource } from './datasourceModel';

export const NAMESPACE = 'DATASOURCE';

export enum ActionTypes {
  SetSource = 'Set Source',
  SetInitSource = 'Set Init Source',
  UpdateItem = 'Update Item',
  RemoveItem = 'Remove Item',
  AddItem = 'Add Item',

  AddSubItemEffect = 'Add Sub Item Effect',
  InitSourceEffect = 'Init Source Effect',
  OnDropEffect = 'On Drop Effect',
}

export function addNamespace(type: string, b: boolean) {
  if (!b) {
    return type;
  }
  return `${NAMESPACE}/${type}`;
}

export interface ISetSourceAction extends Action {
  source: IDatasource[];
}

export function createSetSourceAction(source: IDatasource[], withNamespace = false): ISetSourceAction {
  const type = addNamespace(ActionTypes.SetSource, withNamespace);
  return {
    type,
    source,
  };
}

export interface ISetInitSourceAction extends Action {
  source: IDatasource[];
}

export function createSetInitSourceAction(source: IDatasource[], withNamespace = false): ISetInitSourceAction {
  const type = addNamespace(ActionTypes.SetInitSource, withNamespace);
  return {
    type,
    source,
  };
}

export interface IUpdateItemAction extends Action {
  values: Partial<IDatasource> | Array<Partial<IDatasource>>;
}

export function createUpdateItemAction(values: Partial<IDatasource> | Array<Partial<IDatasource>>, withNamespace = false): IUpdateItemAction {
  const type = addNamespace(ActionTypes.UpdateItem, withNamespace);
  return {
    type,
    values,
  };
}

export interface IRemoveItemAction extends Action {
  id: string;
}

export function createRemoveItemAction(id: string, withNamespace = false): IRemoveItemAction {
  const type = addNamespace(ActionTypes.RemoveItem, withNamespace);
  return {
    type,
    id,
  };
}

export interface IAddItemAction extends Action {
  item: IDatasource;
}

export function createAddItemAction(item: IDatasource, withNamespace = false): IAddItemAction {
  const type = addNamespace(ActionTypes.AddItem, withNamespace);
  return {
    type,
    item,
  };
}

export interface IAddSubItemEffect extends Action {
  parentItem: IDatasource;
  callback?: (item: IDatasource) => any;
}

export function createAddSubItemEffect(parentItem: IDatasource, callback?: (item?: IDatasource) => any, withNamespace = true): IAddSubItemEffect {
  const type = addNamespace(ActionTypes.AddSubItemEffect, withNamespace);
  return {
    type,
    callback,
    parentItem,
  };
}

export interface IInitSourceEffect extends Action {
}

export function createInitSourceEffect(withNamespace = true): IInitSourceEffect {
  const type = addNamespace(ActionTypes.InitSourceEffect, withNamespace);
  return {
    type,
  };
}

export interface IOnDropEffect extends Action {
  dragId: string;
  dropId: string;
  position: number;
}

export function createOnDropEffect(dragId: string, dropId: string, position: number, withNamespace = true): IOnDropEffect {
  const type = addNamespace(ActionTypes.OnDropEffect, withNamespace);
  return {
    type,
    dragId,
    dropId,
    position,
  };
}
