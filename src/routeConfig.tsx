import * as React from 'react';
import { Router, Route, Switch } from 'react-router';
import { ConfigProvider } from 'antd';
import { DvaInstance, Model } from 'dva';
import dynamic from 'dva/dynamic';

import { app } from './app';
import { createPagesModel } from './models/pagesModel';
import { createLayoutsModel } from './models/layoutsModel';
import { IIpfCcmPage, IBoPageLayout, IPgLoElement } from './routes/Visualization/types';
import { VISUALIZATION_CONFIG } from './routes/Visualization/config';
import { TEMPLATE_CONFIG } from './routes/Template/config';
import { PROTOTYPE_CONFIG } from './routes/Prototype/config';
import { IPrototypePage } from './routes/Prototype/types';
import { DATASOURCE_BINDING_CONFIG } from './routes/DatasourceBinding/config';
// import Prototype from './routes/Prototype';

type TDynamic = (opts: {
  app?: DvaInstance,
  component?: () => Promise<any>,
  models?: () => Array<Promise<Model>>
  LoadingComponent?: React.ComponentType,
}) => typeof React.Component;

const myDynamic = dynamic as TDynamic;

const Prototype = myDynamic({
  app,
  component: () => import('./routes/Prototype'),
  models: () => [
    Promise.resolve(createPagesModel<IPrototypePage>({
      namespace: 'PAGES',
      pageIdKey: PROTOTYPE_CONFIG.pageIdKey,
      parentPageIdKey: PROTOTYPE_CONFIG.parentPageIdKey,
      orderKey: PROTOTYPE_CONFIG.pageOrderKey,
    })),
    Promise.resolve(createLayoutsModel<IBoPageLayout, IPgLoElement>({
      namespace: 'LAYOUTS',
      cellNameKey: PROTOTYPE_CONFIG.cellNameKey,
      parentCellNameKey: PROTOTYPE_CONFIG.parentCellNameKey,
      layoutIdKey: PROTOTYPE_CONFIG.layoutIdKey,
      childrenElementsKey: PROTOTYPE_CONFIG.childrenElementsKey,
      layoutElementIdKey: PROTOTYPE_CONFIG.layoutElementIdKey,
      elementIdKey: PROTOTYPE_CONFIG.elementIdKey,
      elementParentLayoutKey: PROTOTYPE_CONFIG.elementParentLayoutKey,
      orderKey: PROTOTYPE_CONFIG.orderKey,
      elementOrderKey: PROTOTYPE_CONFIG.elementOrderKey,
      elementStartIndex: PROTOTYPE_CONFIG.elementStartIndex,
      elementEventsCopyKey: PROTOTYPE_CONFIG.elementEventsCopyKey,
      elementEventsKey: PROTOTYPE_CONFIG.elementEventsKey,
      layoutEventsKey: PROTOTYPE_CONFIG.layoutEventsKey,
      layoutEventsCopyKey: PROTOTYPE_CONFIG.layoutEventsCopyKey,
      getLayoutComponentKey: PROTOTYPE_CONFIG.getLayoutComponentKey,
      getElementComponentKey: PROTOTYPE_CONFIG.getElementComponentKey,
      tempChildrenLayoutsKey: PROTOTYPE_CONFIG.tempChildrenLayoutsKey,
    })),
    import('./models/datasourceModel').then(result => result.DatasourceModel),
  ],
});

const Visualization = myDynamic({
  app,
  component: () => import('./routes/Visualization'),
  models: () => [
    Promise.resolve(createPagesModel<IIpfCcmPage>({
      namespace: 'PAGES',
      pageIdKey: VISUALIZATION_CONFIG.pageIdKey,
      parentPageIdKey: '-',
      orderKey: '-',
    })),
    Promise.resolve(createLayoutsModel<IBoPageLayout, IPgLoElement>({
      namespace: 'LAYOUTS',
      cellNameKey: VISUALIZATION_CONFIG.cellNameKey,
      parentCellNameKey: VISUALIZATION_CONFIG.parentCellNameKey,
      layoutIdKey: VISUALIZATION_CONFIG.layoutIdKey,
      childrenElementsKey: VISUALIZATION_CONFIG.childrenElementsKey,
      elementIdKey: VISUALIZATION_CONFIG.elementIdKey,
      elementParentLayoutKey: VISUALIZATION_CONFIG.elementParentLayoutKey,
      orderKey: VISUALIZATION_CONFIG.orderKey,
      elementOrderKey: VISUALIZATION_CONFIG.elementOrderKey,
      elementStartIndex: VISUALIZATION_CONFIG.elementStartIndex,
      elementEventsCopyKey: VISUALIZATION_CONFIG.elementEventsCopyKey,
      elementEventsKey: VISUALIZATION_CONFIG.elementEventsKey,
      layoutEventsKey: VISUALIZATION_CONFIG.layoutEventsKey,
      layoutEventsCopyKey: VISUALIZATION_CONFIG.layoutEventsCopyKey,
      getLayoutComponentKey: VISUALIZATION_CONFIG.getLayoutComponentKey,
      getElementComponentKey: VISUALIZATION_CONFIG.getElementComponentKey,
      tempChildrenLayoutsKey: VISUALIZATION_CONFIG.tempChildrenLayoutsKey,
    })),
  ],
});

