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
  message,
  Modal,
} from 'antd';

import { UiToolbar } from '../../ui/toolbar';

import { ILayoutsState } from 'src/models/layoutsModel';

import './DynamicComponents';
import UiSidebar from 'src/ui/sidebar';
import { UiDraggableList } from '../../ui/draggableList';
import { UiDraggableListGroup } from 'src/ui/draggableListGroup';
import { UiPropertyForm, UiPagePropertyForm } from 'src/ui/propertyForm';
import { UiEventForm } from 'src/ui/eventForm';
import { UiEditor } from 'src/ui/editor';
import { IPagesState } from 'src/models/pagesModel';
import { IAppState } from 'src/models/appModel';
import { TEMPLATE_CONFIG } from './config';
import { IIpfCcmPage } from './types';
import { createLoadDictsEffect, createWatchSelectionRangeEffect, createSaveEffect, createLoadTemplateRelationsEffect } from 'src/models/appActions';
import { UiCssStyle } from 'src/ui/cssStyle';
import { createSetLayoutAndElementPropertyFormOptionsAction, createSetActiveFormKeyAction } from 'src/models/formsActions';
import { IFormsState } from 'src/models/formsModel';
import { UiTransferModal } from 'src/ui/transferModal';
import { UiFormSettingsModal } from 'src/ui/formSettingsModal';
import { transferModalRef, formSettingsModalRef, uploaderRef, listSourceEditorModalRef } from 'src/utils/modal';
import { UiUploader } from 'src/ui/uploaderModal';
import { UiListSourceEditorModal } from 'src/ui/listSourceEditor';
import { queryPage } from './service';
import { createSelectPageEffect, createSetPageListAction } from 'src/models/pagesActions';
import { createSetStateValueAction, createReplaceLayoutsAction } from 'src/models/layoutsActions';
import { delay } from 'src/utils';
import { formatInputData } from './formatInputData';
import { UiPageTreeLayoutsBox } from 'src/ui/pageLayoutsTreeBox';

const { Panel } = Collapse;
const { TabPane } = Tabs;

const indicator = <Icon type="loading" style={{ fontSize: 32 }} spin />;

interface ITemplateProp extends ILayoutsState<any> {
  dispatch?: Dispatch<AnyAction>;

  urlParams?: any;
  pageList?: IIpfCcmPage[];
  currentPageId?: string;
  isLoading?: boolean;
  activeFormKey?: string;
}

interface ITemplateState {
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
      activeFormKey: FORMS.activeFormKey,
      layouts: LAYOUTS.layouts,
      properties: LAYOUTS.properties,
    };
  },
)
export default class Template extends React.PureComponent<ITemplateProp, ITemplateState> {
  state: ITemplateState = {
    prototypePageList: [],
    isShowPrototypePageListModal: false,
    prototypePageListExpandKeys: [],
  };

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
          onClickSave={this._onClickSave}
        />

        <UiSidebar>
          <Collapse
            defaultActiveKey={['1', '2', '3', '4']}
            bordered={false}
            expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
          >
            <Panel
              key="4"
              header="页面布局"
            >
              <UiPageTreeLayoutsBox />
            </Panel>
            <Panel
              key="1"
              header="布局"
            >
              <UiDraggableList
                source={TEMPLATE_CONFIG.draggableItems_layout}
              />
            </Panel>
            <Panel
              key="2"
              header="工具箱"
            >
              <UiDraggableListGroup
                source={TEMPLATE_CONFIG.draggableItems_tools}
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
              header="页面属性"
            >
              <UiPagePropertyForm />
            </Panel>
            <Panel
              key="2"
              header="属性 / 事件"
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
                  tab="属性"
                  key="property"
                  forceRender
                >
                  <UiPropertyForm />
                </TabPane>
                <TabPane
                  tab="事件"
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
          {/* <UiCodeEditorModal /> */}
        </>,
      </div>
    );
  }

  private _init = () => {
    // tslint:disable-next-line:max-line-length
    this.props.dispatch(createLoadDictsEffect('CellType,GroupWidget,layoutElementType,layoutElementType2,PageType,LayoutContainerType,LayoutType,MessageType,NewGridType,IpfCcmBoUIType,EventType,LayoutEventType,LayoutExecType,conditionType,correctType,initValueType,queryType,rangeType,tabBuildType,SearchOperation,buttonStyle,gridEditType,groupTotType,hotkeyType,hotkeyValue,isOrderBy,MessageType,DdLanguage,AutoTestValueType,YesOrNo'));
    this.props.dispatch(createWatchSelectionRangeEffect());
    this.props.dispatch(createSetLayoutAndElementPropertyFormOptionsAction(
      TEMPLATE_CONFIG.layoutPropertyFormOptions,
      TEMPLATE_CONFIG.elementPropertyFormOptions,
      true,
    ));
    // 加载数据
    this._queryPage();
    this._queryRelations();
  }

  private _queryRelations = () => {
    const { urlParams, dispatch } = this.props;
    dispatch(createLoadTemplateRelationsEffect({
      IpfCcmRelationTreeParams: '',
      isSync: 'N',
      baseViewId: urlParams['baseViewId'],
      searchColumns: {
        propertyName: 'ipfCcmPageLayoutTableId',
        columnName: 'IPF_CCM_PAGE_LAYOUT_TABLE_ID',
        dataType: 'S',
        value: urlParams['ipfCcmPageLayoutTableId'],
        operation: 'EQ',
      },
      // ipfCcmPageLayoutTableId: urlParams['ipfCcmPageLayoutTableId'],
    }));
  }

  private _queryPage = (force = false) => {
    console.log('[_queryPage]');
    const { dispatch, urlParams } = this.props;
    const {
      IpfCcmPageId: ipfCcmPageId,
      baseViewId,
      ipfCcmPageLayoutTableId,
      ipfCcmBoId,
      isOnlyShowMain,
      ipfFciCustomProjectId,
      ipfFciSystemId,
    } = urlParams;
    dispatch(createSelectPageEffect(
      ipfCcmPageId,
      queryPage,
      [{
        ipfCcmPageId,
        baseViewId,
        ipfCcmPageLayoutTableId,
        ipfCcmBoId: ipfCcmBoId || 'undefined',
        isOnlyShowMain: isOnlyShowMain || true,
        ipfFciCustomProjectId: ipfFciCustomProjectId || 'undefined',
        ipfFciSystemId: ipfFciSystemId || 'undefined',
      }],
      this._initPageData,
      force,
    ));
  }

  private _initPageData = async (data: any) => {
    console.log('[_initPageData] data', data);
    this.props.dispatch(createSetStateValueAction({
      originData: data,
    }, true));
    this.props.dispatch(createSetPageListAction([data.ipfCcmPage], true));
    const layouts = formatInputData(data);
    this.props.dispatch(createReplaceLayoutsAction(layouts, 'INIT', true));
    if (!layouts || !layouts.length) {
      await delay(0);
      this.props.dispatch(createReplaceLayoutsAction(TEMPLATE_CONFIG.defaultInitLayouts, true, true));
    }
  }

  private _onFromTabsChange = (key: string) => {
    this.props.dispatch(createSetActiveFormKeyAction(key, true));
  }

  private _onClickSave = () => {
    const {  dispatch } = this.props;
    dispatch(createSaveEffect(
      (data) => {
        message.success(data.msg || '保存成功！');
        this._queryPage(true);
      },
      (data) => {
        Modal.error({
          title: '保存失败',
          content: data && data.msg || data || '',
        });
      },
    ));
  }

}
