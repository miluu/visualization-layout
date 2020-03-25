import * as React from 'react';
import {
  Button,
  Radio,
  Dropdown,
  Menu,
  message,
} from 'antd';

import './style.less';
import { EditorStatus, ZOOMS } from 'src/config';
import { connect } from 'dva';

import { IAppState } from '../../models/appModel';
import { RadioChangeEvent } from 'antd/lib/radio';
import { Dispatch, AnyAction } from 'redux';
import { createSetEditorStatusAction, createZoomToAction, createSaveEffect, createSetKeyValueAction, createExportJsonEffect, createChangeLocaleEffect } from 'src/models/appActions';
import { ILayoutsState } from 'src/models/layoutsModel';
import { canUndo, canRndo, noop, confirm } from 'src/utils';
import { createLayoutsHistoryUndoAction, createLayoutsHistoryRedoAction, createReplaceLayoutsAction, createAutoBindingEffect } from 'src/models/layoutsActions';
import { WrappedInputNumber } from 'src/utils/forms';
import { Location } from 'history';
import { openImportLayoutsJsonModal } from 'src/utils/modal';
import { IPagesState } from 'src/models/pagesModel';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

const ButtonGroup = Button.Group;

interface IUiToolbarProps {
  /** 标题文字 */
  title?: string;
  /** 标题栏宽度 */
  titleWidth?: number;
  /** 右侧扩展栏自定义渲染 */
  extendRender?: () => React.ReactNode;
  /** 右侧扩展栏宽度 */
  extendWidth?: number;

  dispatch?: Dispatch<AnyAction>;
  editorStatus?: EditorStatus;
  zoom?: number;
  canUndoLayouts?: boolean;
  canRedoLayouts?: boolean;
  canClearLayouts?: boolean;

  currentPageId?: string;

  isBinding?: boolean;
  location?: Location;
  isSaving?: boolean;
  locale?: string;

  onClickSave?: (e: React.MouseEvent) => any;

  [key: string]: any;
}

/**
 * 页面工具栏组件
 */
@connect(
  ({ APP, LAYOUTS, PAGES }: {
    APP: IAppState,
    LAYOUTS: ILayoutsState<any>,
    PAGES: IPagesState<any>,
  }) => ({
    editorStatus: APP.editorStatus,
    zoom: APP.zoom,
    canUndoLayouts: canUndo(LAYOUTS.history),
    canRedoLayouts: canRndo(LAYOUTS.history),
    canClearLayouts: !!(LAYOUTS.layouts && LAYOUTS.layouts.length),

    currentPageId: PAGES.currentPageId,

    isBinding: APP.isBinding,
    location: APP.location,
    isSaving: APP.isSaveing,
    title: APP.title,
    locale: APP.locale,
  }),
)
export class UiToolbar extends React.PureComponent<IUiToolbarProps, any> {
  state = {
    showLanguage: true,
  };

  render() {
    const titleWidth = this.props.titleWidth || 200;
    const extendWidth = this.props.extendRender ? (this.props.extendWidth || 100) : 0;
    const { canRedoLayouts, canUndoLayouts, canClearLayouts } = this.props;
    return (
      <div className="editor-toolbar">
        <div className="editor-title" style={{ width: titleWidth }}>
          <h1>{this.props.title}</h1>
        </div>
        <div className="editor-toolbar-extend">
          {this.props.extendRender && this.props.extendRender()}
          {
            this.state.showLanguage
              ? <span className="editor-toolbar-language">
                  <Dropdown
                    overlay={(
                      <Menu>
                        <Menu.Item>
                          <a
                            onClick={ () => this._changeLanguage('zh') }
                          >
                            <img
                              src="/themes/v6/images/langnuge-a.png"
                            />
                            <span>简体中文</span>
                          </a>
                        </Menu.Item>
                        <Menu.Item>
                          <a
                            onClick={ () => this._changeLanguage('en') }
                          >
                            <img
                              src="/themes/v6/images/english-v.png"
                            />
                            <span>English</span>
                          </a>
                        </Menu.Item>
                      </Menu>
                    )}
                  >
                    <a>
                      <img
                        src={
                          (this.props.locale || '').indexOf('en') < 0
                            ? '/themes/v6/images/langnuge-a.png'
                            : '/themes/v6/images/english-v.png'
                        }
                      />
                    </a>
                  </Dropdown>
                </span>
              : null
          }
        </div>
        <div className="editor-toolbar-area" style={{ marginLeft: titleWidth, marginRight: extendWidth }}>
          {this._renderSaveButton()}
          <Radio.Group
            size="small"
            value={this.props.editorStatus}
            onChange={this._changeEditorStatus}
          >
            <Radio.Button value={EditorStatus.EDIT}>{t(I18N_IDS.EDIT)}</Radio.Button>
            <Radio.Button value={EditorStatus.LAYOUT}>{t(I18N_IDS.LAYOUT)}</Radio.Button>
            <Radio.Button value={EditorStatus.PREVIEW}>{t(I18N_IDS.PREVIEW)}</Radio.Button>
          </Radio.Group>
          {' '}
          {/* <Radio.Group
            size="small"
            value={this.props.editorStatus}
            disabled
          >
            <Radio.Button value={EditorStatus.DATA}>数据</Radio.Button>
            <Radio.Button value="code">源码</Radio.Button>
          </Radio.Group> */}
          {/* ' ' */}
          <Button.Group
            size="small"
          >
            <Button
              disabled={!canUndoLayouts}
              onClick={this._undoLayouts}
            >{t(I18N_IDS.UNDO)}</Button>
            <Button
              onClick={this._redoLayouts}
              disabled={!canRedoLayouts}
            >{t(I18N_IDS.REDO)}</Button>
          </Button.Group>
          {' '}
          <Button
            type="danger"
            size="small"
            disabled={!canClearLayouts}
            onClick={this._clearLayouts}
          >{t(I18N_IDS.CLEAR)}</Button>
          {' '}
          <label style={{ marginLeft: 8, color: '#fff' }}>{t(I18N_IDS.ZOOM)}</label> {' '}
          <WrappedInputNumber
            size="small"
            value={this.props.zoom}
            min={ZOOMS.min}
            max={ZOOMS.max}
            step={ZOOMS.step}
            style={{ width: 60 }}
            onChange={this._onZoomChange}
          />
          {' '}
          {this._renderBindingButton()}
          {this._renderImportExportButton()}
          {this.props.children}
        </div>
      </div>
    );
  }

