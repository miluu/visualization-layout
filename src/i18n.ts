import * as _ from 'lodash';

import zh from './i18n/zh';
import en from './i18n/en';

interface ITranslation {
  [key: string]: string;
}

interface ITranslations {
  [key: string]: ITranslation;
}

interface II18NOptions {
  translations?: ITranslations;
  lng?: string;
  defaultLng?: string;
}

interface ITOptions {
  lng?: string;
}

export class GlpaasI18N {
  translations: ITranslations = {};
  lng = 'zh-cn';
  defaultLng = 'zh-cn';

  constructor({
    translations,
    lng,
    defaultLng,
  }: II18NOptions) {
    if (translations) {
      this.translations = translations;
    }
    this.setLng(lng);
    this.setDefaultLng(defaultLng);
  }

  setLng = (lng: string) => {
    if (lng) {
      this.lng = lng;
    }
  }

  setDefaultLng = (defaultLng: string) => {
    if (defaultLng) {
      this.defaultLng = defaultLng;
    }
  }

  addTranslations = (translations: ITranslations) => {
    _.assign(this.translations, translations);
  }

  t = (id: string, options?: ITOptions) => {
    const lng = options && options.lng || this.lng || this.defaultLng;
    const translation = this.getTranslation(lng);
    let result = translation[id];
    if (_.isUndefined(result)) {
      result = id;
    }
    return result;
  }

  getTranslation = (lng: string) => {
    return this.translations[lng] || this.translations[this.defaultLng] || {};
  }
}

const local = localStorage.getItem('locale') || 'zh-cn';
export const i18n = new GlpaasI18N({
  translations: { zh, en, 'zh-cn': zh, 'en-us': en },
  lng: local,
});

export const t = i18n.t;
