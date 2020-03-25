import * as React from 'react';
import * as _ from 'lodash';
// import axios from 'axios';
import { Upload, Icon, Modal } from 'antd';
import { UploadChangeParam } from 'antd/lib/upload';
import produce from 'immer';
import { noop/* , paramsSerializer */ } from 'src/utils';

import './style.less';
import { UploadFile, UploadFileStatus } from 'antd/lib/upload/interface';
import I18N_IDS from 'src/i18n/ids';
import { t } from 'src/i18n';

const Dragger = Upload.Dragger;

export interface IUiUploaderState {
  fileList?: UploadFile[];
  visible?: boolean;
  onOk?: (fileList: UploadFile[]) => any;
  onCancel?: (fileList: UploadFile[]) => any;
}

export class UiUploader extends React.PureComponent<{}, IUiUploaderState> {
  state: IUiUploaderState = {
    fileList: [],
    visible: false,
    onOk: noop,
    onCancel: noop,
  };

  // constructor(props: IUiUploaderProps) {
  //   super(props);
  //   if (props.fileKey) {
  //     this._initFileInfo(props.fileKey);
  //   }
  // }

  render() {
    const { fileList, visible } = this.state;
    return (

      <Modal
        title="上传图片"
        okText={t(I18N_IDS.TEXT_OK)}
        cancelText={t(I18N_IDS.TEXT_CANCEL)}
        maskClosable={false}
        visible={visible}
        onCancel={this._onCancel}
        onOk={this._onOk}
        afterClose={this._afterClose}
      >
        <Dragger
          action="/ipf/cloud/filesystem/uploadFile/1"
          listType="picture"
          accept=".jpg,.jpeg,.gif,.png"
          fileList={fileList}
          onChange={this._onChange}
          onRemove={this._onRemove}
          onPreview={noop}
          showUploadList={{
            showRemoveIcon: false,
          }}
        >
          <p className="ant-upload-drag-icon">
            <Icon type="cloud-upload" />
          </p>
          <p className="ant-upload-hint">点击选择文件或拖放图片到此区域</p>
        </Dragger>
        {
          fileList && fileList.length /*  && (fileList[0].status === 'done' || fileList[0].status === 'success') */
            ? <div className="editor-file-remove">
              <span className="editor-file-status">{this._getStatusText(fileList[0].status)}</span>
              <a href="javascript:void(0)" onClick={this._onRemove} title="删除" >
                <Icon type="delete" theme="twoTone" twoToneColor="#d9534f" style={{ marginRight: 4 }} />
                删除
              </a>
            </div>
            : null
        }
      </Modal>
    );
  }

  open(options: IUiUploaderState) {
    this.setState(_.assign({
      fileList: [],
    }, options, {
      visible: true,
    }));
  }

  close() {
    this.setState({
      visible: false,
    });
  }

  private _onChange = (info: UploadChangeParam) => {
    if (!this.state.visible) {
      this._clearFileList();
      return;
    }
    let { file } = info;
    if (info.file.status === 'done') {
      let str: string = info.file.response || '';
      str = str.split(/<body>|<\/body>/)[1];
      const res = str ? JSON.parse(str) : {
        success: false,
        errorMessages: ['ERROR.'],
      };
      if (res.success === false) {
        file = produce(file, draft => {
          draft.error = res.errorMessages || ['ERROR.'];
          draft.status = 'error';
        });
      } else {
        file = produce(file, draft => {
          draft['fileInfo'] = res;
        });
      }
    }
    console.log('[Uploader#_onChange]', file);
    if (file) {
      this.setState({
        fileList: [file],
      });
    }
  }

  private _onRemove = () => {
    this._clearFileList();
    return false;
  }

  // private _initFileInfo = async (fileKey: string) => {
  //   let fileInfo;
  //   try {
  //     fileInfo = await this._getFileInfo(fileKey);
  //   } catch (e) {
  //     console.warn('[_initFileInfo]', e);
  //   }
  //   console.log('[_initFileInfo]', fileInfo);
  // }

  // private _getFileInfo = async (fileKey: string) => {
  //   return axios.get('/ipf/cloud/filesystem/getFileInfos', {
  //     params: {
  //       fileKeys: fileKey,
  //     },
  //     paramsSerializer,
  //   });
  // }

  private _getStatusText = (status: UploadFileStatus) => {
    switch (status) {
      case 'error':
        return <span className="editor-file-status-error">上传失败.</span>;
      case 'success':
        return <span className="editor-file-status-success">上传成功.</span>;
      case 'uploading':
        return <span className="editor-file-status-uploading">上传中...</span>;
      case 'done':
        return <span className="editor-file-status-done">上传完成.</span>;
      default:
        return null;
    }
  }

  private _onCancel = () => {
    const { fileList, onCancel } = this.state;
    if (onCancel) {
      onCancel(fileList);
    }
    this.close();
  }

  private _onOk = () => {
    const { fileList, onOk } = this.state;
    if (onOk) {
      onOk(fileList);
    }
    this.close();
  }

  private _afterClose = () => {
    this.setState({
      fileList: [],
      onCancel: noop,
      onOk: noop,
    });
  }

  private _clearFileList = () => {
    this.setState({
      fileList: [],
    });
  }
}
