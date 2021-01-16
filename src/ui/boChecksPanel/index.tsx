import { Button, Table } from 'antd';
import * as _ from 'lodash';
import { ColumnProps } from 'antd/lib/table';
import { connect } from 'dva';
import { Dispatch, AnyAction } from 'redux';
import React from 'react';
import { IBoCheck, IRelationsState } from 'src/models/relationsModel';
import { openCheckSettingsModal } from 'src/utils/modal';
import './style.less';
import { IAppState, IDictsMap } from 'src/models/appModel';
import { getDictDisplay } from 'src/utils';
import { getSelectBoTreeItem } from 'src/utils/boRelations';
import { createLoadBoChecksEffect } from 'src/models/relationsAction';

interface IUiBoChecksPanelProps {
  dispatch?: Dispatch<AnyAction>;
  boChecks?: IBoCheck[];
  ipfCcmBoId?: string;
  baseViewId?: string;
  dicts?: IDictsMap;
}

interface IUiBoChecksPanelState {
  columns: Array<ColumnProps<any>>;
  selectedBoChecks: string[];
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
    const { selectedBoTreeItem, boChecks } = RELATIONS;
    const selectedBoTreeItemObj = getSelectBoTreeItem(RELATIONS);
    ipfCcmBoId = selectedBoTreeItem || ipfCcmBoId;
    if (selectedBoTreeItemObj) {
      baseViewId = selectedBoTreeItemObj.baseViewId || baseViewId;
    }
    return {
      boChecks: boChecks[selectedBoTreeItem || ipfCcmBoId] || [],
      ipfCcmBoId,
      baseViewId,
      dicts: APP.dicts,
    };
  },
)
export class UiBoChecksPanel extends React.PureComponent<IUiBoChecksPanelProps, IUiBoChecksPanelState> {

  state: IUiBoChecksPanelState = {
    columns: [
      { title: '属性名称', dataIndex: 'propertyName', width: '120px' },
      { title: '校验名称', dataIndex: 'checkName', width: '200px' },
      { title: '校验类型', dataIndex: 'checkType', render: (text: string) => this.renderDictValue(text)('CheckType') },
    ],
    selectedBoChecks: [],
  };

  render() {
    const { columns, selectedBoChecks } = this.state;
    const { boChecks } = this.props;
    const rowSelection = {
      selectedRowKeys: selectedBoChecks,
      onChange: this.onSelectionChange,
      columnWidth: '40px',
    };
    return (
      <div className="editor-ui-bo-checks-panel">
        <div className="editor-ui-buttons">
          <Button
            size="small"
            type="primary"
            onClick={this.openCheckSettingsModal}
          >校验配置</Button>
        </div>
        <div className="editor-ui-table editor-common-table">
          <Table
            dataSource={boChecks}
            columns={columns}
            size="small"
            rowKey="ipfCcmBoCheckId"
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
    this.props.dispatch(createLoadBoChecksEffect());
  }

  UNSAFE_componentWillReceiveProps(nextProps: IUiBoChecksPanelProps) {
    const nextBoChecks = nextProps.boChecks;
    const boChecks = this.props.boChecks;
    if (nextBoChecks !== boChecks) {
      this.setState({
        selectedBoChecks: [],
      });
    }
  }

  private renderDictValue = (text: string) => (dictName: string) => {
    const { dicts } = this.props;
    return getDictDisplay(text, dictName, dicts);
  }

  private onSelectionChange = (selectedRowKeys: string[]) => {
    this.setState({
      selectedBoChecks: selectedRowKeys,
    });
  }

  private openCheckSettingsModal = () => {
    const { ipfCcmBoId, baseViewId } = this.props;
    openCheckSettingsModal({
      ipfCcmBoId,
      baseViewId,
    });
  }

}
