import * as React from 'react';
import * as _ from 'lodash';
import { connect } from 'dva';
import { Icon, message, Popover } from 'antd';
import { Dispatch, AnyAction } from 'redux';
import classnames from 'classnames';

import { ILayoutsState, ICreateLayouttsModelOptions } from 'src/models/layoutsModel';
import { createSelectElementAction } from 'src/models/layoutsActions';
import { createDragStartAction, createDragEndAction, createDragOverAction, createDropEffect } from 'src/models/dndActions';
import { delay } from 'rxjs/operators';
import { IDndState } from 'src/models/dndModel';

import './BaseElementComponent.less';
import { needBinding, renderHitArea } from 'src/utils';
import { EditorStatus } from 'src/config';
import { Location } from 'history';
import { IAppState, IDictsMap } from 'src/models/appModel';
import { IDatasource, IDatasourceState, ID_KEY, PID_KEY, BG_KEY } from 'src/models/datasourceModel';

export interface IBaseElementComponentProps {
  element: any;
  parentLayout?: any;
  labelUnitCount?: number;
  isComponentGroup?: boolean;

  dispatch?: Dispatch<AnyAction>;

  config?: ICreateLayouttsModelOptions;
  isSelected?: boolean;
  isDragging?: boolean;
  isDraggingOver?: boolean;

  rootElement?: string;

  dragSource?: any;
  dragSourceType?: string;

  renderLocked?: boolean;

  location?: Location;
  editorStatus?: EditorStatus;

  dicts?: IDictsMap;

  datasource?: IDatasource;

  /** 是否在 Reference 内 */
  isInReference?: boolean;

  [key: string]: any;
}

export class BaseElementComponent extends React.Component<IBaseElementComponentProps> {

  render() {
    return <></>;
  }

  shouldComponentUpdate(nextProps: IBaseElementComponentProps) {
    const { element, /* isSelected,  */isDragging, isDraggingOver, labelUnitCount, editorStatus, isInReference, datasource } = this.props;
    const {
      element: nextElement,
      /* isSelected: nextIsSelected, */
      isDragging: nextIsDragging,
      isDraggingOver: nextIsDraggingOver,
      labelUnitCount: nextLabelUnitCount,
      renderLocked,
      editorStatus: nextEditorStatus,
      isInReference: nextIsInReference,
      datasource: nextDatasource,
    } = nextProps;
    return !renderLocked && (
        nextElement !== element
        // || isSelected !== nextIsSelected
        || isDragging !== nextIsDragging
        || isDraggingOver !== nextIsDraggingOver
        || labelUnitCount !== nextLabelUnitCount
        || editorStatus !== nextEditorStatus
        || isInReference !== nextIsInReference
        || datasource !== nextDatasource
      );
  }

  protected _getDomRootId = (_element?: any) => {
    const { element, config } = this.props;
    const { elementIdKey } = config;
    const useElement = _element || element;
    return `editor-element-${useElement[elementIdKey]}`;
  }

  protected _selectElement = (event: React.MouseEvent) => {
    this._selectElementMethod(event);
  }

  protected _selectElementMethod(event: React.MouseEvent) {
    const { element, config, editorStatus, isInReference } = this.props;
    const { elementIdKey } = config;
    event.stopPropagation();
    if (editorStatus !== EditorStatus.EDIT) {
      return;
    }
    this.props.dispatch(createSelectElementAction(element[elementIdKey], { isInReference }, true));
  }

  protected _onDragStart = (event: React.DragEvent) => {
    const { isInReference } = this.props;
    if (isInReference) {
      event.preventDefault();
      event.stopPropagation();
      message.warn('引用布局不可编辑。');
      return;
    }
    const { elementIdKey } = this.props.config;
    const target = event.target as HTMLElement;
    event.dataTransfer.setDragImage(target, 0, 0);
    event.stopPropagation();
    console.log('[onDragStart]', this.props.element[elementIdKey]);
    this.props.dispatch(createDragStartAction(
      this.props.element,
      'element',
      false,
      true,
    ));
  }

