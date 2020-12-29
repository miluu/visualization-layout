import { Button, Icon, Table } from 'antd';
import * as _ from 'lodash';
import { ColumnProps } from 'antd/lib/table';
import { connect } from 'dva';
import { Dispatch, AnyAction } from 'redux';
import React from 'react';
import { IBoRelation, IRelationsState } from 'src/models/relationsModel';
import { openBoRelationEditDrawer } from 'src/utils/modal';
import './style.less';
import { createDeleteRelationsEffect, createLoadRelationsEffect } from 'src/models/relationsAction';
import { IAppState } from 'src/models/appModel';
import { ROW_STATUS } from 'src/config';
import { createId } from 'src/utils';
import { getSelectBoTreeItem } from 'src/utils/boRelations';

interface IUiBoRelationsPanelProps {
  dispatch?: Dispatch<AnyAction>;
  relations?: IBoRelation[];
  ipfCcmBoId?: string;
  baseViewId?: string;
}

interface IUiBoRelationsPanelState {
  columns: Array<ColumnProps<any>>;
  selectedRelations: string[];
}

@connect(
  ({
    RELATIONS,
    APP,
  }: {
    RELATIONS: IRelationsState,
    APP: IAppState,
  }) => {
    let {
      ipfCcmBoId,
      baseViewId,
    } = APP.params;
    const { selectedBoTreeItem, relations } = RELATIONS;
    const selectedBoTreeItemObj = getSelectBoTreeItem(RELATIONS);
    ipfCcmBoId = selectedBoTreeItem || ipfCcmBoId;
    if (selectedBoTreeItemObj) {
      baseViewId = selectedBoTreeItemObj.baseViewId || baseViewId;
    }
    return {
      relations: relations[selectedBoTreeItem || ipfCcmBoId] || [],
      ipfCcmBoId,
      baseViewId,
    };
  },
)
export class UiBoRelationsPanel extends React.PureComponent<IUiBoRelationsPanelProps, IUiBoRelationsPanelState> {

  state: IUiBoRelationsPanelState = {
    columns: [
      { title: '操作',
        dataIndex: 'ipfCcmBoRelationId',
        width: '40px',
        fixed: 'left',
        render: (text: string, record: IBoRelation, index: number) => {
          return (
            <>
              <a
                title="编辑"
                onClick={() => this.editBoRelation(record)}
              >
                <Icon type="edit" />
              </a>
              {' '}
              <a
                title="删除"
                onClick={() => this.deleteBoRelation(record)}
              >
                <Icon type="delete" />
              </a>
            </>
          );
        },
      },
      { title: '属性名称', dataIndex: 'propertyName', width: '180px' },
      { title: '子对象名称', dataIndex: 'subBoName', width: '180px' },
      { title: '对象关系类型', dataIndex: 'subBoRelType' },
    ],
    selectedRelations: [],
  };

  render() {
    const { columns, selectedRelations } = this.state;
    const { relations } = this.props;
    const rowSelection = {
      selectedRowKeys: selectedRelations,
      onChange: this.onSelectionChange,
      columnWidth: '40px',
    };
    return (
      <div className="editor-ui-bo-relations-panel">
        <div className="editor-ui-buttons">
          <Button
            size="small"
            type="primary"
            onClick={this.addBoRelation}
          >新增</Button>
          {' '}
          <Button
            size="small"
            type="danger"
            onClick={this.deleteBoRelations}
            disabled={!(selectedRelations?.length)}
          >批量删除</Button>
        </div>
        <div className="editor-ui-table editor-common-table">
          <Table
            dataSource={relations}
            columns={columns}
            size="small"
            rowKey="ipfCcmBoRelationId"
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
    this.props.dispatch(createLoadRelationsEffect());
  }

  UNSAFE_componentWillReceiveProps(nextProps: IUiBoRelationsPanelProps) {
    const nextRelations = nextProps.relations;
    const relations = this.props.relations;
    if (nextRelations !== relations) {
      this.setState({
        selectedRelations: [],
      });
    }
  }

  private onSelectionChange = (selectedRowKeys: string[]) => {
    this.setState({
      selectedRelations: selectedRowKeys,
    });
  }

  private addBoRelation = () => {
    const { ipfCcmBoId, baseViewId } = this.props;
    const boRelation: IBoRelation = {
      rowStatus: ROW_STATUS.ADDED,
      ipfCcmBoRelationId: createId(),
      subBoOrderNo: 0,
      ipfCcmBoId,
      baseViewId,
    };
    console.log('[addBoRelation]', boRelation);
    openBoRelationEditDrawer({
      boRelation,
      type: 'add',
    });
  }

  private deleteBoRelations = () => {
    this.props.dispatch(createDeleteRelationsEffect(this.state.selectedRelations));
  }

  private deleteBoRelation = (record: IBoRelation) => {
    this.props.dispatch(createDeleteRelationsEffect([record.ipfCcmBoRelationId]));
  }

  private editBoRelation = (record: IBoRelation) => {
    openBoRelationEditDrawer({
      boRelation: record,
      type: 'edit',
    });
  }

}
