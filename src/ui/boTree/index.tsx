import * as React from 'react';
import * as _ from 'lodash';
import {
  Tree,
  Icon,
  Popconfirm,
} from 'antd';

import './style.less';
import { connect } from 'dva';
import { Dispatch, AnyAction } from 'redux';
import { IBoTreeSourceItem, IRelationsState } from 'src/models/relationsModel';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';
import { DEFAULT_COLORS } from 'src/config';

const { TreeNode } = Tree;

export interface IUiBoTreeProps {
  source?: IBoTreeSourceItem[];
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
    return (
      <div className="editor-ui-datasource-tree">
        <Tree
          blockNode
          selectable={false}
          defaultExpandAll
          autoExpandParent
          expandedKeys={this.state.expandedKeys}
          onExpand={this._onExpand}
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
        expandedKeys: _.map(nextSource, s => s.id),
      });
    }
  }

  private _onExpand = (keys: string[]) => {
    this.setState({
      expandedKeys: keys,
    });
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
        key={item.id}
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
        onDoubleClick={() => this._startEdit(item)}
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
        <span className="eitor-item-content" onClick={e => e.stopPropagation()}>
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
          <a
            title="新增子对象关系"
            className="editor-tree-action"
            onClick={() => this._addSubBo(item)}
          ><Icon type="plus-circle" /></a>
          {
            item.pid
              ? (
                <Popconfirm
                  title="确定删除此子对象关系?"
                  onConfirm={() => this._deleteBo(item)}
                  okText={t(I18N_IDS.TEXT_OK)}
                  cancelText={t(I18N_IDS.TEXT_CANCEL)}
                  placement="right"
                >
                  <a title="删除子对象关系" className="editor-tree-action" ><Icon type="delete" /></a>
                </Popconfirm>
              )
              : null
          }
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

  private _addSubBo = async (item: IBoTreeSourceItem) => {
    //
  }

  private _deleteBo = (item: IBoTreeSourceItem) => {
    //
  }

  private _startEdit = async (item: IBoTreeSourceItem) => {
    //
  }
}
