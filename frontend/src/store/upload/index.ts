import * as Typings from "./types";
import {createActions, createReducer} from 'reduxsauce';
import update from 'immutability-helper';

export const {Types, Creators} = createActions<{
    ADD_UPLOAD: string,
    REMOVE_UPLOAD: string,
    UPDATE_UPLOAD: string,
    },{
    addUpload(payload: Typings.AddUploadAction['payload']): Typings.AddUploadAction
    removeUpload(payload: Typings.RemoveUploadAction['payload']): Typings.RemoveUploadAction
    updateUpload(payload: Typings.UpdateProgressAction['payload']): Typings.UpdateProgressAction

}>
({
    addUpload: ['payload'],
    removeUpload: ['payload'],
    updateProgress: ['payload'],
});

export const INITIAL_STATE : Typings.State = {
    uploads: []
};

const reducer = createReducer<Typings.State, Typings.Actions>(INITIAL_STATE, {
    [Types.ADD_UPLOAD] : addUpload as any,
    [Types.REMOVE_UPLOAD] : removeUpload as any,
    [Types.UPDATE_UPLOAD] : removeUpload as any,
});

export default reducer;

function addUpload(state = INITIAL_STATE, action: Typings.AddUploadAction) : Typings.State{
    if (!action.payload.files.length){
        return state;
    }
    const index = findIndexUpload(state, action.payload.video.id);

    if (index !== -1 && state.uploads[index].progress < 1){
        return state;
    }

    const uploads = index === -1
        ? state.uploads
        : update(state.uploads, {
            $splice: [[index, 1]]
    });

    return{
        uploads: [
            ...uploads,
            {
                video: action.payload.video,
                progress: 0,
                files: action.payload.files.map(file => ({
                    fileField: file.fileField,
                    filename: file.file.name,
                    progress: 0
                }))
            }
        ]
    };
}

function removeUpload(state: Typings.State = INITIAL_STATE, action: Typings.RemoveUploadAction): Typings.State {
    const uploads = state.uploads.filter(upload => upload.video.id !== action.payload.id);

    if (uploads.length === state.uploads.length){
        return state;
    }
    return {
        uploads
    }
}

function updateProgress(state: Typings.State = INITIAL_STATE, action: Typings.UpdateProgressAction): Typings.State {
    const videoId = action.payload.video.id;
    const fileField = action.payload.fileField;

    const {indexUpload, indexFile} = findIndexUploadAndFile(state, videoId, fileField)
}

function findIndexUploadAndFile(state: Typings.State, videoId, fileField): {indexUpload?, indexFile?} {
    const indexUpload = findIndexUpload(state, videoId);

    if (indexUpload === -1){
        return {};
    }

    const upload = state.uploads[indexUpload];
    const indexFile = findIndexFile(upload.files, fileField);

    return indexFile === -1 ? {} : {indexUpload, indexFile}
}

function findIndexUpload(state: Typings.State, id: string) {
    return state.uploads.findIndex((upload) => upload.video.id === id);
}

function findIndexFile(files: Array<{fileField}>, fileField: string) {
    return files.findIndex(file => file.fileField === fileField);
}