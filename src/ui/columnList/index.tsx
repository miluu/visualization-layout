import * as React from 'react';
import * as _ from 'lodash';
import classnames from 'classnames';
import {
  Icon,
  Input,
  Select,
  Checkbox,
  Tooltip,
} from 'antd';

import './style.less';
import { delay, noop } from 'src/utils';
import Button, { ButtonType } from 'antd/lib/button';
import produce, { original } from 'immer';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

const { Option } = Select;

export interface IButtonOption {
  text: string | React.ReactNode;
  type?: ButtonType;
  onClick?: (e: React.MouseEvent) => any;
  extendWrapperStyle?: React.CSSProperties;
}

interface ICheckboxProp {
  label: string;
  property: string;
}

export interface IUiColumnListProps {
  title?: string;
  list: any[];
  keyProp: string;
  sortProp?: string;
  displayFunc: (item: any) => string;
  filterProps?: string[];
  rootClassName?: string;
  rootStyle?: React.CSSProperties;
  extendWrapperStyle?: React.CSSProperties;
  onDblClickItem?: (e?: React.MouseEvent, item?: any) => void;
  onDragItems?: (e?: React.DragEvent, listInstance?: UiColumnList) => void;
  onDragItemsEnd?: (e?: React.DragEvent, listInstance?: UiColumnList) => void;

  editable?: boolean;
  editProp?: string;
  /** 列表项是否可编辑 */
  canEdit?: (item?: any) => any;

  checkboxProps?: ICheckboxProp[];

  selectOptions?: {
    list: any[];
    keyProp: string;
    displayFunc: (item: any) => string;
    placeholder?: string;
    extendWrapperStyle?: React.CSSProperties;
  };
  onSelectChange?: (selectValue?: string) => any;

  buttonOptions?: IButtonOption | IButtonOption[];
}

interface IUiColumnListState {
  keywords?: string;
  list?: any[];
  sortProp?: string;
  sortedList?: any[];
  hiddenItems?: Set<any>;
  selectedItems?: Set<any>;
  disabledItems?: Set<any>;
  editingItem?: any;
  editingValue?: any;

  isSelectOpen?: boolean;

  selectValue?: any;

  draggingItem?: any;
  editorCancel?: boolean;
}

export class UiColumnList extends React.PureComponent<IUiColumnListProps, IUiColumnListState> {

  static getDerivedStateFromProps(nextProps: IUiColumnListProps, prevState: IUiColumnListState) {
    const obj: IUiColumnListState = {};
    if (prevState.list !== nextProps.list || prevState.sortProp !== nextProps.sortProp) {
      obj.list = nextProps.list;
      obj.sortedList = nextProps.sortProp ? _.sortBy(nextProps.list, nextProps.sortProp) : nextProps.list;
      obj.sortProp = nextProps.sortProp;
      obj.hiddenItems = new Set();
      obj.selectedItems = new Set();
      obj.keywords = '';
      obj.editingItem = null;
      obj.editingValue = {};
      return obj;
    }
    return null;
  }

  private _inputContainerRef = React.createRef<HTMLDivElement>();

  private _transformStyle: React.CSSProperties = {
    transform: 'rotate(90deg)',
  };

  constructor(props: IUiColumnListProps) {
    super(props);
    this.state = {
      keywords: '',
      list: [],
      hiddenItems: new Set(),
      selectedItems: new Set(),

      selectValue: undefined,
      draggingItem: null,
    };
  }

  render() {
    console.log('[UiColumnList#render]');
    return (
      <div className="editor-list-container">
        {this._renderHead()}
        {this._renderFilter()}
        {this._renderHeadCheckbox()}
        {this._renderList()}
        {this._renderSelect()}
        {this._renderButton()}
        {this._renderChildren()}
      </div>
    );
  }

