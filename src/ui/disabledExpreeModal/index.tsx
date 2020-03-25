import * as React from 'react';
import * as _ from 'lodash';
import { Modal, Row, Select, Col, Input } from 'antd';

import './style.less';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import { ILayoutsState } from 'src/models/layoutsModel';
import { IDatasourceState, ID_KEY, TITLE_KEY, PID_KEY } from 'src/models/datasourceModel';
import { transformUiType } from 'src/utils';
import { createDoUpdateSelectedElementFieldsEffect, createDoUpdateSelectedLayoutFieldsEffect } from 'src/models/layoutsActions';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

const Option = Select.Option;

export interface IUiDisabledExpreeModalState {
  visible?: boolean;
  dataSourceId?: string;
  elementId?: string;
  value?: any;
  elements?: any[];
  target?: any;
  targetType?: string;
}

export interface IUiDisabledExpreeModalProps {
  layoutsState?: ILayoutsState<any>;
  datasourceState?: IDatasourceState;
  dispatch?: Dispatch<AnyAction>;
}

@connect(
  ({
    LAYOUTS,
    DATASOURCE,
  }: {
    LAYOUTS: ILayoutsState<any>,
    DATASOURCE: IDatasourceState,
  }) => {
    return {
      layoutsState: LAYOUTS,
      datasourceState: DATASOURCE,
    };
  }, null, null, {
    withRef: true,
  },
)
export class UiDisabledExpreeModal extends React.PureComponent<IUiDisabledExpreeModalProps, IUiDisabledExpreeModalState> {
  state: IUiDisabledExpreeModalState = {
    visible: false,
  };

  render() {
    const { visible } = this.state;
    return (
      <Modal
        title={t(I18N_IDS.TEXT_EDIT_DISABLED_CONDITIONS)}
        okText={t(I18N_IDS.TEXT_OK)}
        cancelText={t(I18N_IDS.TEXT_CANCEL)}
        maskClosable={false}
        visible={visible}
        onCancel={this._onCancle}
        onOk={this._onOk}
        destroyOnClose
      >
        { this._renderModalBody() }
      </Modal>
    );
  }

  open(target: any, targetType: string) {
    const { layoutsState, datasourceState } = this.props;
    const { layouts, config } = layoutsState;
    const { source } = datasourceState;
    const rootDatasource = _.find(source, s => !s[PID_KEY]);
    const { childrenElementsKey, elementIdKey } = config;
    const initState = this._getDisabledExpreeObj(target, targetType);
    const {
      dataSourceId,
      elementId,
      value,
    } = initState;
    const elements = _.chain(layouts)
      .map(l => {
        const layoutElementType = l.layoutElementType;
        if (
          layoutElementType === 'GRID'
          || layoutElementType === 'TOOLBAR'
        ) {
          return [];
        }
        const childrenElements = _.filter(l[childrenElementsKey] || [], e => {
          const layoutElementTypeE = e.layoutElementType;
          if (
            layoutElementTypeE !== 'ELEMENT'
          ) {
            return false;
          }
          if (!(e.fieldText || e.columnName)) {
            return false;
          }
          const uiTypeText = transformUiType(e.uiType);
          if (
            uiTypeText === 'static'
            || uiTypeText === 'button'
          ) {
            return false;
          }
          return true;
        });
        return childrenElements;
      })
      .flatten()
      .map(e => {
        const datasource = e.dataSourceId
          ?  _.find(source, s => s[ID_KEY] === e.dataSourceId)
          : rootDatasource;
        return {
          id: e[elementIdKey],
          fieldText: e.fieldText || e.columnName,
          dataSourceId: datasource && datasource[ID_KEY],
          datasourceName: datasource && datasource[TITLE_KEY],
        };
      })
      .value();
    this.setState({
      visible: true,
      elements,
      target,
      targetType,
      dataSourceId,
      elementId,
      value,
    });
  }

  close() {
    this.setState({
      visible: false,
    });
  }

  private _getLayoutElementAttrKey = (targetType?: string) => {
    const _targetType = targetType || this.state.targetType;
    switch (_targetType) {
      case 'element':
        return 'layoutElementAttr';
      case 'layout':
        return 'pageLayoutAttr';
      default:
        return '';
    }
  }

