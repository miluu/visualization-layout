import * as React from 'react';
import * as classnames from 'classnames';
import * as _ from 'lodash';

import './style.less';

export interface IUiPageListProps<P> {
  list: P[];
  currentPageId: string;
  dblClickPage?: (page: P, ctrlKey?: boolean) => void;
}

export function createUiPageListComponent<P>(idKey: string, displayFunc: (p: P) => string) {
  return class UiPageList extends React.Component<IUiPageListProps<P>> {

    render() {
      const { list, currentPageId } = this.props;
      return (
        <ul className="editor-page-list">
          {
            _.map(list, (page, index) => (
              <li
                key={index}
                className={classnames({ active: page[idKey] === currentPageId })}
              >
                <a href="javascript:void(0)"
                  onDoubleClick={(e) => this.props.dblClickPage(page, e.ctrlKey)}
                >
                  {displayFunc(page)}
                </a>
              </li>
            ))
          }
        </ul>
      );
    }

  };
}
