import * as React from 'react';

import './style.less';
import { UiPageLayoutsTree } from '../pageLayoutsTree';
import { UiLayoutOutlineCheckbox } from '../layoutOutlineCheckbox';

export class UiPageTreeLayoutsBox extends React.PureComponent {
  render() {
    return (
      <>
        <UiLayoutOutlineCheckbox />
        <div className="editor-tree-layouts-box">
          <div className="editor-tree-layouts-box-container">
            <UiPageLayoutsTree />
          </div>
        </div>
      </>
    );
  }

}
