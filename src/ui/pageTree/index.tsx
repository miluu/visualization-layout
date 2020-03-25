import * as React from 'react';
import * as _ from 'lodash';
import { Tree, Icon, Popconfirm, Button } from 'antd';

import './style.less';
import { UiPageForm } from '../pageForm';
import { connect } from 'dva';
import { IPagesState } from 'src/models/pagesModel';
import { AnyAction, Dispatch } from 'redux';
import {
  createSetExpandedPagesAction,
  createAddSubPageEffect,
  createEditPageEffect,
  createMovePageEffect,
  createGenerateCodeEffect,
  createCopyPageEffect,
} from 'src/models/pagesActions';
import { AntTreeNodeMouseEvent } from 'antd/lib/tree';
import { AntTreeNodeDropEvent, AntTreeNodeCheckedEvent } from 'antd/lib/tree/Tree';
import { groupPages } from 'src/utils';
import { IPrototypePage } from 'src/routes/Prototype/types';
import { PROTOTYPE_CONFIG } from 'src/routes/Prototype/config';
import { IAppState } from 'src/models/appModel';
import I18N_IDS from 'src/i18n/ids';
import { t } from 'src/i18n';

const { TreeNode } = Tree;

export interface IPageTreeProps {
  pageList?: IPrototypePage[];
  currentPageId?: string;
  expandedPageIds?: string[];

  isShowForm?: boolean;
  formTitle?: string;

  onSelectPage?: (e?: React.MouseEvent, page?: any) => any;
  onDeletePage?: (page?: any) => any;
  editable?: boolean;
  showGenerateButton?: boolean;
  onExpand?: (keys: string[]) => any;

  dispatch?: Dispatch<AnyAction>;
}

export interface IPageTreeState {
  checkable?: boolean;
  checkedKeys?: {
    checked: string[];
    halfChecked: string[];
  };
}

@connect(
  ({ PAGES, APP }: {
    PAGES: IPagesState<IPrototypePage>,
    APP: IAppState,
  }) => {
    const { location } = APP;
    if (location.pathname === '/prototype') {
      return {
        pageList: PAGES.pageList,
        currentPageId: PAGES.currentPageId,
        expandedPageIds: PAGES.expandedPageIds,
        isShowForm: PAGES.isShowForm,
        formTitle: PAGES.formTitle,
        editable: true,
        showGenerateButton: true,
      };
    }
    return {
      editable: false,
    };
  },
)

