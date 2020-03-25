import * as React from 'react';
import * as _ from 'lodash';

import { connect } from 'dva';
import { ILayoutsState, IChildrenLayoutsMap, ICreateLayouttsModelOptions } from 'src/models/layoutsModel';
import {
  Tree,
  Dropdown,
  Menu,
  Icon,
} from 'antd';

import './style.less';
import { Dispatch, AnyAction } from 'redux';
import { createSelectLayoutEffect,
  createDisSelectAction,
  createSelectElementAction,
  createRemoveElementEffect,
  createRemoveLayoutsEffect,
  createMoveDownSelectedElementEffect,
  createMoveUpSelectedElementEffect,
  createMoveUpSelectedLayoutEffect,
  createMoveDownSelectedLayoutEffect,
} from 'src/models/layoutsActions';
import { getLayoutTypeDisplay } from 'src/utils';
import { AntTreeNodeDropEvent } from 'antd/lib/tree/Tree';
import { createDropEffect } from 'src/models/dndActions';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

const { TreeNode } = Tree;
const MenuItem = Menu.Item;
// const { Divider } = Menu;

export interface IUiPageLayoutsTreeProps {
  layouts?: any[];
  layoutsMap?: IChildrenLayoutsMap<any>;
  config?: ICreateLayouttsModelOptions;
  selectedKey?: string;
  dispatch?: Dispatch<AnyAction>;
}

export interface IUiPageLayoutsTreeState {
  contextItem: any;
  contextItemType: string;
}

