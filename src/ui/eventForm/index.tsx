import * as React from 'react';
import * as _ from 'lodash';
import {
  Form,
  Switch,
} from 'antd';

import './style.less';
import { connect } from 'dva';
import { IAppState, IDictsMap } from 'src/models/appModel';
import { ILayoutsState } from 'src/models/layoutsModel';
import { findElementById, findLayoutByCellName, isEqual } from 'src/utils';
import { Dispatch, AnyAction } from 'redux';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { IFormItemOption, renderFormItem } from 'src/utils/forms';
import { createUpdateSelectedItemEventEffect } from 'src/models/layoutsActions';
import { t, i18n } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';
// import { createUpdateEventEffect } from 'src/models/layoutsActions';

const formItemsOpts: IFormItemOption[] = [
  {
    property: 'execType',
    label: t(I18N_IDS.LABEL_EXEC_TYPE),
    type: 'select',
    dictName: 'LayoutExecType',
  },
  {
    property: 'execContent',
    label: t(I18N_IDS.LABEL_EXEC_CONTENT),
  },
  {
    property: 'callBack',
    label: t(I18N_IDS.LABEL_CALL_BACK),
  },
];

export interface IControlEvent {
  /** 事件类型 */
  eventType?: string;
  /** 执行类型 */
  execType?: string;
  /** 回调JS方法 */
  callBack?: string;
  /** 执行内容 */
  execContent?: string;
  /** 修改状态 */
  rowStatus?: number;
  /** baseViewId */
  baseViewId?: string;
  /** 事件ID */
  ipfCcmBoControlEventId?: string;
  /** 所属 Element Id */
  ipfCcmBoPgLoElementId?: string;
  /** 所属 Layout Id */
  ipfCcmBoPageLayoutId?: string;
  /** 是否启用 */
  __isActive?: boolean;
}

export interface IControlEventMap {
  [eventType: string]: IControlEvent;
}

export interface IUiEventFormProps {
  dispatch?: Dispatch<AnyAction>;
  form?: WrappedFormUtils;

  dicts?: IDictsMap;
  eventTypes?: any[];
  eventMap?: IControlEventMap;
  selectedItem?: string;
}

@connect(
  ({ APP, LAYOUTS }: {
    APP: IAppState,
    LAYOUTS: ILayoutsState<any>,
  }) => {
    const { layouts, selectedElement, selectedLayout, config } = LAYOUTS;
    const dicts =  APP && APP.dicts || {};
    const selectedItemType = selectedElement ? 'element' : (selectedLayout ? 'layout' : null);
    let dictKey: string;
    let events: IControlEvent[];
    let selectedItem;
    let eventsKey: string;
    const eventMap: IControlEventMap = {};
    switch (selectedItemType) {
      case 'element':
        dictKey = 'EventType';
        eventsKey = config.elementEventsKey;
        selectedItem = findElementById(layouts, selectedElement, config.childrenElementsKey, config.elementIdKey);
        break;
      case 'layout':
        dictKey = 'LayoutEventType';
        eventsKey = config.layoutEventsKey;
        selectedItem = findLayoutByCellName(layouts, selectedLayout, config.cellNameKey);
        break;
      default:
        break;
    }
    const eventTypes = dictKey && (dicts[dictKey] || []) || [];
    events = selectedItem && selectedItem[eventsKey] || [];
    const groupedEventList = _.groupBy(events, 'eventType');
    _.forEach(groupedEventList, (v, k) => eventMap[k] = v[0]);

    return {
      eventTypes,
      eventMap,
      dicts,
      selectedItem,
    };
  },
)
@(Form.create({
  name: 'event_form',
}) as any)
export class UiEventForm extends React.Component<IUiEventFormProps> {
  render() {
    console.log('[UiEventForm#render]');
    const { eventTypes, eventMap, form, dicts, selectedItem } = this.props;
    return (
      <div className="editor-property-form">
        <Form autoComplete="off">
          {
            selectedItem
            ? _.map(eventTypes, eventType => {
              const controlEvent = eventMap[eventType.key];
              const isActive = this._isActive(controlEvent);
              return (
                <div  key={eventType.key} className="editor-event-form-item">
                  <div className="editor-event-type">
                    <Switch
                      size="small"
                      checked={isActive}
                      onChange={checked => this._onChange({ __isActive: checked }, eventType.key)}
                    />
                    <label>{
                      i18n.lng.indexOf('zh') < 0
                        ? _.capitalize(eventType.key).replace(/_/g, ' ')
                        : eventType.value
                    }</label>
                  </div>
                  {
                    isActive
                      ? (
                        <div className="editor-event-form-field">
                          {
                            _.map(formItemsOpts, item => {
                              const opt = _.assign({}, item, {
                                property: `${eventType.key}.${item.property}`,
                              });
                              return renderFormItem(
                                form,
                                opt,
                                eventMap,
                                dicts,
                                (__, value) => this._onChange({ [item.property]: value }, eventType.key),
                              );
                            })
                          }
                        </div>
                      )
                      : null
                  }
                </div>
              );
            })
            : <p className="editor-no-select">{t(I18N_IDS.PANEL_TEXT_NOTHING_SELECTED)}</p>
          }
        </Form>
      </div>
    );
  }

  shouldComponentUpdate(nnextProps: IUiEventFormProps) {
    const { dicts, eventMap, eventTypes } = this.props;
    const {
      dicts: nextDicts,
      eventMap: nextEventMap,
      eventTypes: nextEventTypes,
    } = nnextProps;
    const keys = _.keys(eventMap);
    const nextKeys = _.keys(nextEventMap);
    return dicts !== nextDicts
      || eventTypes !== nextEventTypes
      || !isEqual(keys, nextKeys)
      || !isEqual(
        _.map(keys, k => eventMap[k]),
        _.map(nextKeys, k => nextEventMap[k]),
      );
  }

  componentWillReceiveProps(nextProps: IUiEventFormProps) {
    const nextEventMap = nextProps.eventMap;
    const eventMap = this.props.eventMap;
    const keys = _.keys(eventMap);
    const nextKeys = _.keys(nextEventMap);
    if (
      !isEqual(keys, nextKeys)
      || !isEqual(
        _.map(keys, k => eventMap[k]),
        _.map(nextKeys, k => nextEventMap[k]),
      )
    ) {
      this.props.form.resetFields();
    }
  }

  private _onChange = (changes: any, eventType: string) => {
    console.log('[UiEventForm#_onChange]', changes, eventType);
    this.props.dispatch(createUpdateSelectedItemEventEffect(changes, eventType));
  }

  private _isActive = (event: IControlEvent) => {
    if (!event) {
      return false;
    }
    return event.__isActive || _.isUndefined(event.__isActive);
  }
}
