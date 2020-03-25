import * as React from 'react';
import * as _ from 'lodash';

import { UiSettingsModal } from '../settingsModal';
import { UiColumnList, IUiColumnListProps } from '../columnList';

import './style.less';
import { noop } from 'src/utils';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

export interface IEditableListProps extends IUiColumnListProps {
  extend?: React.ReactNode;
}

export type EditableListHandler = (listInstance?: UiColumnList, list?: any[]) => any;

export interface IUiTransferModalState {
  visible?: boolean;
  listProps?: IEditableListProps;
  onSubmit?: EditableListHandler;
}

const initProps: IEditableListProps = {
  list: [],
  editable: true,
  keyProp: '',
  displayFunc: () => '',
};

const initState: IUiTransferModalState = {
  visible: false,
  listProps: initProps,
  onSubmit: noop,
};

export class UiEditableListModal extends React.PureComponent<any, IUiTransferModalState> {
  listRef = React.createRef<UiColumnList>();

  constructor(props: any) {
    super(props);
    this.state = initState;
  }

  render() {
    const { visible, listProps } = this.state;
    return (
      <UiSettingsModal
        visible={visible}
        onCancel={() => this.setState({ visible: false })}
        wrapClassName="editor-editable-modal"
        onOk={this._onSubmit}
        afterClose={this._afterClose}
      >
        <div className="editor-editable-content">
          <div className="ediotr-editable-list" >
            <UiColumnList
              ref={this.listRef}
              title={t(I18N_IDS.TEXT_SELECTED_FIELDS)}
              {...listProps}
              editable
              editProp="fieldText"
            >
              {listProps.extend}
            </UiColumnList>
          </div>
        </div>
      </UiSettingsModal>
    );
  }

  do(callback: EditableListHandler) {
    callback(this.listRef.current);
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
      this.listRef.current,
      this.listRef.current.state.sortedList,
    );
    this.close();
  }
  // private _onMoveToLeft = (list: any[]) => {}

}
