import * as React from 'react';
import * as classnames from 'classnames';
import * as _ from 'lodash';
import { Icon } from 'antd';

import './style.less';
import { connect } from 'dva';
import { ISelectionRange, IAppState } from 'src/models/appModel';
import { Dispatch, AnyAction } from 'redux';
import { createMoveUpSelectedEffect, createMoveDownSelectedEffect, createRemoveSelectedEffect } from 'src/models/layoutsActions';
import { ILayoutsState } from 'src/models/layoutsModel';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

export interface IUiSelectionProps {
  range?: ISelectionRange;
  selectionOptions?: any;

  dispatch?: Dispatch<AnyAction>;
}

@connect(
  ({ APP, LAYOUTS }: {
    APP: IAppState;
    LAYOUTS: ILayoutsState<any>,
  }) => ({
    range: APP.selectionRange,
    selectionOptions: LAYOUTS.selectionOptions,
  }),
)
export class UiSelection extends React.PureComponent<IUiSelectionProps> {
  render() {
    const { range, selectionOptions } = this.props;
    const isShowButtons = !_.get(selectionOptions, 'isInReference');
    if (!range) {
      return <></>;
    }
    const { top, left, width, height, isHorizontal } = range;
    return (
      <div
        className={classnames('editor-selection', {
          'editor-is-horizontal': isHorizontal,
        })}
        style={{ top, left, width, height }}
      >
        <div className="editor-handler editor-handler-tl" style={{ top: 0, left: 0 }} />
        <div className="editor-handler editor-handler-tc" style={{ top: 0, left: width / 2 }} />
        <div className="editor-handler editor-handler-tr" style={{ top: 0, left: width + 1 }} />
        <div className="editor-handler editor-handler-ml" style={{ top: height / 2, left: 0 }} />
        <div className="editor-handler editor-handler-mr" style={{ top: height / 2, left: width + 1 }} />
        <div className="editor-handler editor-handler-bl" style={{ top: height + 1, left: 0 }} />
        <div className="editor-handler editor-handler-bc" style={{ top: height + 1, left: width / 2 }} />
        <div className="editor-handler editor-handler-br" style={{ top: height + 1, left: width + 1 }} />

        <div className={classnames('editor-button-field', {
          'editor-is-hidden': !isShowButtons,
        })}>
            <a href="javascript:void(0)" title={t(I18N_IDS.MOVE_UP)} className="editor-button editor-button-move-up" onClick={this._onClickMoveUp}>
              <Icon type="up-circle" theme="twoTone" twoToneColor="#337ab7" />
            </a>
            <a href="javascript:void(0)" title={t(I18N_IDS.MOVE_DOWN)} className="editor-button editor-button-move-down" onClick={this._onClickMoveDown}>
              <Icon type="down-circle" theme="twoTone" twoToneColor="#337ab7" />
            </a>
            <a href="javascript:void(0)" title={t(I18N_IDS.DELETE)} className="editor-button editor-button-danger" onClick={this._onClickDelete}>
              <Icon type="delete" theme="twoTone" twoToneColor="#d9534f" />
            </a>
        </div>
      </div>
    );
  }

  private _onClickDelete = () => {
    this.props.dispatch(createRemoveSelectedEffect());
  }

  private _onClickMoveUp = () => {
    this.props.dispatch(createMoveUpSelectedEffect());
  }

  private _onClickMoveDown = () => {
    this.props.dispatch(createMoveDownSelectedEffect());
  }

}
