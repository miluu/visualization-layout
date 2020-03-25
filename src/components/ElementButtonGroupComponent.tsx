import * as React from 'react';
import * as _ from 'lodash';
import classnames from 'classnames';

import {
  BaseElementComponent,
  IBaseElementComponentProps,
  createConnector,
} from './BaseElementComponent';
import { registGlobalComponentClass, getLayoutChildrenByParentElement, isEqual } from 'src/utils';

import './ElementButtonGroupComponent.less';
import { ILayoutsState } from 'src/models/layoutsModel';
import { createSetRootElementAction, createAddLayoutToParentElementIfEmptyEffect } from 'src/models/layoutsActions';
import { createLayout } from 'src/routes/Visualization/config';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

@createConnector(
  ({ LAYOUTS }: {LAYOUTS: ILayoutsState<any>}, { element }: IBaseElementComponentProps) => {
    const { config, layouts } = LAYOUTS;
    const childrenLayouts = getLayoutChildrenByParentElement(layouts, element, config.elementIdKey, config.layoutElementIdKey, config.parentCellNameKey, config.orderKey);
    const groupButtons = childrenLayouts && childrenLayouts.length
      ? childrenLayouts[0][config.childrenElementsKey]
      : [];
    return {
      groupButtons,
    };
  },
)
export class ElementButtonGroupComponent extends BaseElementComponent {
  render() {
    const groupButtons = this.props.groupButtons || [];
    return (
      <div
        {...this._createRootProps(['editor-element-button-group', 'group'])}
      >
        <div className="primaryButtonGroup" style={{ display: 'inline-block' }}>
          {
            !groupButtons.length
              ? <button type="button" className="button-default"> {t(I18N_IDS.TEXT_NOT_SETTING)} </button>
              : _.map(groupButtons, (item, i) => (
                  item['isShowLable']
                    ? <button
                        key={i}
                        type="button"
                        className={classnames([this._getButtonStyle(item), { 'is-sub-button': !item.isShowLable }])}
                      >
                        {item['methodDesc'] || item['fieldText'] || item['columnName']}
                      </button>
                    : null
                ))
          }
          <button className={classnames('groupActionButtonRight', this._getButtonStyle())} >
            <span />
            <i className="fi fi-caret" />
          </button>

        </div>

        {this._renderHitArea(['right'])}

        {this._renderSettings()}

        {this._renderRemark()}

      </div>

    );
  }

  shouldComponentUpdate(nextProps: IBaseElementComponentProps) {
    const { groupButtons } = this.props;
    const {
      groupButtons: nextGroupButtons,
      renderLocked,
    } = nextProps;
    return !renderLocked && (super.shouldComponentUpdate(nextProps) || isEqual(groupButtons, nextGroupButtons));
  }

  clickSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { dispatch, element } = this.props;
    dispatch(createSetRootElementAction(element, `【${t(I18N_IDS.CONTROL_BUTTON_GROUP)}】${t(I18N_IDS.TEXT_SETTING)}`, true));
    dispatch(createAddLayoutToParentElementIfEmptyEffect(
      createLayout({
        layoutContainerType: 'DIV',
        layoutElementType: 'TOOLBAR',
        isParent: '',
        layoutBoName: element.layoutBoName,
      }),
      element,
    ));
  }

}

registGlobalComponentClass('ElementButtonGroupComponent', ElementButtonGroupComponent);
