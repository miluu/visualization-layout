import * as React from 'react';
import classnames from 'classnames';
import { IChildrenLayoutsMap, ILayoutsState, ICreateLayouttsModelOptions, IPropertiesMap, IMehtodsMap } from 'src/models/layoutsModel';
import * as _ from 'lodash';
import { Dispatch, AnyAction } from 'redux';
import { Icon, Menu, Dropdown, message, Popover } from 'antd';
import { isEqual, getDynamicComponentClass, isInLayout, delay, transformStyleClassText, renderHitArea, getLayoutTypeDisplay } from 'src/utils';
import { createSelectLayoutEffect, createUpdateLayoutFieldsEffect } from 'src/models/layoutsActions';
import { connect } from 'dva';
import { createDragStartAction, createDragEndAction, createDragOverAction, createDropEffect } from 'src/models/dndActions';
import { IDndState } from 'src/models/dndModel';
import { createUpdateSelectionRangeEffect } from 'src/models/appActions';
import { LayoutSign } from './LayoutSign';

import './BaseLayoutComponent.less';
import { Location } from 'history';
import { IAppState, IDictsMap } from 'src/models/appModel';
import { EditorStatus } from 'src/config';
import { IDatasource, IDatasourceState, ID_KEY, PID_KEY, BG_KEY } from 'src/models/datasourceModel';

export interface IBaseLayoutComponentProps {
  layout: any;
  parentLayout?: any;
  layouts?: any[];
  childrenLayoutsMap?: IChildrenLayoutsMap<any>;
  dispatch?: Dispatch<AnyAction>;
  config?: ICreateLayouttsModelOptions;

  isSelected?: boolean;
  isDragging?: boolean;
  isDraggingOver?: boolean;
  isDragAdd?: boolean;

  activeTabs?: {
    [key: string]: string;
  };

  dragSource?: any;
  dragSourceType?: string;

  properties: IPropertiesMap;
  methods: IMehtodsMap;
  defaultSetting: any;

  renderLocked?: boolean;

  rootElement?: any;

  location?: Location;
  editorStatus?: EditorStatus;
  dicts?: IDictsMap;

  datasource?: IDatasource;

  /** 是否在 Reference 内 */
  isInReference?: boolean;
  /** 是否在选中的 Layout 内 */
  isInSelected?: boolean;
  isOnlyShowSelectedLayoutOutline: boolean;
  // dragTarget?: string;
  // dragTargetType?: string;
  // dragPosition?: number;

}

export interface IBaseLayoutComponentState {
  isCollpased: boolean;
  scrollLeft?: number;
}

export interface ISettingsMenuItemOption {
  display: string;
  onClick: (e?: React.MouseEvent) => any;
}

export class BaseLayoutComponent extends React.Component<IBaseLayoutComponentProps, IBaseLayoutComponentState> {

  state: IBaseLayoutComponentState = {
    isCollpased: false,
  };

  render() {
    return <></>;
  }

