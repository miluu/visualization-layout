import * as React from 'react';
import { Modal, Icon } from 'antd';

import './style.less';
import { connect } from 'dva';
import { IAppState } from 'src/models/appModel';
import { Dispatch, AnyAction } from 'redux';
import { createSetKeyValueAction } from 'src/models/appActions';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

export interface IUiSessionModalProps {
  visible?: boolean;
  dispatch?: Dispatch<AnyAction>;
}

@connect(({
  APP,
}: {
  APP: IAppState;
}) => {
  return {
    visible: APP.showSessionModal,
  };
})
export class UiSessionModal extends React.PureComponent<IUiSessionModalProps> {

  render() {
    const { visible } = this.props;
    return (

      <Modal
        title={<><Icon style={{ color: '#faad14' }} type="warning" />{' '}{t(I18N_IDS.TEXT_TIPS)}</>}
        cancelText="关闭"
        okText="已登录"
        maskClosable={false}
        visible={visible}
        zIndex={10000}
        closable={false}
        width={420}
        onCancel={this._onCancle}
        wrapClassName="editor-session-modal"
        okButtonProps={{
          style: {
            display: 'none',
          },
        }}
      >
        <p>当前登录已失效, 请登录后再继续操作.</p>
        <p>点击 <a className="editor-link" href="/index.html" target="_blank">这里</a> 在新窗口重新登录, 再返回本窗口继续操作.</p>
      </Modal>
    );
  }

  private _onCancle = () => {
    this.props.dispatch(createSetKeyValueAction('showSessionModal', false, true));
    this.props.dispatch(createSetKeyValueAction('closeTime', new Date(), true));
  }
}
