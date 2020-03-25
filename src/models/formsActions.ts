import { NAMESPACE } from './formsModel';
import { Action } from 'redux';
import { IFormItemOption } from 'src/utils/forms';

export enum ActionTypes {
  SetPropertyFormOptions = 'Set Property Form Options',
  SetLayoutAndElementPropertyFormOptions = 'Set Layout And Element Property Form Options',
  SetActiveFormKey = 'Set Active Form Key',

  ChangePropertyFormWatcher = 'Change Property Form Watcher',
}

export function addNamespace(type: string, b: boolean) {
  if (!b) {
    return type;
  }
  return `${NAMESPACE}/${type}`;
}

export interface ISetPropertyFormOptionsAction extends Action {
  options: IFormItemOption[];
}

export function createSetPropertyFormOptionsAction(options: IFormItemOption[], withNamespace = false): ISetPropertyFormOptionsAction {
  const type = addNamespace(ActionTypes.SetPropertyFormOptions, withNamespace);
  return {
    type,
    options,
  };
}

export interface ISetLayoutAndElementPropertyFormOptionsAction extends Action {
  layoutPropertyFormOptions: IFormItemOption[];
  elementPropertyFormOptions: IFormItemOption[];
}

export function createSetLayoutAndElementPropertyFormOptionsAction(
  layoutPropertyFormOptions: IFormItemOption[],
  elementPropertyFormOptions: IFormItemOption[],
  withNamespace = false,
): ISetLayoutAndElementPropertyFormOptionsAction {
  const type = addNamespace(ActionTypes.SetLayoutAndElementPropertyFormOptions, withNamespace);
  return {
    type,
    layoutPropertyFormOptions,
    elementPropertyFormOptions,
  };
}
export interface ISetActiveFormKeyAction extends Action {
  activeFormKey: string;
}

export function createSetActiveFormKeyAction(activeFormKey: string, withNamespace = false): ISetActiveFormKeyAction {
  const type = addNamespace(ActionTypes.SetActiveFormKey, withNamespace);
  return {
    type,
    activeFormKey,
  };
}

export interface IChangePropertyFormWatcher extends Action {
}
export function createChangePropertyFormWatcherAction(withNamespace = false): IChangePropertyFormWatcher {
  const type = addNamespace(ActionTypes.ChangePropertyFormWatcher, withNamespace);
  return { type };
}
