import * as React from 'react';
import * as _ from 'lodash';
import { Button, Table, Input, message } from 'antd';

import { UiSettingsModal } from '../settingsModal';
import { noop, createId, delay } from 'src/utils';

import './style.less';
import produce from 'immer';
import { ColumnProps } from 'antd/lib/table';
import { UiColumnList } from '../columnList';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

export interface IListSource {
  title: string[];
  source: string[][];
}

export type ListSourceEditorHandler = (editorInstance?: UiListSourceEditorModal) => any;

export interface IUiListSourceEditorModalState {
  visible?: boolean;
  sourceTitle?: string[];
  source?: string[][];
  sourceObj?: any[];
  columns?: Array<ColumnProps<any>>;
  columnsEditable?: boolean;
  isEditingColumn?: boolean;
  editingRowId?: string;
  onSubmit?: ListSourceEditorHandler;
  selectedRows?: string[];
  columnRender?: (options: {
    field?: string;
    text?: string;
    record?: any;
    index?: number;
    instance?: UiListSourceEditorModal;
    onChange?: (index: number, field: string, value: any) => any;
  }) => any;
}

const initState: IUiListSourceEditorModalState = {
  visible: false,
  sourceTitle: [],
  source: [],
  editingRowId: null,
  onSubmit: noop,
  sourceObj: [],
  columns: [],
  isEditingColumn: false,
  columnsEditable: true,
  selectedRows: [],
  columnRender: null,
};

export class UiListSourceEditorModal extends React.Component<any, IUiListSourceEditorModalState> {
  state = initState;
  listRef = React.createRef<UiColumnList>();
  tableWrapRef = React.createRef<HTMLDivElement>();

  render() {
    const { visible, sourceObj, columns, isEditingColumn, columnsEditable, selectedRows } = this.state;
    return (
      <UiSettingsModal
        visible={visible}
        onCancel={() => this.setState({ visible: false })}
        wrapClassName="editor-list-source-editor-modal"
        onOk={this._onSubmit}
        afterClose={this._afterClose}
      >
        <div className="editor-list-source-editor-content">
          {
            columnsEditable && isEditingColumn
              ? (
                <>
                  <div className="editor-list-source-editor-fields">
                    <UiColumnList
                      list={columns}
                      keyProp="__id"
                      displayFunc={item => item.title}
                      editable
                      editProp="title"
                      ref={this.listRef}
                    />
                    <div className="editor-list-source-editor-fields-buttons">
                      <Button
                        type="default"
                        size="small"
                        onClick={this._addField}
                      ><span style={{ width: '4em' }}>{t(I18N_IDS.TEXT_ADD_FIELD)}</span></Button>
                      <Button
                        type="primary"
                        size="small"
                        onClick={this._submitFields}
                      ><span style={{ width: '4em' }}>{t(I18N_IDS.TEXT_OK)}</span></Button>
                    </div>
                  </div>
                </>
              )
              : null
          }
          <div className="editor-list-source-editor-table-wrap">
            <div className="editor-list-source-editor-toolbar">
              {
                columnsEditable
                  ? <><Button size="small" onClick={this._toggleEditColumns} >{isEditingColumn ? t(I18N_IDS.TEXT_EDIT_FIELD_CANCLE) : t(I18N_IDS.TEXT_EDIT_FIELD)}</Button>{' '}</>
                  : null
              }
              <Button size="small" onClick={this._addRow} >{t(I18N_IDS.TEXT_ADD_DATA)}</Button>
              {' '}
              <Button size="small" onClick={this._copyRows} >{t(I18N_IDS.TEXT_COPY_DATA)}</Button>
              {' '}
              <Button size="small" onClick={this._removeRows} >{t(I18N_IDS.DELETE)}</Button>
            </div>
            <div className="editor-list-source-editor-table" ref={this.tableWrapRef} >
              <Table
                bordered
                pagination={false}
                size="small"
                scroll={{
                  x: 150 * columns.length + 50,
                  y: 500,
                }}
                rowKey="__id"
                onRow={(record) => {
                  return {
                    onClick: (e: React.MouseEvent) => {
                      this._startEdit(record.__id);
                    },
                  };
                }}
                columns={columns}
                dataSource={sourceObj}
                rowSelection={{
                  selectedRowKeys: selectedRows,
                  onChange: keys => this.setState({ selectedRows: keys as string[] }),
                  columnWidth: 50,
                }}
              />
            </div>
          </div>
        </div>
      </UiSettingsModal>
    );
  }

  do(callback: ListSourceEditorHandler) {
    callback(this);
    console.log(this._columnRender);
  }

  open(options?: IUiListSourceEditorModalState) {
    const state: any = _.assign({}, initState, options, {
      visible: true,
    });
    const { source, sourceTitle } = state;
    const columns = this._initColumns(sourceTitle);
    const sourceObj = _.map(source, (record, i) => {
      const obj = _.zipObject(sourceTitle, record);
      obj.__id = createId();
      return obj;
    });
    state.sourceObj = sourceObj;
    state.columns = columns;
    this.setState(state);
  }

