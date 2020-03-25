import * as React from 'react';
import * as _ from 'lodash';
import { Upload, Icon, Modal, Descriptions, Alert } from 'antd';
import {
  noop,
  readerJsonFile,
  confirm,
} from 'src/utils';

import './style.less';
import { RcFile } from 'antd/lib/upload/interface';
import moment from 'moment';
import { connect } from 'dva';
import { IPagesState } from 'src/models/pagesModel';
import { Dispatch, AnyAction } from 'redux';
import { createImportLayoutsEffect } from 'src/models/layoutsActions';
import { t } from 'src/i18n';
import I18N_IDS from 'src/i18n/ids';
// import { createSetSourceAction } from 'src/models/datasourceActions';

const Dragger = Upload.Dragger;
const Item = Descriptions.Item;

export interface IUiImportLayoutsJsonModalProps {
  currentPageId?: string;
  dispatch?: Dispatch<AnyAction>;
}

export interface IUiImportLayoutsJsonModalState {
  visible?: boolean;
  fileInfo?: any;
  file?: RcFile;
  readFailed?: boolean;
}

@connect(
  ({ PAGES }: {
    PAGES: IPagesState<any>,
  }) => ({
    currentPageId: PAGES.currentPageId,
  }), null, null, {
    withRef: true,
  },
)
export class UiImportLayoutsJsonModal extends React.PureComponent<IUiImportLayoutsJsonModalProps, IUiImportLayoutsJsonModalState> {
  state: IUiImportLayoutsJsonModalState = {
    visible: false,
    file: null,
    fileInfo: null,
    readFailed: false,
  };

  // constructor(props: IUiImportLayoutsJsonModalProps) {
  //   super(props);
  //   if (props.fileKey) {
  //     this._initFileInfo(props.fileKey);
  //   }
  // }

  render() {
    const { visible, fileInfo, readFailed } = this.state;
    const disabled = readFailed || !_.get(fileInfo, 'layouts');
    return (

      <Modal
        title="导入布局"
        okText="确认导入"
        cancelText={t(I18N_IDS.TEXT_CANCEL)}
        maskClosable={false}
        visible={visible}
        afterClose={this._afterClose}
        onCancel={this.close}
        onOk={this._onOk}
        okButtonProps={{
          disabled,
        }}
      >
        <Dragger
          beforeUpload={this._readFile}
          listType="picture"
          accept=".json"
          fileList={[]}
          onPreview={noop}
          showUploadList={{
            showRemoveIcon: false,
          }}
        >
          <p className="ant-upload-drag-icon">
            <Icon type="cloud-upload" />
          </p>
          <p className="ant-upload-hint">点击选择或拖放导出的 .json 文件到此区域</p>
        </Dragger>
        {this._renderFileInfo()}
      </Modal>
    );
  }

  open() {
    this.setState({
      visible: true,
    });
  }

  close = () => {
    this.setState({
      visible: false,
    });
  }

  private _renderFileInfo = () => {
    const { file, fileInfo, readFailed } = this.state;
    const { currentPageId } = this.props;
    const exportTime = _.get(fileInfo, 'info.exportTime');
    return (
      <div className="editor-fileinfo-contaiter">
        <Descriptions title="文件信息" column={1}>
          <Item label="文件名">
            { _.get(file, 'name') }
          </Item>
          <Item label="导出时间">
            {exportTime ? moment(exportTime).format('YYYY-MM-DD HH:mm:ss') : null}
          </Item>
        </Descriptions>
        {
          readFailed
            ? <Alert
                type="error"
                message="读取文件失败"
              />
            : null
        }
        {
          fileInfo && !_.get(fileInfo, 'layouts')
            ? <Alert
                type="error"
                message="无法读取布局数据"
              />
            : (fileInfo && _.get(fileInfo, 'info.pageId', '----') !== currentPageId
                ? <Alert
                    type="warning"
                    message="导入的布局文件不是由当前页面导出，请确认是否导入。"
                  />
                : null)
        }
      </div>
    );
  }

  private _readFile = async (file: RcFile) => {
    let result: any;
    let readFailed = false;
    try {
      result = await readerJsonFile(file);
      console.log('读取布局：', result);
    } catch (e) {
      console.error(e);
      readFailed = true;
    }
    this.setState({
      file,
      fileInfo: result,
      readFailed,
    });
    return Promise.reject();
  }

  private _afterClose = () => {
    this.setState({
      fileInfo: null,
      file: null,
      readFailed: false,
    });
  }

  private _onOk = async () => {
    const { fileInfo } = this.state;
    const { dispatch } = this.props;
    const layouts = _.get(fileInfo, 'layouts');
    // const datasource = _.get(fileInfo, 'datasource');
    // dispatch(createReplaceLayoutsAction(layouts, true, true));
    const b = await confirm({
      content: '将使用导入的布局替换当前页面布局，是否继续？',
    });
    if (!b) {
      return;
    }
    dispatch(createImportLayoutsEffect(layouts));
    this.close();
    // dispatch(createSetSourceAction(datasource, true));
  }

}