  getSelectedItems = (includeDisabled = true) => {
    const { sortedList } = this.state;
    let selectedItems = _.filter(sortedList, this._isSelectedItem);
    if (!includeDisabled) {
      selectedItems = _.filter(selectedItems, item => !this.isDisabledItem(item));
    }
    return selectedItems;
  }

  addItems = (items: any[]) => {
    const { sortedList } = this.state;
    const newSortedList = sortedList.concat(items);
    this.setState({
      sortedList: newSortedList,
    });
  }

  removeItems = (items: any[]) => {
    const { sortedList } = this.state;
    const newSortedList = _.difference(sortedList, items);
    this.setState({
      sortedList: newSortedList,
    });
  }

  updateItem = (item: any, update: any) => {
    if (!update) {
      return;
    }
    const { sortedList } = this.state;
    const index = _.findIndex(sortedList, i => i === item);
    if (index >= 0) {
      const newSortedList = produce(sortedList, draft => {
        _.assign(draft[index], update);
      });
      this.setState({
        sortedList: newSortedList,
      });
    }
  }

  setDisabledItems = (items: Set<any>) => {
    this.setState({
      disabledItems: items,
    });
  }

  isDisabledItem = (item: any) => {
    const { disabledItems } = this.state;
    if (!disabledItems) {
      return false;
    }
    return disabledItems.has(item);
  }

  resetSelectValue = () => {
    this.setState({
      selectValue: undefined,
    });
  }

  setEditingItem = (item: any, apply = true) => {
    const { editProp, canEdit } = this.props;
    const { editingItem, editingValue } = this.state;
    if (apply) {
      this.updateItem(editingItem, editingValue);
    }
    if (canEdit && item && !canEdit(item)) {
      return;
    }
    this.setState({
      editingItem: item,
      editingValue: {
        [editProp]: item && item[editProp],
      },
      editorCancel: false,
    });
    this._delayFocusInput();
  }

  isEditingItem = (item: any) => {
    return item === this.state.editingItem;
  }

  private _renderHead = () => {
    const { title } = this.props;
    return (
      <div className="editor-list-head">
        <h3>{title}</h3>
        <div className="editor-list-btns">
          <a href="javascript:void(0)" onClick={this._moveUp}>
            <Icon type="up" />
          </a>
          <a href="javascript:void(0)" onClick={this._moveToTop}>
            <Icon type="double-left" style={this._transformStyle} />
          </a>
          <a href="javascript:void(0)" onClick={this._moveDown}>
            <Icon type="down" />
          </a>
          <a href="javascript:void(0)" onClick={this._moveToBottom}>
            <Icon type="double-right" style={this._transformStyle} />
          </a>
        </div>
      </div>
    );
  }

  private _renderFilter = () => {
    const { filterProps } = this.props;
    if (!filterProps || !filterProps.length) {
      return null;
    }
    const { keywords } = this.state;
    return (
      <div className="editor-list-filter">
        <Input
          size="small"
          value={keywords}
          allowClear
          onChange={this._onFilterChange}
        />
      </div>
    );
  }

