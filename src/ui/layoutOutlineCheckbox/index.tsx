import * as React from 'react';
import { connect } from 'dva';

import './style.less';
import { Dispatch, AnyAction } from 'redux';
import { ILayoutsState } from 'src/models/layoutsModel';
import { Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { createSetStateValueAction } from 'src/models/layoutsActions';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

export interface IUiLayoutOutlineCheckbox {
  checked?: boolean;
  dispatch?: Dispatch<AnyAction>;
}

@connect(({
  LAYOUTS,
}: {
  LAYOUTS: ILayoutsState<any>,
}) => {
  return {
    checked: LAYOUTS.isOnlyShowSelectedLayoutOutline,
  };
})
export class UiLayoutOutlineCheckbox extends React.PureComponent<IUiLayoutOutlineCheckbox> {
  render() {
    return (
      <div className="editor-ui-outline-checkbox">
        <Checkbox
          checked={this.props.checked}
          onChange={this._onChange}
        >
          {t(I18N_IDS.PANEL_TEXT_ONLY_SELECTED_BORDER)}
        </Checkbox>
      </div>
    );
  }

  private _onChange = (e: CheckboxChangeEvent) => {
    const checked = e.target.checked;
    this.props.dispatch(createSetStateValueAction({
      isOnlyShowSelectedLayoutOutline: checked,
    }, true));
  }

}
