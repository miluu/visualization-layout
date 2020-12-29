import { IBoTreeSourceItem, IRelationsState } from 'src/models/relationsModel';

import * as _ from 'lodash';

export function getSelectBoTreeItem(state: IRelationsState): IBoTreeSourceItem {
  const {
    selectedBoTreeItem,
    boTreeSource,
  } = state;
  if (!selectedBoTreeItem) {
    return null;
  }
  return _.find(boTreeSource, item => item.id === selectedBoTreeItem);
}
