import * as React from 'react';
import * as _ from 'lodash';
import { Modal, Alert, Row, Select, Col, Table, Icon, Input, Button, message, TreeSelect } from 'antd';

import './style.less';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import { ILayoutsState } from 'src/models/layoutsModel';
import { IDatasourceState, PID_KEY, ID_KEY } from 'src/models/datasourceModel';
import { findElementById } from 'src/utils';
import { ColumnProps } from 'antd/lib/table';
import uuid from 'uuid';
import classnames from 'classnames';
import produce from 'immer';
import { createDoUpdateSelectedElementFieldsEffect } from 'src/models/layoutsActions';
import { IPagesState } from 'src/models/pagesModel';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

const Option = Select.Option;

interface IColumn {
  id: string;
  fieldText: string;
}

interface ICondition {
  pageId?: string;
  case?: string;
  __key?: string;
}

export interface IUiJumpByGridSettingsModalState {
  visible?: boolean;
  errorMsg?: string;

  columnId?: string;
  columns?: IColumn[];

  conditions?: ICondition[];

}

export interface IUiJumpByGridSettingsModalProps {
  dispatch?: Dispatch<AnyAction>;
  layoutsState?: ILayoutsState<any>;
  datasourceState?: IDatasourceState;
  pagesState?: IPagesState<any>;
}

@connect(
  ({
    LAYOUTS,
    DATASOURCE,
    PAGES,
  }: {
    LAYOUTS: ILayoutsState<any>,
    DATASOURCE: IDatasourceState,
    PAGES: IPagesState<any>,
  }) => {
    return {
      layoutsState: LAYOUTS,
      datasourceState: DATASOURCE,
      pagesState: PAGES,
    };
  }, null, null, {
    withRef: true,
  },
)
export class UiJumpByGridSettingsModal extends React.PureComponent<IUiJumpByGridSettingsModalProps, IUiJumpByGridSettingsModalState> {
  state: IUiJumpByGridSettingsModalState = {
    visible: false,
  };

  tableColumns: Array<ColumnProps<ICondition>> = [
    {
      key: -1,
      dataIndex: 'index',
      title: '#',
      width: '8%',
      render: (text, record, index) => {
        return (
          <span>{index + 1}</span>
        );
      },
    }, {
      key: 0,
      dataIndex: 'key',
      title: '操作',
      width: '12%',
      render: (text, record, index) => {
        return (
          <a
            style={{ color: 'red' }}
            onClick={() => this._deleteCondition(record, index)}
          >
            <Icon type="delete" />
          </a>
        );
      },
    }, {
      key: 1,
      dataIndex: 'case',
      title: '值',
      width: '40%',
      render: (text, record, index) => {
        return (
          <Input size="small" value={text} onChange={(e) => this._onCaseChange(e, record, index)} />
        );
      },
    }, {
      key: 2,
      dataIndex: 'pageId',
      title: '跳转页面',
      width: '40%',
      render: (text, record, index) => this._renderPageSelect(text, record, index),
    },
  ];

  render() {
    const { visible } = this.state;
    return (
      <Modal
        title="跳转规则配置"
        okText={t(I18N_IDS.TEXT_OK)}
        cancelText={t(I18N_IDS.TEXT_CANCEL)}
        maskClosable={false}
        visible={visible}
        onCancel={this._onCancle}
        onOk={this._onOk}
        destroyOnClose
      >
        { this._renderModalBody() }
      </Modal>
    );
  }

  // shouldComponentUpdate(nextProps: IUiJumpByGridSettingsModalProps, nextState: IUiJumpByGridSettingsModalState) {
  //   const { visible } = this.state;
  //   const {
  //     visible: nextVisible,
  //   } = nextState;
  //   console.log('[UiJumpByGridSettingsModal#shouldComponentUpdate]', visible, '->', nextVisible);
  //   return nextVisible !== visible;
  // }

  open() {
    const {
      layoutsState,
      datasourceState,
    } = this.props;
    const { layouts, selectedElement, config } = layoutsState;
    const { source } = datasourceState;
    const element = findElementById(layouts, selectedElement, config.childrenElementsKey, config.elementIdKey);
    let errorMsg: string = null;
    const rootDatasource = _.find(source, item => !item[PID_KEY]);
    if (!element) {
      errorMsg = '请选择按钮进行配置.';
    } else if (!rootDatasource) {
      errorMsg = '请配置数据源.';
    }
    if (errorMsg) {
      this.setState({
        visible: true,
        errorMsg,
      });
      return;
    }
    const rootDatasourceId = rootDatasource[ID_KEY];
    const elementDatasourceId = element.dataSourceId || rootDatasourceId;
    const gridLayouts = _.filter(layouts, l => {
      return l.layoutElementType === 'GRID' && (l.dataSourceId || rootDatasourceId) === elementDatasourceId;
    });
    const gridCount = gridLayouts.length;
    if (!gridCount) {
      errorMsg = '当前数据源下没有配置表格, 无法进行跳转配置.';
    } else if (gridCount > 1) {
      errorMsg = '当前数据源存在多个表格, 无法进行跳转配置.';
    }
    if (errorMsg) {
      this.setState({
        visible: true,
        errorMsg,
      });
      return;
    }
    const columns: IColumn[] = _.map(gridLayouts[0][config.childrenElementsKey], e => {
      return {
        id: e[config.elementIdKey],
        fieldText: e.fieldText || e.columnName,
      };
    });
    let conditions: ICondition[] = [];
    let jumpByGridSettings: any = {};
    let columnId = '';
    try {
      jumpByGridSettings = JSON.parse(element.layoutElementAttr).jumpByGridSettings || {};
      conditions = jumpByGridSettings.conditions || [];
      columnId = jumpByGridSettings.columnId;
    } catch (e) {
      console.warn(e);
    }
    _.forEach(conditions, c => {
      if (!c.__key) {
        c.__key = uuid();
      }
    });
    this.setState({
      columns,
      visible: true,
      errorMsg,
      conditions,
      columnId,
    });
  }

