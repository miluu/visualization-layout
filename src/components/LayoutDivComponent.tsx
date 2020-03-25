import * as React from 'react';
import * as _ from 'lodash';
import {
  message, Button,
} from 'antd';

import { BaseLayoutComponent, connector } from './BaseLayoutComponent';
import { registGlobalComponentClass, getLayoutChildrenByParentElement, isEqual, createId, propertiesFilter, isGroupAble, getControlDefaultSetting } from 'src/utils';

import './LayoutDivComponent.less';
import { openToolbarSettingsModal, openFormSettingsModal, openFormQuickSettingsModal, openPrototypeToolbarSettingsModal, openGridSettingsModal } from 'src/utils/modal';
import produce from 'immer';
import { createUpdateLayoutsAction, createAddLayoutsAction, createRemoveLayoutsEffect, createLoadReferencePageLayoutsEffect } from 'src/models/layoutsActions';
import { createLayout, createElement } from 'src/routes/Visualization/config';
import { cellNameManager } from 'src/utils/cellName';
import I18N_IDS from 'src/i18n/ids';
import { t } from 'src/i18n';

/**
 * 容器类型：DIV
 */
@connector
export class LayoutDivComponent extends BaseLayoutComponent {

  render() {
    const { layout } = this.props;
    const { cellNameKey } = this.props.config;
    console.log(`[LayoutDivComponent#render] ${layout ? layout[cellNameKey] : ''}`);
    return (
      <div
        {...this._createRootProps(['editor-layout-div', '__clearfix'])}
      >

        {this._renderReferenceButton()}

        {this._renderChildrenCase()}

        {this._renderLayoutSign()}

        {this._renderHitArea()}

        {this._renderDivSettings()}

        {this._renderRemark()}
      </div>
    );
  }

