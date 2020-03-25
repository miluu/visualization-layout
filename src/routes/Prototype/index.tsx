import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';
import { connect } from 'dva';
import { Dispatch, AnyAction } from 'redux';
import {
  Collapse,
  Icon,
  Spin,
  message,
  Modal,
  notification,
  Tabs,
  Button,
} from 'antd';

import { UiToolbar } from '../../ui/toolbar';

import { ILayoutsState } from 'src/models/layoutsModel';

import './DynamicComponents';
import UiSidebar from 'src/ui/sidebar';
import { UiDraggableList } from '../../ui/draggableList';
import { UiDraggableListGroup } from 'src/ui/draggableListGroup';
import { UiPropertyForm } from 'src/ui/propertyForm';
import { UiEditor } from 'src/ui/editor';
import { IPagesState } from 'src/models/pagesModel';
import { createLoadPageListEffect, createSelectPageEffect } from 'src/models/pagesActions';
import { queryPageList, queryPage, deletePage } from './service';
import { IAppState } from 'src/models/appModel';
import { PROTOTYPE_CONFIG } from './config';
import { IPrototypePage, IBoPageLayout } from './types';
import { createLoadDictsEffect, createWatchSelectionRangeEffect, createSaveEffect, createSetIsLoadingAction, createLoadViewListEffect, createSaveAsTemplateEffect } from 'src/models/appActions';
import { formatInputData } from './formatInputData';
import { createReplaceLayoutsAction, createSetStateValueAction } from 'src/models/layoutsActions';
import { delay, sortPropertiesMap, sortMethodsMap } from 'src/utils';
import { UiCssStyle } from 'src/ui/cssStyle';
import { createSetLayoutAndElementPropertyFormOptionsAction } from 'src/models/formsActions';
import { IFormsState } from 'src/models/formsModel';
import { UiTransferModal } from 'src/ui/transferModal';
import { UiFormSettingsModal } from 'src/ui/formSettingsModal';
import {
  transferModalRef,
  formSettingsModalRef,
  editableListModalRef,
  uploaderRef,
  listSourceEditorModalRef,
  treeEditorModalRef,
  jumpByGridSettingsModal,
  disabledExpreeModal,
  importLayoutsJsonModal,
} from 'src/utils/modal';
import { UiEditableListModal } from 'src/ui/editableListModal';
import { UiUploader } from 'src/ui/uploaderModal';
import { UiListSourceEditorModal } from 'src/ui/listSourceEditor';
import { UiPageTree } from 'src/ui/pageTree';
import { UiTreeEditorModal } from 'src/ui/treeEditorModal';
import { IValidResult } from 'src/utils/validation';
import { UiLink } from 'src/ui/link';
import { UiDataSourceTree } from 'src/ui/dataSourceTree';
import { createInitSourceEffect, createSetInitSourceAction, createSetSourceAction } from 'src/models/datasourceActions';
import { UiPageTreeLayoutsBox } from 'src/ui/pageLayoutsTreeBox';
import { UiJumpByGridSettingsModal } from 'src/ui/jumpByGridSettingsModal';
import { UiSessionModal } from 'src/ui/SessionModal';
import { UiDisabledExpreeModal } from 'src/ui/disabledExpreeModal';
import { UiImportLayoutsJsonModal } from 'src/ui/importLayoutsJsonModal';
import { UiSaveAsTemplateForm } from 'src/ui/saveAsTemplateForm';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

const { Panel } = Collapse;
const { TabPane } = Tabs;

const indicator = <Icon type="loading" style={{ fontSize: 32 }} spin />;

interface IPrototypePageProp extends ILayoutsState<any> {
  dispatch?: Dispatch<AnyAction>;

  urlParams?: any;
  pageList?: IPrototypePage[];
  currentPageId?: string;
  isLoading?: boolean;
  isOnlyShowMain?: boolean;
  activeFormKey?: string;
  hasSelectLayout?: boolean;
}

