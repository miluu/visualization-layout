import * as React from 'react';
import * as classnames from 'classnames';
import * as _ from 'lodash';

import './style.less';
import { Button, Icon } from 'antd';
import { openPageListEditDrawer } from '../../utils/modal';
import { Dispatch, AnyAction } from 'redux';
import { createDeleteBoPageEffect } from 'src/models/pagesActions';
import { confirm } from 'src/utils';

export interface IUiPageListProps<P> {
  dispatch?: Dispatch<AnyAction>;
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
          <li>
            <div>
              <span>页面布局</span>
              <Button
                size="small"
                type="primary"
                style={{ float: 'right' }}
                onClick={this.addPage}
              >新增页面</Button>
            </div>
          </li>
          {
            _.map(list, (page, index) => {
              if (!page['ipfCcmBoPageId']) {
                /*return <li>
                  <div>
                    <span>页面布局</span>
                    <Button
                      size="small"
                      type="primary"
                      style={{ float: 'right' }}
                      onClick={this.addPage}
                    >新增页面</Button>
                  </div>
                </li>;*/
              }
              return <li
                key={index}
                className={classnames({ active: page[idKey] === currentPageId })}
              >
                <div style={{ clear: 'both' }}>
                  <a href="javascript:void(0)"
                    style={{ float: 'left' }}
                    onDoubleClick={(e) => this.props.dblClickPage(page, e.ctrlKey)}
                  >
                    {displayFunc(page)}
                  </a>
                  <div style={{ float: 'right' }}>
                    <a
                      title="编辑"
                      onClick={() => this.editPage(page)}
                    >
                      <Icon type="edit" />
                    </a>
                    {' '}
                    <a
                      title="复制"
                      onClick={() => this.copyPage(page)}
                    >
                      <Icon type="copy" />
                    </a>
                    {' '}
                    <a
                      title="删除"
                      onClick={() => this.deletePage(page)}
                    >
                      <Icon type="delete" />
                    </a>
                  </div>
                </div>
              </li>;
            })
          }
        </ul>
      );
    }

    private addPage = () => {
      openPageListEditDrawer({
        type: 'add',
        page: {},
      });
    }

    private editPage = (record: P) => {
      openPageListEditDrawer({
        page: record,
        type: 'edit',
      });
    }

    private copyPage = (record: P) => {
      openPageListEditDrawer({
        page: record,
        type: 'copy',
      });
      // this.props.dispatch(createCopyPageEffect(record.ipfCcmBoPageId));
    }

    private deletePage = async (record: P) => {
      const b = await confirm({ content: '确定要删除该页面列表？' });
      if (!b) {
        return;
      }
      this.props.dispatch(createDeleteBoPageEffect(record['ipfCcmBoPageId']));
    }

  };
}
