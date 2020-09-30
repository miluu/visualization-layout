import * as React from 'react';
import * as _ from 'lodash';
import * as ReactDOM from 'react-dom';
import { connect } from 'dva';
import { Dispatch, AnyAction } from 'redux';
import {
  Collapse,
  Icon,
  Tabs,
  Spin,
  Modal,
  notification,
} from 'antd';

import { UiToolbar } from '../../ui/toolbar';
import { createUiPageListComponent } from '../../ui/pageList';

import { ILayoutsState } from 'src/models/layoutsModel';

import './DynamicComponents';
import UiSidebar from 'src/ui/sidebar';
import { UiDraggableList } from '../../ui/draggableList';
import { UiDraggableListGroup } from 'src/ui/draggableListGroup';
import { UiPropertyForm } from 'src/ui/propertyForm';
import { UiEventForm } from 'src/ui/eventForm';
import { UiEditor } from 'src/ui/editor';
import { IPagesState } from 'src/models/pagesModel';
import { createSetPageListAction, createSelectCachePageEffect } from 'src/models/pagesActions';
import { queryPage as queryPrototypePage } from '../Prototype/service';
import { IAppState, IDictItem } from 'src/models/appModel';
import { DATASOURCE_BINDING_CONFIG } from './config';
import { IIpfCcmPage } from './types';
import { createLoadDictsEffect, createWatchSelectionRangeEffect, createSetIsLoadingAction } from 'src/models/appActions';
import { formatInputData as formatPrototypeInputData } from '../Prototype/formatInputData';
import { createReplaceLayoutsAction, createSetStateValueAction, createGetBoListEffect } from 'src/models/layoutsActions';
import { UiCssStyle } from 'src/ui/cssStyle';
import { createSetLayoutAndElementPropertyFormOptionsAction, createSetActiveFormKeyAction } from 'src/models/formsActions';
import { IFormsState } from 'src/models/formsModel';
import { UiTransferModal } from 'src/ui/transferModal';
import { UiFormSettingsModal } from 'src/ui/formSettingsModal';
import { transferModalRef, formSettingsModalRef, uploaderRef, listSourceEditorModalRef } from 'src/utils/modal';
import { UiPropertyMehodListTabs } from 'src/ui/draggableTree/propertyMethodListTabs';
import { UiUploader } from 'src/ui/uploaderModal';
import { UiListSourceEditorModal } from 'src/ui/listSourceEditor';
import { PROTOTYPE_CONFIG } from '../Prototype/config';
import { UiPageTree } from 'src/ui/pageTree';
import { delay, sortPropertiesMap, sortMethodsMap, checkFormElementName, checkIsSum, checkIsReadOnlyAndDisabledExpree, checkUiType } from 'src/utils';
import { validDataSourceBindingLayouts } from 'src/utils/validation';
import { UiLink } from 'src/ui/link';
import { UiPageTreeLayoutsBox } from 'src/ui/pageLayoutsTreeBox';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

const { Panel } = Collapse;
const { TabPane } = Tabs;
const UiPageList = createUiPageListComponent<IIpfCcmPage>(
  DATASOURCE_BINDING_CONFIG.pageIdKey,
  DATASOURCE_BINDING_CONFIG.pageDisplayFunc,
);

const indicator = <Icon type="loading" style={{ fontSize: 32 }} spin />;

interface IDatasourceBindingProp extends ILayoutsState<any> {
  dispatch?: Dispatch<AnyAction>;

  urlParams?: any;
  pageList?: IIpfCcmPage[];
  currentPageId?: string;
  isLoading?: boolean;
  isOnlyShowMain?: boolean;
  activeFormKey?: string;
  isBinding?: boolean;
}

interface IDatasourceBindingState {
  prototypePageList: any[];
  isShowPrototypePageListModal: boolean;
  prototypePageListExpandKeys: string[];
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
      properties: LAYOUTS.properties,
      config: LAYOUTS.config,
      isBinding: APP.isBinding,
      cacheLayouts: LAYOUTS.cacheLayouts,
    };
  },
)
export default class DatasourceBinding extends React.PureComponent<IDatasourceBindingProp, IDatasourceBindingState> {
  state: IDatasourceBindingState = {
    prototypePageList: [],
    isShowPrototypePageListModal: false,
    prototypePageListExpandKeys: [],
  };

  constructor(props: any) {
    super(props);
    this._createVirtualScope();
    this._init();
  }

