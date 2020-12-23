import { Button, Table } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import React from 'react';
import './style.less';

interface IUiBoRelationsPanelProps {

}

interface IUiBoRelationsPanelState {
  columns: Array<ColumnProps<any>>;
}

export class UiBoRelationsPanel extends React.PureComponent<IUiBoRelationsPanelProps, IUiBoRelationsPanelState> {

  state: IUiBoRelationsPanelState = {
    columns: [

    ]
  };

  render() {
    const { columns } = this.state;
    return (
      <div className="editor-ui-bo-relations-panel">
        <div className="editor-ui-buttons">
          <Button
            size="small"
            type="primary"
          >新增</Button>
          <Button
            size="small"
            type="danger"
          >批量删除</Button>
        </div>
        <div className="editor-ui-table">
          <Table
            columns={}
          ></Table>
        </div>
      </div>
    );
  }
}