  private _renderList = () => {
    const { displayFunc, keyProp, onDragItems, editable, canEdit } = this.props;
    const { sortedList, draggingItem, isSelectOpen } = this.state;
    const selectedCount = this.getSelectedItems(false).length;
    return (
      <div className={classnames('editor-list-body', {
        'editor-is-select-open': isSelectOpen,
      })} >
        <ul>
          {
            _.map(sortedList, item => {
              const display = displayFunc(item);
              const isSelected = this._isSelectedItem(item);
              const isEditing = this.isEditingItem(item);
              return (
                <li
                  key={item[keyProp]}
                  title={display}
                  onClick={(e) => this._clickItem(e, item)}
                  className={classnames({
                    'editor-active': isSelected,
                    'editor-disabled': this.isDisabledItem(item),
                    'editor-hidden': this._isHiddenItem(item),
                  })}
                  onDoubleClick={(e) => this._onDoubleClick(e, item)}
                  draggable={!!onDragItems}
                  onDragStart={(e) => this._onDragStart(e, item)}
                  onDragEnd={(e) => this._onDragEnd(e, item)}
                >
                  {
                    isEditing
                      ? this._renderItemEditor()
                      : (
                        <>
                          <span className="editor-list-display">
                            {
                              draggingItem === item && selectedCount > 1
                                ? <span className="editor-list-count">{ selectedCount }</span>
                                : null
                            }
                            {display}
                          </span>
                          {
                            editable
                              ? (
                                <span className="editor-list-actions">
                                  {
                                    !canEdit || canEdit(item)
                                      ? (
                                        <a
                                          title="编辑" href="javascript:void(0)"
                                          onClick={e => this._editItem(e, item)}
                                        >
                                          <Icon type="edit" />
                                        </a>
                                      )
                                      : null
                                  }
                                  <a
                                    title="删除" href="javascript:void(0)"
                                    onClick={e => this._removeItem(e, item)}
                                  >
                                    <Icon type="delete" />
                                  </a>
                                </span>
                              )
                              : null
                          }
                        </>
                      )
                  }
                  {this._renderCheckbox(item)}
                </li>
              );
            })
          }
        </ul>
      </div>
    );
  }

  private _renderCheckbox = (item: any) => {
    const { checkboxProps } = this.props;
    if (!(checkboxProps && checkboxProps.length)) {
      return null;
    }
    return (
      <span className="editor-column-list-checkboxs" onClick={this._onClickCheckbox}>
        {_.map(checkboxProps, prop => {
          return (
            <Checkbox
              key={prop.property}
              checked={!!item[prop.property]}
              onChange={e => this._onCheckboxChange(e, item, prop)}
            />
          );
        })}
      </span>
    );
  }

  private _onCheckboxChange = (e: CheckboxChangeEvent, item: any, checkProp: ICheckboxProp) => {
    const { checked } = e.target;
    const { sortedList } = this.state;
    const newSortedList = produce(sortedList, draft => {
      const draftItem = _.find(draft, _draftItem => {
        return original(_draftItem) === item;
      });
      if (draftItem) {
        draftItem[checkProp.property] = checked ? 'X' : '';
      }
    });
    this.setState({
      sortedList: newSortedList,
    });
  }

  private _renderHeadCheckbox = () => {
    const { checkboxProps } = this.props;
    if (!(checkboxProps && checkboxProps.length)) {
      return null;
    }
    return (
      <div className="editor-list-head-checkbox">
        {
          _.map(checkboxProps, prop => {
            return (
              <Tooltip
                title={prop.label}
              >
                <Checkbox
                  key={prop.property}
                  checked={this._isCheckedAll(prop.property)}
                  onChange={e => this._onHeadCheckboxChange(e, prop.property)}
                />
              </Tooltip>
            );
          })
        }
      </div>
    );
  }

  private _isCheckedAll = (property: string) => {
    const { sortedList } = this.state;
    const isCheckedAll = !_.find(sortedList, item => !item[property]);
    return isCheckedAll;
  }

  private _onHeadCheckboxChange = (e: CheckboxChangeEvent, property: string) => {
    const { checked } = e.target;
    const { sortedList } = this.state;
    const newSortedList = produce(sortedList, draft => {
      _.forEach(draft, draftItem => {
        draftItem[property] = checked ? 'X' : '';
      });
    });
    this.setState({
      sortedList: newSortedList,
    });
  }

  private _onClickCheckbox = (e: React.MouseEvent) => {
    e.stopPropagation();
  }