export class UiPageTree extends React.PureComponent<IPageTreeProps, IPageTreeState> {
  formRef: UiPageForm;
  state: IPageTreeState = {
    checkable: false,
    checkedKeys: {
      checked: [],
      halfChecked: [],
    },
  };
  render() {
    console.log('[UiPageTree#render]', this.props);
    const {
      pageList,
      currentPageId,
      expandedPageIds,
      editable,
    } = this.props;
    const { checkable, checkedKeys } = this.state;
    const selectedKeys = [];
    if (currentPageId) {
      selectedKeys.push(currentPageId);
    }
    const groupedPageList = groupPages<IPrototypePage>(pageList, PROTOTYPE_CONFIG.parentPageIdKey, PROTOTYPE_CONFIG.pageOrderKey);
    return (
      <div className="editor-page-tree">
        <div className="editor-page-tree-buttons">
          {this._renderButtons()}
        </div>
        <Tree
          blockNode
          checkable={checkable}
          checkStrictly
          checkedKeys={checkedKeys}
          draggable={editable}
          expandedKeys={expandedPageIds}
          selectedKeys={selectedKeys}
          onExpand={this._onExpand}
          onDragEnter={this._onDragEnter}
          onDrop={this._onDrop}
          onCheck={this._updateCheckedKeys}
        >
          {this._renderTreeNodes(groupedPageList)}
        </Tree>
        {
          editable
            ? <UiPageForm wrappedComponentRef={ref => { this.formRef = ref; }} />
            : null
        }
      </div>
    );
  }
  componentWillReceiveProps(nextProps: IPageTreeProps) {
    console.log('[PageTree#componentWillReceiveProps]', nextProps);
  }
  private _updateCheckedKeys = (keys: any, event: AntTreeNodeCheckedEvent) => {
    const checked = event.checked;
    const currentPage: any = event.node.props.dataRef;
    const { pageList } = this.props;
    const childrenKeys: string[] = [];
    if (!checked) {
      this.setState({
        checkedKeys: keys,
      });
      return;
    }
    pushChildrenKeys([currentPage], false);
    const checkedKeys = keys.checked;
    let finalKeys = checkedKeys;
    if (checked) {
      finalKeys = _.concat(finalKeys, childrenKeys);
    }/*  else {
      finalKeys = _.difference(finalKeys, childrenKeys);
    } */
    finalKeys = _.uniq(finalKeys);
    this.setState({
      checkedKeys: {
        checked: finalKeys,
        halfChecked: [],
      },
    });

    function pushChildrenKeys(nodes: any[], includes = true) {
      _.forEach(nodes, node => {
        const key = node[PROTOTYPE_CONFIG.pageIdKey];
        if (includes) {
          childrenKeys.push(key);
        }
        const childrenNodes = _.filter(pageList, p => p[PROTOTYPE_CONFIG.parentPageIdKey] === key);
        pushChildrenKeys(childrenNodes);
      });
    }
  }
  private _renderButtons = () => {
    const { editable, showGenerateButton } = this.props;
    const { checkable } = this.state;
    if (checkable && showGenerateButton) {
      return (
        <>
          <Button
            size="small"
            type="primary"
            onClick={this._generateCode}
          >
            {t(I18N_IDS.CODE_GEN)}
          </Button>
          <Button
            size="small"
            onClick={() => this._toggleCheckable(false)}
          >
            {t(I18N_IDS.CODE_GEN_EXIT)}
          </Button>
        </>
      );
    }
    return (
      <>
        {
          editable
            ? <Button
                size="small"
                onClick={() => this._addSubPage(null)}
              >
                {t(I18N_IDS.ADD_PAGE)}
                <Icon type="plus" />
              </Button>
            : null
        }
        {
          showGenerateButton
          ?  <Button
              size="small"
              onClick={() => this._toggleCheckable(true)}
            >
              {t(I18N_IDS.CODE_GEN)}
              <Icon type="code" />
            </Button>
          : null
        }
      </>
    );
  }
  private _renderTreeNodes = (groupedPageList: {[pid: string]: IPrototypePage[]}, pid = '') => {
    const nodes = groupedPageList[pid] || [];
    return nodes.map(node => (
      <TreeNode
        title={this._renderTreeNodeTitle(node)}
        key={node[PROTOTYPE_CONFIG.pageIdKey]}
        dataRef={node}
      >
        {this._renderTreeNodes(groupedPageList, node[PROTOTYPE_CONFIG.pageIdKey])}
      </TreeNode>
    ));
  }
  private _renderTreeNodeTitle(node: IPrototypePage) {
    const { editable } = this.props;
    const { checkable } = this.state;
    return (
      <div
        className="editor-tree-node-title"
        onDoubleClick={(e) => this._dblClick(e, node)}
      >
        <span className="editor-tree-title-text">
          {node.originName}
        </span>
        {
          editable && !checkable
            ? (
                <span className="editor-tree-actions">
                  <a
                    title={t(I18N_IDS.TEXT_ADD_SUB_PAGE)}
                    className="editor-tree-action"
                    onClick={() => this._addSubPage(node)}
                  ><Icon type="plus-circle" /></a>
                  <a
                    title={t(I18N_IDS.TEXT_EDIT_PAGE)}
                    className="editor-tree-action"
                    onClick={() => this._editPage(node)}
                  ><Icon type="edit" /></a>
                  <a
                    title={t(I18N_IDS.TEXT_COPY_PAGE)}
                    className="editor-tree-action"
                    onClick={() => this._copyPage(node)}
                  ><Icon type="copy" /></a>
                  <Popconfirm
                    title={t(I18N_IDS.MESSAGE_DELETE_PAGE_CONFIRM)}
                    onConfirm={() => this._deletePage(node)}
                    okText={t(I18N_IDS.TEXT_OK)}
                    cancelText={t(I18N_IDS.TEXT_CANCEL)}
                    placement="topRight"
                  >
                    <a title={t(I18N_IDS.DELETE)} className="editor-tree-action" ><Icon type="delete" /></a>
                  </Popconfirm>
                </span>
              )
            : null
        }
      </div>
    );
  }
  private _toggleCheckable = (checkable?: boolean) => {
    const _checkable = _.isUndefined(checkable) ? true : checkable;
    this.setState({
      checkable: _checkable,
      checkedKeys: {
        checked: [],
        halfChecked: [],
      },
    });
  }
  private _generateCode = () => {
    const { checkedKeys } = this.state;
    this.props.dispatch(createGenerateCodeEffect(checkedKeys.checked || []));
  }
  private _dblClick = (e: React.MouseEvent, node: IPrototypePage) => {
    if (this.props.onSelectPage) {
      this.props.onSelectPage(e, node);
    }
  }
  private _addSubPage = (node: IPrototypePage) => {
    this.props.dispatch(createAddSubPageEffect(node));
  }
  private _editPage = (node: IPrototypePage) => {
    this.props.dispatch(createEditPageEffect(node));
    const { form } = this.formRef.props;
    form.setFieldsValue({
      originName: node.originName,
    });
  }
  private _copyPage = (node: IPrototypePage) => {
    this.props.dispatch(createCopyPageEffect(node));
    const { form } = this.formRef.props;
    form.setFieldsValue({
      originName: node.originName,
    });
  }
  private _deletePage = (node: IPrototypePage) => {
    if (this.props.onDeletePage) {
      this.props.onDeletePage(node);
    }
  }
  private _onExpand = (ids: string[]) => {
    if (this.props.onExpand) {
      this.props.onExpand(ids);
      return;
    }
    this.props.dispatch(createSetExpandedPagesAction(ids, true));
  }
  private _onDragEnter = ({ expandedKeys }: AntTreeNodeMouseEvent & {expandedKeys: string[]}) => {
    this.props.dispatch(createSetExpandedPagesAction(expandedKeys, true));
  }
  private _onDrop = (info: AntTreeNodeDropEvent) => {
    console.log('[_onDrop]', info);
    const dropKey = info.node.props.eventKey;
    const dragKey = info.dragNode.props.eventKey;
    const dropPos = info.node.props.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    this.props.dispatch(createMovePageEffect({
      sourceId: dragKey,
      targetId: dropKey,
      pos: dropPosition,
    }));
  }
}
