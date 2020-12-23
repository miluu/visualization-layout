import * as React from 'react';
import * as _ from 'lodash';
import {
  Tree,
  Popover,
  Input,
  Icon,
  Popconfirm,
} from 'antd';
import {
  SketchPicker, ColorResult,
} from 'react-color';

import './style.less';
import { IDatasource, ID_KEY, PID_KEY, TITLE_KEY, BG_KEY, IDatasourceState, ORDER_KEY } from 'src/models/datasourceModel';
import { connect } from 'dva';
import { Dispatch, AnyAction } from 'redux';
import { createUpdateItemAction, createRemoveItemAction, createAddSubItemEffect, createOnDropEffect } from 'src/models/datasourceActions';
import { delay } from 'src/utils';
import { AntTreeNodeDropEvent } from 'antd/lib/tree/Tree';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';
import { DEFAULT_COLORS } from 'src/config';

const { TreeNode } = Tree;

export interface IUiDataSourceTreeProps {
  source?: IDatasource[];
  dispatch?: Dispatch<AnyAction>;
}

export interface IUiDataSourceTreeState {
  pickerItem: IDatasource;
  pickerColor: string;
  editingItem: IDatasource;
  editingValue: string;
  expandedKeys: string[];
}

@connect(({
  DATASOURCE,
}: {
  DATASOURCE: IDatasourceState;
}) => {
  return {
    source: DATASOURCE && DATASOURCE.source || [],
  };
})
export class UiDataSourceTree extends React.PureComponent<IUiDataSourceTreeProps, IUiDataSourceTreeState> {
  state: IUiDataSourceTreeState = {
    pickerItem: null,
    pickerColor: null,
    editingItem: null,
    editingValue: null,
    expandedKeys: [],
  };

  _wrapRef = React.createRef<HTMLDivElement>();

  render() {
    const map = this._buildSourceMap();
    return (
      <div className="editor-ui-datasource-tree" ref={this._wrapRef}>
        <Tree
          blockNode
          selectable={false}
          draggable={!this.state.editingItem}
          defaultExpandAll
          autoExpandParent
          expandedKeys={this.state.expandedKeys}
          onExpand={this._onExpand}
          onDrop={this._onDrop}
        >
          {
            this._renderNodes(map)
          }
        </Tree>
      </div>
    );
  }

  componentWillReceiveProps(nextProps: IUiDataSourceTreeProps) {
    const { source } = this.props;
    const { source: nextSource } = nextProps;
    if (
      (!source || !source.length)
      && nextSource && nextSource.length
    ) {
      this.setState({
        expandedKeys: _.map(nextSource, s => s[ID_KEY]),
      });
    }
  }

  private _onExpand = (keys: string[]) => {
    this.setState({
      expandedKeys: keys,
    });
  }

  private _onDrop = (info: AntTreeNodeDropEvent) => {
    try {
      const dropKey = info.node.props.eventKey;
      const dragKey = info.dragNode.props.eventKey;
      const dropPos = info.node.props.pos.split('-');
      const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
      console.log('UiDataSourceTree#_onDrop', dragKey , '->', dropKey, dropPosition);
      this.props.dispatch(createOnDropEffect(dragKey, dropKey, dropPosition));
    } catch (e) {/*  */}
  }

  private _buildSourceMap() {
    const { source } = this.props;
    return _.chain(source)
      .orderBy(ORDER_KEY)
      .groupBy(item => item[PID_KEY] || '')
      .value();
  }

  private _renderNodes(map: _.Dictionary<IDatasource[]>, pid = '') {
    const items = map[pid] || [];
    return _.map(items, item => (
      <TreeNode
        key={item[ID_KEY]}
        title={this._renderNodeContent(item)}
      >
        {this._renderNodes(map, item[ID_KEY])}
      </TreeNode>
    ));
  }

  private _renderNodeContent(item: IDatasource) {
    const { editingItem } = this.state;
    return (
      <div
        className="editor-ui-datasource-node"
        onDoubleClick={() => this._startEdit(item)}
      >
        {
          editingItem === item
            ? this._renderEditor()
            : this._renderNodeContentInner(item)
        }
      </div>
    );
  }