  shouldComponentUpdate(nextProps: IBaseLayoutComponentProps, nextState: IBaseLayoutComponentState) {
    const {
      layout,
      childrenLayoutsMap,
      isSelected,
      isDragging,
      isDraggingOver,
      config,
      renderLocked,
      editorStatus,
      isInReference,
      datasource,
      isInSelected,
      isOnlyShowSelectedLayoutOutline,
    } = this.props;
    const { isCollpased } = this.state;
    const { cellNameKey } = config;
    const {
      layout: nextLayout,
      childrenLayoutsMap: nextChildrenLayoutsMap,
      isSelected: nextIsSelected,
      isDragging: nextIsDragging,
      isDraggingOver: nextIsDraggingOver,
      renderLocked: nextRenderLocked,
      editorStatus: nextEditorStatus,
      isInReference: nextIsInReference,
      isInSelected: nextIsInSelected,
      datasource: nextDatasource,
      isOnlyShowSelectedLayoutOutline: nextIsOnlyShowSelectedLayoutOutline,
    } = nextProps;
    const {
      isCollpased: nextIsCollpased,
    } = nextState;
    return (renderLocked && !nextRenderLocked) || (
      !nextRenderLocked && (
        nextLayout !== layout
        || !isEqual(nextChildrenLayoutsMap[nextLayout[cellNameKey]], childrenLayoutsMap[layout[cellNameKey]])
        || isSelected !== nextIsSelected
        || isDragging !== nextIsDragging
        || isDraggingOver !== nextIsDraggingOver
        || isCollpased !== nextIsCollpased
        || editorStatus !== nextEditorStatus
        || isInReference !== nextIsInReference
        || datasource !== nextDatasource
        || isInSelected !== nextIsInSelected
        || isOnlyShowSelectedLayoutOutline !== nextIsOnlyShowSelectedLayoutOutline
      )
    );
  }

  componentDidUpdate() {
    this.props.dispatch(createUpdateSelectionRangeEffect());
  }

  protected _getStyleClass = () => {
    const { layout, editorStatus } = this.props;
    if (!layout.styleClass || editorStatus === EditorStatus.PREVIEW) {
      return layout.styleClass;
    }
    return layout.styleClass.replace(/(flex-|full-height|search-bo|search-close|search-content|glpaas-layout)/g, '__prevent__');
  }

  protected _createRootProps = (extendsClassNames: string[], draggable = true, droppable = true) => {
    const { isDragging, isDraggingOver, editorStatus, isSelected } = this.props;
    const { isCollpased } = this.state;
    const maxHeightStyle = this._getMaxHeightStyle();
    return ({
      id: this._getDomRootId(),
      onClick: this._selectLayout,
      draggable: draggable && editorStatus === EditorStatus.EDIT,
      onDragStart: draggable ? this._onDragStart : undefined,
      onDragEnd: draggable ? this._onDragEnd : undefined,
      onDragOver: droppable ? this._onDragOver : undefined,
      onDragLeave: droppable ? this._onDragLeave : undefined,
      onDrop: droppable ? this._onDrop : undefined,
      className: classnames(
        'editor-base-layout',
        ...extendsClassNames,
        this._getStyleClass(),
        this._getColClass(),
        {
          'editor-layout-max-height': !!maxHeightStyle.maxHeight,
        },
        {
          'editor-dragging-over': isDragging,
          'editor-dragging-source': isDraggingOver,
          'editor-layout-collpased': isCollpased,
          'editor-layout-selected': isSelected,
        },
      ),
      style: editorStatus === EditorStatus.EDIT ? {
        position: 'relative',
        outlineColor: this._getDatasourceBgColor(),
        ...maxHeightStyle,
      } as React.CSSProperties : maxHeightStyle,
    });
  }

  protected _renderChildren = (isComponentGroup = false) => {
    if (this.state.isCollpased) {
      return null;
    }
    return (
      <>
        {this._renderChildrenLayouts()}
        {this._renderChildrenElements(isComponentGroup)}
      </>
    );
  }

  protected _isChildrenInReference = () => {
    const { isInReference, layout } = this.props;
    const isReference = layout && layout.layoutElementType === 'REFERENCE';
    return isInReference || isReference;
  }

  protected _isChildrenInSelected = () => {
    const { isSelected, isInSelected } = this.props;
    return isSelected || isInSelected;
  }

  protected _renderChildrenLayouts = (needRenderIndex?: number[]) => {
    const { config } = this.props;
    const { cellNameKey } = config;
    const childrenLayouts = this._getChildrenLayouts();
    const isInReference = this._isChildrenInReference();
    const isInSelected = this._isChildrenInSelected();
    return _.map(childrenLayouts, (l, i) => {
      if (needRenderIndex && needRenderIndex.indexOf(i) < 0) {
        return null;
      }
      const Compent = getDynamicComponentClass(config.getLayoutComponentKey(l));
      return <Compent
        key={l[cellNameKey]}
        layout={l}
        isInReference={isInReference}
        isInSelected={isInSelected}
      />;
    });
  }

