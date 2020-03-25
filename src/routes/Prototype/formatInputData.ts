// tslint:disable
import * as _ from 'lodash';

import { PROTOTYPE_CONFIG } from './config';

const {
  layoutIdKey,
  elementParentLayoutIdKey,
  childrenElementsKey,
} = PROTOTYPE_CONFIG;

export function formatInputData(dataIn: any) {
  const layouts = _.cloneDeep(dataIn.ipfCcmOriginPageLayout) || [];
  const elements = dataIn.ipfCcmOriginPgLoEles || [];

  const groupedElements = _.chain(elements)
    .orderBy(PROTOTYPE_CONFIG.elementOrderKey)
    .groupBy(elementParentLayoutIdKey)
    .value();
  _.forEach(groupedElements, (eles, layoutId) => {
    const layout = _.find(layouts, l => l[layoutIdKey] === layoutId);
    if (layout) {
      layout[childrenElementsKey] = eles;
    }
  });

  return {
      boPageLayout: layouts,
      properties: dataIn.properties || {},
      methods: dataIn.method || {},
      defaultSetting: dataIn.defaultSetting || {}
  };
}
