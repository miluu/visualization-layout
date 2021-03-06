import * as React from 'react';
import * as _ from 'lodash';
import * as ReactDOM from 'react-dom';
import { connect } from 'dva';
import { Dispatch, AnyAction } from 'redux';
import {
  Switch,
  Collapse,
  Icon,
  Tabs,
  Spin,
  Modal,
  message,
  Button,
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
import { createLoadPageListEffect, createSelectPageEffect, createSetPageListAction } from 'src/models/pagesActions';
import { queryPageList, queryPage, convertToPrototype } from './service';
import { queryPageList as queryPrototypePageList, queryPage as queryPrototypePage } from '../Prototype/service';
import { IAppState } from 'src/models/appModel';
import { VISUALIZATION_CONFIG } from './config';
import { IIpfCcmPage, IBoPageLayout } from './types';
import {
  createLoadDictsEffect,
  createWatchSelectionRangeEffect,
  createSetIsOnlyShowMainAction,
  createSetIsLoadingAction,
  createSaveEffect,
  TemplateType,
  createSaveAsTemplateEffect,
  createLoadViewListEffect,
} from 'src/models/appActions';
import { formatInputData } from './formatInputData';
import { formatInputData as formatPrototypeInputData } from '../Prototype/formatInputData';
import { createReplaceLayoutsAction, createSetStateValueAction } from 'src/models/layoutsActions';
import { delay, sortPropertiesMap, sortMethodsMap, confirm } from 'src/utils';
import { UiCssStyle } from 'src/ui/cssStyle';
import { createSetLayoutAndElementPropertyFormOptionsAction, createSetActiveFormKeyAction } from 'src/models/formsActions';
import { IFormsState } from 'src/models/formsModel';
import { UiTransferModal } from 'src/ui/transferModal';
import { UiFormSettingsModal } from 'src/ui/formSettingsModal';
import {
  transferModalRef,
  formSettingsModalRef,
  uploaderRef,
  listSourceEditorModalRef,
  importLayoutsJsonModal,
  elementCodeFormModalRef,
  languageMsgFormModalRef,
  boRelationEditDrawerRef,
  checkSettingsModalRef,
  boBusinessTypeEditDrawerRef,
  pageListEditDrawerRef,
  boEditDraweRef,
  boPropertyEditDrawerRef,
  boMethodEditDrawerRef,
  closeCheckSettingsModal,
} from 'src/utils/modal';
import { UiPropertyMehodListTabs } from 'src/ui/draggableTree/propertyMethodListTabs';
import { UiUploader } from 'src/ui/uploaderModal';
import { UiListSourceEditorModal } from 'src/ui/listSourceEditor';
import { PROTOTYPE_CONFIG } from '../Prototype/config';
import { UiPageTree } from 'src/ui/pageTree';
import { UiSaveAsTemplateForm } from 'src/ui/saveAsTemplateForm';
import { UiPageTreeLayoutsBox } from 'src/ui/pageLayoutsTreeBox';
import { UiImportLayoutsJsonModal } from 'src/ui/importLayoutsJsonModal';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';
import { UiSaveAsPrototypeForm } from 'src/ui/saveAsPrototypeForm';
import { cellNameManager } from 'src/utils/cellName';
import { UiElementCodeFormModal } from 'src/ui/ElementCodeForm';
import { UiLanguageMsgFormModal } from 'src/ui/LanguageMsgForm';
import { createLoadBoTreeSourceEffect, createLoadBoChecksEffect } from 'src/models/relationsAction';
import { createLoadBoTreeSourceEffect as createLoadBoTreeSourceBusinessTypeEffect } from 'src/models/businessTypesAction';
import { UiBoTree } from 'src/ui/boTree';
import { UiBoRelationsPanel } from 'src/ui/boRelationsPanel';
import { UiBoPropertiesPanel } from 'src/ui/boPropertiesPanel';
import { UiBoMethodsPanel } from 'src/ui/boMethodsPanel';
import { UiBoRelationEditDrawer } from 'src/ui/boRelationEditDrawer';
import { UiBoPropertyEditDrawer } from 'src/ui/boPropertyEditDrawer';
import { UiBoMethodEditDrawer } from 'src/ui/boMethodEditDrawer';
import { BoEditDrawe } from 'src/ui/boEditDrawer';
import { UiCheckSettingsModal } from 'src/ui/checkSettingsModal';
import { UiBoChecksPanel } from 'src/ui/boChecksPanel';
import { UiBoBusinessTypesPanel } from 'src/ui/boBusinessTypesPanel';
import { UiBoBusinessTypeEditDrawer } from 'src/ui/boBusinessTypeEditDrawer';
import { UiPageListEditDrawer } from '../../ui/pageListEditDrawer';

const { Panel } = Collapse;
const { TabPane } = Tabs;
const UiPageList = createUiPageListComponent<IIpfCcmPage>(
  VISUALIZATION_CONFIG.pageIdKey,
  VISUALIZATION_CONFIG.pageDisplayFunc,
);

const indicator = <Icon type="loading" style={{ fontSize: 32 }} spin />;

interface IVisualizationProp extends ILayoutsState<any> {
  dispatch?: Dispatch<AnyAction>;

  urlParams?: any;
  pageList?: IIpfCcmPage[];
  currentPageId?: string;
  isLoading?: boolean;
  isOnlyShowMain?: boolean;
  activeFormKey?: string;
  isBinding?: boolean;
  hasSelectLayout?: boolean;
}

interface IVisualizationState {
  prototypePageList: any[];
  isShowPrototypePageListModal: boolean;
  prototypePageListExpandKeys: string[];
  saveAsTemplateType: TemplateType;
  saveAsPrototypeFormVisible?: boolean;
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
      isBinding: APP.isBinding,
      hasSelectLayout: !!LAYOUTS.selectedLayout,
    };
  },
)
export default class Visualization extends React.PureComponent<IVisualizationProp, IVisualizationState> {
  state: IVisualizationState = {
    prototypePageList: [],
    isShowPrototypePageListModal: false,
    prototypePageListExpandKeys: [],
    saveAsTemplateType: null,
  };