  protected _onDragEnd = async (event: React.DragEvent) => {
    const { elementIdKey } = this.props.config;
    console.log('[onDragEnd]', this.props.element[elementIdKey]);
    event.stopPropagation();
    await delay(0);
    this.props.dispatch(createDragEndAction());
  }

  protected _onDragOver = (event: React.DragEvent) => {
    if (!this.props.dragSource) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const classList = (event.target as HTMLDivElement).classList;
    let position = -1;
    if (this.props.dragSourceType === 'property' || this.props.dragSourceType === 'method') {
      position = 0;
    } else if (classList.contains('editor-hit-bottom') || classList.contains('editor-hit-right')) {
      position = 1;
    }
    this.props.dispatch(createDragOverAction(
      this.props.element,
      'element',
      position,
    ));
  }

  protected _onDragLeave = (event: React.DragEvent) => {
    // console.log('[_onDragLeave]', this.props.element[elementIdKey]);
  }

  protected _onDrop = (event: React.DragEvent) => {
    const { config, isInReference, element } = this.props;
    const { elementIdKey } = config;
    console.log('[onDrop]', element[elementIdKey]);
    event.preventDefault();
    event.stopPropagation();
    if (isInReference) {
      message.warn('引用布局不可编辑。');
      return;
    }
    this.props.dispatch(createDropEffect());
  }

  protected _getLabelColClass = () => {
    const { isComponentGroup } = this.props;
    const col = isComponentGroup ? 0 : this.props.labelUnitCount || 0;
    return `col-md-${col} col-xs-${col} col-sm-${col} col-lg-${col}${isComponentGroup ? ' sr-only' : ''}`;
  }

  protected _getInputDivColClass = () => {
    const { isComponentGroup } = this.props;
    const col = isComponentGroup ? 0 : 12 - (this.props.labelUnitCount || 0);
    return `col-md-${col} col-xs-${col} col-sm-${col} col-lg-${col}`;
  }

  protected _createRootProps = (extendsClassNames?: any[], draggable = true, droppable = true) => {
    const { isDragging, isDraggingOver, dragSourceType, element, editorStatus } = this.props;
    const bindingType = needBinding(element);
    let isNotBinding = false;
    const isDraggingBinding = isDraggingOver && (dragSourceType === 'property' || dragSourceType === 'method');
    let cantBind = false;
    switch (bindingType) {
      case 'method':
        isNotBinding = !element.methodName;
        cantBind = isDraggingBinding && dragSourceType !== 'method';
        break;
      case 'property':
        isNotBinding = !element.propertyName;
        cantBind = isDraggingBinding && dragSourceType !== 'property';
        break;
      default:
        cantBind = true;
        break;
    }
    return ({
      id: this._getDomRootId(),
      onClick: this._selectElement,
      draggable: draggable && editorStatus === EditorStatus.EDIT,
      onDragStart: draggable ? this._onDragStart : undefined,
      onDragEnd: draggable ? this._onDragEnd : undefined,
      onDragOver: droppable ? this._onDragOver : undefined,
      onDragLeave: droppable ? this._onDragLeave : undefined,
      onDrop: droppable ? this._onDrop : undefined,
      className: classnames(
        'editor-base-element',
        ...extendsClassNames,
        {
          'editor-dragging-over': isDraggingOver,
          'editor-dragging-source': isDragging,
          'editor-dragging-binding': isDraggingBinding,
          'editor-can-not-bind': cantBind,
          'editor-not-bind': isNotBinding,
        },
      ),
      style: {
        position: 'relative',
        backgroundColor: this._getDatasourceBgColor(),
      } as React.CSSProperties,
    });
  }

