import * as React from 'react';
import * as _ from 'lodash';
import classnames from 'classnames';
import { Icon } from 'antd';

import { BaseLayoutComponent, connector, IBaseLayoutComponentProps } from './BaseLayoutComponent';
import { registGlobalComponentClass } from 'src/utils';

import './LayoutTabsComponent.less';
import { createUpdateActiveTabsAction, createSelectLayoutAction, createAddLayoutToParentEffect } from 'src/models/layoutsActions';
import { createLayout } from 'src/routes/Visualization/config';
import { EditorStatus } from 'src/config';

/**
 * 容器类型: TABS
 */
@connector
export class LayoutTabsComponent extends BaseLayoutComponent {

  render() {
    const { layout, activeTabs, editorStatus } = this.props;
    const { cellNameKey } = this.props.config;
    console.log(`[LayoutTabsComponent#render] ${layout ? layout[cellNameKey] : ''}`);
    const activeTabIndex = this._getActiveTabIndex(
      this._getChildrenLayouts(),
      activeTabs[layout[cellNameKey]],
    );
    return (
      <div
        {...this._createRootProps(['editor-layout-tabs', 'tab'], true, false)}
      >
        <div className="tab-nav">
          <div className="tab-bar">
            <ul className="tab-items">
              {
                _.map(this._getChildrenLayouts(), (l, i) => (
                  <li
                    key={l[cellNameKey]}
                    className={classnames({
                      active: i === activeTabIndex,
                    })}
                    onClick={(e) => this._selectTab(e, l)}
                  >
                    <a href="javascript:void(0)" >{l.groupTitle}</a>
                  </li>
                ))
              }
              {
                editorStatus === EditorStatus.EDIT
                  ? (
                      <li onClick={this._onClickAddTab}>
                        <a href="javascript:void(0)" >
                          <Icon type="plus-circle" theme="twoTone" />
                        </a>
                      </li>
                    )
                  : null
              }
            </ul>
          </div>
        </div>
        <div className="tab-body" style={{ minHeight: 50 }}>
          {this._renderChildrenLayouts([activeTabIndex])}
        </div>

        {this._renderLayoutSign()}

        {this._renderHitArea(['top', 'bottom'])}

        {this._renderRemark()}

      </div>
    );
  }

  shouldComponentUpdate(nextProps: IBaseLayoutComponentProps, nextState: any) {
    const { activeTabs, layout, config } = this.props;
    const {
      activeTabs: nextActiveTabs,
      layout: nextLayout,
      childrenLayoutsMap: nextChildrenLayoutsMap,
      renderLocked,
    } = nextProps;
    const activeTab = activeTabs[layout[config.cellNameKey]];
    const nextActiveTab = nextActiveTabs[nextLayout[config.cellNameKey]];
    const nextChildrenLayouts = nextChildrenLayoutsMap[nextLayout[config.cellNameKey]];
    const childrenLayouts = this._getChildrenLayouts();
    const activeTabIndex = this._getActiveTabIndex(childrenLayouts, activeTab);
    const nextActiveTabIndex = this._getActiveTabIndex(nextChildrenLayouts, nextActiveTab);
    return !renderLocked && (
      super.shouldComponentUpdate(nextProps, nextState) || activeTabIndex !== nextActiveTabIndex
    );
  }

  private _getActiveTabIndex(childrenLayouts: any[], activeTab: string) {
    const { config } = this.props;
    let index = _.findIndex(childrenLayouts, l => l[config.cellNameKey] === activeTab);
    if (index < 0) {
      index = 0;
    }
    return index;
  }

  private _selectTab(e: React.MouseEvent, tabLayout: any) {
    e.stopPropagation();
    const { config, dispatch, layout, isInReference } = this.props;
    dispatch(createUpdateActiveTabsAction(
      layout[config.cellNameKey],
      tabLayout[config.cellNameKey],
      true,
    ));
    if (this.props.editorStatus !== EditorStatus.EDIT) {
      return;
    }
    dispatch(createSelectLayoutAction(
      tabLayout[config.cellNameKey],
      { isInReference },
      true,
    ));
  }

  private _onClickAddTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { dispatch, layout, config } = this.props;
    dispatch(createAddLayoutToParentEffect(
      createLayout({
        layoutContainerType: 'TAB',
        groupTitle: 'TAB',
      }),
      layout[config.cellNameKey],
      this._getChildrenLayouts().length,
    ));
  }

}

registGlobalComponentClass('LayoutTabsComponent', LayoutTabsComponent);
