import * as _ from 'lodash';
import { ROW_STATUS } from 'src/config';

export function formatLayouts(
  inputLayouts: any[],
  childrenElementsKey: string,
  cellNameKey: string,
  layoutEventsKey: string,
  elementEventsKey: string,
) {
  const output = {
    boPageLayout: [] as any[],
    boPgLoElement: [] as any[],
  };
  let baseViewId: string;
  try {
    const parentScope = window.parent['$']('body').scope();
    baseViewId = parentScope.params.baseViewId;
  } catch (e) {
    console.warn(e);
  }
  _.forEach(inputLayouts, l => {
    const clone = _.cloneDeep(l);
    const elements = clone[childrenElementsKey];
    const cellName = clone[cellNameKey];
    delete clone[childrenElementsKey];
    clone.baseViewId = baseViewId;
    clone[layoutEventsKey] = _.chain(clone[layoutEventsKey])
      .filter(ev => ev.__isActive !== false)
      .forEach(ev => {
        delete ev.__isActive;
        ev.rowStatus = ROW_STATUS.ADDED;
      })
      .value();
    clone.rowStatus = ROW_STATUS.ADDED;
    output.boPageLayout.push({
      formHeaders: null,
      ipfCcmBoFormToolbars: [],
      ipfCcmBoGridColumns: [],
      ipfCcmBoGridToolbars: [],
      ipfCcmBoPageLayout: clone,
      ipfCcmBoPageLayoutCopy: null,
      rowStatus: ROW_STATUS.ADDED,
      searchFormColumns: [],
    });
    _.forEach(elements, e => {
      e.rowStatus = ROW_STATUS.ADDED;
      e.baseViewId = baseViewId;
      e[elementEventsKey] = _.chain(e[elementEventsKey])
        .filter(ev => ev.__isActive !== false)
        .forEach(ev => {
          delete ev.__isActive;
          ev.rowStatus = ROW_STATUS.ADDED;
        })
        .value();
      output.boPgLoElement.push({
        cellName,
        ipfCcmBoFormColumn: null,
        ipfCcmBoGridColumn: null,
        ipfCcmBoPgLoElement: e,
        rowStatus: ROW_STATUS.ADDED,
      });
    });
  });
  return output;
}