  close() {
    this.setState({
      visible: false,
    });
  }

  private _onCancle = () => {
    this.close();
  }

  private _onOk = () => {
    const { conditions, columnId } = this.state;
    const {
      layoutsState,
      dispatch,
    } = this.props;
    if (!columnId) {
      message.error('请选择条件字段.', 4);
      return;
    }
    if (!(conditions && conditions.length)) {
      message.error('请配置跳转规则.', 4);
      return;
    }
    let index = _.findIndex(conditions, c => !c.case);
    if (index >= 0) {
      message.error(`#${index + 1} 值不能为空.`, 4);
      return;
    }
    index = _.findIndex(conditions, c => !c.pageId);
    if (index >= 0) {
      message.error(`#${index + 1} 跳转页面不能为空.`, 4);
      return;
    }

    const { layouts, selectedElement, config } = layoutsState;
    const element = findElementById(layouts, selectedElement, config.childrenElementsKey, config.elementIdKey);
    let layoutElementAttr: any = {};
    try {
      layoutElementAttr = JSON.parse(element.layoutElementAttr);
    } catch (e) {
      console.warn(e);
      layoutElementAttr = {};
    }
    layoutElementAttr.jumpByGridSettings = {
      columnId,
      conditions,
    };
    let layoutElementAttrStr = '';
    try {
      layoutElementAttrStr = JSON.stringify(layoutElementAttr, (k, v) => {
        if (k.indexOf('__') === 0) {
          return undefined;
        }
        return v;
      });
    } catch (e) {
      console.warn(e);
    }
    dispatch(createDoUpdateSelectedElementFieldsEffect({
      layoutElementAttr: layoutElementAttrStr,
    }));
    this.close();
  }

  private _renderModalBody = () => {
    const { visible, errorMsg } = this.state;
    if (!visible) {
      return null;
    }
    if (errorMsg) {
      return this._renderError();
    }
    return this._renderContent();
  }

  private _renderError = () => {
    return (
      <Alert
        message={this.state.errorMsg}
        type="error"
      />
    );
  }

  private _renderContent = () => {
    const { columns, conditions, columnId } = this.state;
    return (
      <div className={classnames('editor-ui-jump-by-grid-content', { 'editor-is-empty': !(conditions && conditions.length) })}>
        <Row>
          <Col span={8}>
            <label>选择条件字段:</label>
          </Col>
          <Col span={16}>
            <Select
              size="small"
              allowClear
              style={{ width: '100%' }}
              onChange={(value: string) => this.setState({ columnId: value })}
              value={columnId}
            >
              {_.map(columns, c => (
                <Option title={c.fieldText} key={c.id} value={c.id}>
                  {c.fieldText}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Row style={{ marginBottom: 8 }}>
          <Col span={24}>
            <Button size="small" onClick={this._addCondtion}>新增配置</Button>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Table
              columns={this.tableColumns}
              size="small"
              bordered
              dataSource={conditions}
              pagination={false}
              rowKey="__key"
              scroll={{ y: 167 }}
            />
          </Col>
        </Row>
      </div>
    );
  }

  private _renderPageSelect = (text: string, record: any, index: number) =>  {
    const {
      pageList,
    } = this.props.pagesState;
    const treeData = _.map(pageList, p => {
      return {
        id: p.ipfCcmOriginPageId,
        pid: p.ipfCcmOriginPagePid || '',
        title: p.originName,
        value: p.ipfCcmOriginPageId,
      };
    });
    return (
      <TreeSelect
        allowClear
        style={{ width: '100%' }}
        treeDefaultExpandAll
        size="small"
        value={text}
        onChange={value => this._onPageIdChange(value, record, index)}
        treeData={treeData}
        treeDataSimpleMode={{
          id: 'id',
          pId: 'pid',
          rootPId: '',
        }}
        dropdownClassName="editor-tree-select"
      />
    );

  }

  private _addCondtion = () => {
    const { conditions } = this.state;
    this.setState({
      conditions: [
        ...(conditions || []),
        {
          __key: uuid(),
        },
      ],
    });
  }

  private _deleteCondition = (record: any, index: number) => {
    console.log('[_deleteCondition]', record, index);
    const { conditions } = this.state;
    const newConditions = _.filter(conditions, (v, i) => {
      return i !== index;
    });
    this.setState({
      conditions: newConditions,
    });
  }

  private _onCaseChange = (e: React.ChangeEvent<HTMLInputElement>, record: ICondition, index: number) => {
    const value = e.target.value;
    const { conditions } = this.state;
    const newConditions = produce(conditions, draft => {
      draft[index].case = value;
    });
    this.setState({
      conditions: newConditions,
    });
  }

  private _onPageIdChange = (value: any, record: ICondition, index: number) => {
    const { conditions } = this.state;
    const newConditions = produce(conditions, draft => {
      draft[index].pageId = value;
    });
    this.setState({
      conditions: newConditions,
    });
  }

}
