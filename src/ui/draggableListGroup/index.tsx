import * as React from 'react';
import * as _ from 'lodash';

import {
  Collapse,
  Icon,
} from 'antd';

import { UiDraggableList, IUiDraggableListItem } from '../draggableList';

import './style.less';
import { t } from 'src/i18n';

const { Panel } = Collapse;

export interface IUiDraggableListGroupItem {
  listSource?: IUiDraggableListItem[];
  render?: () => React.ReactNode;
  groupTitle: string;
}

export interface IUiDraggableListGroupProps {
  source: IUiDraggableListGroupItem[];
}

export class UiDraggableListGroup extends React.Component<IUiDraggableListGroupProps> {
  render() {
    const { source } = this.props;
    const defaultActiveKey = _.map(source, (__, i) => i.toString());
    return (
      <div className="editor-draggable-list-group">
        <Collapse bordered={false} defaultActiveKey={defaultActiveKey} expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}>
          {
            _.map(source, (list, i) => (
              <Panel
                key={defaultActiveKey[i]}
                header={t(list.groupTitle)}
              >
                {
                  list.listSource
                    ? <UiDraggableList
                        source={list.listSource}
                      />
                    : null
                }
                {
                  list.render
                    ? list.render()
                    : null
                }
              </Panel>
            ))
          }
        </Collapse>
      </div>
    );
  }
}
