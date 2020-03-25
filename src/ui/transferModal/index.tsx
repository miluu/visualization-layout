import * as React from 'react';
import * as _ from 'lodash';
import { Button, Icon } from 'antd';

import { UiSettingsModal } from '../settingsModal';
import { UiColumnList, IUiColumnListProps } from '../columnList';

import './style.less';
import { noop } from 'src/utils';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

export interface ITransferListProps extends IUiColumnListProps {
  extend?: React.ReactNode;
}

export type TransferHandler = (leftList?: UiColumnList, rightList?: UiColumnList, list?: any[]) => any;

export interface IUiTransferModalState {
  visible?: boolean;
  leftListProps?: ITransferListProps;
  rightListProps?: ITransferListProps;
  onSubmit?: TransferHandler;
  onMoveToLeft?: TransferHandler;
  onMoveToRight?: TransferHandler;
}

const initProps: ITransferListProps = {
  list: [],
  keyProp: '',
  displayFunc: () => '',
};

const initState = {
  visible: false,
  leftListProps: initProps,
  rightListProps: initProps,
  onSubmit: noop,
  onMoveToLeft: noop,
  onMoveToRight: noop,
};

export class UiTransferModal extends React.PureComponent<any, IUiTransferModalState> {
  leftListRef = React.createRef<UiColumnList>();
  rightListRef = React.createRef<UiColumnList>();

  constructor(props: any) {
    super(props);
    this.state = initState;
  }

  render() {
    const { visible, leftListProps, rightListProps } = this.state;
    return (
      <UiSettingsModal
        visible={visible}
        onCancel={() => this.setState({ visible: false })}
        wrapClassName="editor-transfer-modal"
        onOk={this._onSubmit}
        afterClose={this._afterClose}
      >
        <div className="editor-transfer-content">
          <div className="editor-transfer-list">
            <UiColumnList
              ref={this.leftListRef}
              title={t(I18N_IDS.TEXT_ALL_FIELDS)}
              onDblClickItem={this._onDblClickLeftItem}
              {...leftListProps}
            >
              {leftListProps.extend}
            </UiColumnList>
          </div>
          <div className="editor-transfer-buttons">
              <Button onClick={this._moveToRight}><Icon type="right" /></Button>
              <Button onClick={this._moveAllToRight}><Icon type="double-right" /></Button>
              <Button onClick={this._moveToLeft}><Icon type="left" /></Button>
              <Button onClick={this._moveAllToLeft}><Icon type="double-left" /></Button>
          </div>
          <div className="editor-transfer-list" >
            <UiColumnList
              ref={this.rightListRef}
              title={t(I18N_IDS.TEXT_SELECTED_FIELDS)}
              onDblClickItem={this._onDblClickRightItem}
              {...rightListProps}
            >
              {rightListProps.extend}
            </UiColumnList>
          </div>
        </div>
      </UiSettingsModal>
    );
  }

  do(callback: TransferHandler) {
    callback(this.leftListRef.current, this.rightListRef.current);
  }

  open(options: IUiTransferModalState) {
    const state: any = _.assign({}, initState, options, {
      visible: true,
    });
    this.setState(state);
  }

  close() {
    this.setState({
      visible: false,
    });
  }

  private _afterClose = () => {
    this.setState(initState);
  }

  private _onSubmit = () => {
    this.state.onSubmit(
      this.leftListRef.current,
      this.rightListRef.current,
      this.rightListRef.current.state.sortedList,
    );
    this.close();
  }

  private _onDblClickLeftItem = (e: React.MouseEvent, item: any) => {
    console.log('[UiTransferModal] >', item);
    const { onMoveToRight } = this.state;
    if (onMoveToRight) {
      onMoveToRight(
        this.leftListRef.current,
        this.rightListRef.current,
        [item],
      );
    }
  }

  private _onDblClickRightItem = (e: React.MouseEvent, item: any) => {
    console.log('[UiTransferModal] <', item);
    const { onMoveToLeft } = this.state;
    if (onMoveToLeft) {
      onMoveToLeft(
        this.leftListRef.current,
        this.rightListRef.current,
        [item],
      );
    }
  }

  private _moveToRight = (e: React.MouseEvent) => {
    const items = this.leftListRef.current.getSelectedItems();
    console.log('[UiTransferModal] >', items);
    const { onMoveToRight } = this.state;
    if (onMoveToRight) {
      onMoveToRight(
        this.leftListRef.current,
        this.rightListRef.current,
        items,
      );
    }
  }

  private _moveAllToRight = (e: React.MouseEvent) => {
    console.log('[UiTransferModal] >>', this.leftListRef.current.state.sortedList);
    const { onMoveToRight } = this.state;
    if (onMoveToRight) {
      onMoveToRight(
        this.leftListRef.current,
        this.rightListRef.current,
        [...this.leftListRef.current.state.sortedList],
      );
    }
  }

  private _moveToLeft = (e: React.MouseEvent) => {
    const items = this.rightListRef.current.getSelectedItems();
    console.log('[UiTransferModal] <', items);
    const { onMoveToLeft } = this.state;
    if (onMoveToLeft) {
      onMoveToLeft(
        this.leftListRef.current,
        this.rightListRef.current,
        items,
      );
    }
  }

  private _moveAllToLeft = (e: React.MouseEvent) => {
    console.log('[UiTransferModal] >>', this.rightListRef.current.state.sortedList);
    const { onMoveToLeft } = this.state;
    if (onMoveToLeft) {
      onMoveToLeft(
        this.leftListRef.current,
        this.rightListRef.current,
        [...this.rightListRef.current.state.sortedList],
      );
    }
  }

  // private _onMoveToLeft = (list: any[]) => {}

}
