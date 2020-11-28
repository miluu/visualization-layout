import { httpPost, httpGet } from '.';
import { delay } from 'src/utils';
import { createSetIsLoadingAction } from 'src/models/appActions';
import { message, Modal } from 'antd';
import { ROW_STATUS } from 'src/config';
import { closeElementCodeFormModal, closeLanguageMsgFormModal, openElementCodeFormModal, openLanguageMsgFormModal } from 'src/utils/modal';
import * as _ from 'lodash';

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

export async function saveLanguageMsg(data: any) {
  console.log('[saveLanguageMsg]', data);
  if (debug) {
    await delay(500);
    return { succss: true };
  }
  return httpPost('/ipf/ipfLanguageMsg/custom/saveOrUpdateAndCommit', data);
}

export async function checkLanguageMsg(data: any) {
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
        'messageKey',
        'messageText',
      ], 14),
    };
  }
  return httpGet('/ipf/ipfLanguageMsg/custom/getAllUseingLanguageMsgVos', {
    params: data,
  });
}

export async function getLanguageMsg(options?: any) {
  console.log('getLanguageMsg:', options);
  if (debug) {
    await delay(500);
    return {
      data: {
        messageKey: 'messageKey111',
        messageText: 'messageText111',
        messageType: 'messageType111',
        ddLanguage: 'ddLanguage111',
      },
    };
  }
  return httpGet('/ipf/ipfLanguageMsg/custom/getIpfLanguageMsg', {
    params: options,
  });
}

export async function modifyLanguageMsg({
  values,
  dispatch,
  callback,
  type,
  codeKey,
  textKey,
  layoutType,
}: {
  values: any;
  dispatch: any;
  callback: any;
  type: 'edit' | 'add';
  codeKey: string,
  textKey: string,
  layoutType: 'layout' | 'element',
}) {
  let formData: any = {};
  dispatch(createSetIsLoadingAction(true, true));
  try {
    let getResult: any;
    if (type === 'add') {
      getResult = {};
    } else {
      getResult = await getLanguageMsg({
        messageKey: values[codeKey],
        baseViewId: window['__urlParams']?.baseViewId,
      });
    }
    formData = getResult?.data ?? {};
  } catch (e) {
    console.error(e);
    Modal.error({ content: e?.msg ?? '查询多语言消息失败。' });
    return;
  } finally {
    dispatch(createSetIsLoadingAction(false, true));
  }
  // formData = {};
  // console.log(getLanguageMsg);
  if (type === 'edit') {
    formData.rowStatus = ROW_STATUS.MODIFIED;
    formData.baseViewId = window['__urlParams']?.baseViewId ?? '';
    // formData.messageKey = values[codeKey];
    // formData.messageText = values[textKey];
  } else {
    formData.rowStatus = ROW_STATUS.ADDED;
    formData.baseViewId = window['__urlParams']?.baseViewId ?? '';
    formData.messageType = '2';
    formData.ddLanguage = 'zh';
  }
  openLanguageMsgFormModal({
    formData: { ...formData },
    editType: type,
    async onSubmit(data, editType) {
      const postData = {
        ...formData,
        ...data,
        metaDataType: layoutType === 'element' ? 'IpfCcmBoPgLoElement' : 'IpfCcmBoPageLayout',
        businessId: layoutType === 'element' ? values?.ipfCcmBoPgLoElementId : values?.ipfCcmBoPageLayoutId,
      };
      if (type === 'edit' && editType === 'add') {
        postData.rowStatus = ROW_STATUS.ADDED;
        postData.baseViewId = window['__urlParams']?.baseViewId ?? '';
      }
      if (postData.businessId?.indexOf?.('NEW_') >= 0) {
        postData.businessId = null;
      }
      let result: any;
      dispatch(createSetIsLoadingAction(true, true));
      try {
        result = await saveLanguageMsg(postData);
      } catch (e) {
        console.error(e);
        Modal.error({ content: e?.msg ?? '保存失败。' });
        return;
      } finally {
        dispatch(createSetIsLoadingAction(false, true));
      }
      console.log(result);
      message.success('保存成功。');
      callback(
        [{ property: codeKey }, { property: textKey }],
        [data?.messageKey, data?.messageText],
        true,
      );
      closeLanguageMsgFormModal();
    },
  });
}

export async function modifyDataElement({
  values,
  dispatch,
  callback,
  type,
  codeKey,
  textKey,
  otherTextKeys,
}: {
  values: any;
  dispatch: any;
  callback: any;
  type: 'edit' | 'add';
  codeKey: string;
  textKey: string;
  otherTextKeys?: string[];
}) {
  let formData: any = {};
  dispatch(createSetIsLoadingAction(true, true));
  try {
    let getResult: any;
    if (type === 'add') {
      getResult = await getDmlElementByPropertyName({
        baseViewId: window['__urlParams']?.baseViewId,
        boName: values.layoutBoName,
        propertyName: values?.propertyName,
      });
    } else {
      getResult = await getDmlElement({
        elementCode: values && values[codeKey],
        baseViewId: window['__urlParams']?.baseViewId,
      });
    }
    formData = getResult?.data ?? {};
  } catch (e) {
    console.error(e);
    Modal.error({ content: e?.msg ?? '查询数据元素失败。' });
    return;
  } finally {
    dispatch(createSetIsLoadingAction(false, true));
  }
  const originElementCode = formData.elementCode;
  if (type === 'edit') {
    formData.rowStatus = ROW_STATUS.MODIFIED;
  } else {
    formData.referenceCode = originElementCode;
    formData.elementCode = null;
    formData.configItemCode = null;
    formData.ipfDmlElementId = null;
    formData.rowStatus = ROW_STATUS.ADDED;
    formData.baseViewId = window['__urlParams']?.baseViewId ?? '';
    formData.revisionNumber = 0;
  }
  const typeText = type === 'edit' ? '修改' : '新增';
  openElementCodeFormModal({
    title: `${typeText}数据元素`,
    submitText: `${typeText}并提交`,
    formData: { ...formData },
    editType: type,
    async onSubmit(data, editType) {
      const postData = {
        ...formData,
        ...data,
      };
      if (type === 'edit' && editType === 'add') {
        postData.referenceCode = originElementCode;
        postData.configItemCode = null;
        postData.ipfDmlElementId = null;
        postData.rowStatus = ROW_STATUS.ADDED;
        postData.baseViewId = window['__urlParams']?.baseViewId ?? '';
        postData.revisionNumber = 0;
      }
      let result: any;
      dispatch(createSetIsLoadingAction(true, true));
      try {
        result = await saveElementCode(postData);
      } catch (e) {
        console.error(e);
        Modal.error({ content: e?.msg ?? '保存失败。' });
        return;
      } finally {
        dispatch(createSetIsLoadingAction(false, true));
      }
      console.log(result);
      message.success('保存成功。');
      callback(
        [{ property: codeKey }, { property: textKey }, ..._.map(otherTextKeys, key => ({
          property: key,
        }))],
        [data?.elementCode, data?.fieldText, ..._.map(otherTextKeys, () => data?.fieldText)],
        true,
      );
      closeElementCodeFormModal();
    },
  });
}
