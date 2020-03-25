import * as React from 'react';
import classnames from 'classnames';

import './style.less';
import { connect } from 'dva';
import { Dispatch, AnyAction } from 'redux';
import { createDragStartAction, createDragEndAction } from 'src/models/dndActions';
import { delay } from 'src/utils';
import { IPagesState } from 'src/models/pagesModel';
import { IAppState } from 'src/models/appModel';

/** 显示样式类型, V: 纵向, H: 横向 */
export type ItemDisplayType = 'V' | 'H';

export interface IUiDraggableItemProps {
  source: any;
  type: string;
  title: string;
  icon?: string;

  displayType?: ItemDisplayType;

  editable?: boolean;

  dispatch?: Dispatch<AnyAction>;
}

@connect(
  ({ PAGES, APP }: {
    PAGES: IPagesState<any>,
    APP: IAppState,
  }) => {
    return {
      editable: PAGES.currentPageId !== null && PAGES.currentPageId !== undefined,
    };
  },
)
export class UiDraggableItem extends React.Component<IUiDraggableItemProps> {
  render() {
    const { editable, displayType } = this.props;
    return (
      <div
        className={classnames('editor-draggable-item', `editor-draggable-item-${displayType || 'V'}`, {
          'editor-editable': editable,
        })}
        draggable={editable}
        onDragStart={this._onDragStart}
        onDragEnd={this._onDragEnd}
        title={this.props.title}
      >
        <div className="editor-item-icon">
          <span className={classnames('editor-item-icon-inner', this.props.icon)} />
        </div>
        <div className="editor-item-name">
          <span className="editor-item-text">
            {this.props.title}
          </span>
        </div>
      </div>
    );
  }

  private _onDragStart = (event: React.DragEvent) => {
    const { source, type } = this.props;
    const target = event.target as HTMLElement;
    event.dataTransfer.setDragImage(target, 0, 0);
    event.stopPropagation();
    this.props.dispatch(createDragStartAction(
      source,
      type,
      true,
      true,
    ));
  }

  private _onDragEnd = async (event: React.DragEvent) => {
    event.stopPropagation();
    await delay(0);
    this.props.dispatch(createDragEndAction());
  }

}
