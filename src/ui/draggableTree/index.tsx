import * as React from 'react';
import * as _ from 'lodash';
import {
  Tree,
} from 'antd';
import { noop } from 'src/utils';

import './style.less';
import produce from 'immer';

const { TreeNode } = Tree;

export interface IUiDraggableTreeProps {
  list: { [key: string]: any[] };
  keyProp: string;
  displayFunc: (item: any) => string;
  onDragStart?: (e?: React.DragEvent, item?: any) => any;
  onDragEnd?: (e?: React.DragEvent, item?: any) => any;
  parentKey?: string;
}

export interface IUiDraggableTreeState {
  expandedNodes: string[];
  list: any;
}

export class UiDraggableTree extends React.PureComponent<IUiDraggableTreeProps, IUiDraggableTreeState> {
  static getDerivedStateFromProps(nextProps: IUiDraggableTreeProps, prevState: IUiDraggableTreeState) {
    if (prevState.list !== nextProps.list) {
      return {
        list: nextProps.list,
        expandedNodes: _.keys(nextProps.list),
      };
    }
    return null;
  }

  state: IUiDraggableTreeState = {
    expandedNodes: [],
    list: {},
  };

  render() {
    const { list, displayFunc, keyProp, parentKey } = this.props;
    let { onDragEnd, onDragStart } = this.props;
    onDragEnd = onDragEnd || noop;
    onDragStart = onDragStart || noop;
    const { expandedNodes } = this.state;
    return (
      <div className="editor-draggbale-tree">
        <Tree
          blockNode
          expandedKeys={expandedNodes}
          onExpand={expandedKeys => this.setState({ expandedNodes: expandedKeys })}
        >
          {
            _.map(list, (l, k) => (
              <TreeNode
                title={k}
                key={k}
              >
                {
                  _.map(l, item => {
                    const _item = !parentKey ? item : produce(item, draft => {
                      draft[parentKey] = k;
                    });
                    const display = displayFunc(item);
                    return (
                      <TreeNode
                        key={_item[keyProp]}
                        title={(
                          <span
                            title={display}
                            onDragStart={e => onDragStart(e, _item)}
                            onDragEnd={e => onDragEnd(e, _item)}
                            draggable
                          >
                            {display}
                          </span>
                        )}
                      />
                    );
                  })
                }
              </TreeNode>
            ))
          }
        </Tree>
      </div>
    );
  }
}