const Template = myDynamic({
  app,
  component: () => import('./routes/Template'),
  models: () => [
    Promise.resolve(createPagesModel<any>({
      namespace: 'PAGES',
      pageIdKey: TEMPLATE_CONFIG.pageIdKey,
      parentPageIdKey: '-',
      orderKey: '-',
    })),
    Promise.resolve(createLayoutsModel<any, any>({
      namespace: 'LAYOUTS',
      cellNameKey: TEMPLATE_CONFIG.cellNameKey,
      parentCellNameKey: TEMPLATE_CONFIG.parentCellNameKey,
      layoutIdKey: TEMPLATE_CONFIG.layoutIdKey,
      childrenElementsKey: TEMPLATE_CONFIG.childrenElementsKey,
      elementIdKey: TEMPLATE_CONFIG.elementIdKey,
      elementParentLayoutKey: TEMPLATE_CONFIG.elementParentLayoutKey,
      orderKey: TEMPLATE_CONFIG.orderKey,
      elementOrderKey: TEMPLATE_CONFIG.elementOrderKey,
      elementStartIndex: TEMPLATE_CONFIG.elementStartIndex,
      elementEventsCopyKey: TEMPLATE_CONFIG.elementEventsCopyKey,
      elementEventsKey: TEMPLATE_CONFIG.elementEventsKey,
      layoutEventsKey: TEMPLATE_CONFIG.layoutEventsKey,
      layoutEventsCopyKey: TEMPLATE_CONFIG.layoutEventsCopyKey,
      getLayoutComponentKey: TEMPLATE_CONFIG.getLayoutComponentKey,
      getElementComponentKey: TEMPLATE_CONFIG.getElementComponentKey,
      tempChildrenLayoutsKey: TEMPLATE_CONFIG.tempChildrenLayoutsKey,
    })),
  ],
});

const DatasourceBinding = myDynamic({
  app,
  component: () => import('./routes/DatasourceBinding'),
  models: () => [
    Promise.resolve(createPagesModel<IIpfCcmPage>({
      namespace: 'PAGES',
      pageIdKey: DATASOURCE_BINDING_CONFIG.pageIdKey,
      parentPageIdKey: '-',
      orderKey: '-',
    })),
    Promise.resolve(createLayoutsModel<IBoPageLayout, IPgLoElement>({
      namespace: 'LAYOUTS',
      cellNameKey: DATASOURCE_BINDING_CONFIG.cellNameKey,
      parentCellNameKey: DATASOURCE_BINDING_CONFIG.parentCellNameKey,
      layoutIdKey: DATASOURCE_BINDING_CONFIG.layoutIdKey,
      childrenElementsKey: DATASOURCE_BINDING_CONFIG.childrenElementsKey,
      elementIdKey: DATASOURCE_BINDING_CONFIG.elementIdKey,
      elementParentLayoutKey: DATASOURCE_BINDING_CONFIG.elementParentLayoutKey,
      orderKey: DATASOURCE_BINDING_CONFIG.orderKey,
      elementOrderKey: DATASOURCE_BINDING_CONFIG.elementOrderKey,
      elementStartIndex: DATASOURCE_BINDING_CONFIG.elementStartIndex,
      elementEventsCopyKey: DATASOURCE_BINDING_CONFIG.elementEventsCopyKey,
      elementEventsKey: DATASOURCE_BINDING_CONFIG.elementEventsKey,
      layoutEventsKey: DATASOURCE_BINDING_CONFIG.layoutEventsKey,
      layoutEventsCopyKey: DATASOURCE_BINDING_CONFIG.layoutEventsCopyKey,
      getLayoutComponentKey: DATASOURCE_BINDING_CONFIG.getLayoutComponentKey,
      getElementComponentKey: DATASOURCE_BINDING_CONFIG.getElementComponentKey,
      tempChildrenLayoutsKey: DATASOURCE_BINDING_CONFIG.tempChildrenLayoutsKey,
    })),
  ],
});

export function RouterConfig({ history }: any) {
  return (
    <ConfigProvider autoInsertSpaceInButton={false}>
      <Router history={history}>
        <Switch>
          <Route path="/datasourceBinding" component={DatasourceBinding} />
          <Route path="/prototype" component={Prototype} />
          <Route path="/template" component={Template} />
          <Route path="/" component={Visualization} />
        </Switch>
      </Router>
    </ConfigProvider>
  );
}
