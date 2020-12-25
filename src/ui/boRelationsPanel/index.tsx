import { Button, Icon, Table } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import React from 'react';
import { IBoRelation } from 'src/models/relationsModel';
import { openBoRelationEditDrawer } from 'src/utils/modal';
import './style.less';

interface IUiBoRelationsPanelProps {

}

interface IUiBoRelationsPanelState {
  columns: Array<ColumnProps<any>>;
  relations: IBoRelation[];
  selectedRelations: string[];
}

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
                onClick={() => this.editBoRelation(text)}
              >
                <Icon type="edit" />
              </a>
              {' '}
              <a
                title="删除"
                onClick={() => this.deleteBoRelation(text)}
              >
                <Icon type="delete" />
              </a>
            </>
          );
        },
      },
      { title: '属性名称', dataIndex: 'propertyName', width: '140px' },
      { title: '子对象名称', dataIndex: 'subBoName', width: '140px' },
      { title: '对象关系类型', dataIndex: 'subBoRelType' },
    ],
    relations: [
      {
        ipfCcmBoRelationId: '1',
        propertyName: 'aaa',
        subBoName: 'bbb',
        subBoRelType: 's',
      },
      {
        ipfCcmBoRelationId: '2',
        propertyName: 'aaa',
        subBoName: 'bbb',
        subBoRelType: 's',
      },
      {
        ipfCcmBoRelationId: '3',
        propertyName: 'aaa',
        subBoName: 'bbb',
        subBoRelType: 's',
      },
      {
        ipfCcmBoRelationId: '4',
        propertyName: 'aaa',
        subBoName: 'bbb',
        subBoRelType: 's',
      },
      {
        ipfCcmBoRelationId: '5',
        propertyName: 'aaa',
        subBoName: 'bbb',
        subBoRelType: 's',
      },
    ],
    selectedRelations: [],
  };

  render() {
    const { columns, relations, selectedRelations } = this.state;
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
          >批量删除</Button>
        </div>
        <div className="editor-ui-table editor-common-table">
          <Table
            dataSource={relations}
            columns={columns}
            size="small"
            rowKey="ipfCcmBoRelationId"
            rowSelection={rowSelection}
            scroll={{ x: 1500, y: 300 }}
            bordered
            pagination={false}
          />
        </div>
      </div>
    );
  }

  private onSelectionChange = (selectedRowKeys: string[]) => {
    this.setState({
      selectedRelations: selectedRowKeys,
    });
  }

  private addBoRelation = () => {
    openBoRelationEditDrawer();
  }

  private deleteBoRelations = () => {
    console.log('批量删除', this.state.selectedRelations);
  }

  private deleteBoRelation = (id: string) => {
    console.log('删除', id);
  }

  private editBoRelation = (id: string) => {
    openBoRelationEditDrawer();
  }

}
