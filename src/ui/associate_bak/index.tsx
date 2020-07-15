import * as React from 'react';
import { Select, Icon } from 'antd';
import * as _ from 'lodash';
import axios from 'axios';

import { delay, paramsSerializer } from '../../utils';
import { IAppState } from 'src/models/appModel';
import { connect } from 'dva';

const { Option, OptGroup } = Select;

export interface IUiAssociateProps {
  urlParams?: any;
  onChange?: (value: string) => void;
  value?: string;
  disabled?: boolean;
  // url: string;
}

export interface IUiAssociateState {
  source: any[];
  value: any;
  currentPage: number;
  prevPage: number;
  total: number;
  pageSize: number;
  prevSearchKeywords: string;
  isLoading: boolean;
}

@connect(
  ({ APP }: {
    APP: IAppState,
  }) => ({
    urlParams: APP.params,
  }),
)
export class UiAssociate extends React.PureComponent<IUiAssociateProps, IUiAssociateState> {

  static getDerivedStateFromProps(nextProps: IUiAssociateProps) {
    if ('value' in nextProps) {
      return {
        value: nextProps.value,
      };
    }
    return null;
  }

  private _debounceHandleSearch: (value: string) => Promise<void>;

  constructor(props: IUiAssociateProps) {
    super(props);
    this._debounceHandleSearch = _.debounce(this._handleSearch, 300);
    this.state = {
      source: [],
      value: null,
      currentPage: 1,
      prevPage: 1,
      total: 0,
      pageSize: 10,
      prevSearchKeywords: null,
      isLoading: false,
    };
  }

  render() {
    const options = this.state.source.map(d => {
      const text = `${d.messageKey} - ${d.messageText}`;
      return <Option value={d.messageKey} key={d.messageKey} title={text}>{text}</Option>;
    });
    const { total, pageSize, currentPage/* , source */, prevPage, isLoading } = this.state;
    const { disabled } = this.props;
    // const count = source.length;
    const page = isLoading ? prevPage : currentPage;
    // let from: number;
    // let to: number;
    const totalPages = Math.ceil(total / pageSize);
    // if (count) {
    //   from = (page - 1) * pageSize + 1;
    //   to = from + count - 1;
    // }
    return (
      <Select
        showSearch
        size="small"
        value={this.state.value}
        style={{ width: '100%' }}
        onSearch={this._debounceHandleSearch}
        onChange={this._handleChange}
        onDropdownVisibleChange={this._onDropdownVisibleChange}
        defaultActiveFirstOption={true}
        optionLabelProp="value"
        filterOption={false}
        allowClear={true}
        notFoundContent={null}
        disabled={disabled}
      >
        <OptGroup label={
          <>
            第{ page }/{ totalPages }页{' '}
            <a href="javascript:void(0)" onClick={this._prevPage} title="上一页"><Icon type="backward" /></a>
            <a href="javascript:void(0)" onClick={this._nextPage} title="下一页"><Icon type="forward" /></a>
          </>
        }>
          {options}
        </OptGroup>
      </Select>
    );
  }

  private _handleSearch = async (value: string) => {
    await delay(0);
    const keywords = value || '';
    const { currentPage, pageSize } = this.state;
    this.setState({
      isLoading: true,
    });
    let result: any;
    try {
      result = await query(keywords, this.props.urlParams, currentPage, pageSize);
    } catch (e) {
      this.setState({
        source: [],
        total: 0,
        prevSearchKeywords: '',
        isLoading: false,
        prevPage: 1,
        currentPage: 1,
      });
      return;
    }
    console.log('handleSearch', result);
    this.setState({
      source: result.ipfLanguageMsgs,
      total: result.total,
      prevSearchKeywords: keywords,
      isLoading: false,
      prevPage: this.state.currentPage,
    });
  }

  private _handleChange = (value: string) => {
    if (!('value' in this.props)) {
      this.setState({ value });
    }
    this._triggerChange(value);
  }

  private _triggerChange = (value: string) => {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(value);
    }
  }

  private _onDropdownVisibleChange = (open: boolean) => {
    if (open) {
      this.setState({
        currentPage: 1,
      });
      this._handleSearch(this.state.value);
    }
  }

  private _prevPage = () => {
    console.log('UiAssociate_prevPage');
    const { currentPage, prevSearchKeywords } = this.state;
    if (currentPage <= 1) {
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
    const { currentPage, total, pageSize, prevSearchKeywords } = this.state;
    const totalPages = Math.ceil(total / pageSize);
    if (currentPage >= totalPages) {
      return;
    }
    this.setState({
      isLoading: true,
      currentPage: currentPage + 1,
    });
    this._handleSearch(prevSearchKeywords);
  }

}

async function query(keywords: string, urlParams: any, currentPage = 1, pageSize = 10): Promise<any> {
  const searchColumns = createSearchColumns(keywords, urlParams);
  return axios.get('/ipf/ipfLanguageMsg/query', {
    params: {
      currentPage,
      messageKey: keywords,
      pageSize,
      queryResultType: 'page',
      searchColumns,
      sum: false,
    },
    paramsSerializer,
  }).then(resp => {
    return resp.data;
  });
}

function createSearchColumns(keywords: string, urlParams: any) {
  const searchColumns = [];
  if (keywords) {
    searchColumns.push({
      propertyName:'messageKey',
      columnName:'MESSAGE_KEY',
      dataType:'S',
      junction:'or',
      value: keywords,
      operation:'LIKEIC',
    });
    searchColumns.push({
      propertyName:'messageText',
      columnName:'MESSAGE_TEXT',
      dataType:'S',
      junction:'or',
      value: keywords,
      operation:'LIKEIC',
    });
  }
  searchColumns.push({
    propertyName: 'baseViewId',
    columnName: 'BASE_VIEW_ID',
    dataType: 'S',
    value: urlParams.baseViewId || '',
    operation:'EQ',
  });

  if (urlParams.configItemCode) {
    searchColumns.push({
      propertyName:'configItemCode',
      columnName:'CONFIG_ITEM_CODE',
      dataType:'S',
      value: urlParams.configItemCode || '',
      operation: 'EQ',
    });
  }
  return searchColumns;
}
