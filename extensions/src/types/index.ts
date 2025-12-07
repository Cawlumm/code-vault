export interface Snippet {
    id: string;
    title: string;
    faviconUrl: string;
    body: string;
    language?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    token: string;
    accessToken?: string;
    jwt?: string;
    access_token?: string;
}

export interface ApiError {
    message: string;
    status?: number;
}

export interface PendingSnippet {
    content: string;
    language?: string;
    sourceUrl?: string;
    sourceTitle?: string;
}
