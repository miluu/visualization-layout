import axios from 'axios';

import { IIpfCcmPage } from './types';
import { VISUALIZATION_CONFIG } from './config';
import { httpGet, httpPost } from 'src/services';
import { IQueryOptions, IQueryResult } from 'src/ui/associate';
import { paramsSerializer } from 'src/utils';

export async function queryPageList(params: any): Promise<IIpfCcmPage[]> {
  return axios.get(VISUALIZATION_CONFIG.queryPageListUrl, {
    params,
  }).then(resp => {
    return resp.data.boPageList;
  });
}

export async function queryPage(params: any): Promise<any> {
  return httpGet(VISUALIZATION_CONFIG.queryPageUrl, {
    params,
  });
}

export async function saveVisualizationPage(data: any): Promise<any> {
  return httpPost(VISUALIZATION_CONFIG.savePageUrl, data);
}

export async function uniqValidateLayoutCode(value: string): Promise<any> {
  return httpPost('/ipf/validation/unique', {
    boName: 'IpfCcmBoPageLayoutTable',
    configItemCode: '',
    entityName: 'com.gillion.platform.implement.classic.domain.IpfCcmBoPageLayoutTable',
    fieldNames: ['ipfCcmBoPageLayoutTable.layoutCode'],
    fieldValues: [value],
    pkValue: -9999999,
    version: false,
  })
    .then((data) => {
      return new Promise((resolve, reject) => {
        if (data && data.success) {
          resolve();
          return;
        }
        reject();
      });
    });
}

export async function layoutCodeUniqValidator(rule: any, value: string, callback: any) {
  try {
    await uniqValidateLayoutCode(value);
  } catch (e) {
    callback('布局编码必须唯一');
    return;
  }
  callback();
}

export async function convertToPrototype(params: any): Promise<any> {
  return httpPost(VISUALIZATION_CONFIG.convertPrototypeUrl, params);
}

export function dataElementCodeQueryMethodCreator(urlParams: any) {
  const baseViewId = urlParams.baseViewId;
  return async function dataElementCodeQueryMethod(options: IQueryOptions) {
    let result: IQueryResult;
    const {
      currentPage,
      pageSize,
      keywords,
    } = options;
    const searchColumns: any[] = [{
      propertyName: 'baseViewId',
      columnName: 'BASE_VIEW_ID',
      dataType: 'S',
      value: baseViewId,
      operation:'EQ',
    }];
    if (keywords) {
      searchColumns.push({
        propertyName: 'elementCode',
        columnName: 'ELEMENT_CODE',
        dataType: 'S',
        junction: 'or',
        value: keywords,
        operation:'LIKEIC',
      }, {
        propertyName: 'fieldText',
        columnName: 'FIELD_TEXT',
        dataType: 'S',
        junction:'or',
        value: keywords,
        operation:'LIKEIC',
      }, {
        propertyName: 'dbType',
        columnName: 'DB_TYPE',
        dataType: 'S',
        junction: 'or',
        value: keywords,
        operation:'LIKEIC',
      });
    }
    const res = await httpGet('/ipf/ipfDmlElement/query', {
      paramsSerializer,
      params: {
        type: 'S',
        sourceName: 'IpfDmlElement',
        searchName: 'ElementCode',
        baseViewId,
        currentPage,
        elementCode: keywords,
        pageSize,
        queryResultType: 'page',
        sum: 'false',
        searchColumns,
      },
    });
    result = {
      source: res.ipfDmlElements || [],
      total: res.total,
    };
    return result;
  };
}
