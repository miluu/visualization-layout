import { IBoTreeSourceItem, IMethodsState } from 'src/models/methodsModel';

import * as _ from 'lodash';

export function getSelectBoTreeItem(state: IMethodsState): IBoTreeSourceItem {
  const {
    selectedBoTreeItem,
    boTreeSource,
  } = state;
  if (!selectedBoTreeItem) {
    return null;
  }
  return _.find(boTreeSource, item => item.id === selectedBoTreeItem);
}
