import * as React from 'react';
import { BaseLayoutComponent, connector } from './BaseLayoutComponent';
import { registGlobalComponentClass } from 'src/utils';

@connector
export class LayoutPanelComponent extends BaseLayoutComponent {
  constructor(props: any) {
    super(props);
    console.log(':::LayoutPanelComponent');
  }

  render() {
    const { layout } = this.props;
    console.log(`[LayoutPanelComponent#render] ${layout ? layout.cellName : ''}`);
    return (
      <div
        {...this._createRootProps(['panel', 'panel-default', 'editor-layout-panel'])}
      >
        <div className="panel-heading">
          <h4 className="panel-title">{layout.groupTitle}</h4>
        </div>
        <div className="panel-body" >
          {this._renderChildren()}
        </div>
        {this._renderLayoutSign()}
        {this._renderHitArea()}
        {this._renderRemark()}
      </div>
    );
  }
}

registGlobalComponentClass('LayoutPanelComponent', LayoutPanelComponent);
