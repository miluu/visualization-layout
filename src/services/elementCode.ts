import { httpPost, httpGet } from '.';
import { delay } from 'src/utils';

const debug = false;

export async function getDmlElementByPropertyName(options?: any) {
  console.log('getDataElement:', options);
  if (debug) {
    await delay(500);
    return {
      data: {
        elementCode: 'XXXX',
        fieldText: 'hehe',
      },
    };
  }
  return httpGet('/ipf/ipfDmlElement/custom/getDmlElementByPropertyName', {
    params: options,
  });
}

export async function getDmlElement(options?: any) {
  console.log('getDataElement:', options);
  if (debug) {
    await delay(500);
    return {
      data: {
        elementCode: 'XXXXY',
        fieldText: 'hehee',
      },
    };
  }
  return httpGet('/ipf/ipfDmlElement/custom/getDmlElement', {
    params: options,
  });
}

export async function saveElementCode(data: any) {
  if (debug) {
    await delay(500);
    return { succss: true };
  }
  return httpPost('/ipf/ipfDmlElement/custom/saveOrUpdateAndCommit', data);
}

export async function checkElementCode(data: any) {
  if (debug) {
    await delay(500);
    // return Promise.reject({ msg: 'hehe' });
    return {
      records: makeRecords([
        'sourceType',
        'pageType',
        'pageName',
        'layoutBoName',
        'propertyName',
        'description',
        'fieldText',
        'dataElementCode',
        'dataElementText',
      ], 64),
    };
  }
  return httpGet('/ipf/ipfDmlElement/custom/getAllUseingElementVos', {
    params: data,
  });
}

function makeRecords(fields: string[], length: number = 20) {
  const list: any[] = [];
  for (let i = 0; i < length; i++) {
    const item = {};
    fields.forEach(field => item[field] = `${field}_${i}`);
    list[i] = item;
  }
  return list;
}
