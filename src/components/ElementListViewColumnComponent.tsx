import * as React from 'react';
import * as _ from 'lodash';
import {
  BaseElementComponent,
  connector,
} from './BaseElementComponent';
import { registGlobalComponentClass } from 'src/utils';

import './ElementListViewColumnComponent.less';
import { createSetRootElementAction } from 'src/models/layoutsActions';

@connector
export class ElementListViewColumnComponent extends BaseElementComponent {
  render() {
    const { element } = this.props;
    return (
      <th
        {...this._createRootProps(['editor-element-list-view-column', 'header-column-cell align-center'])}
        style={{
          position: 'relative',
          width: `${element['controlWidth'] || 150}px`,
        }}
      >
        {
          element.isShowSort
            ? <div className="grid-head-sort">
                <button className="btn">
                  <span className="caret caret-up" />
                </button>
                <button className="btn">
                  <span className="caret caret-down" />
                </button>
              </div>
            : null
        }

        {element.isNotNull ? <span className="required">*</span> : null}

        <span>
          {this._getColumnTitle()}
        </span>

        {this._renderSettings()}
        {this._renderRemark()}

      </th>
    );
  }

  clickSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    this.props.dispatch(createSetRootElementAction(
      this.props.element,
      `ListItem 配置 【${this._getColumnTitle()}】`,
      true,
    ));
  }

  private _getColumnTitle(): string {
    const { element } = this.props;
    return this._getMultiTitle() || element.fieldText || element.columnName;
  }

  private _getMultiTitle(): string {
    const { element } = this.props;
    const staticContent = _.trim(element.staticContent || '');
    if (!staticContent) {
      return '';
    }
    const propertyNameArr = _.chain(staticContent.split('\n'))
      .map(_.trim)
      .compact()
      // .map(propertyName => {
      //   const property = this.dataManager.getProperty({layoutBoName: element.layoutBoName, propertyName} as any);
      //   if (!property) {
      //     return '';
      //   }
      //   return property.fieldText || property.columnName || '';
      // })
      .value();
    return propertyNameArr.join(element.controlConnector || '/');
  }

}

registGlobalComponentClass('ElementListViewColumnComponent', ElementListViewColumnComponent);
