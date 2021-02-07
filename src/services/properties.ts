import { httpGet, httpPost } from '.';
import { paramsSerializer } from 'src/utils';
import { IBoProperty } from 'src/models/propertiesModel';
import { IQueryOptions, IQueryResult } from 'src/ui/associate';

export interface ILoadBoPropertiesOptions {
  baseViewId: string;
  ipfCcmBoId: string;
}
export async function loadBoProperties({
  baseViewId,
  ipfCcmBoId,
}: ILoadBoPropertiesOptions) {
  const result = await httpGet('/ipf/ipfCcmBoProperty/query', {
    params: {
      baseViewId,
      cascadeParam: { name: 'IpfCcmBoProperty' },
      currentPage: 1,
      gridType: 'HTR',
      pageSize: 500,
      queryResultType: 'page',
      sum: false,
      searchColumns: [
        {
          propertyName: 'ipfCcmBoId',
          columnName: 'IPF_CCM_BO_ID',
          dataType: 'S',
          value: ipfCcmBoId,
          operation: 'EQ',
        },
        {
          propertyName: 'baseViewId',
          columnName: 'BASE_VIEW_ID',
          dataType: 'S',
          value: baseViewId,
          operation: 'EQ',
        },
      ],
    },
    paramsSerializer,
  });
  return result?.ipfCcmBoPropertys;
}

interface ISaveBoPropertyOptions  {
  data: IBoProperty;
  baseViewId?: string;
  type: string;
}
export async function saveOrUpdateBoProperty({
  data,
  baseViewId,
  type,
}: ISaveBoPropertyOptions) {
  const method = type === 'add' ? 'save' : 'update';
  return httpPost(`/ipf/ipfCcmBoProperty/${method}`, data, {
    params: {
      $v_group_name: 'IpfCcmBoProperty_Default',
      baseViewId,
    },
    paramsSerializer,
  });
}

interface IDeleteBoPropertiesOptions {
  ids: string[];
  baseViewId?: string;
}
export async function deleteBoProperties({
  ids,
  baseViewId,
}: IDeleteBoPropertiesOptions) {
  return httpPost(
    '/ipf/ipfCcmBoProperty/deletes',
    ids,
    {
      params: {
        baseViewId,
      },
      paramsSerializer,
    },
  );
}

export async function queryPropertyNameMethod(options: IQueryOptions, ipfCcmBoId?: string, boName?: string) {
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
  if (boName) {
    searchColumns.push({
      propertyName: 'boName',
      columnName: 'BO_NAME',
      dataType:'S',
      value: boName || '',
      operation: 'EQ',
    });
  }
  if (ipfCcmBoId) {
    searchColumns.push({
      propertyName: 'ipfCcmBoId',
      columnName: 'IPF_CCM_BO_ID',
      dataType:'S',
      value: ipfCcmBoId || '',
      operation: 'EQ',
    });
  }
  if (keywords && isExactQuery) {
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
      sourceName: 'IpfCcmBoProperty',
      searchName: 'VwIpfCcmBoProperty',
      baseViewId,
      currentPage,
      propertyName: keywords,
      pageSize,
      queryResultType: 'page',
      sum: 'false',
      searchColumns,
    },
  });
  result = {
    source: res.ipfCcmBoPropertys || [],
    total: res.total,
  };
  return result;
}

export async function querySubPropertyNameMethod(options: IQueryOptions, boName?: string) {
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
  searchColumns.push({
    propertyName: 'boName',
    columnName: 'BO_NAME',
    dataType:'S',
    value: boName || '',
    operation: 'EQ',
  });
  if (keywords && isExactQuery) {
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
      propertyName: keywords,
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
}

export async function queryElementCodeMethod(options: IQueryOptions) {
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
      propertyName:'elementCode',
      columnName:'ELEMENT_CODE',
      dataType:'S',
      value: keywords,
      operation: 'EQ',
    });
  } else if (keywords) {
    searchColumns.push({
      propertyName:'elementCode',
      columnName:'ELEMENT_CODE',
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
      sourceName: 'IpfDmlElementWithoutQuote',
      searchName: 'ElementCode',
      baseViewId,
      currentPage,
      propertyName: keywords,
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
}
export async function querySearchHelpMethod(options: IQueryOptions) {
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
  }, {
    propertyName:'revisionStatus',
    columnName:'REVISION_STATUS',
    dataType:'S',
    value: 'COM',
    operation: 'EQ',
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
  res = await httpGet('/ipf/ipfCcmShlp/query', {
    paramsSerializer,
    params: {
      type: 'S',
      baseViewId,
      currentPage,
      propertyName: keywords,
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

export async function queryDictTableMethod(options: IQueryOptions) {
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
      propertyName:'dictCode',
      columnName:'DICT_CODE',
      dataType:'S',
      junction:'or',
      value: keywords,
      operation: 'EQ',
    });
    searchColumns.push({
      propertyName:'dictName',
      columnName:'DICT_NAME',
      dataType:'S',
      junction:'or',
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
    });
    searchColumns.push({
      propertyName:'dictName',
      columnName:'DICT_NAME',
      dataType:'S',
      junction:'or',
      value: keywords,
      operation: 'LIKEIC',
    });
  }
  let res: any;
  res = await httpGet('/ipf/ipfCcmDict/query', {
    paramsSerializer,
    params: {
      type: 'S',
      baseViewId,
      currentPage,
      propertyName: keywords,
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
