import { httpGet } from '.';
import { paramsSerializer } from 'src/utils';
import { IBoTreeSourceItem } from 'src/models/relationsModel';

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