@connect(({
  LAYOUTS,
}: {
  LAYOUTS: ILayoutsState<any>;
}) => {
  return {
    layouts: LAYOUTS.layouts,
    layoutsMap: LAYOUTS.childrenLayoutsMap,
    config: LAYOUTS.config,
    selectedKey: LAYOUTS.selectedElement || LAYOUTS.selectedLayout,
  };
})
export class UiPageLayoutsTree extends React.PureComponent<IUiPageLayoutsTreeProps,
IUiPageLayoutsTreeState> {
  state: IUiPageLayoutsTreeState = {
    contextItem: null,
    contextItemType: null,
  };

  render() {
    const { selectedKey } = this.props;
    return (
      <div className="editor-ui-page-layouts-tree">
        <Tree
          blockNode
          defaultExpandAll
          autoExpandParent
          selectedKeys={[selectedKey]}
          draggable
          onDrop={this._onDrop}
        >
          { this._renderChildrenLayouts() }
        </Tree>
      </div>
    );
  }

  private _renderChildrenLayouts(parentLayout?: any) {
    const { layoutsMap, config } = this.props;
    const {
      cellNameKey,
    } = config;
    const parentCellName = parentLayout ? (parentLayout[cellNameKey] || '') : '';
    const childreLayouts = layoutsMap[parentCellName] || [];
    if (!childreLayouts.length) {
      return null;
    }
    return (
      _.map(childreLayouts, l => {
        return (
          <TreeNode
            key={l[cellNameKey]}
            title={this._renderLayoutItem(l)}
            dataType={'layout'}
            data={l}
          >
            {this._renderChildrenLayouts(l)}
            {this._renderChildrenElements(l)}
          </TreeNode>
        );
      })
    );
  }

  private _renderChildrenElements(parentLayout?: any) {
    const { config } = this.props;
    const {
      childrenElementsKey,
      elementIdKey,
    } = config;
    const childrentElements = parentLayout[childrenElementsKey] || [];
    if (!childrentElements.length) {
      return null;
    }
    return (
      _.map(childrentElements, e => {
        return (
          <TreeNode
            key={e[elementIdKey]}
            title={this._renderElementItem(e)}
            dataType={'element'}
            data={e}
          />
        );
      })
    );
  }

  private _onClickLayoutItem = (layout: any) => {
    const { config, selectedKey } = this.props;
    const {
      cellNameKey,
    } = config;
    const cellName = layout[cellNameKey];
    if (cellName !== selectedKey) {
      this.props.dispatch(createSelectLayoutEffect(layout[cellNameKey]));
    } else {
      this.props.dispatch(createDisSelectAction(true));
    }
  }

  private _onClickElementItem = (element: any) => {
    const { config, selectedKey } = this.props;
    const {
      elementIdKey,
    } = config;
    const elementId = element[elementIdKey];
    if (elementId !== selectedKey) {
      this.props.dispatch(createSelectElementAction(elementId, undefined, true));
    } else {
      this.props.dispatch(createDisSelectAction(true));
    }
  }

  private _renderLayoutItem = (layout: any) => {
    const { config } = this.props;
    const {
      cellNameKey,
    } = config;
    return (
      <Dropdown
        overlay={this._renderContextMenu()}
        trigger={['contextMenu']}
        onVisibleChange={visible => this._onContexMenuVisibleChange(visible, layout, 'layout')}
      >
        <div className="editor-tree-node-layout"
          onClick={() => this._onClickLayoutItem(layout)}
        >
          <span>
            {`[${getLayoutTypeDisplay(layout)}] ${layout[cellNameKey]}`}
          </span>
          {/* <span
            className={classnames(['editor-is-parent', {
              active: layout.isParent,
            }])}
          >父</span> */}
        </div>
      </Dropdown>
    );
  }

  private _renderElementItem = (element: any) => {
    let displayText = element.fieldText || element.columnName;
    switch (element.layoutElementType) {
      case 'BUTTON_GROUP':
        displayText = t(I18N_IDS.CONTROL_BUTTON_GROUP);
        break;
      case 'DYNA_MORE_QUERY':
        displayText = t(I18N_IDS.CONTROL_ADVANCED_SEARCH);
        break;
      case 'DYNA_COMB_QUERY':
        displayText = t(I18N_IDS.CONTROL_COMBINED_SEARCH);
        break;
      default:
        break;
    }
    return (
      <Dropdown
        overlay={this._renderContextMenu()}
        trigger={['contextMenu']}
        onVisibleChange={visible => this._onContexMenuVisibleChange(visible, element, 'element')}
      >

        <div className="editor-tree-node-layout"
          onClick={() => this._onClickElementItem(element)}
        >
          <span>
            {displayText}
          </span>
        </div>
      </Dropdown>
    );
  }

  private _onContexMenuVisibleChange = (visible: boolean, item: any, type: string) => {
    if (visible) {
      this.setState({
        contextItem: item,
        contextItemType: type,
      });
      return;
    }
    this.setState({
      contextItem: null,
      contextItemType: null,
    });
  }

  private _renderContextMenu = () => (
    <Menu>
      <MenuItem
        onClick={() => this._moveUpContextItem()}
      >
        <Icon type="up-circle" />
        <span className="editor-ui-menu-text">{t(I18N_IDS.MOVE_UP)}</span>
      </MenuItem>
      <MenuItem
        onClick={() => this._moveDownContextItem()}
      >
        <Icon type="down-circle" />
        <span className="editor-ui-menu-text">{t(I18N_IDS.MOVE_DOWN)}</span>
      </MenuItem>
      <MenuItem
        onClick={() => this._removeContextItem()}
      >
        <Icon type="delete" />
        <span className="editor-ui-menu-text">{t(I18N_IDS.DELETE)}</span>
      </MenuItem>
      {/* {
        this.state.contextItemType === 'layout'
          ? (
            [
              <Divider key="1" />,
              <MenuItem
                key="2"
                onClick={() => this._settingContextItem()}
              >
                <Icon type="setting" />
                <span className="editor-ui-menu-text">快捷配置</span>
              </MenuItem>,
            ]
          )
          : null
      } */}
    </Menu>
  )

  private _moveUpContextItem = () => {
    const {
      contextItemType,
      contextItem,
    } = this.state;
    const {
      config,
      dispatch,
    } = this.props;
    const {
      elementIdKey,
      cellNameKey,
    } = config;
    switch (contextItemType) {
      case 'element':
        dispatch(createMoveUpSelectedElementEffect(contextItem[elementIdKey]));
        break;
      default:
        dispatch(createMoveUpSelectedLayoutEffect(contextItem[cellNameKey]));
        break;
    }
  }

  private _moveDownContextItem = () => {
    const {
      contextItemType,
      contextItem,
    } = this.state;
    const {
      config,
      dispatch,
    } = this.props;
    const {
      elementIdKey,
      cellNameKey,
    } = config;
    switch (contextItemType) {
      case 'element':
        dispatch(createMoveDownSelectedElementEffect(contextItem[elementIdKey]));
        break;
      default:
        dispatch(createMoveDownSelectedLayoutEffect(contextItem[cellNameKey]));
        break;
    }
  }

  private _removeContextItem = () => {
    const {
      contextItemType,
      contextItem,
    } = this.state;
    const { config, dispatch } = this.props;
    const {
      cellNameKey,
      elementIdKey,
    } = config;
    console.log('_removeContextItem, 点击右键菜单', contextItemType, contextItem);
    switch (contextItemType) {
      case 'element':
        dispatch(createRemoveElementEffect(contextItem[elementIdKey]));
        break;
      case 'layout':
        dispatch(createRemoveLayoutsEffect(contextItem[cellNameKey]));
        break;
      default:
        break;
    }
  }

  // private _settingContextItem = () => {
  //   const {
  //     contextItemType,
  //     contextItem,
  //   } = this.state;
  //   console.log('_settingContextItem, 点击右键菜单', contextItemType, contextItem);
  // }

  private _onDrop = (info: AntTreeNodeDropEvent) => {
    const {
      dataType: targetType,
      data: target,
      pos,
    } = info.node.props;
    const {
      dataType: dragSourceType,
      data: dragSource,
    } = info.dragNode.props;
    const dropPos = pos.split('-');
    const position = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    const { dispatch } = this.props;
    if (
      dragSourceType === 'element' && targetType === 'layout' && (target.isParent || position !== 0)
      || dragSourceType === 'layout' && targetType === 'element'
      || dragSourceType === 'layout' && targetType === 'layout' && position === 0 && !target.isParent
    ) {
      return;
    }
    dispatch(createDropEffect({
      dragSource,
      dragSourceType,
      isAdd: false,
      target,
      targetType,
      position,
    }));
  }

}
