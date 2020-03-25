import axios, { AxiosRequestConfig, AxiosPromise } from 'axios';
import * as _ from 'lodash';
import { IUiDraggableListItem } from 'src/ui/draggableList';
import { ROW_STATUS } from 'src/config';

let getSessionUrl: string;

(async function () {
  let result: any = {};
  try {
    result = await axios.get(`/bower_components/requirejs/require.js?t=${+new Date()}`, {
      responseType: 'text',
    });
  } catch (e) {
    //
  }
  const data = result.data;
  if (_.includes(data, '/gillion_gurs_web/system/security/getSessionAttrsAndNoPermits2')) {
    getSessionUrl = '/gillion_gurs_web/system/security/getSessionAttrsAndNoPermits2';
  } else if (_.includes(data, '/ipf/system/security/getSessionAttrsAndNoPermits2')) {
    getSessionUrl = '/ipf/system/security/getSessionAttrsAndNoPermits2';
  } else {
    getSessionUrl = '/gillion_gurs_web/system/security/getSessionAttrsAndNoPermits2';
  }
})();

export async function httpGet(url: string, config?: AxiosRequestConfig) {
  return axiosResponse(axios.get(url, config));
}

export async function httpPost(url: string, data?: any, config?: AxiosRequestConfig) {
  return axiosResponse(axios.post(url, data, config));
}

export async function axiosResponse(p: AxiosPromise<any>) {
  return p
    .then(resp => {
      const { data } = resp;
      if (data.success) {
        return data;
      }
      return Promise.reject(data);
    })
    .catch(reson => {
      if (reson.response && reson.response.data) {
        return Promise.reject(reson.response.data);
      }
      return Promise.reject(reson);
    });
}

export async function queryDicts(dictNames: string) {
  return httpGet('/ipf/dictionary/queryDictRows', {
    params: {
      params: dictNames,
    },
  });
}

export async function queryComponentGroup(config: any) {
  return httpGet('/ipf/ipfCcmBoPageLayoutTable/queryToVisualization', {
    params: {
      gridKey: '48a67cd2ab70434e901877ca37d691ca_HT',
      cascadeParam: {
        name: 'IpfCcmBoPageLayoutTable',
      },
      currentPage: 1,
      gridType: 'HTR',
      pageSize: 100,
      queryResultType: 'page',
      sum: false,
      searchColumns: {
        propertyName: 'componentType',
        columnName: 'COMPONENT_TYPE',
        dataType: 'S',
        value: 'X',
        operation: 'EQ',
      },
    },
  }).then((data) => {
    if (data.success) {
      return Promise.resolve(formatComponentGroupData(data, config));
    }
    return Promise.reject(data);
  });
}

function formatComponentGroupData(data: any, config: {
  tempChildrenLayoutsKey: string;
  childrenElementsKey: string;
  layoutEventsKey: string;
  elementEventsKey: string;
  parentCellNameKey: string;
  cellNameKey: string;
}) {
  const {
    ipfCcmBoPageLayoutTables,
    ipfCcmPages,
    listControlEventForEles,
    listControlEvents,
    listPageLayouts,
    listPgLoElements,
  } = data;
  const {
    tempChildrenLayoutsKey,
    childrenElementsKey,
    layoutEventsKey,
    elementEventsKey,
    parentCellNameKey,
    cellNameKey,
  } = config;
  const groupedPages = _.groupBy(ipfCcmPages, 'ipfCcmPageLayoutTableId');
  _.forEach(ipfCcmBoPageLayoutTables, t => {
    t.ipfCcmPages = groupedPages[t.ipfCcmPageLayoutTableId] || [];
    // _.forEach(ipfCcmPages, p => {
    //   p.displayName = t.layoutName;
    //   if (p.pageName !== t.layoutName) {
    //     p.displayName += `-${p.pageName}`;
    //   }
    // });
  });
  const groupedLayouts = _.chain(listPageLayouts)
    .orderBy('seqNo')
    .groupBy('ipfCcmPageId')
    .value();
  _.forEach(ipfCcmPages, p => {
    p.ipfCcmPageLayouts = groupedLayouts[p.ipfCcmPageId] || [];
    const groupedLayoutsByParentCellName = _.groupBy(p.ipfCcmPageLayouts, l => l[parentCellNameKey] || '');
    const rootLayouts = groupedLayoutsByParentCellName[''];
    next(rootLayouts);
    p.componentGroup = rootLayouts;

    function next(parentLayouts: any[]) {
      _.forEach(parentLayouts, pl => {
        const childrenLayouts = groupedLayoutsByParentCellName[pl[cellNameKey]] || [];
        pl.configItemCode = null;
        pl.rowStatus = ROW_STATUS.ADDED;
        pl[tempChildrenLayoutsKey] = childrenLayouts;
        if (childrenLayouts && childrenLayouts.length) {
          next(childrenLayouts);
        }
      });
    }
  });
  const groupedElements = _.chain(listPgLoElements)
    .orderBy('seqNo')
    .groupBy('ipfCcmPageLayoutId')
    .value();
  const groupedLayoutEvents = _.chain(listControlEvents)
    .filter(ev => ev.eventType)
    .groupBy('ipfCcmPageLayoutId')
    .value();
  _.forEach(listPageLayouts, l => {
    l[childrenElementsKey] = groupedElements[l.ipfCcmPageLayoutId] || [];
    l[layoutEventsKey] = groupedLayoutEvents[l.ipfCcmPageLayoutId] || [];
    l.ipfCcmPageId = null;
    l.ipfCcmPageLayoutId = null;
  });
  const groupedElementEvents = _.chain(listControlEventForEles)
    .filter(ev => ev.eventType)
    .groupBy('ipfCcmPgLoElementId')
    .value();
  _.forEach(listPgLoElements, e => {
    e[elementEventsKey] = groupedElementEvents[e.ipfCcmPgLoElementId] || [];
  });
  const componentGroups: any = _.chain(ipfCcmBoPageLayoutTables)
    .map(t => t.ipfCcmPages)
    .flatten()
    .filter(p => p.componentGroup && p.componentGroup.length === 1)
    .map(p => {
      return {
        title: p.pageName,
        type: 'layout',
        source: p.componentGroup[0],
      } as IUiDraggableListItem;
    })
    .value();
  return componentGroups;
}

export async function queryViews() {
  return httpGet('/ipf/ipfFciView/getViewComboTree')
    .then(data => data.success ? data.trees : Promise.reject(data));
}

export async function getSessionAttrsAndNoPermits() {
  // const url = '/ipf/system/security/getSessionAttrsAndNoPermits2';
  const url = getSessionUrl;
  if (!url) {
    return Promise.resolve({});
  }
  return axios.get(url, {
    params: {
      pageUrl: '/index.html',
      t: +new Date(),
    },
  }).then(res => {
    const sessionAttrs = _.get(res, 'data.sessionAttrs');
    const redirectUrl = _.get(res, 'data.redirectUrl');
    if (sessionAttrs) {
      return sessionAttrs;
    }
    if (redirectUrl) {
      return Promise.reject('NOT_LOGIN');
    }
    return Promise.reject(res.data);
  });
}

export function exportJsonFile(filename: string, obj: any) {
  const str = JSON.stringify(obj, null, 2);
  const uri = `data:text/json;charset=utf-8,\ufeff${encodeURIComponent(str)}`;
  const link = document.createElement('a');
  link.href = uri;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
