import * as React from 'react';
import classnames from 'classnames';
import { Icon, message } from 'antd';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

export interface ILayoutSignProps {
  isCollpased: boolean;
  uiTypeText: string;
  styleClassText: string;
  isParent: boolean;
  seqNo: number;
  isInReference?: boolean;

  onToggleIsCollpased?: () => void;
  onToggleIsParent?: () => void;
}

export class LayoutSign extends React.PureComponent<ILayoutSignProps> {
  render() {
    const { isCollpased, uiTypeText, styleClassText, isParent/* , seqNo */ } = this.props;
    return (
      <div className="editor-sign" >
        <a href="javascript:void(0)" className="editor-collpase" onClick={this._clickToggleIsCollpase}>
          <Icon type={ isCollpased ? 'plus-square' : 'minus-square'} />
        </a>
        <span className="editor-ui-type">
          {/* [{seqNo}] */}
          {uiTypeText}
          {
            styleClassText
              ? <span className="editor-class-display">{styleClassText}</span>
              : null
          }
        </span>
        <span
          className={classnames('editor-parent', { 'editor-parent-false': !isParent })}
          onClick={this._clickToggleIsParent}
        >
          {isParent ? t(I18N_IDS.SIGN_PARENT) : t(I18N_IDS.SIGN_NON_PARENT)}
        </span>
      </div>
    );
  }

  private _clickToggleIsCollpase = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { onToggleIsCollpased } = this.props;
    if (onToggleIsCollpased) {
      onToggleIsCollpased();
    }
  }

  private _clickToggleIsParent = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { onToggleIsParent, isInReference } = this.props;
    if (isInReference) {
      message.warn('引用布局不可编辑。');
      return;
    }
    if (onToggleIsParent) {
      onToggleIsParent();
    }
  }
}