  protected clickSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { layout } = this.props;
    switch (layout.layoutElementType) {
      case 'TOOLBAR':
        this._clickToolbarSettings();
        break;
      case 'ELEMENT':
        this._clickFormSettings();
      default:
        break;
    }
  }

  private _renderReferenceButton() {
    const { layout, location } = this.props;
    if (!(
      location.pathname === '/prototype'
      && layout.layoutElementType === 'REFERENCE'
    )) {
      return null;
    }
    if (
      layout.__referenceLoadStatus === 'LOADED'
      || layout.__referenceLoadStatus === 'LOADING'
    ) {
      return null;
    }
    if (!layout.referenceId) {
      return <span className="editor-ui-reference-tip">{t(I18N_IDS.TEXT_REFRENERCE_PAGE_NO_SETTING)}</span>;
    }
    return (
      <>
        <Button
          className="editor-ui-reference-button"
          size="small"
          type="default"
          onClick={this._loadReferencePageLayouts}
        >{t(I18N_IDS.TEXT_LOAD_REFRENERCE_PAGE)}...</Button>
      </>
    );
  }

  private _loadReferencePageLayouts = () => {
    const { layout, dispatch, config } = this.props;
    const { referenceId } = layout;
    if (!referenceId) {
      return;
    }
    dispatch(createLoadReferencePageLayoutsEffect(referenceId, layout[config.cellNameKey]));
  }

  private _renderChildrenCase = () => {
    const { layout, config } = this.props;

    if (
      layout.groupTitle
      && layout.layoutContainerType !== 'STEP'
      && layout.layoutContainerType !== 'PANEL_GROUP'
      && layout.layoutContainerType !== 'DYNAMIC_GROUP'
      && layout.layoutContainerType !== 'FOLD_GROUP'
    ) {
      return this._renderGroupTitleChildren();
    }

    const childrenElements = layout[config.childrenElementsKey];
    if (
      layout.layoutContainerType === 'DIV'
      && !layout.layoutElementType
      && childrenElements && childrenElements.length === 2
      && isGroupAble(childrenElements[0].uiType)
      && isGroupAble(childrenElements[1].uiType)
    ) {
      return this._renderControlGroupChildren();
    }

    return this._renderChildren();
  }

  private _renderControlGroupChildren = () => {
    const { layout, config } = this.props;
    const childrenElements = layout[config.childrenElementsKey];
    const labelUnitCount = _.isNumber(layout.labelUnitCount) ? layout.labelUnitCount : 4;
    const labels = _.chain(childrenElements)
      .map(e => e.isShowLable ? e.fieldText || e.columnName : null)
      .compact()
      .value();
    const controlConnector: string = childrenElements[1].controlConnector || '';

    return (
      <div className="row">
        <div className={`col-xs-${labelUnitCount}`}>
          <label>{labels.join(controlConnector)}：</label>
        </div>
        <div className={`col-xs-${12 - labelUnitCount}`}>
          <div className="form-inline">
            {this._renderChildren(true)}
          </div>
        </div>
      </div>
    );
  }

  private _clickToolbarSettings = () => {
    const { config, layout, properties, methods, layouts, location, rootElement, defaultSetting } = this.props;

    let childrenButtons: any[] = layout[config.childrenElementsKey] || [];
    childrenButtons = _.map(childrenButtons, e => {
      if (e.layoutElementType === 'BUTTON_GROUP') {
        return produce(e, draft => {
          const childrenLayouts = getLayoutChildrenByParentElement(
            layouts,
            e,
            config.elementIdKey,
            config.layoutElementIdKey,
            config.parentCellNameKey,
            config.orderKey,
          );
          const groupButtons = childrenLayouts && childrenLayouts.length
            ? childrenLayouts[0][config.childrenElementsKey]
            : [];
          draft.__groupButtons = groupButtons || [];
        });
      }
      return e;
    });

    const onSubmit = (list: any[]) => {
      if (isEqual(childrenButtons, list)) {
        console.log('[_clickToolbarSettings onSubmit] 没有变化...');
        return;
      }
      const newChildrenButtons = _.map(list, (item, i) => {
        const isNew = !_.find(childrenButtons, button => button[config.elementIdKey] === item[config.elementIdKey]);
        return produce(item, draft => {
          draft[config.elementOrderKey] = i + config.elementStartIndex;
          if (isNew) {
            const buttonDefaultSetting = getControlDefaultSetting(defaultSetting, 'T', item.uiType);
            _.assign(draft, buttonDefaultSetting);
          }
        });
      });
      const newLayout = produce(layout, draft => {
        draft[config.childrenElementsKey] = newChildrenButtons;
      });
      this.props.dispatch(createUpdateLayoutsAction(
        [newLayout],
        true,
        true,
      ));
    };

    if (location.pathname === '/prototype') {
      openPrototypeToolbarSettingsModal({
        config,
        layout,
        childrenButtons,
        showButtonGroupButton: !rootElement,
        onSubmit: (__, list) => {
          onSubmit(list);
        },
      });
      return;
    }

    openToolbarSettingsModal({
      config,
      layout,
      childrenButtons,
      properties,
      showButtonGroupButton: !rootElement,
      methods,
      onSubmit: (__, ___, list) => {
        onSubmit(list);
      },
    });

  }

  private _clickFormSettings = (acceptCols?: number[]) => {
    const { layout, location, rootElement, dicts } = this.props;
    const rootLayoutElementType = rootElement && rootElement.layoutElementType;
    if (rootLayoutElementType === 'DYNA_COMB_QUERY') {
      this._clickCombQuerySettings();
      return;
    }
    const editable = location.pathname === '/prototype';
    const showSelect = location.pathname === '/datasourceBinding' || location.pathname === '/';
    openFormSettingsModal({
      layout,
      acceptCols,
      editable,
      rangeTypeDicts: showSelect ? dicts && dicts['rangeType'] : null,
    });
  }

  private _renderGroupTitleChildren() {
    const { layout } = this.props;
    return (
      <div className="form-group form-group-padding __clearfix">
        <label className={`col-xs-${layout.labelUnitCount} control-label`}>{layout.groupTitle || layout.elementName}：</label>
        <div className={`col-xs-${12 - layout.labelUnitCount}`} >
          <div className="form-inline">
            {this._renderChildren()}
          </div>
        </div>
      </div>
    );
  }

  private _renderDivSettings = () => {
    const { layout, rootElement, location } = this.props;
    const rootLayoutElementType = rootElement && rootElement.layoutElementType;
    switch (layout.layoutElementType) {
      case 'TOOLBAR':
      case 'ELEMENT':
        switch (rootLayoutElementType) {
          case 'DYNA_MORE_QUERY':
            const options = [
              {
                display: '快速配置',
                onClick: () => {
                  this._clickMoreQueryQuickSettings();
                },
              },
              {
                display: '高级配置',
                onClick: () => {
                  this._clickFormSettings([1]);
                },
              },
            ];
            if (location.pathname === '/' || location.pathname === '/datasourceBinding') {
              options.push({
                display: '一键配置',
                onClick: () => {
                  this._clickMoreQueryAutoSettings();
                },
              });
            }
            return this._renderSettings(options);
          default:
            return this._renderSettings();
        }
      default:
        return null;
    }
  }

  private _clickMoreQueryQuickSettings = () => {
    const { config, layout, properties, location } = this.props;
    const childrenLayoutsOrigin = this._getChildrenLayouts();
    const childrenLayouts = _.map(childrenLayoutsOrigin, cl => {
      return produce(cl, draft => {
        draft[config.tempChildrenLayoutsKey] = this._getChildrenLayouts(cl);
      });
    });

    const isPrototype = location.pathname === '/prototype';

    openFormQuickSettingsModal({
      config,
      layout,
      properties,
      childrenLayouts,
      isPrototype,
      onSubmit: (__, ___, newChildrenLayouts) => {
        // const willRemoveLayouts: any[] = [];
        const willAddLayouts: any[] = [];
        const willUpdateLayouts: any[] = [];
        const willRemoveLayouts: any[] = _.differenceBy(childrenLayoutsOrigin, newChildrenLayouts, config.cellNameKey);
        _.forEach(newChildrenLayouts, (nl, i) => {
          const oldLayout = _.find(childrenLayoutsOrigin, ol => nl[config.cellNameKey] === ol[config.cellNameKey]);
          if (oldLayout) {
            // 已有的 layout，如果顺序变化则更新顺序字段
            if (i !== oldLayout[config.orderKey]) {
              willUpdateLayouts.push(produce(oldLayout, draft => {
                draft[config.orderKey] = i;
              }));
            }
          } else {
            // 否则是新增加的 layout
            let col = nl[config.tempChildrenLayoutsKey][0];
            const row = produce(nl, draft => {
              delete draft[config.tempChildrenLayoutsKey];
              draft[config.orderKey] = i;
              draft[config.layoutIdKey] = createId();
              draft[config.layoutElementIdKey || config.elementIdKey] = layout[config.layoutElementIdKey || config.elementIdKey];
            });
            willAddLayouts.push(row);
            if (col) {
              col = produce(col, draft => {
                draft[config.orderKey] = 0;
                draft[config.layoutIdKey] = createId();
                draft[config.layoutElementIdKey || config.elementIdKey] = layout[config.layoutElementIdKey || config.elementIdKey];
                const element = draft[config.childrenElementsKey][0];
                if (element) {
                  element[config.elementOrderKey] = config.elementStartIndex;
                  element[config.elementIdKey] = createId();
                  element.isVisible = 'X';
                  element.isShowLable = 'X';
                  element.layoutElementType = layout.layoutElementType;
                }
              });
              willAddLayouts.push(col);
            }
          }
        });
        console.log('[openFormQuickSettingsModal] onSubmit', { willAddLayouts, willUpdateLayouts });
        this.props.dispatch(createRemoveLayoutsEffect(_.map(willRemoveLayouts, l => l[config.cellNameKey]), false));
        this.props.dispatch(createAddLayoutsAction(willAddLayouts, false, true));
        this.props.dispatch(createUpdateLayoutsAction(willUpdateLayouts, true, true));
      },
    });

  }

  private _clickMoreQueryAutoSettings = () => {
    const { config, layout, properties } = this.props;
    const { cellNameKey,
      orderKey,
      parentCellNameKey,
      elementIdKey,
      layoutIdKey,
      childrenElementsKey,
      elementStartIndex,
      elementOrderKey,
    } = config;
    if (!layout.layoutBoName) {
      message.warn('请先配置页面布局业务对象名称。');
    }
    const childrenLayouts = this._getChildrenLayouts();
    const willAddLayouts: any[] = [];
    const willRemoveLayouts = childrenLayouts;
    const layoutProperties = propertiesFilter(properties, layout);
    console.log('[_clickMoreQueryAutoSettings]', willAddLayouts, willRemoveLayouts, layoutProperties);
    _.forEach(layoutProperties, (p, i) => {
      const rowCellName = cellNameManager.create(layout[cellNameKey]);
      const colCellName = cellNameManager.create(rowCellName);
      const row = createLayout({
        layoutContainerType: 'DIV',
        styleClass: 'row',
        isParent: 'X',
        [orderKey]: i,
        [cellNameKey]: rowCellName,
        [parentCellNameKey]: layout[cellNameKey],
        [elementIdKey]: layout[elementIdKey],
        [layoutIdKey]: createId(),
      });
      const col = createLayout({
        layoutContainerType: 'DIV',
        styleClass: 'row',
        unitCount: 12,
        isParent: '',
        [orderKey]: 0,
        [cellNameKey]: colCellName,
        [parentCellNameKey]: rowCellName,
        [elementIdKey]: layout[elementIdKey],
        [layoutIdKey]: createId(),
        [childrenElementsKey]: [createElement({
          [elementOrderKey]: elementStartIndex,
          [config.elementIdKey]: createId(),
          isVisible: 'X',
          isShowLable: 'X',
          layoutElementType: layout.layoutElementType,
          layoutBoName: layout.layoutBoName,
          propertyName: p.propertyName,
          columnName: p.fieldText,
          uiType: p.uiType || '01',
          conditionType: layout.conditionType,
        })],
      });
      willAddLayouts.push(row, col);
    });
    if (willAddLayouts.length || willRemoveLayouts.length) {
      this.props.dispatch(createRemoveLayoutsEffect(_.map(willRemoveLayouts, l => l[cellNameKey]), false));
      this.props.dispatch(createAddLayoutsAction(willAddLayouts, true, true));
    }
  }

  private _clickCombQuerySettings = () => {
    const { config, layout, properties, methods, location } = this.props;

    const onSubmit = (list: any[]) => {
      const childrenElements = layout[config.childrenElementsKey];
      if (isEqual(childrenElements, list)) {
        console.log('[_clickCombQuerySettings onSubmit] 没有变化。');
        return;
      }
      const newChildrenElements = _.map(list, (item, i) => {
        return produce(item, draft => {
          draft[config.elementOrderKey] = i + config.elementStartIndex;
        });
      });
      const newLayout = produce(layout, draft => {
        draft[config.childrenElementsKey] = newChildrenElements;
      });
      this.props.dispatch(createUpdateLayoutsAction(
        [newLayout],
        true,
        true,
      ));
    };
    const isPrototype = location.pathname === '/prototype';
    openGridSettingsModal({
      config,
      layout,
      properties,
      methods,
      isPrototype,
      onSubmit: (__, ___, list) => {
        onSubmit(list);
      },
      showMethodSelect: false,
    });
  }

}

registGlobalComponentClass('LayoutDivComponent', LayoutDivComponent);
