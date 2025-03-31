export interface Document {
    id: string;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
    file_extension: string;
    session_id: string;
    created_at: string;
    processed: boolean;
}
