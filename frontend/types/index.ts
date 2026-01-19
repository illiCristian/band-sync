export interface Band {
    id: string;
    name: string;
    members: string[];
}

export type SongStatus = 'IDEA' | 'RECORDED' | 'PUBLISHED';

export interface Song {
    id: string;
    title: string;
    status: SongStatus;
    bandId: string;
    recordings: Recording[];
}

export type RecordingCategory = 'REHEARSAL' | 'STUDIO' | 'LIVE' | 'DEMO';

export interface Recording {
    id: string;
    url: string;
    versionName: string;
    category: RecordingCategory;
    duration: number;
    recordedAt: string;
    isFinal: boolean;
    type?: string;
    comments?: Comment[];
}

export interface Comment {
    id: string;
    text: string;
    timestampSeconds: number;
    authorName: string;
    recordingId: string;
    createdAt: string;
}
