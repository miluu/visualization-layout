import * as React from 'react';
import { connect } from 'dva';
import { IDndState } from 'src/models/dndModel';
import { isHorizontalElement } from 'src/utils';

import './style.less';
import { ILayoutsState } from 'src/models/layoutsModel';

export interface IUiDroplineProps {
  target?: string;
  targetType?: string;
  position?: number;
  dragSource?: any;
  dragSourceType?: string;

  cellNameKey?: string;
  elementIdKey?: string;
}

@connect(
  ({ DND, LAYOUTS }: {
    DND: IDndState,
    LAYOUTS: ILayoutsState<any>,
  }) => ({
    target: DND.target,
    targetType: DND.targetType,
    position: DND.position,
    dragSourceType: DND.dragSourceType,
    dragSource: DND.dragSource,
    cellNameKey: LAYOUTS.config.cellNameKey,
    elementIdKey: LAYOUTS.config.elementIdKey,
  }),
)
export class UiDropline extends React.PureComponent<IUiDroplineProps> {
  render() {
    return <div className="editor-dropline" style={this._getStyle()}/>;
  }

  private _getStyle: () => React.CSSProperties = () => {
    const { target, targetType, position, dragSource, dragSourceType, cellNameKey, elementIdKey } = this.props;
    const none = {
      display: 'none',
    };
    if (!target || dragSourceType === 'property' || dragSourceType === 'method') {
      return none;
    }
    const targetId = targetType === 'layout'
      ? target[cellNameKey]
      : target[elementIdKey];
    const domId = `editor-${targetType}-${targetId}`;
    const dom = document.getElementById(domId);
    const offset = dom && dom.getBoundingClientRect();
    if (!offset || target === dragSource) {
      return {
        display: 'none',
      };
    }
    const { width, height, top, left } = offset;
    const style: React.CSSProperties = {};
    if (isHorizontalElement(dom)) {
      style.height = height;
      style.top = top;
      style.width = 3;
      switch (position) {
        case -1:
          style.left = left - 4;
          break;
        case 1:
          style.left = left + width + 1;
          break;
        default:
          style.top = top + 10;
          style.left = left + width - 10;
          style.height = height - 20;
      }
    } else {
      style.width = width;
      style.left = left;
      style.height = 3;
      switch (position) {
        case -1:
          style.top = top - 4;
          break;
        case 1:
          style.top = top + height + 1;
          break;
        default:
          style.top = top + height - 10;
          style.left = left + 10;
          style.width = width - 20;
      }
    }
    return style;
  }
}