@connect(
  ({
    APP,
    PAGES,
    FORMS,
    LAYOUTS,
  }: {
    LAYOUTS: ILayoutsState<any>,
    PAGES: IPagesState<any>,
    APP: IAppState,
    FORMS: IFormsState,
  }) => {
    return {
      urlParams: APP.params,
      isLoading: APP.isLoading,
      pageList: PAGES.pageList,
      currentPageId: PAGES.currentPageId,
      isOnlyShowMain: APP.isOnlyShowMain,
      activeFormKey: FORMS.activeFormKey,
      layouts: LAYOUTS.layouts,
      hasSelectLayout: !!LAYOUTS.selectedLayout,
    };
  },
)
export default class PrototypePage extends React.PureComponent<IPrototypePageProp, any> {
  state:any = {};
  // transferModalRef = React.createRef<UiTransferModal>();

  constructor(props: any) {
    super(props);
    this._init();
  }

  render() {
    const { isLoading } = this.props;
    return (
      <div className="editor-root">

        <UiCssStyle />

        {
          ReactDOM.createPortal(
            <Spin indicator={indicator} className="editor-root-spin" spinning={isLoading} />,
            document.body,
          )
        }

        <UiEditor />

        <UiToolbar
          extendWidth={120}
          isOnlyShowMain={this.props.isOnlyShowMain}
          onClickSave={this._onClickSave}
        >
          {this._renderSaveAsButtons()}
        </UiToolbar>

        <UiSidebar>
          <Collapse
            defaultActiveKey={['1', '2', '3', '4']}
            bordered={false}
            expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
          >
            <Panel
              key="4"
              header={t(I18N_IDS.PANEL_TITLE_PAGE_LAYOUTS)}
            >
              <UiPageTreeLayoutsBox />
            </Panel>
            <Panel
              key="3"
              header={t(I18N_IDS.PANEL_TITLE_DATASOURCES)}
            >
              <UiDataSourceTree />
            </Panel>
            <Panel
              key="1"
              header={t(I18N_IDS.PANEL_TITLE_LAYOUTS)}
            >
              <UiDraggableList
                source={PROTOTYPE_CONFIG.draggableItems_layout}
              />
            </Panel>
            <Panel
              key="2"
              header={t(I18N_IDS.PANEL_TITLE_TOOLS)}
            >
              <UiDraggableListGroup
                source={PROTOTYPE_CONFIG.draggableItems_tools}
              />
            </Panel>
          </Collapse>
        </UiSidebar>

        <UiSidebar position="right" defaultWidth={250} >
          <Collapse
            defaultActiveKey={['1', '2', '3', '4']}
            bordered={false}
            expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
          >
            <Panel
              key="1"
              header={`${t(I18N_IDS.PANEL_TITLE_PAGE_LIST)} / ${t(I18N_IDS.PANEL_TITLE_PROPERTIES)}`}
            >
              <Tabs
                size="small"
                animated={{
                  tabPane: false,
                  inkBar: true,
                }}
              >
                <TabPane
                  tab={t(I18N_IDS.PANEL_TITLE_PAGE_LIST)}
                  key="pageList"
                  forceRender
                >
                  <UiPageTree
                    onSelectPage={(e, p) => this._selectPage(p, e.ctrlKey)}
                    onDeletePage={this._deletePage}
                  />
                </TabPane>
                <TabPane
                  tab={t(I18N_IDS.PANEL_TITLE_PROPERTIES)}
                  key="property"
                  forceRender
                >
                  <UiPropertyForm />
                </TabPane>
              </Tabs>

            </Panel>
          </Collapse>
        </UiSidebar>

        <>
          <UiTransferModal ref={transferModalRef} />
          <UiFormSettingsModal ref={formSettingsModalRef} />
          <UiUploader ref={uploaderRef} />
          <UiEditableListModal ref={editableListModalRef} />
          <UiListSourceEditorModal ref={listSourceEditorModalRef} />
          <UiTreeEditorModal ref={treeEditorModalRef} />
          <UiJumpByGridSettingsModal ref={jumpByGridSettingsModal} />
          <UiDisabledExpreeModal ref={disabledExpreeModal} />
          <UiSessionModal />
          <UiImportLayoutsJsonModal ref={importLayoutsJsonModal} />
          <UiSaveAsTemplateForm
            templateType={this.state.saveAsTemplateType}
            onSubmit={this._onSaveAsTemplateSubmit}
            onCancle={this._onSaveAsTemplateCancle}
          />
        </>,

      </div>
    );
  }

