import * as React from 'react';
import { connect } from 'dva';

import './style.less';
import { Dispatch, AnyAction } from 'redux';
import { createSelectElementAction, createSelectLayoutEffect } from 'src/models/layoutsActions';

export interface IUiLink {
  target: string;
  type: 'layout' | 'element';
  dispatch?: Dispatch<AnyAction>;
}

export class UiLink extends React.PureComponent<IUiLink> {
  render() {
    return (
      <a
        className="editor-ui-link"
        href="javascript:void(0)"
        onClick={this._onClick}
      >
        {this.props.children}
      </a>
    );
  }

  private _onClick = () => {
    const { target, type, dispatch } = this.props;
    switch (type) {
      case 'element':
        dispatch(createSelectElementAction(target, {}, true));
        break;
      default:
        dispatch(createSelectLayoutEffect(target));
    }
  }
}

export const ConnectedUiLink = connect(UiLink);