  constructor(props: any) {
    super(props);
    this._init();
  }

  render() {
    const { pageList, currentPageId, isLoading, isBinding, layouts, hasSelectLayout } = this.props;
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
          extendRender={this._renderOnlyShowMain}
          extendWidth={120}
          isOnlyShowMain={this.props.isOnlyShowMain}
          onClickSave={this._onClickSave}
        >
          {' '}
          <Button
            size="small"
            onClick={this._saveAsTemplate}
            disabled={!layouts.length}
          >{t(I18N_IDS.SAVE_AS_TEMPLATE)}</Button>
          {' '}
          <Button
            size="small"
            onClick={this._saveAsGroup}
            disabled={!(layouts.length && hasSelectLayout)}
          >{t(I18N_IDS.SAVE_AS_CONTROL_GROUP)}</Button>
          {' '}
          <Button
            size="small"
            onClick={this._saveAsPrototype}
            disabled={!layouts.length}
          >{t(I18N_IDS.SAVE_AS_PROTOTYPE)}</Button>
        </UiToolbar>

        <UiSidebar>
          <Collapse
            defaultActiveKey={['1', '2', '3', '4', '5']}
            bordered={false}
            expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
          >
            {
              isBinding
                ? (
                  <Panel
                    key="3"
                    header={`${t(I18N_IDS.PANEL_TITLE_BO_PROPERTIES)} / ${t(I18N_IDS.PANEL_TITLE_BO_METHODS)}`}
                  >
                    <UiPropertyMehodListTabs />
                  </Panel>
                )
                : (
                  <>
                    <Panel
                      key="5"
                      header="数据源"
                    >
                      <UiBoTree />
                    </Panel>

                    <Panel
                      key="4"
                      header={t(I18N_IDS.PANEL_TITLE_PAGE_LAYOUTS)}
                    >
                      <UiPageTreeLayoutsBox />
                    </Panel>

                    <Panel
                      key="1"
                      header={t(I18N_IDS.PANEL_TITLE_LAYOUTS)}
                    >
                      <UiDraggableList
                        source={VISUALIZATION_CONFIG.draggableItems_layout}
                      />
                    </Panel>
                    <Panel
                      key="2"
                      header={t(I18N_IDS.PANEL_TITLE_TOOLS)}
                    >
                      <UiDraggableListGroup
                        source={VISUALIZATION_CONFIG.draggableItems_tools}
                      />
                    </Panel>
                  </>
                )
            }
          </Collapse>
        </UiSidebar>

        <UiSidebar position="right" defaultWidth={250} >
          <Collapse
            defaultActiveKey={['1', '2', '3', '4', '5']}
            bordered={false}
            expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
          >
            <Panel
              key="1"
              header={t(I18N_IDS.PANEL_TITLE_PAGE_LIST)}
            >
              <UiPageList
                dispatch={this.props.dispatch}
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
            <Panel
              key="3"
              header="属性定义 / 方法定义"
            >
            <Tabs
                size="small"
                animated={{
                  tabPane: false,
                  inkBar: true,
                }}
              >
                <TabPane
                  tab="属性定义"
                  key="boProperty"
                  forceRender
                >
                  <UiBoPropertiesPanel />
                </TabPane>
                <TabPane
                  tab="方法定义"
                  key="boMethod"
                  forceRender
                >
                  <UiBoMethodsPanel />
                </TabPane>
              </Tabs>
            </Panel>
            <Panel
              key="4"
              header="子对象关系 / 业务类型"
            >
              <Tabs
                defaultActiveKey="1"
                size="small"
                animated={{
                  tabPane: false,
                  inkBar: true,
                }}
              >
                <TabPane
                  tab="子对象关系"
                  key="1"
                  forceRender
                >
                  <UiBoRelationsPanel />
                </TabPane>
                <TabPane
                  tab="业务类型"
                  key="2"
                  forceRender
                >
                  <UiBoBusinessTypesPanel />
                </TabPane>
              </Tabs>
            </Panel>
            <Panel
              key="5"
              header="校验"
            >
              <UiBoChecksPanel />
            </Panel>
          </Collapse>
        </UiSidebar>

        <>
          <UiTransferModal ref={transferModalRef} />
          <UiFormSettingsModal ref={formSettingsModalRef} />
          <UiUploader ref={uploaderRef} />
          <UiListSourceEditorModal ref={listSourceEditorModalRef} />
          <UiSaveAsTemplateForm
            templateType={this.state.saveAsTemplateType}
            onSubmit={this._onSaveAsTemplateSubmit}
            onCancle={this._onSaveAsTemplateCancle}
          />
          <UiImportLayoutsJsonModal ref={importLayoutsJsonModal} />
          <UiSaveAsPrototypeForm
            visible={this.state.saveAsPrototypeFormVisible}
            onSubmit={this._onSaveAsPrototypeSubmit}
            onCancle={this._onSaveAsPrototypeCancle}
          />
          <UiElementCodeFormModal ref={elementCodeFormModalRef} />
          <UiLanguageMsgFormModal ref={languageMsgFormModalRef} />
          <UiBoPropertyEditDrawer ref={boPropertyEditDrawerRef} />
          <UiBoMethodEditDrawer ref={boMethodEditDrawerRef} />
          <UiBoRelationEditDrawer ref={boRelationEditDrawerRef} />
          <UiCheckSettingsModal ref={checkSettingsModalRef} />
          <UiBoBusinessTypeEditDrawer ref={boBusinessTypeEditDrawerRef} />
          <UiPageListEditDrawer ref={pageListEditDrawerRef} />
          <BoEditDrawe ref={boEditDraweRef} />
        </>,

        {/* 原型列表 */}
        <Modal
          visible={this.state.isShowPrototypePageListModal}
          title={t(I18N_IDS.MESSAGE_SELECT_PROTOTYPE)}
          cancelText={t(I18N_IDS.TEXT_CANCEL)}
          onCancel={this._closePrototypePageListModal}
          onOk={this._closePrototypePageListModal}
          className="editor-pagetree-modal"
          okButtonProps={{
            style: {
              display: 'none',
            },
          }}
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

  private _renderOnlyShowMain = () => {
    return (
      <>
        <label style={{ color: '#fff' }} htmlFor="">{t(I18N_IDS.MAIN_BO_ONLY)}</label>{' '}
        <Switch size="small" checked={this.props.isOnlyShowMain} onChange={this._setIsOnlyShowMain} />
      </>
    );
  }

  private _init = () => {
    this.props.dispatch(createLoadDictsEffect([
      'CellType',
      'GroupWidget',
      'layoutElementType',
      'layoutElementType2',
      'PageType',
      'LayoutContainerType',
      'LayoutType',
      'MessageType',
      'NewGridType',
      'IpfCcmBoUIType',
      'EventType',
      'LayoutEventType',
      'LayoutExecType',
      'conditionType',
      'correctType',
      'initValueType',
      'queryType',
      'rangeType',
      'tabBuildType',
      'SearchOperation',
      'buttonStyle',
      'gridEditType',
      'groupTotType',
      'hotkeyType',
      'hotkeyValue',
      'isOrderBy',
      'MessageType',
      'DdLanguage',
      'AutoTestValueType',
      'YesOrNo',
      'ModelTableLayoutType',
      'DataTyp',
      'ObjectType',
      'PersistentSaveType',
      'SubBoRelType',
      'gridEditType',
      'tabBuildType',
      'CheckType',
      'DeviceType',
      'IpfCcmBoPropertyType',
      'IpfCcmBoMethodType',
      'IpfCcmBoType',
      'IpfCcmBoTableType',
      'GenerateOption',
      'IpfCcmBoPrintMethod',
      'IpfCcmBoPrintOption',
      'IpfCcmBoMehtodOperateType',
      'PageSize',
      'PageGroup',
      'gridAlign',
    ].join(',')));
    this.props.dispatch(createLoadViewListEffect());
    this.props.dispatch(createWatchSelectionRangeEffect());
    this.props.dispatch(createLoadBoTreeSourceEffect());
    this.props.dispatch(createLoadBoTreeSourceBusinessTypeEffect());
    if (!this.props.urlParams.isFromMenuOfPage) {
      this.props.dispatch(
        createLoadPageListEffect(queryPageList, [{
          ipfCcmBoId: this.props.urlParams['ipfCcmBoId'],
          baseViewId: this.props.urlParams['baseViewId'],
        }]),
      );
    }
    this.props.dispatch(createSetLayoutAndElementPropertyFormOptionsAction(
      VISUALIZATION_CONFIG.layoutPropertyFormOptions,
      VISUALIZATION_CONFIG.elementPropertyFormOptions,
      true,
    ));
    if (this.props.urlParams[VISUALIZATION_CONFIG.pageIdKey]) {
      this._selectPage({
        [VISUALIZATION_CONFIG.pageIdKey]: this.props.urlParams[VISUALIZATION_CONFIG.pageIdKey],
      } as any, true);
    }

    window['closeCheckSettingsModal'] = () => {
      closeCheckSettingsModal();
      this.props.dispatch(createLoadBoChecksEffect(true));
    };
  }

  private _selectPage = (p: IIpfCcmPage, forceQuery = false) => {
    console.log('[_selectPage]', p);
    this.props.dispatch(createSelectPageEffect(
      p.ipfCcmBoPageId,
      queryPage,
      [{
        ipfCcmBoId: this.props.urlParams['ipfCcmBoId'],
        ipfCcmBoPageId: p.ipfCcmBoPageId,
        isOnlyShowMain: this.props.isOnlyShowMain,
        baseViewId: this.props.urlParams['baseViewId'],
        isFromMenuOfPage: this.props.urlParams['isFromMenuOfPage'],
      }],
      this._initPageData,
      forceQuery,
    ));
  }

  private _initPageData = async (data: any) => {
    console.log('[_initPageData] data', data);
    const formatedData = formatInputData(data);
    console.log('[_initPageData] formatedData', formatedData);
    this.props.dispatch(createSetStateValueAction({
      originData: data,
    }, true));
    if (this.props.urlParams.isFromMenuOfPage) {
      this.props.dispatch(createSetPageListAction(data.boPageList, true));
    }
    this.props.dispatch(createReplaceLayoutsAction<IBoPageLayout>(formatedData.boPageLayout, 'INIT', true));
    this.props.dispatch(createSetStateValueAction(
      {
        properties: sortPropertiesMap(data.properties),
        methods: sortMethodsMap(data.method),
        defaultSetting: data.defaultSetting,
      },
      true,
    ));
    if (!formatedData.boPageLayout || !formatedData.boPageLayout.length) {
      await delay(0);
      const b = await confirm({
        content: t(I18N_IDS.MESSAGE_NO_LAYOUT),
      });
      if (b) {
        this._importPrototypePage();
        return;
      }
      this.props.dispatch(createReplaceLayoutsAction<IBoPageLayout>(VISUALIZATION_CONFIG.defaultInitLayouts, true, true));
    }
  }

  private _onFromTabsChange = (key: string) => {
    this.props.dispatch(createSetActiveFormKeyAction(key, true));
  }

  private _setIsOnlyShowMain = async (checked: boolean) => {
    this.props.dispatch(createSetIsOnlyShowMainAction(checked, true));
    await delay(0);
    if (this.props.currentPageId || this.props.currentPageId === '') {
      this._selectPage({
        [VISUALIZATION_CONFIG.pageIdKey]: this.props.currentPageId,
      } as any, true);
    }
  }

  private _importPrototypePage = async () => {
    let result: any;
    try {
      this.props.dispatch(createSetIsLoadingAction(true));
      result = await queryPrototypePageList({
        baseViewId: this.props.urlParams['baseViewId'],
      });
    } catch (e) {
      console.error('[_importPrototypePage]', e);
      Modal.error({
        content: '查询原型页面列表失败。',
      });
      return;
    } finally {
      this.props.dispatch(createSetIsLoadingAction(false));
    }
    console.log('[_importPrototypePage]', result);
    this._openPrototypePageListModal(result || []);
  }

  private _openPrototypePageListModal = (pageList: any) => {
    this.setState({
      isShowPrototypePageListModal: true,
      prototypePageList: pageList,
      prototypePageListExpandKeys: _.map(pageList, p => p[PROTOTYPE_CONFIG.pageIdKey]),
    });
  }

  private _closePrototypePageListModal = () => {
    this.setState({
      isShowPrototypePageListModal: false,
      prototypePageList: [],
      prototypePageListExpandKeys: [],
    });
    this.props.dispatch(createReplaceLayoutsAction<IBoPageLayout>(VISUALIZATION_CONFIG.defaultInitLayouts, true, true));
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
      l[VISUALIZATION_CONFIG.layoutIdKey] = l[PROTOTYPE_CONFIG.layoutIdKey];
      l[VISUALIZATION_CONFIG.elementIdKey] = l[PROTOTYPE_CONFIG.layoutElementIdKey];
      delete l.layoutOriginName;
      delete l.ipfCcmOriginPageId;
      delete l.ipfCcmOriginId;
      delete l.ipfCcmOriginPageLayoutId;
      delete l.ipfCcmOriginPgLoEleId;
      delete l[PROTOTYPE_CONFIG.layoutElementIdKey];
      _.forEach(l[VISUALIZATION_CONFIG.childrenElementsKey], e => {
        e[VISUALIZATION_CONFIG.elementIdKey] = e[PROTOTYPE_CONFIG.elementIdKey];
        e[VISUALIZATION_CONFIG.elementParentLayoutKey] = l[VISUALIZATION_CONFIG.cellNameKey];
        delete e.ipfCcmOrPgLoEleId;
        delete e.ipfCcmOriginPageLayoutId;
      });
    });
    console.log(boPageLayout);
    this._closePrototypePageListModal();
    this.props.dispatch(createReplaceLayoutsAction(boPageLayout, true, true));
    cellNameManager.init(boPageLayout, cellNameManager.configName);
  }

  private _onClickSave = () => {
    const {  dispatch } = this.props;
    dispatch(createSaveEffect(
      (data) => {
        message.success(data.msg || '保存成功！');
        this._selectPage({
          [VISUALIZATION_CONFIG.pageIdKey]: this.props.currentPageId,
        } as any, true);
      },
      (data) => {
        Modal.error({
          title: '保存失败',
          content: data && data.msg || '',
        });
      },
    ));
  }

  /**
   * 另存为模板
   */
  private _saveAsTemplate = () => {
    this.setState({
      saveAsTemplateType: 'TEMPLATE',
    });
  }

  /**
   * 另存为控件组合
   */
  private _saveAsGroup = () => {
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

  private _saveAsPrototype = () => {
    this.setState({
      saveAsPrototypeFormVisible: true,
    });
  }

  private _onSaveAsPrototypeSubmit = async (values: any) => {
    console.log(values);
    const { currentPageId, urlParams } = this.props;
    const params = {
      ipfCcmBoId: urlParams['ipfCcmBoId'],
      ipfCcmBoPageId: currentPageId,
      isOnlyShowMain: false,
      baseViewId: values.baseViewId,
      originPageName: values.pageName,
    };
    this.props.dispatch(createSetIsLoadingAction(true, true));
    try {
      const result = await convertToPrototype(params);
      message.success(result.msg || '保存成功');
      this._onSaveAsPrototypeCancle();
    } catch (e) {
      console.log(e);
      message.error(e.msg || '保存失败');
    }
    this.props.dispatch(createSetIsLoadingAction(false, true));
  }

  private _onSaveAsPrototypeCancle = () => {
    this.setState({
      saveAsPrototypeFormVisible: false,
    });
  }

}

// 模拟 angularJs 全局变量，避免引入平台弹窗页面报错
// window['angular'] = {
//   element() {
//     return {
//       scope() {
//         return {
//           $emit() {/*  */},
//         };
//       },
//     };
//   },
// };
// window['$'] = window['angular']['element'];