  protected _getDatasourceBgColor = () => {
    const { datasource } = this.props;
    const bgColor = datasource && datasource[BG_KEY];
    if (
      !bgColor
      || bgColor === 'transparent'
      || bgColor === 'TRANSPARENT'
      || _.endsWith(bgColor, ', 0)')
    ) {
      return null;
    }
    return bgColor;
  }

  protected _getButtonStyle = (_element?: any) => {
    const element = _element || this.props.element;
    const { rootElement } = this.props;
    const buttonStyle = element['buttonStyle'] || element.columnStyle || element.lableStyle || 'button-default';
    return classnames(
      buttonStyle,
      {
        'editor-is-sub-button': rootElement && rootElement['layoutElementType'] === 'BUTTON_GROUP' && !element['isShowLable'],
      },
    );
  }

  protected _renderSettings = () => {
    if (this.props.editorStatus !== EditorStatus.EDIT) {
      return null;
    }
    return (
      <div className="editor-settings">
        <a href="javascript:void(0)" onClick={this.clickSettings}>
          <Icon type="setting" theme="filled" />
        </a>
      </div>
    );
  }

  protected _renderHitArea = (positions?: Array<'top' | 'bottom' | 'left' | 'right'>) => {
    if (this.props.editorStatus !== EditorStatus.EDIT) {
      return null;
    }
    return renderHitArea(positions);
  }

  protected clickSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
  }

  protected _getDisplayValue = () => {
    const { element, dicts } = this.props;
    if (!element) {
      return '';
    }
    if (element.defaultValue) {
      return element.defaultValue;
    }
    if (element.initValueType) {
      const items = dicts.initValueType;
      const item = _.find(items, d => d.key === element.initValueType);
      return item ? `{{${item.value}}}` : '';
    }
    return '';
  }

  protected _renderRemark = () => {
    const { element } = this.props;
    const { remark } = element;
    if (!remark) {
      return null;
    }
    const content = (
      <div className="editor-element-remark-popover">
        { _.map(remark.split('\n'), (str, i) => {
          return (
            <React.Fragment key={i}>
              <span>{str}</span>
              <br />
            </ React.Fragment>
          );
        }) }
      </div>
    );
    return (
      <Popover
        title="备注"
        content={content}
        trigger="click"
        overlayClassName="editor-element-remark-overlay"
      >
        <span
          className="editor-element-remark-icon"
          onClick={e => e.stopPropagation()}
        />
      </Popover>
    );
  }

}

export const connector = createConnector();

export function createConnector(extendCb?: (state: any, props: IBaseElementComponentProps) => any) {
  return connect(
    (state: {
      LAYOUTS: ILayoutsState<any>,
      DND: IDndState,
      APP: IAppState,
      DATASOURCE: IDatasourceState,
    }, props: IBaseElementComponentProps) => {
      const { LAYOUTS, DND, APP } = state;
      const { element } = props;
      let datasource: IDatasource;
      if (state.DATASOURCE && state.DATASOURCE.source) {
        if (element.dataSourceId) {
          datasource = _.find(state.DATASOURCE.source, s => s[ID_KEY] === element.dataSourceId);
        } else {
          datasource = _.find(state.DATASOURCE.source, s => !s[PID_KEY]);
        }
      }
      return {
        config: LAYOUTS.config,
        isSelected: element[LAYOUTS.config.elementIdKey] === LAYOUTS.selectedElement,
        isDragging: DND.dragSourceType === 'element' && DND.dragSource[LAYOUTS.config.elementIdKey] === element[LAYOUTS.config.elementIdKey],
        isDraggingOver: DND.target === element,
        dragSource: DND.dragSource,
        dragSourceType: DND.dragSourceType,
        rootElement: LAYOUTS.rootElement,
        renderLocked: LAYOUTS.isTemp,
        location: APP.location,
        editorStatus: APP.editorStatus,
        dicts: APP.dicts,
        datasource,
        ...(extendCb ? extendCb(state, props) : {}),
      };
    },
  );
}
