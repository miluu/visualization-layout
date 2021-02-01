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
  /*const boParams = {
    baseViewId: params['baseViewId'],
    cascadeParam: { name: 'IpfCcmBoPage' },
    currentPage: 1,
    gridType: 'HTR',
    pageSize: 500,
    queryResultType: 'page',
    sum: false,
    searchColumns: [
      {
        propertyName: 'boName',
        columnName: 'BO_NAME', // IPF_CCM_BO_ID
        dataType: 'S',
        value: 'JwTest', // params['ipfCcmBoId']
        operation: 'EQ',
      },
      {
        propertyName: 'baseViewId',
        columnName: 'BASE_VIEW_ID',
        dataType: 'S',
        value: params['baseViewId'],
        operation: 'EQ',
      },
    ],
  };
  return axios.get(VISUALIZATION_CONFIG.queryBoPageListUrl, {
    params: boParams,
    paramsSerializer,
  }).then(resp => {
    return resp.data.ipfCcmBoPages;
  });*/
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

export function dataElementCodeQueryMethodCreator(urlParams: {urlParams: any}) {
  const baseViewId = window['__urlParams']?.baseViewId;
  return async function dataElementCodeQueryMethod(options: IQueryOptions) {
    let result: IQueryResult;
    const {
      currentPage,
      pageSize,
      keywords,
      isExactQuery,
    } = options;
    const searchColumns: any[] = [{
      propertyName: 'baseViewId',
      columnName: 'BASE_VIEW_ID',
      dataType: 'S',
      value: baseViewId,
      operation:'EQ',
    }];
    if (isExactQuery && keywords) {
      searchColumns.push({
        propertyName: 'elementCode',
        columnName: 'ELEMENT_CODE',
        dataType: 'S',
        value: keywords,
        operation:'EQ',
      });
    } else if (keywords) {
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
    const res = await httpGet('/ipf/ipfDmlElement/custom/query', {
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

export async function titleMsgCodeQueryMethod(options: IQueryOptions) {
  const baseViewId = window['__urlParams']?.baseViewId;
  let result: IQueryResult;
  const {
    currentPage,
    pageSize,
    keywords,
    isExactQuery,
  } = options;
  const searchColumns: any[] = [{
    propertyName: 'baseViewId',
    columnName: 'BASE_VIEW_ID',
    dataType: 'S',
    value: baseViewId,
    operation:'EQ',
  }];
  if (isExactQuery && keywords) {
    searchColumns.push({
      propertyName:'messageKey',
      columnName:'MESSAGE_KEY',
      dataType:'S',
      value: keywords,
      operation: 'EQ',
    });
  } else if (keywords) {
    searchColumns.push({
      propertyName:'messageKey',
      columnName:'MESSAGE_KEY',
      dataType:'S',
      junction:'or',
      value: keywords,
      operation: 'LIKEIC',
    }, {
      propertyName:'messageText',
      columnName:'MESSAGE_TEXT',
      dataType:'S',
      junction:'or',
      value: keywords,
      operation: 'LIKEIC',
    });
  }
  let res: any;
  res = await httpGet('/ipf/ipfLanguageMsg/custom/query', {
    paramsSerializer,
    params: {
      type: 'S',
      sourceName: 'IpfLanguageMsg',
      searchName: 'ShlpIpfLanguageMsgCode',
      baseViewId,
      currentPage,
      messageKey: keywords,
      pageSize,
      queryResultType: 'page',
      sum: 'false',
      searchColumns,
    },
  });
  // res = {
  //   ipfLanguageMsgs: [
  //     { messageKey: 'Hello', messageText: 'World' },
  //     { messageKey: 'Hello2', messageText: 'World2' },
  //     { messageKey: 'Hello3', messageText: 'World3' },
  //     { messageKey: 'Hello4', messageText: 'World4' },
  //   ],
  //   msg: '操作成功！',
  //   success: true,
  //   total: 4,
  //   type: 'info',
  // };
  result = {
    source: res.ipfLanguageMsgs || [],
    total: res.total,
  };
  return result;
}
