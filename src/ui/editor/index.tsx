import * as React from 'react';
import { createPortal } from 'react-dom';
import { connect } from 'dva';
import * as _ from 'lodash';
import * as classNames from 'classnames';
import { Button } from 'antd';

import { IAppState } from 'src/models/appModel';
import { Dispatch, AnyAction } from 'redux';

import './style.less';
import { ILayoutsState } from 'src/models/layoutsModel';
import { getDynamicComponentClass } from 'src/utils';
import { UiSelection } from '../selection';
import { createDisSelectAction, createSetRootElementAction } from 'src/models/layoutsActions';
import { UiDropline } from '../dropline';
import { IDndState } from 'src/models/dndModel';
import { /* createUpdateSelectionRangeEffect,  */createDoUpdateSelectionRangeEffect } from 'src/models/appActions';
import { createDragOverAction, createDropEffect, createClearTargetAction } from 'src/models/dndActions';
import { EditorStatus } from 'src/config';
import { Location } from 'history';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

export interface IUiEditor {
  dispatch?: Dispatch<AnyAction>;
  left?: number;
  right?: number;
  childrenLayoutsMap?: any;
  dragSource?: any;
  dragSourceType?: string;
  isDragging?: boolean;
  zoom?: number;
  config?: any;
  rootElement?: string;
  rootTitle?: string;
  editorStatus?: EditorStatus;
  location?: Location;
  isOnlyShowSelectedLayoutOutline?: boolean;
}

@connect(
  ({ APP, LAYOUTS, DND }: {
    APP: IAppState;
    LAYOUTS: ILayoutsState<any>;
    DND: IDndState;
  }) => ({
    left: APP.sidebarWidthLeft,
    right: APP.sidebarWidthRight,
    childrenLayoutsMap: LAYOUTS.childrenLayoutsMap,
    dragSource: DND.dragSource,
    dragSourceType: DND.dragSourceType,
    isDragging: !!DND.dragSource,
    zoom: APP.zoom,
    config: LAYOUTS.config,
    rootElement: LAYOUTS.rootElement,
    rootTitle: LAYOUTS.rootTitle,
    editorStatus: APP.editorStatus,
    location: APP.location,
    isOnlyShowSelectedLayoutOutline: LAYOUTS.isOnlyShowSelectedLayoutOutline,
  }),
)
export class UiEditor extends React.PureComponent<IUiEditor> {
  editorMainRef = React.createRef<HTMLDivElement>();
  private _rootLayoutData: any;
  private _rootELayoutData: any;

  render() {
    const {
      left,
      right,
      childrenLayoutsMap,
      isDragging,
      zoom,
      config,
      rootElement,
      editorStatus,
      location,
      isOnlyShowSelectedLayoutOutline,
    } = this.props;
    const layouts = childrenLayoutsMap[''];
    let zoomStyle: React.CSSProperties = null;
    if (zoom !== 100) {
      zoomStyle = {
        transform: `scale(${zoom / 100})`,
        width: `${10000 / zoom}%`,
        height: `${10000 / zoom}%`,
      };
    }
    let wrapLeft = left;
    let wrapRight = right;
    if (editorStatus === EditorStatus.PREVIEW) {
      wrapLeft = 0;
      wrapRight = 0;
    }
    return (
      <div
        className={classNames('editor-main-wrap', {
          'editor-with-head': !!rootElement,
          'editor-status-edit': editorStatus === EditorStatus.EDIT,
          'editor-status-preview': editorStatus ===  EditorStatus.PREVIEW,
          'editor-status-layout': editorStatus === EditorStatus.LAYOUT,
          'editor-router-visualization': location.pathname === '/',
          'editor-router-template': location.pathname === '/template',
          'editor-router-prototype': location.pathname === '/prototype',
          'editor-router-datasourceBinding': location.pathname === '/datasourceBinding',
          'editor-is-only-show-selected-layout-outline': isOnlyShowSelectedLayoutOutline,
        })}
        style={{ left: wrapLeft, right: wrapRight }}
      >
        {this._renderEditorHead()}
        <div
          className={classNames('editor-main', {
            'editor-dragging': isDragging,
          })}
          id="editor-main"
          ref={this.editorMainRef}
          onClick={this._onclick}
          onScroll={this._onScroll}
          style={zoomStyle}
          onTransitionEnd={this._onTransitionEnd}
          onDragOver={this._onDragOver}
          onDrop={this._onDrop}
          onDragLeave={this._onDragLeave}
        >
          {
            _.map(layouts, l => {
              const Component = getDynamicComponentClass(config.getLayoutComponentKey(l));
              return (
                <Component
                  key={l.cellName}
                  layout={l}
                  childrenLayoutsMap={childrenLayoutsMap}
                />
              );
            })
          }
          {
            editorStatus === EditorStatus.EDIT
              ? (
                createPortal(
                  <>
                    <UiDropline />
                    <UiSelection />
                  </>,
                  document.getElementById('root'),
                )
              )
              : null
          }
          <script>
            window.hello = '1111';
          </script>
        </div>
      </div>
    );
  }

  private _renderEditorHead = () => {
    const { rootElement, rootTitle } = this.props;
    if (!rootElement) {
      return null;
    }
    return (
      <div className="editor-head" >
        <h3>{rootTitle}</h3>
        <Button type="primary" size="small" onClick={this._resetEditorRoot} >{t(I18N_IDS.TEXT_OK)}</Button>
      </div>
    );

  }

  private _onclick = (event: React.MouseEvent) => {
    const target: HTMLElement = event.target as HTMLElement;
    if (target.id === 'editor-main') {
      this.props.dispatch(createDisSelectAction(true));
    }
  }

  private _onScroll = () => {
    this.props.dispatch(createDoUpdateSelectionRangeEffect());
  }

  private _resetEditorRoot = (e: React.MouseEvent) => {
    this.props.dispatch(createSetRootElementAction(null, null, true));
  }

  private _onTransitionEnd = (e: React.TransitionEvent) => {
    if (this.editorMainRef.current !== e.target) {
      return;
    }
    this.props.dispatch(createDoUpdateSelectionRangeEffect());
  }

  private _onDragOver = (event: React.DragEvent) => {
    event.stopPropagation();
    const { dispatch, dragSource, dragSourceType, rootElement } = this.props;
    if (dragSourceType === 'property' ||　dragSourceType === 'method' || !dragSource) {
      return;
    }
    event.preventDefault();
    dispatch(createDragOverAction(
      this._getRootLayoutData(rootElement ? 'ROOT_E' : 'ROOT'),
      'layout',
      0,
    ));
  }

  private _getRootLayoutData = (cellName: string) => {
    const { config } = this.props;
    switch (cellName) {
      case 'ROOT':
        this._rootLayoutData = this._rootLayoutData || {
          [config.cellNameKey]: cellName,
        };
        return this._rootLayoutData;
      case 'ROOT_E':
        this._rootELayoutData = this._rootELayoutData || {
          [config.cellNameKey]: cellName,
        };
        return this._rootELayoutData;
      default:
        return {};
    }
  }

  private _onDragLeave = (event: React.DragEvent) => {
    this.props.dispatch(createClearTargetAction());
  }

  private _onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.dispatch(createDropEffect());
  }

}
