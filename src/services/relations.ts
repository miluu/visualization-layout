import { httpGet, httpPost } from '.';
import { paramsSerializer } from 'src/utils';
import { IBoRelation, IBoTreeSourceItem } from 'src/models/relationsModel';
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

export interface ILoadBorelationsOptions {
  baseViewId: string;
  ipfCcmBoId: string;
}
export async function loadBoRelations({
  baseViewId,
  ipfCcmBoId,
}: ILoadBorelationsOptions) {
  const result = await httpGet('/ipf/ipfCcmBoRelation/query', {
    params: {
      baseViewId,
      cascadeParam: { name: 'IpfCcmBoRelation' },
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
  return result?.ipfCcmBoRelations;
}

interface ISaveBoRelationOptions  {
  data: IBoRelation;
  baseViewId?: string;
  type: string;
}
export async function saveOrUpdateBoRelation({
  data,
  baseViewId,
  type,
}: ISaveBoRelationOptions) {
  const method = type === 'add' ? 'save' : 'update';
  return httpPost(`/ipf/ipfCcmBoRelation/${method}`, data, {
    params: {
      $v_group_name: 'IpfCcmBoRelation_Default',
      baseViewId,
    },
    paramsSerializer,
  });
}

interface IDeleteBoRelationsOptions {
  ids: string[];
  baseViewId?: string;
}
export async function deleteBoRelations({
  ids,
  baseViewId,
}: IDeleteBoRelationsOptions) {
  return httpPost(
    '/ipf/ipfCcmBoRelation/deletes',
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