  private _renderSaveAsButtons = () => {
    const { layouts, hasSelectLayout } = this.props;
    return (
      <>
        {' '}
        <Button
          size="small"
          onClick={this._saveAsTemplate}
          disabled={!(layouts && layouts.length)}
        >{t(I18N_IDS.SAVE_AS_TEMPLATE)}</Button>
        {' '}
        <Button
          size="small"
          onClick={this._saveAsGroup}
          disabled={!(layouts && layouts.length && hasSelectLayout)}
        >{t(I18N_IDS.SAVE_AS_CONTROL_GROUP)}</Button>
      </>
    );
  }

  private _init = () => {
    // tslint:disable-next-line:max-line-length
    this.props.dispatch(createLoadDictsEffect('CellType,GroupWidget,layoutElementType,layoutElementType2,PageType,LayoutContainerType,LayoutType,MessageType,NewGridType,IpfCcmBoUIType,EventType,LayoutEventType,LayoutExecType,conditionType,correctType,initValueType,queryType,rangeType,tabBuildType,SearchOperation,buttonStyle,gridEditType,groupTotType,hotkeyType,hotkeyValue,isOrderBy,MessageType,DdLanguage,LayoutElementAttr,YesOrNo,ModelTableLayoutType'));
    this.props.dispatch(createLoadViewListEffect());
    this.props.dispatch(createWatchSelectionRangeEffect());
    this.props.dispatch(
      createLoadPageListEffect(queryPageList, [{
        baseViewId: this.props.urlParams['baseViewId'],
      }]),
    );
    this.props.dispatch(createSetLayoutAndElementPropertyFormOptionsAction(
      PROTOTYPE_CONFIG.layoutPropertyFormOptions,
      PROTOTYPE_CONFIG.elementPropertyFormOptions,
      true,
    ));
    if (this.props.urlParams[PROTOTYPE_CONFIG.pageIdKey]) {
      this._selectPage({
        [PROTOTYPE_CONFIG.pageIdKey]: this.props.urlParams[PROTOTYPE_CONFIG.pageIdKey],
      } as any, true);
    }
  }

  private _selectPage = (p: IPrototypePage, forceQuery = false) => {
    console.log('[_selectPage]', p);
    this.props.dispatch(createSelectPageEffect(
      p[PROTOTYPE_CONFIG.pageIdKey],
      queryPage,
      [{
        ipfCcmOriginPageId: p[PROTOTYPE_CONFIG.pageIdKey],
      }],
      this._initPageData,
      forceQuery,
    ));
  }

  private _deletePage = async (p: IPrototypePage) => {
    let result: any;
    this.props.dispatch(createSetIsLoadingAction());
    try {
      result = await deletePage(p);
    } catch (e) {
      console.warn('[_deletePage]', e);
      Modal.error({
        content: e.msg || '删除失败',
      });
      return;
      // message.error(e.msg || '删除失败');
    } finally {
      this.props.dispatch(createSetIsLoadingAction(false));
    }
    if (result.success) {
      // Modal.success({
      //   content: result.msg || '删除成功',
      // });
      message.success(result.msg || '删除成功');
      this.props.dispatch(
        createLoadPageListEffect(queryPageList, [{
          baseViewId: this.props.urlParams['baseViewId'],
        }]),
      );
      if (p.ipfCcmOriginPageId === this.props.currentPageId) {
        // 删除当前打开的页面清除数据
        const dataSource: any[] = [];
        this.props.dispatch(createReplaceLayoutsAction([], 'INIT', true));
        this.props.dispatch(createSetInitSourceAction(dataSource, true));
        this.props.dispatch(createSetSourceAction(dataSource, true));
      }
    } else {
      Modal.error({
        content: result.msg || '删除失败',
      });
      // message.error(result.msg || '删除失败');
    }
  }

