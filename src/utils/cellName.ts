import * as _ from 'lodash';

export class CellNameManager {
  private _existCellNames: string[] = [];
  private _configName: string;

  create(parentCellName?: string) {
    let prefix: string;
    if (parentCellName === 'ROOT_E') {
      prefix = this._configName ? `${this._configName}.EF` : 'EF';
    } else {
      prefix = (!parentCellName || parentCellName === 'ROOT')
        ? (this._configName ? `${this._configName}.F` : 'F')
        : `${parentCellName}-`;
    }
    const existCellNames = _.filter(this._existCellNames, n => {
      return n.indexOf(prefix) === 0
        && n.replace(prefix, '').indexOf('-') < 0;
    });
    let i = existCellNames.length;
    let name = prefix + i;
    while (1) {
      if (!_.includes(existCellNames, name)) {
        this.add(name);
        return name;
      }
      i++;
      name = prefix + i;
    }
    return null;
  }

  clear() {
    this._existCellNames = [];
  }

  add(cellName: string) {
    this._existCellNames.push(cellName);
  }

  init(layouts: any[], configName?: string, cellNameKey = 'cellName') {
    this._existCellNames = _.map(layouts, l => l[cellNameKey]);
    this._configName = configName;
  }
}

export const cellNameManager = new CellNameManager();
window['cellNameManager'] = cellNameManager;