  private _renderItemEditor = () => {
    const { editProp } = this.props;
    const editingValue = this.state.editingValue || {};
    return (
      <div className="editor-list-editor">
        <div className="editor-list-editor-input" ref={this._inputContainerRef}>
          <Input
            value={editingValue[editProp]}
            size="small"
            onChange={e => this._onEditorChange(e.target.value)}
            onBlur={this._onEditorBlur}
            onKeyDown={this._onEditorKeyDown}
          />
        </div>
        <div className="editor-list-editor-actions">
          <a
            title={t(I18N_IDS.TEXT_OK)} href="javascript:void(0)"
          >
            <Icon type="check" />
          </a>
          <a
            onMouseDown={() => this.setState({
              editorCancel: true,
            })}
            onClick={e => this._closeEditor(false)}
            title={t(I18N_IDS.TEXT_CANCEL)} href="javascript:void(0)"
          >
            <Icon type="close" />
          </a>
        </div>
      </div>
    );
  }

  private _closeEditor = (apply: boolean) => {
    // const { editingItem, editingValue } = this.state;
    this.setEditingItem(null, apply);
    // if (apply) {
    //   this.updateItem(editingItem, editingValue);
    // }
  }

  private _onEditorChange = (value: any) => {
    const { editProp } = this.props;
    const editingValue = this.state.editingValue || {};
    this.setState({
      editingValue: _.assign({}, editingValue, {
        [editProp]: value,
      }),
    });
  }

