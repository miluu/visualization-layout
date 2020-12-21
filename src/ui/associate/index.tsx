import * as React from 'react';
import { Select, Icon } from 'antd';
import * as _ from 'lodash';

import { delay, getDictDisplay } from '../../utils';
import { DROPDOWN_ALIGN_PROPS } from 'src/config';
import './style.less';
import { connect } from 'dva';
import { IAppState, IDictsMap } from 'src/models/appModel';

const { Option, OptGroup } = Select;

export interface IQueryOptions {
  keywords: string;
  pageSize: number;
  currentPage: number;
  isExactQuery?: boolean;
}

export interface IQueryResult {
  source: any[];
  total?: number;
}

export interface IAssociateColumn {
  field: string;
  title: string;
  width?: number;
  format?: (value: any) => string;
  dictName?: string;
}

export interface IUiAssociateProps {
  queryMethod: (options: IQueryOptions) => Promise<IQueryResult>;
  columns: IAssociateColumn[];
  value?: any;
  valueProp: string;
  labelProp: string;
  labelInit?: string;
  disabled?: boolean;
  onChange?: (value: any, option: any) => any;
  dicts?: IDictsMap;
}

export interface IUiAssociateState {
  source: any[];
  originSource: any[];
  pageSize: number;
  currentPage: number;
  total: number;
  keywords: string;
  prevSearchKeywords: string;
  isLoading: boolean;
  open: boolean;
}

@connect(
  ({ APP }: {
    APP: IAppState,
  }) => ({
    dicts: APP.dicts,
  }), null, null, {
    withRef: true,
  },
)
export class UiAssociate extends React.PureComponent<IUiAssociateProps, IUiAssociateState> {

  private _debounceHandleSearch: (keywords: string) => void;

  constructor(props: IUiAssociateProps) {
    super(props);

    this.state = {
      source: [],
      originSource: [],
      pageSize: 10,
      currentPage: 1,
      total: null,
      keywords: null,
      prevSearchKeywords: null,
      isLoading: false,
      open: false,
    };

    this._debounceHandleSearch = _.debounce((keywords: string = '') => {
      if (this.state.isLoading) {
        return;
      }
      this._handleSearch(keywords);
    }, 300);
  }

  render() {
    const {
      value,
      valueProp,
      labelProp,
      labelInit,
      columns,
      disabled,
    } = this.props;
    const { total, pageSize, currentPage, isLoading, source, open } = this.state;
    let renderSource = source;
    const valueItem = _.find(renderSource, item => item[valueProp] === value);
    if (!valueItem && labelInit) {
      renderSource = [
        {
          [valueProp]: value,
          [labelProp]: labelInit,
          __hidden: true,
        },
        ...renderSource,
      ];
    } else if (valueItem && valueItem[labelProp] !== labelInit && !open) {
      renderSource = _.filter(renderSource, r => r !== valueItem);
      renderSource = [
        {
          ...valueItem,
          [labelProp]: labelInit,
        },
        ...renderSource,
      ];
    }
    const options = renderSource.map(d => {
      const text = columns.map(c => (
        <span className="editor-associate-td" key={c.field}>
          {/* {d[c.field] || ''} */}
          {this._getColumnDisplay(d, c)}
        </span>
      ));
      return (
        <Option
          value={d[valueProp]}
          key={d[valueProp]}
          label={d[labelProp]}
          className="editor-associate-tr"
          disabled={d.__hidden}
          style={d.__hidden ? { display: 'none' } : null}
        >{text}</Option>
      );
    });
    const from = (currentPage - 1) * pageSize + 1;
    const to = from + source.length - 1;
    return (
      <Select
        showSearch
        size="small"
        value={value}
        style={{ width: '100%' }}
        onSearch={this._debounceHandleSearch}
        onChange={this._handleChange}
        onSelect={this._onSelect}
        onDropdownVisibleChange={this._onDropdownVisibleChange}
        defaultActiveFirstOption={false}
        optionLabelProp="label"
        filterOption={false}
        allowClear={true}
        notFoundContent={null}
        suffixIcon={<Icon type="search" />}
        disabled={disabled}
        {...DROPDOWN_ALIGN_PROPS}
        dropdownClassName="editor-associate-dropdown"
        className="editor-associate"
        placeholder={this._getPlaceholder()}
        onBlur={this._onBlur}
      >
        <OptGroup key="1" label={
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <div>
              <span>第 {from} - {to} 条</span>
              {
                total
                  ? <span>，共 {total} 条</span>
                  : null
              }
              {
                isLoading
                  ? <Icon type="loading" />
                  : null
              }
            </div>
            <div>
              <a href="javascript:void(0)" onClick={this._prevPage} title="上一页"><Icon type="backward" /></a>
              <a href="javascript:void(0)" onClick={this._nextPage} title="下一页"><Icon type="forward" /></a>
            </div>
          </div>
        }>
          <Option className="editor-associate-none" disabled value="----"> --- </Option>
        </OptGroup>
        <OptGroup {...{ className: 'editor-associate-table' }} key="2" label={
          <div className="editor-associate-head-tr">
            {
              _.map(columns, c => (
                <span className="editor-associate-th" key={c.field}>
                  {c.title}
                </span>
              ))
            }
          </div>
        }>
          {options}
        </OptGroup>
      </Select>
    );
  }