  private _getLayoutElementAttrObj = (target: any, targetType: string) => {
    const layoutElementAttr = target[this._getLayoutElementAttrKey(targetType)];
    let obj: any;
    try {
      obj = JSON.parse(layoutElementAttr) || {};
    } catch (e) {
      obj = {};
    }
    return obj;
  }

  private _getDisabledExpreeObj = (target: any, targetType: string) => {
    return this._getLayoutElementAttrObj(target, targetType).disabledExpree || {};
  }

  private _onCancle = () => {
    this.close();
  }

  private _onOk = () => {
    const {
      dataSourceId,
      elementId,
      value,
      target,
      targetType,
    } = this.state;
    const layoutElementAttrObj = this._getLayoutElementAttrObj(target, targetType);
    const disabledExpreeObj = layoutElementAttrObj.disabledExpree || {};
    const { dispatch } = this.props;
    if (
      disabledExpreeObj.dataSourceId === dataSourceId
      && disabledExpreeObj.elementId === elementId
      && disabledExpreeObj.value === value
    ) {
      this.close();
      return;
    }
    layoutElementAttrObj.disabledExpree = {
      dataSourceId: dataSourceId || '',
      elementId: elementId || '',
      value: value || '',
    };
    try {
      const layoutElementAttr = JSON.stringify(layoutElementAttrObj);
      switch (targetType) {
        case 'element':
          dispatch(createDoUpdateSelectedElementFieldsEffect({
            [this._getLayoutElementAttrKey(targetType)]: layoutElementAttr,
          }));
          break;
        case 'layout':
          dispatch(createDoUpdateSelectedLayoutFieldsEffect({
            [this._getLayoutElementAttrKey(targetType)]: layoutElementAttr,
          }));
        default:
          break;
      }
      this.close();
    } catch (e) {
      console.warn(e);
    }
  }

  private _renderModalBody = () => {
    const { visible } = this.state;
    if (!visible) {
      return null;
    }
    return this._renderContent();
  }

  private _renderContent = () => {
    // const { datasourceState } = this.props;
    // const {
    //   source,
    // } = datasourceState;
    const {
      // dataSourceId,
      elementId,
      value,
      elements,
    } = this.state;
    return (
      <div>
        {/* <Row>
          <Col span={8}>
            <label>选择数据源:</label>
          </Col>
          <Col span={16}>
            <Select
              size="small"
              allowClear
              style={{ width: '100%' }}
              value={dataSourceId}
              onChange={this._onDataSourceIdChange}
            >
              {_.map(source, s => (
                <Option title={s[TITLE_KEY]} key={s[ID_KEY]} value={s[ID_KEY]}>
                  {s[TITLE_KEY]}
                </Option>
              ))}
            </Select>
          </Col>
        </Row> */}
        <Row>
          <Col span={8}>
            <label>{t(I18N_IDS.TEXT_SELECT_FIELD)}:</label>
          </Col>
          <Col span={16}>
            <Select
              size="small"
              allowClear
              style={{ width: '100%' }}
              value={elementId}
              onChange={this._onElementIdChange}
            >
              {_.map(elements, e => {
                const title = `${e.fieldText} - ${e.datasourceName}`;
                return <Option title={title} key={e.id} value={e.id}>
                  {title}
                </Option>;
              })}
            </Select>
          </Col>
        </Row>
        <Row>
        <Col span={8}>
          <label>{t(I18N_IDS.TEXT_CONDITION_VALUE)}:</label>
          </Col>
          <Col span={16}>
            <Input
              size="small"
              allowClear
              value={value}
              onChange={this._onValueChange}
            />
          </Col>
        </Row>
      </div>
    );
  }

  // private _onDataSourceIdChange = (id: string) => {
  //   // const { layoutsState, datasourceState } = this.props;
  //   // const { layouts, config } = layoutsState;
  //   // const {} = datasourceState;
  //   this.setState({
  //     dataSourceId: id,
  //     elementId: null,
  //   });
  // }

  private _onElementIdChange = (elementId: string, option: React.ReactElement<any>) => {
    console.log(option);
    const { elements } = this.state;
    const element = _.find(elements, e => e.id === elementId);
    this.setState({
      elementId,
      dataSourceId: element && element.dataSourceId,
    });
  }

  private _onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    this.setState({
      value,
    });
  }

}
