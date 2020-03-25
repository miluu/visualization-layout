import * as React from 'react';
import * as _ from 'lodash';
import { UiSettingsModal } from '../settingsModal';

import './style.less';

export interface IUiCodeEditorModalState {
  visible: boolean;
  language?: string;
  onSubmit?: (code?: string) => any;
}

export class UiCodeEditorModal extends React.PureComponent<{}, IUiCodeEditorModalState> {
  state: IUiCodeEditorModalState = {
    visible: true,
  };

  render() {
    const { visible } = this.state;
    return (
      <UiSettingsModal
        visible={visible}
        onCancel={this._onCancel}
        onOk={this._onSubmit}
        wrapClassName="editor-code-editor-modal"
      >
        <div className="editor-code-editor-content" style={{
          width: '100%',
          height: '100%',
        }}>
          {
            visible
              ? (
                <iframe
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 0,
                  }}
                  src="http://localhost:8088/html/platform/codeEditor/?language=html"
                />
              )
              : null
          }
        </div>
      </UiSettingsModal>
    );
  }

  open = (options: IUiCodeEditorModalState) => {
    const state = _.assign({}, options, {
      visible: true,
    });
    this.setState(state);
  }

  close = () => {
    this.setState({
      visible: false,
    });
  }

  private _onCancel = () => {
    this.close();
  }

  private _onSubmit = () => {
    const { onSubmit } = this.state;
    if (onSubmit) {
      onSubmit();
    }
    this.close();
  }
}