  protected _getDatasourceBgColor = () => {
    const { datasource } = this.props;
    const bgColor = datasource && datasource[BG_KEY];
    if (
      !bgColor
      || bgColor === 'transparent'
      || bgColor === 'TRANSPARENT'
      || _.endsWith(bgColor, ', 0)')
    ) {
      return null;
    }
    return bgColor;
  }

  protected _getChildrenLayouts = (_layout?: any) => {
    const { childrenLayoutsMap, config } = this.props;
    const layout = _layout || this.props.layout;
    const childrenLayouts = childrenLayoutsMap[layout[config.cellNameKey]] || [];
    return childrenLayouts;
  }

  protected _renderChildrenElements = (isComponentGroup = false): JSX.Element[] => {
    const { layout, config } = this.props;
    const { childrenElementsKey, elementIdKey } = config;
    const childrenElement = this.props.layout[childrenElementsKey] || [];
    const isInReference = this._isChildrenInReference();
    const isInSelected = this._isChildrenInSelected();
    return childrenElement.map((e: any) => {
      const Compent = getDynamicComponentClass(config.getElementComponentKey(e, layout));
      return <Compent
        key={e[elementIdKey]}
        element={e}
        labelUnitCount={layout.labelUnitCount}
        isComponentGroup={isComponentGroup}
        isInReference={isInReference}
        isInSelected={isInSelected}
      />;
    });
  }

  protected _renderLayoutSign = () => {
    const { layout, editorStatus, isInReference, isOnlyShowSelectedLayoutOutline  } = this.props;
    if (editorStatus !== EditorStatus.EDIT) {
      return null;
    }
    if (isOnlyShowSelectedLayoutOutline && !this._isChildrenInSelected()) {
      return null;
    }
    const { isCollpased } = this.state;
    return (
      <LayoutSign
        isCollpased={isCollpased}
        uiTypeText={this._getUiTypeText()}
        styleClassText={this._getStyleClassSingText()}
        isParent={layout.isParent}
        onToggleIsCollpased={this._toggleCollpased}
        onToggleIsParent={this._toggleIsParent}
        seqNo={layout.seqNo}
        isInReference={isInReference}
      />
    );
  }

  protected _onDragStart = (event: React.DragEvent) => {
    const { isInReference } = this.props;
    if (isInReference) {
      event.preventDefault();
      event.stopPropagation();
      message.warn('引用布局不可编辑。');
      return;
    }
    const { cellNameKey } = this.props.config;
    const target = event.target as HTMLElement;
    event.dataTransfer.setDragImage(target, 0, 0);
    event.stopPropagation();
    console.log('[onDragStart]', this.props.layout[cellNameKey]);
    this.props.dispatch(createDragStartAction(
      this.props.layout,
      'layout',
      false,
      true,
    ));
  }

  protected _onDragEnd = async (event: React.DragEvent) => {
    const { cellNameKey } = this.props.config;
    console.log('[onDragEnd]', this.props.layout[cellNameKey]);
    event.stopPropagation();
    await delay(0);
    this.props.dispatch(createDragEndAction());
  }