  close() {
    this.setState({
      visible: false,
    });
  }

  getListSourceObj(): IListSource {
    const { sourceObj, columns } = this.state;
    const sourceTitle = _.map(columns, c => (c.title || '') as string);
    const source = _.map(sourceObj, record => _.map(sourceTitle, title => record[title]));
    return {
      source,
      title: sourceTitle,
    };
  }

  getListSourceJson(): string {
    const obj = this.getListSourceObj();
    try {
      return JSON.stringify(obj, (key, value) => {
        if (_.startsWith(key, '__')) {
          return undefined;
        }
        return value || '';
      });
    } catch (e) {
      console.warn('[getListSourceJson] error:', e);
      return '';
    }
  }

  private _addField = () => {
    const id = createId();
    const title = '新增字段';
    this.listRef.current.addItems([{
      __id: id,
      width: 150,
      title,
      key: id,
    }]);
  }

  private _submitFields = () => {
    let columns = this.listRef.current.state.sortedList;
    const count = columns.length;
    if (_.uniqBy(columns, c => c.title).length !== count) {
      message.warn('字段名称不能重复。');
      return;
    }
    columns = _.map(columns, (column, i) => {
      return produce(column, draft => {
        draft.render = (text: any, record: any, index: number) => this._columnRender(column.title, text, record, index);
        draft.width = i < count - 1 ? 150 : undefined;
      });
    });
    this.setState({
      columns,
      isEditingColumn: false,
    });
  }

  private _toggleEditColumns = () => {
    this.setState({
      isEditingColumn: !this.state.isEditingColumn,
    });
  }

  private _initColumns(sourceTitle: string[]): Array<ColumnProps<any>> {
    const count = sourceTitle.length;
    return _.map(sourceTitle, (title, i) => {
      const id = createId();
      return {
        __id: id,
        width: i < count - 1 ? 150 : undefined,
        title,
        key: id,
        render: (text: any, record: any, index: number) => this._columnRender(title, text, record, index),
      };
    });
  }

  private _addRow = () => {
    const { sourceObj } = this.state;
    const id = createId();
    const newSourceObj = sourceObj.concat({
      __id: id,
    });
    this.setState({
      sourceObj: newSourceObj,
    });
    this._startEdit(id);
  }

  private _removeRows = () => {
    const { sourceObj, selectedRows } = this.state;
    const newSourceObj = _.filter(sourceObj, record => !_.includes(selectedRows, record.__id));
    this.setState({
      sourceObj: newSourceObj,
      selectedRows: [],
    });
  }

  private _copyRows = () => {
    const { sourceObj, selectedRows } = this.state;
    if (!selectedRows.length) {
      message.warn('请先勾选一条或多条数据再进行复制。');
      return;
    }
    const copiedItems = _.chain(sourceObj)
      .filter((record: any) => _.includes(selectedRows, record.__id))
      .map(record => {
        return _.assign({}, record, {
          __id: createId(),
        });
      })
      .value();
    const newSourceObj = sourceObj.concat(copiedItems);
    this.setState({
      sourceObj: newSourceObj,
    });
    const id = _.get(copiedItems, '0.__id');
    if (id) {
      this._startEdit(id);
    }
  }

  private _columnRender = (field: string, text: string, record: any, index: number) => {
    const { editingRowId, columnRender } = this.state;
    let result: React.ReactNode;
    if (columnRender) {
      result = columnRender({
        field,
        text,
        record,
        index,
        instance: this,
        onChange: this._onChange,
      });
    }
    return (
      <div className="editor-list-source-editor-cell" title={text}>
        {(() => {
          if (result) {
            return result;
          }
          if (record.__id !== editingRowId) {
            return record[field];
          }
          return (
            <Input size="small" value={record[field]} onChange={e => this._onChange(index, field, e.target.value)} />
          );
        })()}
      </div>
    );
  }

  private _onChange = (index: number, field: string, value: any) => {
    const { sourceObj } = this.state;
    const newSourceObj = produce(sourceObj, draft => {
      sourceObj[index][field] = value;
    });
    this.setState({
      sourceObj: newSourceObj,
    });
  }

  private _startEdit(rowId: string) {
    if (rowId === this.state.editingRowId) {
      return;
    }
    this.setState({
      editingRowId: rowId,
    });
    this._delayFocus();
  }

  private _delayFocus = async () => {
    await delay();
    this._focus();
  }

  private _focus = () => {
    const tableWrap = this.tableWrapRef.current;
    if (!tableWrap) {
      return;
    }
    const input: HTMLInputElement = tableWrap
      .querySelector('.ant-input');
    if (input) {
      input.select();
      input.focus();
    }
  }

  // private _finishEdit(apply = true) {
  //   this.setState({
  //     editingRow: null,
  //     editingValue: null,
  //   });
  // }

  private _afterClose = () => {
    this.setState(initState);
  }

  private _onSubmit = () => {
    this.state.onSubmit(
      this,
    );
    this.close();
  }

}
