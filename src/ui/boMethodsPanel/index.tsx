import { Button, Icon, Table } from 'antd';
import * as _ from 'lodash';
import { ColumnProps } from 'antd/lib/table';
import { connect } from 'dva';
import { Dispatch, AnyAction } from 'redux';
import React from 'react';
import { IBoMethod } from 'src/models/methodsModel';
import { openBoMethodEditDrawer } from 'src/utils/modal';
import './style.less';
import { createDeleteMethodsEffect, createLoadMethodsEffect } from 'src/models/methodsAction';
import { IAppState, IDictsMap } from 'src/models/appModel';
import { ROW_STATUS } from 'src/config';
import { createId, getDictDisplay } from 'src/utils';

interface IUiBoMethodsPanelProps {
  dispatch?: Dispatch<AnyAction>;
  methods?: IBoMethod[];
  ipfCcmBoId?: string;
  baseViewId?: string;
  dicts?: IDictsMap;
}

interface IUiBoMethodsPanelState {
  columns: Array<ColumnProps<any>>;
  selectedMethods: string[];
}

@connect(
  ({
    // METHODS,
    APP,
  }: {
    // METHODS: IMethodsState,
    APP: IAppState,
  }) => {
    const {
      ipfCcmBoId,
      baseViewId,
    } = APP.params;
    // const { methods } = METHODS;
    return {
      // methods: methods[baseViewId || ipfCcmBoId] || [],
      ipfCcmBoId,
      baseViewId,
      dicts: APP.dicts,
    };
  },
)
export class UiBoMethodsPanel extends React.PureComponent<IUiBoMethodsPanelProps, IUiBoMethodsPanelState> {

  state: IUiBoMethodsPanelState = {
    columns: [
      { title: '操作',
        dataIndex: 'ipfCcmBoMethodId',
        width: '40px',
        fixed: 'left',
        render: (text: string, record: IBoMethod, index: number) => {
          return (
            <>
              <a
                title="编辑"
                onClick={() => this.editBoMethod(record)}
              >
                <Icon type="edit" />
              </a>
              {' '}
              <a
                title="删除"
                onClick={() => this.deleteBoMethod(record)}
              >
                <Icon type="delete" />
              </a>
            </>
          );
        },
      },
      { title: '属性名称', dataIndex: 'propertyName', width: '180px' },
      { title: '子对象名称', dataIndex: 'subBoName', width: '180px' },
      { title: '对象关系类型', dataIndex: 'subBoRelType', render: (text: string) => this.renderDictValue(text)('SubBoRelType') },
    ],
    selectedMethods: [],
  };

  render() {
    const { columns, selectedMethods } = this.state;
    const { methods } = this.props;
    const rowSelection = {
      selectedRowKeys: selectedMethods,
      onChange: this.onSelectionChange,
      columnWidth: '40px',
    };
    return (
      <div className="editor-ui-bo-methods-panel">
        <div className="editor-ui-buttons">
          <Button
            size="small"
            type="primary"
            onClick={this.addBoMethod}
          >新增</Button>
          {' '}
          <Button
            size="small"
            type="danger"
            onClick={this.deleteBoMethods}
            disabled={!(selectedMethods?.length)}
          >批量删除</Button>
        </div>
        <div className="editor-ui-table editor-common-table">
          <Table
            dataSource={methods}
            columns={columns}
            size="small"
            rowKey="ipfCcmBoMethodId"
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
    this.props.dispatch(createLoadMethodsEffect());
  }

  UNSAFE_componentWillReceiveProps(nextProps: IUiBoMethodsPanelProps) {
    const nextMethods = nextProps.methods;
    const methods = this.props.methods;
    if (nextMethods !== methods) {
      this.setState({
        selectedMethods: [],
      });
    }
  }

  private renderDictValue = (text: string) => (dictName: string) => {
    const { dicts } = this.props;
    return getDictDisplay(text, dictName, dicts);
  }

  private onSelectionChange = (selectedRowKeys: string[]) => {
    this.setState({
      selectedMethods: selectedRowKeys,
    });
  }

  private addBoMethod = () => {
    const { ipfCcmBoId, baseViewId } = this.props;
    const boMethod: IBoMethod = {
      rowStatus: ROW_STATUS.ADDED,
      ipfCcmBoMethodId: createId(),
      subBoOrderNo: 0,
      ipfCcmBoId,
      baseViewId,
    };
    console.log('[addBoMethod]', boMethod);
    openBoMethodEditDrawer({
      boMethod,
      type: 'add',
    });
  }

  private deleteBoMethods = () => {
    this.props.dispatch(createDeleteMethodsEffect(this.state.selectedMethods));
  }

  private deleteBoMethod = (record: IBoMethod) => {
    this.props.dispatch(createDeleteMethodsEffect([record.ipfCcmBoMethodId]));
  }

  private editBoMethod = (record: IBoMethod) => {
    openBoMethodEditDrawer({
      boMethod: record,
      type: 'edit',
    });
  }

}