  private _getPlaceholder = () => {
    const {
      // value,
      labelInit,
    } = this.props;
    if (labelInit) {
      return labelInit;
    }
    return '';
  }

  private _getColumnDisplay = (record: any, column: IAssociateColumn) => {
    const { dicts } = this.props;
    let display = record[column.field];
    if (column.format) {
      display = column.format(display);
    } else if (column.dictName) {
      // const dictList = dicts[column.dictName] ?? [];
      // const dict = _.find(dictList, d => d.key === display);
      // if (dict) {
      //   display = dict.value;\
      // }
      display = getDictDisplay(display, column.dictName, dicts);
    }
    return display ?? '';
  }

  private _createQueryOptions = (keywords: string = '', isExactQuery = false): IQueryOptions => {
    return {
      keywords,
      pageSize: this.state.pageSize,
      currentPage: this.state.currentPage,
      isExactQuery,
    };
  }

  private _handleSearch = async (keywords: string = '', isExactQuery = false) => {
    await delay(0);
    this.setState({
      isLoading: true,
    });
    const options = this._createQueryOptions(keywords, isExactQuery);
    try {
      const result = await this.props.queryMethod(options);
      const source = result.source || [];
      const uniqSource = _.uniqBy(source, this.props.valueProp);
      console.log('handleSearch', result);
      this.setState({
        source: uniqSource,
        originSource: source,
        total: result.total,
        prevSearchKeywords: keywords,
        isLoading: false,
      });
    } catch (e) {
      console.warn(e);
      this.setState({
        source: [],
        originSource: [],
        total: 0,
        isLoading: false,
        currentPage: 1,
      });
    }
  }

  private _onSelect = (value: string, option: any) => {
    this._triggerChange(value);
  }

  private _handleChange = (value: string, option: any) => {
    if (!value) {
      this.setState({
        source: [],
        originSource: [],
        total: 0,
        isLoading: false,
        currentPage: 1,
      });
    }
    this._triggerChange(value);
  }

  private _triggerChange = (value: string) => {
    const { onChange, valueProp } = this.props;
    const { source } = this.state;
    const item = _.find(source, r => r[valueProp] === value);
    if (onChange) {
      onChange(value, item);
    }
  }

  private _onBlur = (value: any) => {
    console.log('.... _onBlur', value);
    const { valueProp } = this.props;
    const {
      isLoading,
      source,
    } = this.state;
    if (!isLoading && source.length === 1 && source[0][valueProp] !== value) {
      this._handleChange(source[0][valueProp], source[0]);
    }
  }

  private _onDropdownVisibleChange = (open: boolean) => {
    this.setState({
      open,
    });
    if (open) {
      this.setState({
        currentPage: 1,
      });
      this._handleSearch(this.props.value, true);
    }
  }

  private _prevPage = () => {
    console.log('UiAssociate_prevPage');
    const { currentPage, prevSearchKeywords, isLoading } = this.state;
    if (currentPage <= 1 || isLoading) {
      return;
    }
    this.setState({
      isLoading: true,
      currentPage: currentPage - 1,
    });
    this._handleSearch(prevSearchKeywords);
  }

  private _nextPage = () => {
    console.log('UiAssociate_nextPage');
    const { currentPage, total, pageSize, prevSearchKeywords, isLoading } = this.state;
    const totalPages = Math.ceil(total / pageSize);
    if (currentPage >= totalPages || isLoading) {
      return;
    }
    this.setState({
      isLoading: true,
      currentPage: currentPage + 1,
    });
    this._handleSearch(prevSearchKeywords);
  }

}
