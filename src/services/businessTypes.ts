import { httpGet, httpPost } from '.';
import { paramsSerializer } from 'src/utils';
import { IBoBusinessType, IBoTreeSourceItem } from 'src/models/businessTypesModel';
import { IQueryOptions, IQueryResult } from 'src/ui/associate';

export interface ILoadBoTreeSourceOptions{
  baseViewId: string;
  ipfCcmBoId: string;
}

export async function loadBoTreeSource({
  baseViewId,
  ipfCcmBoId,
}: ILoadBoTreeSourceOptions): Promise<IBoTreeSourceItem[]> {
  const result = await httpGet('/ipf/ipfCcmBo/getIpfCcmBoTree', {
    params: {
      baseViewId,
      ipfCcmBoId,
    },
    paramsSerializer,
  });
  return result?.result;
}

export interface ILoadBobusinessTypesOptions {
  baseViewId: string;
  ipfCcmBoId: string;
}
export async function loadBoBusinessTypes({
  baseViewId,
  ipfCcmBoId,
}: ILoadBobusinessTypesOptions) {
  const result = await httpGet('/ipf/ipfCcmBoBusinessType/query', {
    params: {
      baseViewId,
      cascadeParam: { name: 'IpfCcmBoBusinessType' },
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
  return result?.ipfCcmBoBusinessTypes;
}

interface ISaveBoBusinessTypeOptions  {
  data: IBoBusinessType;
  baseViewId?: string;
  type: string;
}
export async function saveOrUpdateBoBusinessType({
  data,
  baseViewId,
  type,
}: ISaveBoBusinessTypeOptions) {
  const method = type === 'add' ? 'save' : 'update';
  return httpPost(`/ipf/ipfCcmBoBusinessType/${method}`, data, {
    params: {
      $v_group_name: 'IpfCcmBoBusinessType_Default',
      baseViewId,
    },
    paramsSerializer,
  });
}

interface IDeleteBoBusinessTypesOptions {
  ids: string[];
  baseViewId?: string;
}
export async function deleteBoBusinessTypes({
  ids,
  baseViewId,
}: IDeleteBoBusinessTypesOptions) {
  return httpPost(
    '/ipf/ipfCcmBoBusinessType/deletes',
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

export async function queryBusinessTypeMethod(options: IQueryOptions, ipfCcmBoId?: string, boName?: string) {
  const baseViewId = window['__urlParams']?.baseViewId;
  let result: IQueryResult;
  const {
    currentPage,
    pageSize,
    keywords,
    isExactQuery,
  } = options;
  const searchColumns: any[] = [
    {
      propertyName: 'baseViewId',
      columnName: 'BASE_VIEW_ID',
      dataType: 'S',
      value: baseViewId,
      operation:'EQ',
    },
  ];
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
      propertyName:'businessType',
      columnName:'BUSINESS_TYPE',
      dataType:'S',
      value: keywords,
      operation: 'EQ',
    });
  } else if (keywords) {
    searchColumns.push({
      propertyName:'businessType',
      columnName:'BUSINESS_TYPE',
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
      sourceName: 'VwIpfBoBusinessTypeLast',
      searchName: 'BusinessType',
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
    source: res.vwIpfBoBusinessTypeLasts || [],
    total: res.total,
  };
  return result;
}

// 批量提交
interface ICommitBoBusinessTypeOptions  {
  ids: string;
  remark: string;
  baseViewId?: string;
}
export async function commitBoBusinessType({
  ids,
  remark,
  baseViewId,
}: ICommitBoBusinessTypeOptions) {
  return httpPost('/ipf/ipfCcmBoBusinessType/commit', null, {
    params: {
      ids,
      remark,
      baseViewId,
    },
    paramsSerializer,
  });
}
