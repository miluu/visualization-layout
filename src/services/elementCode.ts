import { httpPost, httpGet } from '.';

export async function getDataElement(options?: any) {
  console.log('getDataElement:', options);
  return httpGet('/ipf/ipfDmlElement/custom/getDmlElementByPropertyName', {
    params: options,
  });
}

export async function saveElementCode(data: any) {
  return httpPost('/ipf/ipfDmlElement/custom/saveOrUpdateAndCommit', data);
}
