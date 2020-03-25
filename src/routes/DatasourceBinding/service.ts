import axios from 'axios';

import { IIpfCcmPage } from './types';
import { DATASOURCE_BINDING_CONFIG } from './config';

export async function queryPageList(params: any): Promise<IIpfCcmPage[]> {
  return axios.get(DATASOURCE_BINDING_CONFIG.queryPageListUrl, {
    params,
  }).then(resp => {
    return resp.data.boPageList;
  });
}

export async function queryPage(params: any): Promise<any> {
  return axios.get(DATASOURCE_BINDING_CONFIG.queryPageUrl, {
    params,
  }).then(resp => {
    return resp.data;
  });
}

export async function saveVisualizationPage(data: any): Promise<any> {
  return axios.post(DATASOURCE_BINDING_CONFIG.savePageUrl, data).then(resp => {
    return resp.data;
  }).catch(reson => {
    if (reson.response && reson.response.data) {
      return Promise.reject(reson.response.data);
    }
    return Promise.reject(reson);
  });
}
