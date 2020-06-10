import {Video} from "../../util/models";
import {AxiosError} from "axios";

export interface FileUpload{
    fileField: string;
    filename: string;
    progress: number;
    error?: AxiosError;
}

export interface Upload{
    video: Video;
    progress: number;
    files: FileUpload[]
}

export interface UploadCollection {
    uploads: Upload[]
}