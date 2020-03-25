import axios from 'axios';

import { IPrototypePage } from './types';
import { PROTOTYPE_CONFIG } from './config';
import { httpGet, httpPost } from 'src/services';

export async function queryPageList(params: any): Promise<IPrototypePage[]> {
  return axios.get(PROTOTYPE_CONFIG.queryPageListUrl, {
    params,
  }).then(resp => {
    return resp.data.ipfCcmOriginPages;
  });
}

export async function queryPage(params: any): Promise<any> {
  return httpGet(PROTOTYPE_CONFIG.queryPageUrl, {
    params,
  });
}

export async function savePrototypePage(data: any): Promise<any> {
  return httpPost(PROTOTYPE_CONFIG.savePageUrl, data);
}

export async function savePrototypePageInfo(page: any): Promise<any> {
  return httpPost('/ipf/ipfCcmOriginPage/saveOrUpdate', page);
}

export async function savePrototypePageInfoById(page: any): Promise<any> {
  return httpPost('/ipf/ipfCcmOriginPage/saveOrUpdateById', page);
}

export async function deletePage(page: any): Promise<any> {
  return httpGet('/ipf/ipfCcmOriginPage/delete', {
    params: {
      ipfCcmOriginPageId: page[PROTOTYPE_CONFIG.pageIdKey],
    },
  });
}

export async function generateCode(params: any): Promise<any> {
  return httpPost('/ipf/codegenerator/codeGeneratesByConfigItemTypeOriginPage', params);
}

export async function copyPage(params: any): Promise<any> {
  return httpPost('/ipf/ipfCcmOriginPage/copyIpfCcmOriginPage', params);
}
