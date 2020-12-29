import { httpGet, httpPost } from '.';
import { paramsSerializer } from 'src/utils';
import { IBoRelation, IBoTreeSourceItem } from 'src/models/relationsModel';

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
