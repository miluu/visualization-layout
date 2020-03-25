import * as React from 'react';
import * as _ from 'lodash';
import { Icon } from 'antd';

import {
  BaseElementComponent,
  connector,
} from './BaseElementComponent';
import { registGlobalComponentClass } from 'src/utils';

import './ElementStaticComponent.less';
import { createUpdateSelectionRangeEffect } from 'src/models/appActions';

/**
 * @Component
 * 静态控件
 */
@connector
export class ElementStaticComponent extends BaseElementComponent {
  render() {
    const { element } = this.props;
    switch (element.uiType) {
      case '32': // 静态按钮
        return this._renderButton(element);
      case '33': // 静态文本
        return this._renderText(element);
      case '34': // 图标
        return this._renderIcon(element);
      case '03': // 静态图片
        return this._renderImg(element);
      default:
        return (
          <div
            {...this._createRootProps(['editor-element-static-unknow'])}
            style={{ color: 'red', fontStyle: 'italic', position: 'relative' }}
          >
            [Unknow uiType.]
            {this._renderRemark()}
          </div>
        );
    }
  }

  private _renderButton(element: any) {
    return (
      <button
        type="button"
        {...this._createRootProps(['editor-element-static-button', this._getButtonStyle()])}
      >
        {element.isShowLable ? (element.staticContent || '[按钮]') : ''}

        {this._renderHitArea(['right'])}
        {this._renderRemark()}

      </button>
    );
  }

  private _renderText(element: any) {
    const { staticContent } = element;
    const displayText = _.trim((staticContent || '').replace(/(<[a-zA-Z]+.*?>)|(<\/[a-zA-Z]*>)/g, ''))
      ? staticContent
      : '[文本]';
    return (
      <span
        {...this._createRootProps(['editor-element-static-text'])}
        style={{
          position: 'relative',
          display: 'inline-block',
        }}
      >
        <span
          dangerouslySetInnerHTML={{
            __html: displayText,
          }}
        />
        {this._renderHitArea(['right'])}
        {this._renderRemark()}
      </span>
    );
  }

  private _renderIcon(element: any) {
    return (
      <span
        {...this._createRootProps(['editor-element-static-icon', element.lableStyle, element.staticContent])}
      >
        {
          element.staticContent
            ? null
            : <Icon type="picture" theme="filled" />
        }
        {this._renderHitArea(['right'])}
        {this._renderRemark()}
      </span>
    );
  }

  private _renderImg(element: any) {
    const { staticContent } = element;
    return (
      <span
        {...this._createRootProps(['editor-element-static-img', element.lableStyle])}
        style={{
          position: 'relative',
          display: 'inline-block',
        }}
      >
        {
          staticContent
            ? <img
                src={this._getFileNameByKey(staticContent)}
                alt={`[图片]${staticContent || ''}`}
                className={element.lableStyle}
                style={{
                  width: element.controlWidth,
                  height: element.controlHeight,
                }}
                onLoad={this._onImgLoad}
              />
            : <Icon type="picture" theme="twoTone" style={{ fontSize: 50 }} />
        }
        {this._renderHitArea(['right'])}
        {this._renderRemark()}
      </span>
    );
  }

  private _onImgLoad = () => {
    console.log('[_onImgLoad]');
    this.props.dispatch(createUpdateSelectionRangeEffect());
  }

  private _getFileNameByKey(_key: string) {
    const key = _.last((_key || '').split('/'));
    if (isFileKey(key)) {
      return getFileNameByKey(key);
    }
    return _key;
  }

}

function isFileKey(str = '') {
  return str.length === 32 && str.indexOf('.') < 0;
}

function getFileNameByKey(key: string) {
  return `/ipf/cloud/filesystem/downloadFileDef/${key}`;
}

registGlobalComponentClass('ElementStaticComponent', ElementStaticComponent);