  private _renderNodeContentInner = (item: IDatasource) => {
    const { pickerItem, pickerColor } = this.state;
    return (
      <>
        <span className="eitor-item-content" onClick={e => e.stopPropagation()}>
          <Popover
            content={this._renderColorPicker()}
            trigger="click"
            overlayClassName="editor-ui-color-picker-popover"
            destroyTooltipOnHide
            onVisibleChange={(visible) => this._onPickerVisibleChange(visible, item)}
          >
            <button
              className="editor-ui-color"
              title="设置背景色"
            >
              <span
                className="editor-color-bg"
              >
                <span
                  className="editor-color-inner"
                  style={{
                    backgroundColor: item === pickerItem ? pickerColor : item[BG_KEY],
                  }}
                />
              </span>
            </button>
          </Popover>
          <span
            className="editor-item-title"
          >{item[TITLE_KEY]}</span>
          <a
            title="新增子数据源"
            className="editor-tree-action"
            onClick={() => this._addSubDatasource(item)}
          ><Icon type="plus-circle" /></a>
          {
            item[PID_KEY]
              ? (
                <Popconfirm
                  title="确定删除此数据源?"
                  onConfirm={() => this._deleteDatasource(item)}
                  okText={t(I18N_IDS.TEXT_OK)}
                  cancelText={t(I18N_IDS.TEXT_CANCEL)}
                  placement="right"
                >
                  <a title="删除数据源" className="editor-tree-action" ><Icon type="delete" /></a>
                </Popconfirm>
              )
              : null
          }
        </span>
      </>
    );
  }

  private _addSubDatasource = async (item: IDatasource) => {
    const { expandedKeys } = this.state;
    this.setState({
      expandedKeys: expandedKeys.concat(item[ID_KEY]),
    });
    this.props.dispatch(createAddSubItemEffect(item, subItem => {
      this._startEdit(subItem);
    }));
  }

  private _deleteDatasource = (item: IDatasource) => {
    this.props.dispatch(createRemoveItemAction(item[ID_KEY], true));
  }

  private _startEdit = async (item: IDatasource) => {
    this.setState({
      editingItem: item,
      editingValue: item[TITLE_KEY],
    });
    await delay();
    const wrap = this._wrapRef.current;
    const input: HTMLInputElement = wrap.querySelector('.editor-ui-input');
    if (input) {
      input.focus();
      input.select();
    }
  }

  private _renderColorPicker() {
    return (
      <SketchPicker
        color={this.state.pickerColor}
        onChangeComplete={this._onColorChange}
        presetColors={ DEFAULT_COLORS }
      />
    );
  }

  private _onPickerVisibleChange = (visible: boolean, item: IDatasource) => {
    const { pickerColor } = this.state;
    if (!visible) {
      if (pickerColor !== item[BG_KEY]) {
        this.props.dispatch(createUpdateItemAction({
          [ID_KEY]: item[ID_KEY],
          [BG_KEY]: pickerColor,
        }, true));
      }
      this.setState({
        pickerColor: null,
        pickerItem: null,
      });
      return;
    }
    this.setState({
      pickerItem: item,
      pickerColor: item[BG_KEY] || 'rgba(0, 0, 0, 0)',
    });
  }

  private _onColorChange = (result: ColorResult) => {
    const rgb = result.rgb;
    this.setState({
      pickerColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`,
    });
  }

  private _renderEditor() {
    return (
      <Input
        size="small"
        defaultValue={this.state.editingValue}
        onChange={this._onEditorChange}
        onBlur={this._onEditorBlur}
        className="editor-ui-input"
        style={{ height: '100%' }}
        onDragStart={e => {
          e.stopPropagation();
          e.preventDefault();
        }}
      />
    );
  }

  private _onEditorBlur = () => {
    const { editingItem, editingValue } = this.state;
    this.props.dispatch(createUpdateItemAction({
      [ID_KEY]: editingItem[ID_KEY],
      [TITLE_KEY]: editingValue,
    }, true));
    this.setState({
      editingItem: null,
      editingValue: null,
    });
  }

  private _onEditorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = target.value;
    this.setState({
      editingValue: value,
    });
  }
}
