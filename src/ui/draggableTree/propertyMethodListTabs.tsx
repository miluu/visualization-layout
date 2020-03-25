import * as React from 'react';
import * as _ from 'lodash';
import { Tabs, Input } from 'antd';
import { UiPropertyList } from './propertyList';
import { UiMethodList } from './methodList';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';

const { TabPane } = Tabs;

interface IUiPropertyMehodListTabsState {
  keywords: string;
}

export class UiPropertyMehodListTabs extends React.PureComponent<any, IUiPropertyMehodListTabsState> {
  state: IUiPropertyMehodListTabsState = {
    keywords: '',
  };

  render() {
    return (
      <div className="editor-property-method-tabs">
        <Input
          size="small"
          value={this.state.keywords}
          onChange={this._onKeywordsChange}
          placeholder={t(I18N_IDS.TEXT_INPUT_KEYWRODS)}
          allowClear
        />
        <Tabs
          size="small"
        >
          <TabPane
            tab={t(I18N_IDS.PANEL_TITLE_BO_PROPERTIES)}
            key="property"
          >
            <UiPropertyList
              keywords={this.state.keywords}
            />
          </TabPane>
          <TabPane
            tab={t(I18N_IDS.PANEL_TITLE_BO_METHODS)}
            key="method"
          >
            <UiMethodList
              keywords={(this.state.keywords || '').toLowerCase()}
            />
          </TabPane>
        </Tabs>
      </div>
    );
  }

  private _onKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = _.trim(e.target.value);
    this.setState({
      keywords: value,
    });
  }

}
