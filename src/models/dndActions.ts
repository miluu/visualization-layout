import { Action } from 'redux';

export const NAMESPACE = 'DND';

export enum ActionTypes {
  DragStart = 'Drag Start',
  DragEnd = 'Drag End',
  DragOver = 'Drag Over',
  DragLeave = 'Drag Leave',
  ClearTarget = 'Clear Target',

  DropEffect = 'Drop Effect',
  DropAddEffect = 'Drop Add Effect',
}

export function addNamespace(type: string, b: boolean) {
  if (!b) {
    return type;
  }
  return `${NAMESPACE}/${type}`;
}

export interface IDragStartAction extends Action {
  dragSource: any;
  dragSourceType: string;
  isAdd?: boolean;
}

export function createDragStartAction(dragSource: any, dragSourceType = 'layout', isAdd = false, withNamespace = true): IDragStartAction {
  const type = addNamespace(ActionTypes.DragStart, withNamespace);
  return {
    type,
    dragSource,
    dragSourceType,
    isAdd,
  };
}

export interface IDragEndAction extends Action {
}

export function createDragEndAction(withNamespace = true): IDragEndAction {
  const type = addNamespace(ActionTypes.DragEnd, withNamespace);
  return {
    type,
  };
}

export interface IClearTargetAction extends Action {
}

export function createClearTargetAction(withNamespace = true): IClearTargetAction {
  const type = addNamespace(ActionTypes.ClearTarget, withNamespace);
  return {
    type,
  };
}

export interface IDragOverAction extends Action {
  target: any;
  targetType: string;
  position: number;
}

export function createDragOverAction(target: any, targetType: string, position: number, withNamespace = true): IDragOverAction {
  const type = addNamespace(ActionTypes.DragOver, withNamespace);
  return {
    type,
    target,
    targetType,
    position,
  };
}

interface IDndOptions {
  dragSource: any;
  dragSourceType: string;
  isAdd: boolean;
  target: any;
  targetType: string;
  position: number;
}

export interface IDropEffect extends Action {
  options?: IDndOptions;
}

export function createDropEffect(options?: IDndOptions, withNamespace = true): IDropEffect {
  const type = addNamespace(ActionTypes.DropEffect, withNamespace);
  return { type, options };
}
export interface IDropAddEffect extends Action {
}

export function createDropAddEffect(withNamespace = true): IDropAddEffect {
  const type = addNamespace(ActionTypes.DropAddEffect, withNamespace);
  return { type };
}
