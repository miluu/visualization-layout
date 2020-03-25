import * as React from 'react';
import * as _ from 'lodash';
import { Icon } from 'antd';

import { UiDraggableItem, IUiDraggableItemProps, ItemDisplayType } from '../draggableItem';

import './style.less';

export interface IUiDraggableListItem extends IUiDraggableItemProps { }

export interface IUiDraggableListProps {
  source: IUiDraggableListItem[];
  itemDisplayType?: ItemDisplayType;
  isLoading?: boolean;
}

export class UiDraggableList extends React.Component<IUiDraggableListProps> {
  render() {
    const { source, itemDisplayType } = this.props;
    return (
      <div className="editor-draggable-list">
        {this._renderLoading()}
        {
          _.map(source, (itemData, i) => (
            <UiDraggableItem
              key={i}
              displayType={itemDisplayType}
              {...itemData}
            />
          ))
        }
      </div>
    );
  }

  private _renderLoading() {
    if (!this.props.isLoading) {
      return null;
    }
    return (
      <div className="editor-list-loading">
        <Icon className="editor-list-loading-icon" type="loading" spin />
        <span className="editor-list-loading-text">Loading...</span>
      </div>
    );
  }
}
