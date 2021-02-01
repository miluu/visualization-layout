import { Button, Icon, Table } from 'antd';
import * as _ from 'lodash';
import { ColumnProps } from 'antd/lib/table';
import { connect } from 'dva';
import { Dispatch, AnyAction } from 'redux';
import React from 'react';
import { IBoProperty, IPropertiesState } from 'src/models/propertiesModel';
import { openBoPropertyEditDrawer } from 'src/utils/modal';
import './style.less';
import { createDeletePropertiesEffect, createLoadPropertiesEffect } from 'src/models/propertiesAction';
import { IAppState, IDictsMap } from 'src/models/appModel';
import { ROW_STATUS } from 'src/config';
import { createId, getDictDisplay } from 'src/utils';
import { getSelectBoTreeItem } from 'src/utils/boRelations';

interface IUiBoPropertiesPanelProps {
  dispatch?: Dispatch<AnyAction>;
  properties?: IBoProperty[];
  ipfCcmBoId?: string;
  baseViewId?: string;
  dicts?: IDictsMap;
}

interface IUiBoPropertiesPanelState {
  columns: Array<ColumnProps<any>>;
  selectedProperties: string[];
}

@connect(
  ({
    PROPERTIES,
    APP,
  }: {
    PROPERTIES: IPropertiesState,
    APP: IAppState,
  }) => {
    let {
      ipfCcmBoId,
      baseViewId,
    } = APP.params;
    const { selectedBoTreeItem, properties } = PROPERTIES;
    const selectedBoTreeItemObj = getSelectBoTreeItem(PROPERTIES as any);
    ipfCcmBoId = selectedBoTreeItem || ipfCcmBoId;
    if (selectedBoTreeItemObj) {
      baseViewId = selectedBoTreeItemObj.baseViewId || baseViewId;
    }
    return {
      properties: properties[selectedBoTreeItem || ipfCcmBoId] || [],
      ipfCcmBoId,
      baseViewId,
      dicts: APP.dicts,
    };
  },
)
export class UiBoPropertiesPanel extends React.PureComponent<IUiBoPropertiesPanelProps, IUiBoPropertiesPanelState> {

  state: IUiBoPropertiesPanelState = {
    columns: [
      { title: '操作',
        dataIndex: 'ipfCcmBoPropertyId',
        width: '40px',
        fixed: 'left',
        render: (text: string, record: IBoProperty, index: number) => {
          return (
            <>
              <a
                title="编辑"
                onClick={() => this.editBoProperty(record)}
              >
                <Icon type="edit" />
              </a>
              {' '}
              <a
                title="删除"
                onClick={() => this.deleteBoProperty(record)}
              >
                <Icon type="delete" />
              </a>
            </>
          );
        },
      },
      {
        title: '属性名',
        dataIndex: 'propertyName',
        width: '180px',
        onFilter: (value, record) => record.propertyName.indexOf(value) === 0,
        sorter: (a, b) => a.propertyName.length - b.propertyName.length,
      },
      {
        title: '显示文本',
        dataIndex: 'fieldText',
        width: '180px',
        onFilter: (value, record) => record.fieldText.indexOf(value) === 0,
        sorter: (a, b) => a.fieldText.length - b.fieldText.length,
      },
      { title: '属性类型', dataIndex: 'propertyType', width: '180px', render: (text: string) => this.renderDictValue(text)('IpfCcmBoPropertyType') },
    ],
    selectedProperties: [],
  };

  render() {
    const { columns, selectedProperties } = this.state;
    const { properties } = this.props;
    const rowSelection = {
      selectedRowKeys: selectedProperties,
      onChange: this.onSelectionChange,
      columnWidth: '40px',
    };
    return (
      <div className="editor-ui-bo-relations-panel">
        <div className="editor-ui-buttons">
          <Button
            size="small"
            type="primary"
            onClick={this.addBoProperty}
          >新增</Button>
          {' '}
          <Button
            size="small"
            type="danger"
            onClick={this.deleteBoProperties}
            disabled={!(selectedProperties?.length)}
          >批量删除</Button>
        </div>
        <div className="editor-ui-table editor-common-table">
          <Table
            dataSource={properties}
            columns={columns}
            size="small"
            rowKey="ipfCcmBoPropertyId"
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
    this.props.dispatch(createLoadPropertiesEffect());
  }

  UNSAFE_componentWillReceiveProps(nextProps: IUiBoPropertiesPanelProps) {
    const nextProperties = nextProps.properties;
    const properties = this.props.properties;
    if (nextProperties !== properties) {
      this.setState({
        selectedProperties: [],
      });
    }
  }

  private renderDictValue = (text: string) => (dictName: string) => {
    const { dicts } = this.props;
    return getDictDisplay(text, dictName, dicts);
  }

  private onSelectionChange = (selectedRowKeys: string[]) => {
    this.setState({
      selectedProperties: selectedRowKeys,
    });
  }

  private addBoProperty = () => {
    const { ipfCcmBoId, baseViewId } = this.props;
    const boProperty: IBoProperty = {
      rowStatus: ROW_STATUS.ADDED,
      ipfCcmBoPropertyId: createId(),
      subBoOrderNo: 0,
      ipfCcmBoId,
      baseViewId,
    };
    console.log('[addBoProperty]', boProperty);
    openBoPropertyEditDrawer({
      boProperty,
      type: 'add',
    });
  }

  private deleteBoProperties = () => {
    this.props.dispatch(createDeletePropertiesEffect(this.state.selectedProperties));
  }

  private deleteBoProperty = (record: IBoProperty) => {
    this.props.dispatch(createDeletePropertiesEffect([record.ipfCcmBoPropertyId]));
  }

  private editBoProperty = (record: IBoProperty) => {
    openBoPropertyEditDrawer({
      boProperty: record,
      type: 'edit',
    });
  }

}
