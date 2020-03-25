import * as React from 'react';
import { connect } from 'dva';
import { IAppState } from 'src/models/appModel';
import { EditorStatus } from 'src/config';

interface IUiCssStyleProps {
  editorStatus?: EditorStatus;
}

@connect(
  ({
    APP,
  }: {
    APP: IAppState,
  }) => {
    return {
      editorStatus: APP.editorStatus,
    };
  },
)
export class UiCssStyle extends React.PureComponent<IUiCssStyleProps> {
  render() {
    return (
      <>
        <link rel="stylesheet" href="/bower_components/bootstrap/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/static/css/controls.css" />
        <link rel="stylesheet" href="/resource/css/main.css" />
        <link rel="stylesheet" href="/resource/css/custom.css" />
        <link rel="stylesheet" href="/static/css/iconfont.css" />
        <link rel="stylesheet" href="/static/app/framework/dynamic/GillionDynamicHtmlStyle.css" />
        <link rel="stylesheet" href="/static/app/framework/buttonGroup/GillionButtonGroup.css" />
        {/* <link rel="stylesheet" href="/themes/v5/css/theme.css" /> */}
        {/* { this._renderFlex() } */}
      </>
    );
  }

  // _renderFlex() {
  //   if (this.props.editorStatus === EditorStatus.PREVIEW) {
  //     return null;
  //   }
  //   return (
  //     <style>
  //       .full-height,
  //       .flex-container-grid,
  //       .flex-container-grid .grid,
  //       .flex-container-tab .tab {'{'}
  //         height: auto !important;
  //       {'}'}
  //       .flex-container,
  //       .flex-container-grid,
  //       .flex-container-grid .grid {'{'}
  //         display: auto;
  //       {'}'}
  //       .flex-container-horizontal {'{'}
  //         display: auto;
  //       {'}'}
  //       .flex-container-grid .grid {'{'}
  //         height: auto !important;
  //       {'}'}
  //       .flex-container-grid .grid .grid-body,
  //       .flex-item,
  //       .flex-item-1,
  //       .flex-container-grid > .grid-container {'{'}
  //         display: auto;
  //       {'}'}
  //       .flex-container-grid .grid-container {'{'}
  //         position: relative;
  //       {'}'}
  //       .flex-container-grid .grid-container-inner {'{'}
  //         position: static;
  //       {'}'}
  //       .flex-item-2 {'{'}
  //         flex-grow: 2;
  //       {'}'}
  //       .flex-item-3 {'{'}
  //         flex-grow: 3;
  //       {'}'}
  //       .flex-item-4 {'{'}
  //         flex-grow: 4;
  //       {'}'}
  //       .flex-item-5 {'{'}
  //         flex-grow: 5;
  //       {'}'}
  //       .flex-item-6 {'{'}
  //         flex-grow: 6;
  //       {'}'}
  //       .flex-item-7 {'{'}
  //         flex-grow: 7;
  //       {'}'}
  //       .flex-item-8 {'{'}
  //         flex-grow: 8;
  //       {'}'}
  //       .flex-item-9 {'{'}
  //         flex-grow: 9;
  //       {'}'}
  //       .flex-item-10 {'{'}
  //         flex-grow: 10;
  //       {'}'}
  //     </style>
  //   );
  // }
}
