import * as React from 'react';
import {
  Modal,
} from 'antd';
import classnames from 'classnames';
import { ModalProps } from 'antd/lib/modal';

import './style.less';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

export class UiSettingsModal extends React.PureComponent<ModalProps> {

  render() {
    return (
      <Modal
        visible
        centered
        closable={false}
        okText={t(I18N_IDS.TEXT_OK)}
        cancelText={t(I18N_IDS.TEXT_CANCEL)}
        title=""
        maskClosable={false}
        okButtonProps={{
          size: 'small',
        }}
        cancelButtonProps={{
          size: 'small',
        }}
        {...this.props}
        wrapClassName={classnames('editor-settings-modal', this.props.wrapClassName)}
      >
        {this.props.children}
      </Modal>
    );
  }

}
