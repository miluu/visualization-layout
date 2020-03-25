import { TEMPLATE_CONFIG } from './config';
import { httpGet, httpPost } from 'src/services';

export async function queryPage(params: any): Promise<any> {
  return httpGet(TEMPLATE_CONFIG.queryPageUrl, {
    params,
  });
}

export async function saveTemplatePage(data: any): Promise<any> {
  return httpPost(TEMPLATE_CONFIG.savePageUrl, data);
}

export async function queryRelations(params: any): Promise<any> {
  return httpGet('/ipf/ipfCcmRelation/queryTreeIpfCcmRelationTree', {
    params,
  });
}

export async function saveAsTemplate(data: any): Promise<any> {
  return httpPost('/ipf/ipfCcmGroupPageLayout/update', data);
}
