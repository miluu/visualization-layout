import { Button, Icon, Table } from 'antd';
import * as _ from 'lodash';
import { ColumnProps } from 'antd/lib/table';
import { connect } from 'dva';
import { Dispatch, AnyAction } from 'redux';
import React from 'react';
import { IBoBusinessType, IBusinessTypesState } from 'src/models/businessTypesModel';
import { openBoBusinessTypeEditDrawer } from 'src/utils/modal';
import './style.less';
import { createDeleteBusinessTypesEffect, createLoadBusinessTypesEffect } from 'src/models/businessTypesAction';
import { IAppState, IDictsMap } from 'src/models/appModel';
import { ROW_STATUS } from 'src/config';
import { createId } from 'src/utils';
import { getSelectBoTreeItem } from 'src/utils/boBusinessTypes';

interface IUiBoBusinessTypesPanelProps {
  dispatch?: Dispatch<AnyAction>;
  businessTypes?: IBoBusinessType[];
  ipfCcmBoId?: string;
  baseViewId?: string;
  dicts?: IDictsMap;
}

interface IUiBoBusinessTypesPanelState {
  columns: Array<ColumnProps<any>>;
  selectedBusinessTypes: string[];
}

@connect(
  ({
    BUSINESS_TYPES,
    APP,
  }: {
    BUSINESS_TYPES: IBusinessTypesState,
    APP: IAppState,
  }) => {
    let {
      ipfCcmBoId,
      baseViewId,
    } = APP.params;
    const { selectedBoTreeItem, businessTypes } = BUSINESS_TYPES;
    const selectedBoTreeItemObj = getSelectBoTreeItem(BUSINESS_TYPES);
    ipfCcmBoId = selectedBoTreeItem || ipfCcmBoId;
    if (selectedBoTreeItemObj) {
      baseViewId = selectedBoTreeItemObj.baseViewId || baseViewId;
    }
    return {
      businessTypes: businessTypes[selectedBoTreeItem || ipfCcmBoId] || [],
      ipfCcmBoId,
      baseViewId,
      dicts: APP.dicts,
    };
  },
)
export class UiBoBusinessTypesPanel extends React.PureComponent<IUiBoBusinessTypesPanelProps, IUiBoBusinessTypesPanelState> {

  state: IUiBoBusinessTypesPanelState = {
    columns: [
      { title: '操作',
        dataIndex: 'ipfCcmBoBusinessTypeId',
        width: '40px',
        fixed: 'left',
        render: (text: string, record: IBoBusinessType, index: number) => {
          return (
            <>
              <a
                title="编辑"
                onClick={() => this.editBoBusinessType(record)}
              >
                <Icon type="edit" />
              </a>
              {' '}
              <a
                title="删除"
                onClick={() => this.deleteBoBusinessType(record)}
              >
                <Icon type="delete" />
              </a>
            </>
          );
        },
      },
      { title: '业务类型', dataIndex: 'businessType', width: '110px' },
      { title: '描述', dataIndex: 'description' },
    ],
    selectedBusinessTypes: [],
  };

  render() {
    const { columns, selectedBusinessTypes } = this.state;
    const { businessTypes } = this.props;
    const rowSelection = {
      selectedRowKeys: selectedBusinessTypes,
      onChange: this.onSelectionChange,
      columnWidth: '40px',
    };
    return (
      <div className="editor-ui-bo-businessTypes-panel">
        <div className="editor-ui-buttons">
          <Button
            size="small"
            type="primary"
            onClick={this.addBoBusinessType}
          >新增</Button>
          {' '}
          <Button
            size="small"
            type="danger"
            onClick={this.deleteBoBusinessTypes}
            disabled={!(selectedBusinessTypes?.length)}
          >批量删除</Button>
        </div>
        <div className="editor-ui-table editor-common-table">
          <Table
            dataSource={businessTypes}
            columns={columns}
            size="small"
            rowKey="ipfCcmBoBusinessTypeId"
            rowSelection={rowSelection}
            scroll={{ x: 550, y: 300 }}
            bordered
            pagination={false}
          />
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.props.dispatch(createLoadBusinessTypesEffect());
  }

  UNSAFE_componentWillReceiveProps(nextProps: IUiBoBusinessTypesPanelProps) {
    const nextBusinessTypes = nextProps.businessTypes;
    const businessTypes = this.props.businessTypes;
    if (nextBusinessTypes !== businessTypes) {
      this.setState({
        selectedBusinessTypes: [],
      });
    }
  }

  private onSelectionChange = (selectedRowKeys: string[]) => {
    this.setState({
      selectedBusinessTypes: selectedRowKeys,
    });
  }

  private addBoBusinessType = () => {
    const { ipfCcmBoId, baseViewId } = this.props;
    const boBusinessType: IBoBusinessType = {
      rowStatus: ROW_STATUS.ADDED,
      ipfCcmBoBusinessTypeId: createId(),
      subBoOrderNo: 0,
      ipfCcmBoId,
      baseViewId,
    };
    console.log('[addBoBusinessType]', boBusinessType);
    openBoBusinessTypeEditDrawer({
      boBusinessType,
      type: 'add',
    });
  }

  private deleteBoBusinessTypes = () => {
    this.props.dispatch(createDeleteBusinessTypesEffect(this.state.selectedBusinessTypes));
  }

  private deleteBoBusinessType = (record: IBoBusinessType) => {
    this.props.dispatch(createDeleteBusinessTypesEffect([record.ipfCcmBoBusinessTypeId]));
  }

  private editBoBusinessType = (record: IBoBusinessType) => {
    openBoBusinessTypeEditDrawer({
      boBusinessType: record,
      type: 'edit',
    });
  }

}
