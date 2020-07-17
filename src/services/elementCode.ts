import { httpPost, httpGet } from '.';

export async function getDmlElementByPropertyName(options?: any) {
  console.log('getDataElement:', options);
  // return {
  //   data: {
  //     elementCode: 'XXXX',
  //     fieldText: 'hehe',
  //   },
  // };
  return httpGet('/ipf/ipfDmlElement/custom/getDmlElementByPropertyName', {
    params: options,
  });
}

export async function getDmlElement(options?: any) {
  console.log('getDataElement:', options);
  // return {
  //   data: {
  //     elementCode: 'XXXXY',
  //     fieldText: 'hehee',
  //   },
  // };
  return httpGet('/ipf/ipfDmlElement/custom/getDmlElement', {
    params: options,
  });
}

export async function saveElementCode(data: any) {
  // return { succss: true };
  return httpPost('/ipf/ipfDmlElement/custom/saveOrUpdateAndCommit', data);
}
