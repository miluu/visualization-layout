import * as React from 'react';
import * as _ from 'lodash';
import {
  Button,
  Tree,
  Icon,
  Input,
} from 'antd';

import { UiSettingsModal } from '../settingsModal';

import './style.less';
import { noop, delay } from 'src/utils';
import produce from 'immer';
import { AntTreeNodeDropEvent } from 'antd/lib/tree/Tree';

const { TreeNode } = Tree;

export interface ITreeSourceItem {
  id: string;
  pid: string;
  title: string;
}

export interface IUiTreeEditorModalState {
  visible?: boolean;
  source?: ITreeSourceItem[];
  editingItemId?: string;
  expandedKeys?: string[];
  onSubmit?: (source: ITreeSourceItem[]) => any;
  editingValue?: string;
}

const initState: IUiTreeEditorModalState = {
  visible: false,
  source: [],
  onSubmit: noop,
  expandedKeys: [],
  editingValue: '',
  editingItemId: '-',
};

export class UiTreeEditorModal extends React.PureComponent<any, IUiTreeEditorModalState> {
  private _treeWrapRef = React.createRef<HTMLDivElement>();

  constructor(props: any) {
    super(props);
    this.state = initState;
  }

  render() {
    const { visible, source, expandedKeys } = this.state;
    const groupedSource = _.groupBy(source, item => item.pid || '');
    return (
      <UiSettingsModal
        visible={visible}
        onCancel={() => this.setState({ visible: false })}
        wrapClassName="editor-tree-editor-modal"
        onOk={this._onSubmit}
        afterClose={this._afterClose}
      >
        <div className="editor-tree-editor-content">
          <h3>配置树数据</h3>
          <div className="editor-tree-editor-toolbar">
            <Button size="small" onClick={() => this._addItem()}>新增根节点</Button>
          </div>
          <div className="editor-tree-editor-tree" ref={this._treeWrapRef}>
            <Tree
              blockNode
              showLine
              showIcon={false}
              expandedKeys={expandedKeys}
              draggable={true}
              onExpand={keys => this.setState({ expandedKeys: keys })}
              onDrop={this._onDrop}
            >
              {this._renderTreeNodes(groupedSource, '')}
            </Tree>
          </div>
        </div>
      </UiSettingsModal>
    );
  }

  do(callback: () => any) {
    callback();
  }

  open(options: IUiTreeEditorModalState) {
    const expandedKeys = _.map(options.source, item => item.id);
    const state: any = _.assign({}, initState, options, {
      visible: true,
      expandedKeys,
    });
    this.setState(state);
  }

  close() {
    this.setState({
      visible: false,
    });
  }

  private _onDrop = ({
    node,
    dragNode,
    dropPosition,
  }: AntTreeNodeDropEvent) => {
    const dragId = dragNode.props.eventKey;
    const dropId = node.props.eventKey;
    const { source, expandedKeys } = this.state;
    const dragItem = _.find(source, item => item.id === dragId);
    const newSource = _.filter(source, item => item !== dragItem);
    const dropItemIndex = _.findIndex(newSource, item => item.id === dropId);
    const dropItem = newSource[dropItemIndex];
    let newDragItem: ITreeSourceItem;
    const dropLevel = node.props.pos.split('-');
    const dropPos = dropPosition - Number(dropLevel[dropLevel.length - 1]);
    switch (dropPos) {
      case 1:
        newDragItem = produce(dragItem, draft => {
          draft.pid = dropItem.pid;
        });
        newSource.splice(dropItemIndex + 1, 0, newDragItem);
        break;
      case -1:
        newDragItem = produce(dragItem, draft => {
          draft.pid = dropItem.pid;
        });
        newSource.splice(dropItemIndex, 0, newDragItem);
        break;
      default:
        newDragItem = produce(dragItem, draft => {
          draft.pid = dropItem.id;
        });
        newSource.push(newDragItem);
        break;
    }
    const newExpandedKeys = _.uniq(expandedKeys.concat([dragId, dropId]));
    this.setState({
      source: newSource,
      expandedKeys: newExpandedKeys,
    });
  }

