import * as React from 'react';
import * as _ from 'lodash';
import { UiDraggableTree } from '.';
import { connect } from 'dva';
import { ILayoutsState, IMehtodsMap } from 'src/models/layoutsModel';
import { Dispatch, AnyAction } from 'redux';
import { delay } from 'src/utils';
import { createDragEndAction, createDragStartAction } from 'src/models/dndActions';

export interface IUiDroplineProps {
  methods?: IMehtodsMap;
  dispatch?: Dispatch<AnyAction>;
  keywords?: string;
}

@connect(
  ({ LAYOUTS }: {
    LAYOUTS: ILayoutsState<any>,
  }) => ({
    methods: LAYOUTS.methods,
  }),
)
export class UiMethodList extends React.PureComponent<IUiDroplineProps> {
  render() {
    const { methods, keywords } = this.props;
    let filterMehods: IMehtodsMap = methods;
    if (keywords) {
      filterMehods = _.mapValues(methods, (list) => {
        return _.filter(list, m => {
          return _.includes((m.methodDesc || '').toLowerCase(), keywords)
            || _.includes((m.methodName || '').toLowerCase(), keywords);
        });
      });
    }
    return (
      <UiDraggableTree
        list={filterMehods}
        keyProp="methodName"
        parentKey="layoutBoName"
        displayFunc={item => `${item.methodDesc}(${item.methodName})`}
        onDragEnd={this._onDragEnd}
        onDragStart={this._onDragStart}
      />
    );
  }

  private _onDragStart = (e: React.DragEvent, item: any) => {
    event.stopPropagation();
    console.log('[UiMethodList#_onDragStart]', item);
    this.props.dispatch(createDragStartAction(
      item,
      'method',
      false,
      true,
    ));
  }

  private _onDragEnd = async (e: React.DragEvent) => {
    console.log('[UiMethodList#_onDragEnd]');
    e.stopPropagation();
    await delay(0);
    this.props.dispatch(createDragEndAction());
  }
}
