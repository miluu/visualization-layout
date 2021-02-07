import { httpGet, httpPost } from '.';
import { paramsSerializer } from 'src/utils';
import { IBoMethod } from 'src/models/methodsModel';
import { IQueryOptions, IQueryResult } from 'src/ui/associate';

export interface ILoadBomethodsOptions {
  baseViewId: string;
  ipfCcmBoId: string;
}
export async function loadBoMethods({
  baseViewId,
  ipfCcmBoId,
}: ILoadBomethodsOptions) {
  const result = await httpGet('/ipf/ipfCcmBoMethod/query', {
    params: {
      baseViewId,
      cascadeParam: { name: 'IpfCcmBoMethod' },
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
  return result?.ipfCcmBoMethods;
}

interface ISaveBoMethodOptions  {
  data: IBoMethod;
  baseViewId?: string;
  type: string;
}
export async function saveOrUpdateBoMethod({
  data,
  baseViewId,
  type,
}: ISaveBoMethodOptions) {
  const method = type === 'add' ? 'save' : 'update';
  const param = {
    ...data,
    realBaseViewId: baseViewId,
  };
  return httpPost(`/ipf/ipfCcmBoMethodExt/${method}`, param, {
    params: {
      $v_group_name: 'IpfCcmBoMethod_Default',
      baseViewId,
    },
    paramsSerializer,
  });
}

interface IDeleteBoMethodsOptions {
  ids: string[];
  baseViewId?: string;
}
export async function deleteBoMethods({
  ids,
  baseViewId,
}: IDeleteBoMethodsOptions) {
  return httpPost(
    '/ipf/ipfCcmBoMethod/deletes',
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

export async function queryPenetrationMethod(options: IQueryOptions, boName?: string) {
  const baseViewId = window['__urlParams']?.baseViewId;
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
  }, {
    propertyName:'revisionStatus',
    columnName:'REVISION_STATUS',
    dataType:'S',
    value: 'COM',
    operation: 'EQ',
  }];
  if (keywords) {
    searchColumns.push({
      propertyName:'penetrationCode',
      columnName:'PENETRATION_CODE',
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
      sourceName: 'IpfDataPenetration',
      searchName: 'IpfDataPenetrationShlp',
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
    source: res.ipfDataPenetrations || [],
    total: res.total,
  };
  return result;
}

export async function queryLanguageMsgMethod(options: IQueryOptions, boName?: string) {
  const baseViewId = window['__urlParams']?.baseViewId;
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
      propertyName:'messageKey',
      columnName:'MESSAGE_KEY',
      dataType:'S',
      junction:'or',
      value: keywords,
      operation: 'LIKEIC',
    });
    searchColumns.push({
      propertyName:'messageText',
      columnName:'MESSAGE_TEXT',
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
      sourceName: 'IpfLanguageMsgWithoutQuote',
      searchName: 'ShlpIpfMethodHintMsg',
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
    source: res.ipfLanguageMsgs || [],
    total: res.total,
  };
  return result;
}

export async function queryDataTransferMethod(options: IQueryOptions, boName?: string) {
  const baseViewId = window['__urlParams']?.baseViewId;
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
      propertyName:'dataTransferCode',
      columnName:'DATA_TRANSFER_CODE',
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
      sourceName: 'IpfCcmDataTransfer',
      searchName: 'ShlpIpfCcmDataTransfer',
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
    source: res.ipfCcmDataTransfers || [],
    total: res.total,
  };
  return result;
}

export async function queryBoNameMethod(options: IQueryOptions, boName?: string) {
  const baseViewId = window['__urlParams']?.baseViewId;
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
      sourceName: 'VwIpfCcmBo',
      searchName: 'BO_NAME',
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
    source: res.vwIpfCcmBos || [],
    total: res.total,
  };
  return result;
}

export async function queryMethodMethod(options: IQueryOptions, boName?: string) {
  const baseViewId = window['__urlParams']?.baseViewId;
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
      searchName: 'IpfCcmBoMethod',
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
    source: res.vwIpfCcmBoMethods || [],
    total: res.total,
  };
  return result;
}
