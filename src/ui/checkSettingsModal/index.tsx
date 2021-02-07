import * as React from 'react';
import { Modal } from 'antd';

import './style.less';

export interface IUiCheckSettingsModalState {
  visible: boolean;
  baseViewId: string;
  ipfCcmBoId: string;
  groupName?: string;
}

export interface IUiCheckSettingsModalProps {
}

export class UiCheckSettingsModal extends React.PureComponent<IUiCheckSettingsModalProps, IUiCheckSettingsModalState> {
  state: IUiCheckSettingsModalState = {
    visible: false,
    baseViewId: null,
    ipfCcmBoId: null,
  };

  render() {
    const { visible } = this.state;
    return (
      <Modal
        title="校验配置"
        maskClosable={false}
        visible={visible}
        footer={null}
        onCancel={this.close}
        afterClose={this._afterClose}
        destroyOnClose
        centered
        wrapClassName="editor-ui-check-settings-modal"
      >
        { this._renderModalBody() }
      </Modal>
    );
  }

  open = ({ baseViewId, ipfCcmBoId, groupName }: any) => {
    this.setState({
      visible: true,
      baseViewId,
      ipfCcmBoId,
      groupName,
    });
  }

  close = () => {
    this.setState({
      visible: false,
    });
  }

  private _renderModalBody = () => {
    const { ipfCcmBoId, baseViewId, groupName } = this.state;
    if (!ipfCcmBoId) {
      return (
        <div>缺少业务对象ID!</div>
      );
    }
    let url = `/html/platform/implement/metadata/ipfCcmBoCheckSettings.html?openFrom=1&ipfCcmBoId=${ipfCcmBoId}&baseViewId=${baseViewId}`;
    if (groupName) {
      url += `&groupName=${groupName}`;
    }
    return (
      <iframe
        src={url}
        frameBorder="0"
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    );
  }

  private _afterClose = () => {
    this.setState({
      ipfCcmBoId: null,
      baseViewId: null,
    });
  }
}