  private _onEditorKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      this._closeEditor(true);
      return;
    }
    if (e.key === 'Escape') {
      this._closeEditor(false);
      return;
    }
  }

  private _onEditorBlur = (e: React.FocusEvent) => {
    if (!this.state.editorCancel) {
      this._closeEditor(true);
    }
    this.setState({
      editorCancel: false,
    });
  }

  private _onDragStart = async (e: React.DragEvent, item: any) => {
    e.persist();
    if (this.isEditingItem(item)) {
      return;
    }
    if (this.isDisabledItem(item)) {
      e.preventDefault();
      return;
    }
    const state: IUiColumnListState = {
      draggingItem: item,
    };
    if (!this._isSelectedItem(item)) {
      state.selectedItems = new Set<any>([item]);
    }
    this.setState(state);
    await delay(0);
    const { onDragItems } = this.props;
    if (onDragItems) {
      onDragItems(e, this);
    }
  }

  private _onDragEnd = (e: React.DragEvent, item: any) => {
    this.setState({
      draggingItem: null,
    });
    const { onDragItemsEnd } = this.props;
    if (onDragItemsEnd) {
      onDragItemsEnd(e, this);
    }
  }

  private _onDoubleClick = (e: React.MouseEvent, item: any) => {
    if (this.isEditingItem(item)) {
      return;
    }
    const { onDblClickItem, editable } = this.props;
    if (onDblClickItem) {
      onDblClickItem(e, item);
    } else if (editable) {
      this.setEditingItem(item);
    }
  }

  private _renderChildren = () => {
    const { children, extendWrapperStyle } = this.props;
    if (children) {
      return (
        <div className="editor-list-extend" style={extendWrapperStyle}>
          {children}
        </div>
      );
    }
    return null;
  }

  private _renderSelect = () => {
    const { selectOptions } = this.props;
    if (!selectOptions) {
      return null;
    }
    const { extendWrapperStyle, list, keyProp, displayFunc, placeholder } = selectOptions;
    const { selectValue } = this.state;
    return (
      <div className="editor-list-extend" style={_.assign({ position: 'relative', height: 24 }, extendWrapperStyle)}>
        <Select
          placeholder={placeholder}
          size="small"
          allowClear
          style={{
            position: 'absolute',
            width: '100%',
          }}
          value={selectValue}
          onChange={this._onSelectChange}
          onDropdownVisibleChange={this._onDropdownVisibleChange}
        >
          {
            _.map(list, item => (
              <Option
                key={item[keyProp]}
              >{displayFunc(item)}</Option>
            ))
          }
        </Select>
      </div>
    );
  }

  private _onSelectChange = (value: string) => {
    this.setState({
      selectValue: value,
    });
    if (this.props.onSelectChange) {
      this.props.onSelectChange(value);
    }
  }

  private _onDropdownVisibleChange = (open: boolean) => {
    this.setState({
      isSelectOpen: open,
    });
  }

  private _renderButton = () => {
    const { buttonOptions } = this.props;
    if (!buttonOptions) {
      return null;
    }
    const options = _.isArray(buttonOptions) ? buttonOptions : [buttonOptions];
    return (
      <div className="editor-list-extend" style={{ position: 'relative', height: 24 * options.length + 4 * (options.length - 1) }}>
        {
          _.map(options, (opt, i) => {
            const { text, type, onClick } = opt;
            return (
              <Button
                key={i}
                type={type || 'primary'}
                block
                size="small"
                onClick={onClick || noop}
                style={{ position: 'absolute', top: 28 * i }}
              >{text}</Button>
            );
          })
        }
      </div>
    );
  }

  private _onFilterChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = _.trim(e.target.value);
    this.setState({
      keywords: value,
    });
    await delay(0);
    this._updateVisibleItems();
  }

  private _updateVisibleItems = () => {
    const { list, filterProps } = this.props;
    let { keywords } = this.state;
    keywords = (_.trim(keywords) || '').toLowerCase();
    const hiddenItems = _.filter(list, item => {
      return !_.find(filterProps, p => _.includes(String(item[p]).toLowerCase(), keywords || ''));
    });
    this.setState({
      hiddenItems: new Set(hiddenItems),
    });
  }

  private _clickItem = (e: React.MouseEvent, item: any) => {
    if (this.isEditingItem(item)) {
      return;
    }
    const { selectedItems } = this.state;
    const newSelectedItems = new Set(selectedItems);
    if (e.ctrlKey) {
      if (this._isSelectedItem(item)) {
        newSelectedItems.delete(item);
      } else {
        newSelectedItems.add(item);
      }
    } else {
      newSelectedItems.clear();
      if (
        selectedItems.size > 1
        || !this._isSelectedItem(item)
      ) {
        newSelectedItems.add(item);
      }
    }
    this.setState({
      selectedItems: newSelectedItems,
    });
  }

  private _isSelectedItem = (item: any) => {
    return this.state.selectedItems.has(item);
  }

  private _isHiddenItem = (item: any) => {
    return this.state.hiddenItems.has(item);
  }

  private _move = (action?: 'up' | 'down' | 'top' | 'bottom') => {
    const { sortedList } = this.state;
    const selectedList: any[] = [];
    let index: number;
    _.forEach(sortedList, (item, i) => {
      if (this._isSelectedItem(item)) {
        selectedList.push(item);
        if (_.isUndefined(index)) {
          index = i;
        }
      }
    });
    const newSortedList = _.difference(sortedList, selectedList);
    switch (action) {
      case 'up':
        index--;
        break;
      case 'down':
        index++;
        break;
      case 'top':
        index = 0;
        break;
      case 'bottom':
        index = sortedList.length - 1;
        break;
      default:
        break;
    }
    if (index < 0) {
      index = 0;
    } else if (index > sortedList.length - 1) {
      index = sortedList.length - 1;
    }
    newSortedList.splice(index, 0, ...selectedList);
    this.setState({
      sortedList: newSortedList,
    });
  }

  private _moveUp = () => {
    this._move('up');
  }

  private _moveToTop = () => {
    this._move('top');
  }

  private _moveDown = () => {
    this._move('down');
  }

  private _moveToBottom = () => {
    this._move('bottom');
  }

  private _editItem = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    this.setEditingItem(item);
  }

  private _removeItem = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    this.removeItems([item]);
  }

  private _focusInput = () => {
    const ref = this._inputContainerRef;
    const inputContainer = ref.current;
    if (!inputContainer) {
      return;
    }
    const input = inputContainer.querySelector('input');
    input.select();
    input.focus();
  }

  private _delayFocusInput = async () => {
    await delay();
    this._focusInput();
  }

}
