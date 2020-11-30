import { httpGet } from '.';
import { IQueryOptions, IQueryResult } from 'src/ui/associate';
import { paramsSerializer } from 'src/utils';

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

export function queryPropertyCreator({ values }: {values: any}) {
  return async function queryProperty(options: IQueryOptions) {
    let result: IQueryResult;
    const baseViewId = window['__urlParams']?.baseViewId;
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
    }, {
      propertyName: 'boName',
      columnName: 'BO_NAME',
      dataType: 'S',
      value: values.layoutBoName || '',
      operation:'EQ',
    }];
    if (isExactQuery && keywords) {
      searchColumns.push({
        propertyName:'propertyName',
        columnName:'PROPERTY_NAME',
        dataType:'S',
        value: keywords,
        operation: 'EQ',
      });
    } else if (keywords) {
      searchColumns.push({
        propertyName:'propertyName',
        columnName:'PROPERTY_NAME',
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
        sourceName: 'VwIpfCcmBoProperty',
        searchName: 'IpfCcmBoProperty',
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
      source: res.vwIpfCcmBoPropertys || [],
      total: res.total,
    };
    return result;
  };
}

export function queryMethodCreator({ values }: {values: any}) {
  return async function queryProperty(options: IQueryOptions) {
    let result: IQueryResult;
    const baseViewId = window['__urlParams']?.baseViewId;
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
    }, {
      propertyName: 'boName',
      columnName: 'BO_NAME',
      dataType: 'S',
      value: values.layoutBoName || '',
      operation:'EQ',
    }];
    if (isExactQuery && keywords) {
      searchColumns.push({
        propertyName:'methodName',
        columnName:'METHOD_NAME',
        dataType:'S',
        value: keywords,
        operation: 'EQ',
      });
    } else if (keywords) {
      searchColumns.push({
        propertyName:'methodName',
        columnName:'METHOD_NAME',
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
        sourceName: 'VwIpfCcmBoMethod',
        searchName: 'IpfCcmBoFormColumnMethod',
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
      source: res.vwIpfCcmBoMethods || [],
      total: res.total,
    };
    return result;
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
