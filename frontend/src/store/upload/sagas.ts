import {Types} from './index';
import {actionChannel, take, call} from 'redux-saga/effects'
import {AddUploadAction, FileInfo, FileUpload} from "./types";
import {Video} from "../../util/models";

export function* uploadWatcherSaga() {

    const newFilesChannel = yield actionChannel(Types.ADD_UPLOAD);

    while (true){
        const {payload}:AddUploadAction = yield take(newFilesChannel);

        for (const fileInfo of payload.files){
            yield call(uploadFile, {video: payload.video, fileInfo})
        }
        console.log(payload);
    }
}

function* uploadFile({video, fileInfo}: {video:Video, fileInfo: FileInfo}) {
    console.log(video, fileInfo);
}