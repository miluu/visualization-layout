import { app } from './app';
import registerServiceWorker from './registerServiceWorker';
import { RouterConfig } from './routeConfig';

import './index.less';
import './assets/icomoon-gl/style.css';

import { appModel } from './models/appModel';
import { dndModel } from './models/dndModel';
import { formsModel } from './models/formsModel';

app.model(appModel);
app.model(dndModel);
app.model(formsModel);
app.router(RouterConfig);
app.start('#root');

registerServiceWorker();
