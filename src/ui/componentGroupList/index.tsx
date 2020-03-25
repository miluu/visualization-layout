import * as React from 'react';
import * as _ from 'lodash';

import { UiDraggableList, IUiDraggableListItem } from '../draggableList';

import './style.less';
import { connect } from 'dva';
import { IAppState } from 'src/models/appModel';
import { Dispatch, AnyAction } from 'redux';
import { createLoadComponentGroupSourceEffect } from 'src/models/appActions';

export interface IUiComponentGroupListProps {
  source?: IUiDraggableListItem[];
  isLoading?: boolean;
  dispatch?: Dispatch<AnyAction>;
}

@connect(
  ({
    APP,
  }: {
    APP: IAppState,
  }) => {
    return {
      isLoading: APP.isLoadingComponentGroup,
      source: APP.componentGroupSource,
    };
  },
)
export class UiComponentGroupList extends React.PureComponent<IUiComponentGroupListProps> {
  constructor(props: IUiComponentGroupListProps) {
    super(props);
    props.dispatch(createLoadComponentGroupSourceEffect());
  }
  render() {
    const { source, isLoading } = this.props;
    return (
      <UiDraggableList
        source={source}
        itemDisplayType="H"
        isLoading={isLoading}
      />
    );
  }
}
