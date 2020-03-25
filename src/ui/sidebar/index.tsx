import * as React from 'react';
import * as classnames from 'classnames';
import { fromEvent, Subscription } from 'rxjs';
import { map, takeUntil, concatAll, withLatestFrom } from 'rxjs/operators';
import * as _ from 'lodash';

import './style.less';
import { connect } from 'dva';
import { IAppState } from 'src/models/appModel';
import { Dispatch, AnyAction } from 'redux';
import { createSetSidebarWidthAction } from 'src/models/appActions';
import { EditorStatus } from 'src/config';

const MIN_WIDTH = 8;
const MAX_WIDTH = 500;

interface IUiSidebarProps {
  dispatch?: Dispatch<AnyAction>;

  position?: 'left' | 'right';
  defaultWidth?: number;
  leftWidth?: number;
  rightWidth?: number;
  editorStatus?: EditorStatus;
}

interface IUiSidebarState {
  // width: number;
  isMouseDown: boolean;
}

@connect(
  ({ APP }: {
    APP: IAppState,
  }) => ({
    leftWidth: APP.sidebarWidthLeft,
    rightWidth: APP.sidebarWidthRight,
    splitWidth: APP.sidebarSplitWidth,
    editorStatus: APP.editorStatus,
  }),
)
export default class UiSidebar extends React.Component<IUiSidebarProps, IUiSidebarState> {
  subscriptions: Subscription[] = [];
  state = {
    // width: this.props.defaultWidth || DEFAULT_WIDTH,
    isMouseDown: false,
  };

  split = React.createRef<HTMLDivElement>();

  render() {
    const { leftWidth, rightWidth, position, editorStatus } = this.props;
    const width = position === 'right' ? rightWidth : leftWidth;
    const style: React.CSSProperties = {
      width,
      display: editorStatus === EditorStatus.PREVIEW ? 'none' : undefined,
    };
    return (
      <>
        <div
          className={classnames('editor-sidebar', { 'editor-sidebar-right': this.props.position === 'right' })}
          style={style}
        >
          <div className="editor-sidebar-content">
            {this.props.children}
          </div>
          <div
            className={classnames('editor-split', { 'editor-split-mousedown': this.state.isMouseDown })}
            ref={this.split}
          />
        </div>
        {this._renderStyle()}
      </>
    );
  }

  componentDidMount() {
    const split = this.split.current;
    const mouseDown$ = fromEvent(split, 'mousedown');
    const mouseMove$ = fromEvent(document, 'mousemove');
    const mouseUp$ = fromEvent(document, 'mouseup');

    const source = mouseDown$.pipe(
      map(__ => mouseMove$.pipe(
        takeUntil(mouseUp$),
      )),
      concatAll(),
      withLatestFrom(
        mouseDown$.pipe(
          map(event => ({
            event,
            originWidth: (() => {
              const { leftWidth, rightWidth, position } = this.props;
              const width = position === 'right' ? rightWidth : leftWidth;
              return width;
            })(),
          })),
        ), (move, down) => {
        return {
          offset: move['clientX'] - down.event['clientX'],
          originWidth: down.originWidth,
        };
      }),
    );

    const subscription = source.subscribe(info => {
      const direction = this.props.position === 'right' ? -1 : 1;
      let newWidth = info.originWidth + info.offset * direction;
      if (newWidth < MIN_WIDTH) {
        newWidth = MIN_WIDTH;
      }
      if (newWidth > MAX_WIDTH) {
        newWidth = MAX_WIDTH;
      }
      this.props.dispatch(createSetSidebarWidthAction(newWidth, this.props.position));
    });

    const subscription2 = mouseDown$.subscribe(() => {
      this.setState({
        isMouseDown: true,
      });
    });

    const subscription3 = mouseUp$.subscribe(() => {
      if (this.state.isMouseDown) {
        this.setState({
          isMouseDown: false,
        });
      }
    });

    this.subscriptions = [subscription, subscription2, subscription3];

  }

  componentWillUnmount() {
    _.forEach(this.subscriptions, s => s.unsubscribe());
  }

  private _renderStyle() {
    return this.state.isMouseDown
      ? (
        <style>
          body {'{'}
            user-select: none;
          {'}'}
        </style>
      )
      : null;
  }

}
