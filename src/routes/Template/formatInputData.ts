import * as _ from 'lodash';

import { TEMPLATE_CONFIG } from './config';

const {
  childrenElementsKey,
  cellNameKey,
  elementParentLayoutKey,
  layoutIdKey,
} = TEMPLATE_CONFIG;

export function formatInputData(dataIn: any) {
  const { boPageLayout, boPgLoElement } = dataIn;
  const groupedElements = _.groupBy(boPgLoElement, layoutIdKey);
  const output = _.map(boPageLayout, l => {
    const cellName = l[cellNameKey];
    const childrenElements = groupedElements[l[layoutIdKey]] || [];
    _.forEach(childrenElements, e => e[elementParentLayoutKey] = cellName);
    return _.assign({}, l, {
      [childrenElementsKey]: childrenElements,
    });
  });
  return output;
}
