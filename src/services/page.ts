import { httpGet, httpPost } from '.';
import { paramsSerializer } from 'src/utils';
import { IQueryOptions, IQueryResult } from 'src/ui/associate';
import { IIpfCcmPage } from 'src/routes/Visualization/types';

export interface ILoadBoPageOptions {
  baseViewId: string;
  ipfCcmBoId: string;
}
export async function loadBoPages({
  baseViewId,
  ipfCcmBoId,
}: ILoadBoPageOptions) {
  const result = await httpGet('/ipf/ipfCcmBoPage/query', {
    params: {
      baseViewId,
      cascadeParam: { name: 'IpfCcmBoPage' },
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
  return result?.ipfCcmBoPages;
}

interface ISaveBoPageOptions  {
  data: IIpfCcmPage;
  baseViewId?: string;
  type: string;
}
export async function saveOrUpdateBoPage({
  data,
  baseViewId,
  type,
}: ISaveBoPageOptions) {
  const method = type === 'add' ? 'saveExt' : 'updateExt';
  return httpPost(`/ipf/ipfCcmBoPage/${method}`, data, {
    params: {
      baseViewId,
    },
    paramsSerializer,
  });
}

interface IDeleteBoPagesOptions {
  ids: string[];
  baseViewId?: string;
}
export async function deleteBoPages({
  ids,
  baseViewId,
}: IDeleteBoPagesOptions) {
  return httpPost(
    '/ipf/ipfCcmBoPage/deletes',
    ids,
    {
      params: {
        baseViewId,
      },
      paramsSerializer,
    },
  );
}

export interface IGetIpfCcmBoPageOptions {
  baseViewId: string;
  ipfCcmBoPageId: string;
}
export async function getIpfCcmBoPage({
  baseViewId,
  ipfCcmBoPageId,
}: IGetIpfCcmBoPageOptions) {
  const result = await httpGet('/ipf/ipfCcmBoPage/getIpfCcmBoPage', {
    params: {
      baseViewId,
      ipfCcmBoPageId,
      cascade: false,
    },
    paramsSerializer,
  });
  return result?.ipfCcmBoPage;
}

interface ICopyBoPageOptions {
  id: string;
  baseViewId?: string;
}
export async function copyBoPage({
  id,
  baseViewId,
}: ICopyBoPageOptions) {
  return httpPost(
    '/ipf/ipfCcmBoPage/copyPageDataExt',
    {
      ids: id,
      baseViewId,
    },
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