  private _initPageData = async (data: any) => {
    console.log('[_initPageData] data', data);
    const formatedData = formatInputData(data);
    console.log('[_initPageData] formatedData', formatedData);
    this.props.dispatch(createReplaceLayoutsAction<IBoPageLayout>(formatedData.boPageLayout, 'INIT', true));
    this.props.dispatch(createSetInitSourceAction(data.originDataSources, true));
    if (!data.originDataSources || !data.originDataSources.length) {
      this.props.dispatch(createInitSourceEffect());
    } else {
      this.props.dispatch(createSetSourceAction(data.originDataSources, true));
    }
    if (!formatedData.boPageLayout || !formatedData.boPageLayout.length) {
      await delay(0);
      this.props.dispatch(createReplaceLayoutsAction<IBoPageLayout>(PROTOTYPE_CONFIG.defaultInitLayouts, true, true));
    }
    this.props.dispatch(createSetStateValueAction(
      {
        properties: sortPropertiesMap({}),
        methods: sortMethodsMap({}),
        defaultSetting: {},
      },
      true,
    ));
  }

  private _onClickSave = () => {
    const { /* currentPageId, */ dispatch } = this.props;
    dispatch(createSaveEffect((data) => {
      // Modal.success({
      //   title: '保存成功',
      //   content: data && data.msg || '',
      // });
      message.success(data && data.msg || '保存成功');
      this._selectPage({
        [PROTOTYPE_CONFIG.pageIdKey]: this.props.currentPageId,
      } as any, true);
    }, (data) => {
      const validResults: IValidResult[] = data && data.validResults;
      if (validResults) {
        notification.error({
          className: 'editor-error-notification',
          duration: 0,
          message: (function () {
            return (
              <>
                {
                  _.map(validResults, (r, i) => {
                    const { element, layout } = r;
                    let type: 'element' | 'layout';
                    if (element) {
                      type = 'element';
                    } else if (layout) {
                      type = 'layout';
                    }
                    const target = type === 'element'
                      ? element[PROTOTYPE_CONFIG.elementIdKey]
                      : (type === 'layout' ? layout[PROTOTYPE_CONFIG.cellNameKey] : null);
                    return (
                      <React.Fragment key={i}>
                        {
                          _.map(r.messages, (m, j) => {
                            return (
                              <React.Fragment key={j}>
                                {
                                  type
                                    ? (<UiLink
                                        dispatch={dispatch}
                                        type={type}
                                        target={target}
                                      >{m}</UiLink>)
                                    : m
                                }
                                <br />
                              </React.Fragment>
                            );
                          })
                        }
                      </React.Fragment>
                    );
                  })
                }
              </>
            );
          })(),
        });
        return;
      }
      Modal.error({
        title: '保存失败',
        content: data && data.msg || '',
      });
      // message.error(data && data.msg || '保存失败');
    }));
  }

  /**
   * 另存为模板
   */
  private _saveAsTemplate = (e: React.MouseEvent) => {
    this.setState({
      saveAsTemplateType: 'TEMPLATE',
    });
  }

  /**
   * 另存为控件组合
   */
  private _saveAsGroup = (e: React.MouseEvent) => {
    if (!this.props.hasSelectLayout) {
      Modal.warn({
        content: '请先选择一个布局容器',
      });
      return;
    }
    this.setState({
      saveAsTemplateType: 'GROUP',
    });
  }

  private _onSaveAsTemplateSubmit = (values: any) => {
    console.log('[_onSaveAsTemplateSubmit]', values);
    this.props.dispatch(createSaveAsTemplateEffect(
      this.state.saveAsTemplateType,
      values,
    ));
    this.setState({
      saveAsTemplateType: null,
    });
  }

  private _onSaveAsTemplateCancle = () => {
    this.setState({
      saveAsTemplateType: null,
    });
  }

}
