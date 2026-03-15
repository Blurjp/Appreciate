import { PaginatedResponse } from '../types';
interface PostWithAuthor {
    id: string;
    content: string;
    feeling: string | null;
    category: string;
    visibility: string;
    photoUrl: string | null;
    authorId: string;
    author: {
        id: string;
        name: string;
        avatarUrl: string | null;
    };
    createdAt: Date;
    updatedAt: Date;
    heartCount: number;
    isBookmarked: boolean;
}
export declare function getPublicFeed(page: number, limit: number, category?: string): Promise<PaginatedResponse<PostWithAuthor>>;
export declare function getMyWall(userId: string, page: number, limit: number, visibility?: string): Promise<PaginatedResponse<PostWithAuthor>>;
export declare function getPostById(postId: string, requesterId?: string): Promise<PostWithAuthor>;
export declare function createPost(userId: string, data: {
    content: string;
    feeling?: string | null;
    category: string;
    visibility: string;
    photoUrl?: string | null;
}): Promise<PostWithAuthor>;
export declare function updatePost(postId: string, userId: string, data: {
    content?: string;
    feeling?: string | null;
    category?: string;
    visibility?: string;
    photoUrl?: string | null;
}): Promise<PostWithAuthor>;
export declare function deletePost(postId: string, userId: string): Promise<void>;
export declare function heartPost(postId: string, _userId: string): Promise<{
    heartCount: number;
}>;
export declare function getUserPublicWall(userId: string, page: number, limit: number): Promise<PaginatedResponse<PostWithAuthor>>;
export {};
//# sourceMappingURL=postService.d.ts.map