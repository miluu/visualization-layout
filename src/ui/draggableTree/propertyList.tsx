import * as React from 'react';
import * as _ from 'lodash';
import { UiDraggableTree } from '.';
import { connect } from 'dva';
import { ILayoutsState, IPropertiesMap } from 'src/models/layoutsModel';
import { Dispatch, AnyAction } from 'redux';
import { delay } from 'src/utils';
import { createDragEndAction, createDragStartAction } from 'src/models/dndActions';

export interface IUiDroplineProps {
  properties?: IPropertiesMap;
  dispatch?: Dispatch<AnyAction>;
  keywords?: string;
}

@connect(
  ({ LAYOUTS }: {
    LAYOUTS: ILayoutsState<any>,
  }) => ({
    properties: LAYOUTS.properties,
  }),
)
export class UiPropertyList extends React.PureComponent<IUiDroplineProps> {
  render() {
    const { properties, keywords } = this.props;
    let filterProperties: IPropertiesMap = properties;
    if (keywords) {
      filterProperties = _.mapValues(properties, (list) => {
        return _.filter(list, p => {
          return _.includes((p.fieldText || '').toLowerCase(), keywords)
            || _.includes((p.propertyName || '').toLowerCase(), keywords);
        });
      });
    }
    return (
      <UiDraggableTree
        list={filterProperties}
        keyProp="propertyName"
        parentKey="layoutBoName"
        displayFunc={item => `${item.fieldText}(${item.propertyName})`}
        onDragEnd={this._onDragEnd}
        onDragStart={this._onDragStart}
      />
    );
  }

  private _onDragStart = (e: React.DragEvent, item: any) => {
    event.stopPropagation();
    console.log('[UiPropertyList#_onDragStart]', item);
    this.props.dispatch(createDragStartAction(
      item,
      'property',
      false,
      true,
    ));
  }

  private _onDragEnd = async (e: React.DragEvent) => {
    console.log('[UiPropertyList#_onDragEnd]');
    e.stopPropagation();
    await delay(0);
    this.props.dispatch(createDragEndAction());
  }
}