  protected _onDragOver = (event: React.DragEvent) => {
    // console.log('[onDragOver]', this.props.layout[cellNameKey]);
    const { layout, dragSource, dragSourceType, layouts, config, isDragAdd } = this.props;
    if (
      dragSourceType === 'property'
      || dragSourceType === 'method'
      || dragSourceType === 'element' && layout.isParent
    ) {
      return;
    }
    if (!dragSource || !isDragAdd && isInLayout({
      l1: layout,
      l2: dragSource,
      cellNameKey: config.cellNameKey,
      parentCellNameKey: config.parentCellNameKey,
      includeSelf: false,
      list: layouts,
    })) {
      console.log('[_onDragOver] return');
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const classList = (event.target as HTMLDivElement).classList;
    let position = 0;
    if (dragSourceType === 'layout') {
      if (classList.contains('editor-hit-top') || classList.contains('editor-hit-left')) {
        position = -1;
      } else if (classList.contains('editor-hit-bottom') || classList.contains('editor-hit-right')) {
        position = 1;
      }
    }
    this.props.dispatch(createDragOverAction(
      this.props.layout,
      'layout',
      position,
    ));
  }

  protected _onDragLeave = (event: React.DragEvent) => {
    // console.log('[_onDragLeave]', this.props.layout[cellNameKey]);
  }

  protected _onDrop = (event: React.DragEvent) => {
    const { isInReference, layout, config } = this.props;
    const { cellNameKey } = config;
    console.log('[onDrop]', this.props.layout[cellNameKey]);
    event.preventDefault();
    event.stopPropagation();
    if (isInReference || layout.layoutElementType === 'REFERENCE') {
      message.warn('引用布局不可编辑。');
      return;
    }
    this.props.dispatch(createDropEffect());
  }

  protected _selectLayout = (event: React.MouseEvent) => {
    event.stopPropagation();
    const { config, isInReference } = this.props;
    const { cellNameKey } = config;
    console.log('[_selectLayout]: ', this.props.layout[cellNameKey]);
    if (this.props.editorStatus !== EditorStatus.EDIT) {
      return;
    }
    this.props.dispatch(createSelectLayoutEffect(this.props.layout[cellNameKey], { isInReference }));
  }

  protected _getDomRootId = () => {
    const { cellNameKey } = this.props.config;
    return `editor-layout-${this.props.layout[cellNameKey]}`;
  }

  protected _getStyleClassSingText = () => {
    return transformStyleClassText(this.props.layout.styleClass);
  }

  protected _toggleCollpased = () => {
    this.setState({
      isCollpased: !this.state.isCollpased,
    });
  }

  protected _toggleIsParent = () => {
    console.log('_toggleIsParent');
    const { dispatch, layout, config } = this.props;
    dispatch(createUpdateLayoutFieldsEffect(
      layout[config.cellNameKey],
      {
        isParent: layout.isParent ? '' : 'X',
      },
    ));
  }

  protected _getColClass = () => {
    const { layout } = this.props;
    const uiTypeText = this._getUiTypeText();
    if (_.startsWith(uiTypeText, 'COL-')) {
    // if (layout.layoutContainerType === 'DIV' && !layout.layoutElementType && layout.unitCount >= 1 && layout.unitCount <= 12) {
      return `col-xs-${layout.unitCount}`;
    }
    return null;
  }

  protected _getMaxHeightStyle = () => {
    const { layout } = this.props;
    const { pageLayoutAttr } = layout;
    let attrObj: any = {};
    if (pageLayoutAttr) {
      try {
        attrObj = JSON.parse(pageLayoutAttr) || {};
      } catch (__) {/*  */}
    }
    if (!attrObj.visualizationMaxHeightOpen) {
      return {};
    }
    return {
      // overflow: 'auto',
      maxHeight: attrObj.visualizationMaxHeight || 500,
    };
  }

  protected _getUiTypeText = () => {
    return getLayoutTypeDisplay(this.props.layout);
  }

  protected _renderSettings = (menuSource?: ISettingsMenuItemOption[]) => {
    if (this.props.editorStatus !== EditorStatus.EDIT || this.props.isInReference) {
      return null;
    }
    if (this.props.isOnlyShowSelectedLayoutOutline && !this._isChildrenInSelected()) {
      return null;
    }
    return (
      <div className="editor-settings" onClick={e => e.stopPropagation()}>
        {
          menuSource
            ? (
              <Dropdown overlay={this._renderSettingsMenu(menuSource)} trigger={['click']}>
                <a href="javascript:void(0)" className="editor-settings" onClick={e => e.stopPropagation()}>
                  <Icon type="setting" theme="filled" />
                </a>
              </Dropdown>
            )
            : (
              <a href="javascript:void(0)" className="editor-settings" onClick={this.clickSettings}>
                <Icon type="setting" theme="filled" />
              </a>
            )
        }
      </div>
    );
  }

  protected _renderRemark = () => {
    const { layout } = this.props;
    const { remark } = layout;
    if (!remark) {
      return null;
    }
    const content = (
      <div className="editor-layout-remark-popover">
        { _.map(remark.split('\n'), (str, i) => {
          return (
            <React.Fragment key={i}>
              <span>{str}</span>
              <br />
            </ React.Fragment>
          );
        }) }
      </div>
    );
    return (
      <Popover
        title="备注"
        content={content}
        trigger="click"
        overlayClassName="editor-layout-remark-overlay"
      >
        <span
          className="editor-layout-remark-icon"
          onClick={e => e.stopPropagation()}
        />
      </Popover>
    );
  }

  protected _renderSettingsMenu = (menuSource: ISettingsMenuItemOption[]) => {
    if (this.props.editorStatus !== EditorStatus.EDIT) {
      return null;
    }
    const { Item } = Menu;
    return (
      <Menu>
        {
          _.map(menuSource, (item, i) => (
            <Item key={i}>
              <a
                href="javascript:void(0)"
                onClick={item.onClick}
              >{item.display}</a>
            </Item>
          ))
        }
      </Menu>
    );
  }

  protected _renderHitArea = (positions?: Array<'top' | 'bottom' | 'left' | 'right'>) => {
    if (this.props.editorStatus !== EditorStatus.EDIT) {
      return null;
    }
    return renderHitArea(positions);
  }

  protected clickSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
  }

}