  render() {
    const { pageList, currentPageId, isLoading, isBinding } = this.props;
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

        <UiToolbar />

        <UiSidebar>
          <Collapse
            defaultActiveKey={['1', '2', '3', '4']}
            bordered={false}
            expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
          >
            {
              isBinding
                ? (
                  <Panel
                    key="3"
                    header={`${t(I18N_IDS.PANEL_TITLE_PROPERTIES)} / ${t(I18N_IDS.PANEL_TITLE_BO_METHODS)}`}
                  >
                    <UiPropertyMehodListTabs />
                  </Panel>
                )
                : (
                  <>
                    <Panel
                      key="4"
                      header={t(I18N_IDS.PANEL_TITLE_PAGE_LAYOUT_TYPES)}
                    >
                      <UiPageTreeLayoutsBox />
                    </Panel>
                    <Panel
                      key="1"
                      header={t(I18N_IDS.PANEL_TITLE_LAYOUTS)}
                    >
                      <UiDraggableList
                        source={DATASOURCE_BINDING_CONFIG.draggableItems_layout}
                      />
                    </Panel>
                    <Panel
                      key="2"
                      header={t(I18N_IDS.PANEL_TITLE_TOOLS)}
                    >
                      <UiDraggableListGroup
                        source={DATASOURCE_BINDING_CONFIG.draggableItems_tools}
                      />
                    </Panel>
                  </>
                )
            }
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
              header={t(I18N_IDS.PANEL_TITLE_PAGE_LIST)}
            >
              <UiPageList
                list={pageList}
                currentPageId={currentPageId}
                dblClickPage={this._selectPage}
              />
            </Panel>
            <Panel
              key="2"
              header={`${t(I18N_IDS.PANEL_TITLE_PROPERTIES)} / ${t(I18N_IDS.PANEL_TITLE_EVENTS)}`}
            >
              <Tabs
                activeKey={this.props.activeFormKey}
                onChange={this._onFromTabsChange}
                size="small"
                animated={{
                  tabPane: false,
                  inkBar: true,
                }}
              >
                <TabPane
                  tab={t(I18N_IDS.PANEL_TITLE_PROPERTIES)}
                  key="property"
                  forceRender
                >
                  <UiPropertyForm />
                </TabPane>
                <TabPane
                  tab={t(I18N_IDS.PANEL_TITLE_EVENTS)}
                  key="event"
                  forceRender
                >
                  <UiEventForm />
                </TabPane>
              </Tabs>
            </Panel>
          </Collapse>
        </UiSidebar>

        <>
          <UiTransferModal ref={transferModalRef} />
          <UiFormSettingsModal ref={formSettingsModalRef} />
          <UiUploader ref={uploaderRef} />
          <UiListSourceEditorModal ref={listSourceEditorModalRef} />
        </>,

        {/* 原型列表 */}
        <Modal
          visible={this.state.isShowPrototypePageListModal}
          title={t(I18N_IDS.MESSAGE_SELECT_PROTOTYPE)}
          onCancel={this._closePrototypePageListModal}
          onOk={this._closePrototypePageListModal}
          className="editor-pagetree-modal"
        >
          <UiPageTree
            pageList={this.state.prototypePageList}
            onSelectPage={(e, p) => this._loadPrototypePage(p)}
            expandedPageIds={this.state.prototypePageListExpandKeys}
            onExpand={keys => this.setState({
              prototypePageListExpandKeys: keys,
            })}
          />
        </Modal>

      </div>
    );
  }

  /** 虚拟一个 scope, 上层 step 控件调用 */
  private _createVirtualScope = () => {
    window['__virtualScope'] = {
      checkDatasource: this._checkDatasource,
      getBoList: this._getBoList,
      validLayouts: this._validLayouts,
      refreshPropertiesAndMethods: this._refreshPropertiesAndMethods,
      refreshPageLayouts: this._init,
    };
    window['jQuery'] = window['$'] = function () {
      return {
        scope: () => window['__virtualScope'],
      };
    };
    window['angular'] = {
      element: window['$'],
    };
  }

  private _validLayouts = () => {
    const { config, layouts, dispatch } = this.props;
    const validResults = validDataSourceBindingLayouts(layouts, config, { property: true, method: false });
    console.log('_validLayouts', validResults);
    if (!validResults.length) {
      return true;
    }

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

    return false;
  }

  private _getBoList = async () => {
    return new Promise((resolve) => {
      this.props.dispatch(createGetBoListEffect((data) => {
        resolve(data);
      }));
    });
  }

  private _checkDatasource = () => {
    const { layouts, properties, config, pageList, cacheLayouts, currentPageId } = this.props;

    const ret = {
      valid: true,
      msg: '',
      tipType: '',
    };

    const checkFormElementNameResult = checkFormElementName(layouts);
    if (!checkFormElementNameResult.valid) {
      ret.valid = false,
      ret.msg = checkFormElementNameResult.msgs.join('\r\n');
      return ret;
    }

    const checkIsSumResult = checkIsSum(layouts, properties, config.childrenElementsKey);
    if (!checkIsSumResult.valid) {
      ret.valid = false,
      ret.msg = checkIsSumResult.msgs.join('\r\n');
      return ret;
    }

    const checkIsReadOnlyAndDisabledExpreeResult = checkIsReadOnlyAndDisabledExpree(layouts, config.childrenElementsKey);
    if (!checkIsReadOnlyAndDisabledExpreeResult.valid) {
      ret.valid = false,
      ret.msg = checkIsReadOnlyAndDisabledExpreeResult.msgs.join('\r\n');
      return ret;
    }

    _.forEach(pageList, p => {
      const pageLayouts = getPageLayouts(p);
      const checkUiTypeResult = checkUiType(pageLayouts, properties, config.childrenElementsKey);
      if (!checkUiTypeResult.valid) {
        ret.valid = false,
        ret.msg = _.map(checkUiTypeResult.msgs, m => {
          return `${DATASOURCE_BINDING_CONFIG.pageDisplayFunc(p)}： ${m}`;
        }).join('\r\n');
      }
      return ret.valid;
    });

    return ret;

    function getPageLayouts(page: IIpfCcmPage) {
      const id = page.ipfCcmPageId;
      if (id === currentPageId) {
        return layouts;
      }
      const originLayouts = page && page['ipfCcmBoPageLayouts'] || [];
      const willUseLayouts = cacheLayouts[id] || originLayouts;
      return willUseLayouts;
    }
  }

  private _init = async () => {
    this.props.dispatch(createWatchSelectionRangeEffect());

    const data: any[] = this._getData();
    // const properties: any = {};
    // const methods: any = {};
    const extDict: IDictItem[] = _.map(data, bo => {
      return {
        key: bo.boName,
        value: bo.boName,
      };
    });
    this.props.dispatch(createLoadDictsEffect(
      // tslint:disable-next-line:max-line-length
      'CellType,GroupWidget,layoutElementType,layoutElementType2,PageType,LayoutContainerType,LayoutType,MessageType,NewGridType,IpfCcmBoUIType,EventType,LayoutEventType,LayoutExecType,conditionType,correctType,initValueType,queryType,rangeType,tabBuildType,SearchOperation,buttonStyle,gridEditType,groupTotType,hotkeyType,hotkeyValue,isOrderBy,MessageType,DdLanguage,YesOrNo',
      {
        BoName: extDict,
      },
    ));
    // _.forEach(data, bo => {
    //   properties[bo.boName] = bo.ipfCcmBoProperties;
    //   methods[bo.boName] = bo.ipfCcmBoMethods;
    // });
    const {
      properties,
      methods,
    } = this._getPropertiesAndMethods(data);
    this.props.dispatch(createSetStateValueAction({
      originData: data,
      properties,
      methods,
    }, true));
    const mainBo = _.find(data, bo => bo.isMainObject);
    const pageList = mainBo && mainBo.ipfCcmBoPages || [];
    this.props.dispatch(createSetPageListAction(pageList, true));

    await delay(0);
    this._selectPage(pageList[0]);

    this.props.dispatch(createSetLayoutAndElementPropertyFormOptionsAction(
      DATASOURCE_BINDING_CONFIG.layoutPropertyFormOptions,
      DATASOURCE_BINDING_CONFIG.elementPropertyFormOptions,
      true,
    ));
  }

  /**
   * 从上层数据获取格式化属性和方法列表
   * @param data
   */
  private _getPropertiesAndMethods(data: any) {
    console.log('[_getPropertiesAndMethods]');
    const properties: any = {};
    const methods: any = {};
    _.forEach(data, bo => {
      properties[bo.boName] = bo.ipfCcmBoProperties;
      methods[bo.boName] = bo.ipfCcmBoMethods;
    });
    const result = {
      properties: sortPropertiesMap(properties),
      methods: sortMethodsMap(methods),
    };
    return result;
  }

  /** 刷新属性和方法列表 */
  private _refreshPropertiesAndMethods = () => {
    const data = this._getData();
    const result = this._getPropertiesAndMethods(data);
    this.props.dispatch(createSetStateValueAction(result, true));
  }

  private _selectPage = async (p: IIpfCcmPage) => {
    console.log('[_selectPage]', p);
    this.props.dispatch(createSelectCachePageEffect(p[DATASOURCE_BINDING_CONFIG.pageIdKey]));
  }

  // private _initPageData = async (data: any) => {
  //   console.log('[_initPageData] data', data);
  //   const formatedData = formatInputData(data);
  //   console.log('[_initPageData] formatedData', formatedData);
  //   this.props.dispatch(createSetStateValueAction({
  //     originData: data,
  //   }, true));
  //   this.props.dispatch(createReplaceLayoutsAction<IBoPageLayout>(formatedData.boPageLayout, 'INIT', true));
  //   this.props.dispatch(createSetStateValueAction(
  //     {
  //       properties: sortPropertiesMap(data.properties),
  //       methods: sortMethodsMap(data.method),
  //       defaultSetting: data.defaultSetting,
  //     },
  //     true,
  //   ));
  //   if (!formatedData.boPageLayout || !formatedData.boPageLayout.length) {
  //     await delay(0);
  //     const b = await confirm({
  //       content: '当前页面无布局数据，是否导入原型界面布局?',
  //     });
  //     if (b) {
  //       this._importPrototypePage();
  //       return;
  //     }
  //     this.props.dispatch(createReplaceLayoutsAction<IBoPageLayout>(DATASOURCE_BINDING_CONFIG.defaultInitLayouts, true, true));
  //   }
  // }

  private _onFromTabsChange = (key: string) => {
    this.props.dispatch(createSetActiveFormKeyAction(key, true));
  }

  private _closePrototypePageListModal = () => {
    this.setState({
      isShowPrototypePageListModal: false,
      prototypePageList: [],
      prototypePageListExpandKeys: [],
    });
  }

  private _loadPrototypePage = async (page: any) => {
    let result: any;
    try {
      this.props.dispatch(createSetIsLoadingAction(true));
      result = await queryPrototypePage({
        [PROTOTYPE_CONFIG.pageIdKey]: page[PROTOTYPE_CONFIG.pageIdKey],
      });
    } catch (e) {
      console.error('[_loadPrototypePage]', e);
      Modal.error({
        content: '获取原型页面布局失败。',
      });
      return;
    } finally {
      this.props.dispatch(createSetIsLoadingAction(false));
    }
    console.log('[_loadPrototypePage]', result);
    if (!result.success) {
      Modal.error({
        content: result.msg || '获取原型页面布局失败。',
      });
      return;
    }
    const formatedData = formatPrototypeInputData(result);
    const {
      boPageLayout,
    } = formatedData;
    _.forEach(boPageLayout, l => {
      l[DATASOURCE_BINDING_CONFIG.layoutIdKey] = l[PROTOTYPE_CONFIG.layoutIdKey];
      delete l.layoutOriginName;
      delete l.ipfCcmOriginPageId;
      delete l.ipfCcmOriginId;
      delete l.ipfCcmOriginPageLayoutId;
      delete l.ipfCcmOriginPgLoEleId;
      _.forEach(l[DATASOURCE_BINDING_CONFIG.childrenElementsKey], e => {
        e[DATASOURCE_BINDING_CONFIG.elementIdKey] = e[PROTOTYPE_CONFIG.elementIdKey];
        e[DATASOURCE_BINDING_CONFIG.elementParentLayoutKey] = l[DATASOURCE_BINDING_CONFIG.cellNameKey];
        delete e.ipfCcmOrPgLoEleId;
        delete e.ipfCcmOriginPageLayoutId;
      });
    });
    console.log(boPageLayout);
    this._closePrototypePageListModal();
    this.props.dispatch(createReplaceLayoutsAction(boPageLayout, true, true));
  }

  private _getData = (): any[] => {
    const parentScope = window.parent['$']('body').scope();
    if (parentScope) {
      let originData = parentScope.fiveFourIpfCcmBoData;
      try {
        originData = JSON.parse(JSON.stringify(originData));
      } catch (e) {
        console.warn('[_getData]', e);
        return [];
      }
      return originData || [];
    }
    return [];
  }
}