  private _renderTreeNodes = (groupedSource: _.Dictionary<ITreeSourceItem[]>, pid: string) => {
    const nodes = groupedSource[pid] || [];
    return (
      _.map(nodes, node => {
        return (
          <TreeNode
            title={this._renderNodeTitle(node)}
            key={node.id}
          >
            {this._renderTreeNodes(groupedSource, node.id)}
          </TreeNode>
        );
      })
    );
  }

  private _renderNodeTitle = (node: ITreeSourceItem) => {
    if (node.id === this.state.editingItemId) {
      return this._renderEditingNodeTitle(node);
    }
    return (
      <div
        className="editor-tree-node-title"
        onDoubleClick={() => this._editItem(node)}
      >
        <span className="editor-tree-title-text">
          {node.title}
        </span>
          <span className="editor-tree-actions">
            <a
              title="新增子节点"
              className="editor-tree-action"
              onClick={() => this._addItem(node.id)}
            >
              <Icon type="plus-circle" />
            </a>
            <a
              title="编辑节点信息"
              className="editor-tree-action"
              onClick={() => this._editItem(node)}
            >
              <Icon type="edit" />
            </a>
            <a
              title="删除节点"
              className="editor-tree-action"
              onClick={() => this._removeItem(node)}
            >
              <Icon type="delete" />
            </a>
          </span>
      </div>
    );
  }

  private _renderEditingNodeTitle = (node: ITreeSourceItem) => {
    const { editingValue } = this.state;
    return (
      <div
        className="editor-tree-node-editor"
      >
        <Input
          value={editingValue}
          onClick={e => e.stopPropagation()}
          onChange={e => this.setState({ editingValue: e.target.value })}
          onBlur={this._onInputBlur}
        />
      </div>
    );
  }

  private _addItem = (pid = '') => {
    const item = {
      id: (+new Date()).toString(),
      pid,
      title: '新增节点',
    };
    let { source, expandedKeys } = this.state;
    source = source.concat(item);
    expandedKeys = _.uniq(expandedKeys.concat(item.id));
    this.setState({
      source,
      expandedKeys,
    });
    this._editItem(item);
  }

  private _removeItem = (node: ITreeSourceItem) => {
    let { source } = this.state;
    const groupedSource = _.groupBy(source, item => item.pid || '');
    const willRemoveItems = [node];
    findChildren([node], willRemoveItems);
    console.log('willRemoveItems: ', willRemoveItems);
    source = _.difference(source, willRemoveItems);

    this.setState({
      source,
    });

    function findChildren(parentNodes: ITreeSourceItem[], container: ITreeSourceItem[]) {
      _.forEach(parentNodes, parentNode => {
        const childrenNodes = groupedSource[parentNode.id];
        if (childrenNodes && childrenNodes.length) {
          container.push(...childrenNodes);
          findChildren(childrenNodes, container);
        }
      });
    }
  }

  private _editItem = (node: ITreeSourceItem) => {
    this.setState({
      editingItemId: node.id,
      editingValue: node.title,
    });
    this._delayFocusInput();
  }

  private _afterClose = () => {
    this.setState(initState);
  }

  private _onSubmit = () => {
    this.state.onSubmit(this.state.source);
    this.close();
  }

  private _delayFocusInput = async () => {
    await delay();
    this._focusInput();
  }

  private _focusInput = () => {
    const treeWrap = this._treeWrapRef.current;
    const input: HTMLInputElement = treeWrap.querySelector('.ant-input');
    if (input) {
      input.focus();
      input.select();
    }
  }

  private _onInputBlur = () => {
    const { editingValue, editingItemId, source } = this.state;
    const newSource = produce(source, draft => {
      const item = _.find(draft, i => i.id === editingItemId);
      if (item) {
        item.title = editingValue;
      }
    });
    this.setState({
      source: newSource,
      editingValue: '',
      editingItemId: '-',
    });
  }

}