  private _renderSaveButton = () => {
    const { location, isSaving } = this.props;
    switch (location.pathname) {
      case '/datasourceBinding':
        return null;
      default:
        return (
          <>
            <Button
              type="primary"
              size="small"
              onClick={this._onClickSave}
              disabled={isSaving}
            >{t(I18N_IDS.SAVE)}</Button>
            {' '}
            <Button
              type="primary"
              size="small"
              disabled
            >{t(I18N_IDS.COMMIT)}</Button>
            {' '}
          </>
        );
    }
  }

  private _renderBindingButton = () => {
    const { location, isBinding } = this.props;
    switch (location.pathname) {
      case '/':
      case '/datasourceBinding':
        return (
          <ButtonGroup
            size="small"
          >
            <Button
              onClick={this._onClickBinding}
            >{ isBinding ? t(I18N_IDS.EXIT_PROPERTY_BINDING) : t(I18N_IDS.PROPERTY_BINDING)}</Button>
            <Button
              onClick={this._onClickAutoBinding}
            >{t(I18N_IDS.AUTO_BINDING)}</Button>
          </ButtonGroup>
        );
      default:
        return null;
    }
  }

  private _changeEditorStatus = (e: RadioChangeEvent) => {
    const status = e.target.value;
    this.props.dispatch(createSetEditorStatusAction(status));
  }

  private _onZoomChange = (zoom: number) => {
    this.props.dispatch(createZoomToAction(zoom));
  }

  private _undoLayouts = () => {
    this.props.dispatch(createLayoutsHistoryUndoAction(true));
  }

  private _redoLayouts = () => {
    this.props.dispatch(createLayoutsHistoryRedoAction(true));
  }

  private _clearLayouts = () => {
    this.props.dispatch(createReplaceLayoutsAction([], true, true));
  }

  private _onClickSave = (e: React.MouseEvent) => {
    if (this.props.onClickSave) {
      this.props.onClickSave(e);
      return;
    }
    this.props.dispatch(createSaveEffect(noop, noop));
  }

  private _onClickBinding = () => {
    const { isBinding } = this.props;
    this.props.dispatch(createSetKeyValueAction('isBinding', !isBinding, true));
  }

  private _onClickAutoBinding = () => {
    this.props.dispatch(createAutoBindingEffect());
  }

  private _renderImportExportButton = () => {
    const { currentPageId, location } = this.props;
    const { pathname } = location;
    if (!(
      pathname === '/todo/prototype'
      || pathname === '/todo/'
    )) {
      return null;
    }
    return (
      <>
      {' '}
      <ButtonGroup
        size="small"
      >
        <Button
          onClick={this._import}
          disabled={!currentPageId}
        >导入</Button>
        <Button
          onClick={this._export}
          disabled={!currentPageId}
        >导出</Button>
      </ButtonGroup>
      </>
    );
  }

  private _changeLanguage = async (lng: string) => {
    if (lng === this.props.locale) {
      message.info('当前语言，无需切换。');
      return;
    }
    const b = await confirm({
      content: '切换语言将会重新加载此页面，请确认数据是否保存。',
      okText: t(I18N_IDS.TEXT_OK),
      cancelText: t(I18N_IDS.TEXT_CANCEL),
    });
    if (!b) {
      return;
    }
    this.props.dispatch(createChangeLocaleEffect(lng));
    setTimeout(() => {
      window.location.reload();
    }, 50);
  }

  private _export = () => {
    this.props.dispatch(createExportJsonEffect());
  }

  private _import = () => {
    openImportLayoutsJsonModal();
  }
}
