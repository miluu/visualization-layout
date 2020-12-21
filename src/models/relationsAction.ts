import { Action } from 'redux';
import * as _ from 'lodash';
import { IBoTreeSourceItem } from './relationsModel';

export const NAMESPACE = 'RELATIONS';

export enum ActionTypes {
  SetRelations = 'Set Relations',
  AddRelation = 'Add Relation',
  SetEditingRelation = 'Set Editing Relation',
  SetBoTreeSource = 'Set Bo Tree Source',

  LoadRelationsEffect = 'Load Relations Effect',
  AddRelationEffect = 'Add Relation Effect',
  EditRelationEffect = 'Edit Relation Effect',
  SaveOrUpdateRelationEffect = 'Save Or Update Relation Effect',
  DeleteRelationsEffect = 'Delete Relations Effect',
  LoadBoTreeSourceEffect = 'Load Bo Tree Source Effect',
}

export function addNamespace(type: string, b: boolean) {
  if (!b) {
    return type;
  }
  return `${NAMESPACE}/${type}`;
}

// Actions

export interface ISetDataSourceAction extends Action {
  boTreeSource: IBoTreeSourceItem[];
}

export function createSetDataSourceAction(boTreeSource: IBoTreeSourceItem[], withNamespace = false): ISetDataSourceAction {
  const type = addNamespace(ActionTypes.SetBoTreeSource, withNamespace);
  return {
    type,
    boTreeSource,
  };
}

// Effects
export interface ILoadBoTreeSourceEffect extends Action {
}

export function createLoadDataSourceEffect(withNamespace = true): ILoadBoTreeSourceEffect {
  const type = addNamespace(ActionTypes.LoadBoTreeSourceEffect, withNamespace);
  return {
    type,
  };
}
