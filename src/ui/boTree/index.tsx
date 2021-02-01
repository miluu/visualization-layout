import * as React from 'react';
import * as _ from 'lodash';
import {
  Tree,
} from 'antd';

import './style.less';
import { connect } from 'dva';
import { Dispatch, AnyAction } from 'redux';
import { IBoTreeSourceItem, IRelationsState } from 'src/models/relationsModel';
import { DEFAULT_COLORS } from 'src/config';
import { createSelectBoTreeItemAction as createSelectBoTreeRelationAction } from 'src/models/relationsAction';
import { createSelectBoTreeItemAction as createSelectBoTreePropertyAction } from 'src/models/propertiesAction';
import { createSelectBoTreeItemAction as createSelectBoTreeMethodAction } from 'src/models/methodsAction';

const { TreeNode } = Tree;

export interface IUiBoTreeProps {
  source?: IBoTreeSourceItem[];
  selectedItem?: string;
  dispatch?: Dispatch<AnyAction>;
}

export interface IUiBoTreeState {
  expandedKeys: string[];
}

@connect(({
  RELATIONS,
}: {
  RELATIONS: IRelationsState;
}) => {
  return {
    source: RELATIONS.boTreeSource || [],
    selectedItem: RELATIONS.selectedBoTreeItem,
  };
})
/**
 * 子对象关系树
 */
export class UiBoTree extends React.PureComponent<IUiBoTreeProps, IUiBoTreeState> {
  state: IUiBoTreeState = {
    expandedKeys: [],
  };

  render() {
    const map = this._buildSourceMap();
    const selectedItems = this.props.selectedItem ? [this.props.selectedItem] : [];
    return (
      <div className="editor-ui-datasource-tree">
        <Tree
          blockNode
          selectedKeys={selectedItems}
          selectable={true}
          defaultExpandAll
          autoExpandParent={false}
          expandedKeys={this.state.expandedKeys}
          onExpand={this._onExpand}
          onSelect={this._onSelect}
        >
          {
            this._renderNodes(map)
          }
        </Tree>
      </div>
    );
  }

  componentWillReceiveProps(nextProps: IUiBoTreeProps) {
    const { source } = this.props;
    const { source: nextSource } = nextProps;
    if (
      (!source || !source.length)
      && nextSource && nextSource.length
    ) {
      this.setState({
        expandedKeys: _.map(nextSource, s => s.id || ''),
      });
    }
  }

  private _onExpand = (keys: string[]) => {
    this.setState({
      expandedKeys: keys,
    });
  }

  private _onSelect = (keys: string[]) => {
    this.props.dispatch(createSelectBoTreeRelationAction(keys[0], true));
    this.props.dispatch(createSelectBoTreePropertyAction(keys[0], true));
    this.props.dispatch(createSelectBoTreeMethodAction(keys[0], true));
  }

  private _buildSourceMap() {
    const { source } = this.props;
    return _.chain(source)
      .orderBy('seqNo')
      .groupBy(item => item.pid || '')
      .value();
  }

  private _renderNodes(map: _.Dictionary<IBoTreeSourceItem[]>, pid = '') {
    const items = map[pid] || [];
    return _.map(items, item => (
      <TreeNode
        key={item.id || ''}
        title={this._renderNodeContent(item)}
      >
        {this._renderNodes(map, item.id)}
      </TreeNode>
    ));
  }

  private _renderNodeContent(item: IBoTreeSourceItem) {
    return (
      <div
        className="editor-ui-datasource-node"
      >
        {
          this._renderNodeContentInner(item)
        }
      </div>
    );
  }

  private _renderNodeContentInner = (item: IBoTreeSourceItem) => {
    return (
      <>
        <span className="eitor-item-content">
          <button
            className="editor-ui-color"
          >
            <span
              className="editor-color-bg"
            >
              <span
                className="editor-color-inner"
                style={{
                  backgroundColor: this._getItemColor(item),
                }}
              />
            </span>
          </button>
          <span
            className="editor-item-title"
          >{item.custom}</span>
        </span>
      </>
    );
  }

  private _getItemColor = (item: IBoTreeSourceItem): string => {
    const colorCount = DEFAULT_COLORS.length;
    const { source } = this.props;
    const index = _.findIndex(source, _item => _item === item);
    const i = index % colorCount;
    return DEFAULT_COLORS[i];
  }

}