export function createConnector(extendCb?: (state: any, props: IBaseLayoutComponentProps) => any) {
  return connect(
    (state: {
      LAYOUTS: ILayoutsState<any>,
      DND: IDndState,
      APP: IAppState,
      DATASOURCE: IDatasourceState,
    }, props: IBaseLayoutComponentProps) => {
      const { LAYOUTS, DND, APP } = state;
      const { layout } = props;
      let datasource: IDatasource;
      if (state.DATASOURCE && state.DATASOURCE.source) {
        if (layout.dataSourceId) {
          datasource = _.find(state.DATASOURCE.source, s => s[ID_KEY] === layout.dataSourceId);
        } else {
          datasource = _.find(state.DATASOURCE.source, s => !s[PID_KEY]);
        }
      }
      return {
        childrenLayoutsMap: LAYOUTS.childrenLayoutsMap,
        config: LAYOUTS.config,
        layouts: LAYOUTS.layouts,
        isSelected: layout[LAYOUTS.config.cellNameKey] === LAYOUTS.selectedLayout,
        isDragging: DND.dragSource === layout,
        isDraggingOver: DND.target === layout,
        isDragAdd: DND.isAdd,
        isOnlyShowSelectedLayoutOutline: LAYOUTS.isOnlyShowSelectedLayoutOutline,

        activeTabs: LAYOUTS.activeTabs,

        dragSource: DND.dragSource,
        dragSourceType: DND.dragSourceType,

        properties: LAYOUTS.properties,
        methods: LAYOUTS.methods,
        defaultSetting: LAYOUTS.defaultSetting,

        renderLocked: LAYOUTS.isTemp,

        rootElement: LAYOUTS.rootElement,

        location: APP.location,
        editorStatus: APP.editorStatus,
        dicts: APP.dicts,
        datasource,
        ...(extendCb ? extendCb(state, props) : {}),
      };
    },
  );
}

export const connector = createConnector();
