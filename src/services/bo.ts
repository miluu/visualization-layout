import { httpGet } from '.';
import * as _ from 'lodash';
import { IQueryOptions, IQueryResult } from 'src/ui/associate';
import { paramsSerializer } from 'src/utils';
import { IPropertiesMap } from 'src/models/layoutsModel';

export async function queryBoName(options: IQueryOptions) {
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
      propertyName:'boName',
      columnName:'BO_NAME',
      dataType:'S',
      value: keywords,
      operation: 'EQ',
    });
  } else if (keywords) {
    searchColumns.push({
      propertyName:'boName',
      columnName:'BO_NAME',
      dataType:'S',
      junction:'or',
      value: keywords,
      operation: 'LIKEIC',
    });
  }
  let res: any;
  res = await httpGet('/ipf/commonSearchHelp/query', {
    paramsSerializer,
    params: {
      type: 'S',
      sourceName: 'IpfCcmBo',
      searchName: 'ShlpIpfCcmBo',
      baseViewId,
      currentPage,
      boName: keywords,
      pageSize,
      queryResultType: 'page',
      sum: 'false',
      searchColumns,
    },
  });
  result = {
    source: res.ipfCcmBos || [],
    total: res.total,
  };
  return result;
}

export function queryPropertyMehodCreator({ values, propertiesMap }: {values: any, propertiesMap: IPropertiesMap}) {
  const boName = values?.layoutBoName;
  const properties = propertiesMap?.[boName] ?? [];
  return async function queryProperty(options: IQueryOptions) {
    const {
      currentPage,
      pageSize,
      keywords,
    } = options;
    const _keywords = (keywords ?? '').toLowerCase();
    const filterProperties = _.filter(properties, p => {
      return p.propertyName?.toLowerCase().indexOf(_keywords) >= 0;
    });
    const total = filterProperties.length;
    const source = filterProperties.slice(pageSize * (currentPage - 1), pageSize * currentPage);
    return {
      total,
      source,
    };
  };
}

export async function queryDictMethod(options: IQueryOptions) {
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
      propertyName:'dictCode',
      columnName:'DICT_CODE',
      dataType:'S',
      value: keywords,
      operation: 'EQ',
    });
  } else if (keywords) {
    searchColumns.push({
      propertyName:'dictCode',
      columnName:'DICT_CODE',
      dataType:'S',
      junction:'or',
      value: keywords,
      operation: 'LIKEIC',
    }, {
      propertyName:'dictName',
      columnName:'DICT_NAME',
      dataType:'S',
      junction:'or',
      value: keywords,
      operation: 'LIKEIC',
    });
  }
  let res: any;
  res = await httpGet('/ipf/commonSearchHelp/query', {
    paramsSerializer,
    params: {
      type: 'S',
      sourceName: 'IpfCcmDict',
      searchName: 'ShlpIpfCcmDict',
      baseViewId,
      currentPage,
      boName: keywords,
      pageSize,
      queryResultType: 'page',
      sum: 'false',
      searchColumns,
    },
  });
  result = {
    source: res.ipfCcmDicts || [],
    total: res.total,
  };
  return result;
}

export async function queryShlpMethod(options: IQueryOptions) {
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
  if (keywords && isExactQuery) {
    searchColumns.push({
      propertyName:'shlpName',
      columnName:'SHLP_NAME',
      dataType:'S',
      value: keywords,
      operation: 'EQ',
    });
  } else if (keywords) {
    searchColumns.push({
      propertyName:'shlpName',
      columnName:'SHLP_NAME',
      dataType:'S',
      junction:'or',
      value: keywords,
      operation: 'LIKEIC',
    });
  }
  let res: any;
  res = await httpGet('/ipf/commonSearchHelp/query', {
    paramsSerializer,
    params: {
      type: 'S',
      sourceName: 'IpfCcmShlp',
      searchName: 'ShlpIpfCcmShlp',
      baseViewId,
      currentPage,
      boName: keywords,
      pageSize,
      queryResultType: 'page',
      sum: 'false',
      searchColumns,
    },
  });
  result = {
    source: res.ipfCcmShlps || [],
    total: res.total,
  };
  return result;
}
