import { IBoTreeSourceItem, IBusinessTypesState } from 'src/models/businessTypesModel';

import * as _ from 'lodash';

export function getSelectBoTreeItem(state: IBusinessTypesState): IBoTreeSourceItem {
  const {
    selectedBoTreeItem,
    boTreeSource,
  } = state;
  if (!selectedBoTreeItem) {
    return null;
  }
  return _.find(boTreeSource, item => item.id === selectedBoTreeItem);
}
