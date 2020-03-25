import * as React from 'react';

import {
  BaseElementComponent,
  connector,
} from './BaseElementComponent';
import { registGlobalComponentClass, noop } from 'src/utils';

import './ElementCheckboxComponent.less';

@connector
export class ElementCheckboxComponent extends BaseElementComponent {
  render() {
    const { element } = this.props;
    return (
      <div
        {...this._createRootProps([
          'editor-element-checkbox',
          'checkbox-inline',
        ])}
        style={{
          position: 'relative',
          height: 36,
          marginLeft: 12,
          backgroundColor: this._getDatasourceBgColor(),
        }}
      >
        <label>
          <input
            style={{
              verticalAlign: 'middle',
              marginRight: 4,
            }}
            type="checkbox"
            checked={false}
            onChange={noop}
          />
          {element.isShowLable ? (element.fieldText || element.columnName) : ''}
        </label>
        {this._renderRemark()}
      </div>
    );
  }
}

registGlobalComponentClass('ElementCheckboxComponent', ElementCheckboxComponent);
