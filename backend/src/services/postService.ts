import prisma from '../config/database';
import { PaginatedResponse } from '../types';
import { updateStreak } from './streakService';

interface PostWithAuthor {
  id: string;
  content: string;
  feeling: string | null;
  category: string;
  visibility: string;
  photoUrl: string | null;
  authorId: string;
  author: { id: string; name: string; avatarUrl: string | null };
  createdAt: Date;
  updatedAt: Date;
  heartCount: number;
  isBookmarked: boolean;
}

function formatPost(post: PostWithAuthor): PostWithAuthor {
  // For anonymous posts, hide author info
  if (post.visibility === 'ANONYMOUS') {
    return {
      ...post,
      author: { id: post.author.id, name: 'Anonymous', avatarUrl: null },
    };
  }
  return post;
}

const authorSelect = {
  id: true,
  name: true,
  avatarUrl: true,
};

export async function getPublicFeed(
  page: number,
  limit: number,
  category?: string
): Promise<PaginatedResponse<PostWithAuthor>> {
  const where: any = {
    visibility: { in: ['PUBLIC', 'ANONYMOUS'] },
  };
  if (category) {
    where.category = category;
  }

  const [items, total] = await Promise.all([
    prisma.gratitudePost.findMany({
      where,
      include: { author: { select: authorSelect } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.gratitudePost.count({ where }),
  ]);

  return {
    items: (items as PostWithAuthor[]).map(formatPost),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getMyWall(
  userId: string,
  page: number,
  limit: number,
  visibility?: string
): Promise<PaginatedResponse<PostWithAuthor>> {
  const where: any = { authorId: userId };
  if (visibility) {
    where.visibility = visibility;
  }

  const [items, total] = await Promise.all([
    prisma.gratitudePost.findMany({
      where,
      include: { author: { select: authorSelect } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.gratitudePost.count({ where }),
  ]);

  return {
    items: items as PostWithAuthor[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getPostById(
  postId: string,
  requesterId?: string
): Promise<PostWithAuthor> {
  const post = await prisma.gratitudePost.findUnique({
    where: { id: postId },
    include: { author: { select: authorSelect } },
  });

  if (!post) {
    const err = new Error('Post not found');
    (err as any).status = 404;
    throw err;
  }

  // Private posts only visible to author
  if (post.visibility === 'PRIVATE' && post.authorId !== requesterId) {
    const err = new Error('Post not found');
    (err as any).status = 404;
    throw err;
  }

  return formatPost(post as PostWithAuthor);
}

export async function createPost(
  userId: string,
  data: {
    content: string;
    feeling?: string | null;
    category: string;
    visibility: string;
    photoUrl?: string | null;
  }
): Promise<PostWithAuthor> {
  const post = await prisma.gratitudePost.create({
    data: {
      content: data.content,
      feeling: data.feeling ?? null,
      category: data.category,
      visibility: data.visibility,
      photoUrl: data.photoUrl ?? null,
      authorId: userId,
    },
    include: { author: { select: authorSelect } },
  });

  // Update streak in background
  updateStreak(userId).catch((err) =>
    console.error('[Streak update failed]', err)
  );

  return formatPost(post as PostWithAuthor);
}

export async function updatePost(
  postId: string,
  userId: string,
  data: {
    content?: string;
    feeling?: string | null;
    category?: string;
    visibility?: string;
    photoUrl?: string | null;
  }
): Promise<PostWithAuthor> {
  const existing = await prisma.gratitudePost.findUnique({
    where: { id: postId },
  });

  if (!existing) {
    const err = new Error('Post not found');
    (err as any).status = 404;
    throw err;
  }

  if (existing.authorId !== userId) {
    const err = new Error('Not authorized to update this post');
    (err as any).status = 403;
    throw err;
  }

  const post = await prisma.gratitudePost.update({
    where: { id: postId },
    data,
    include: { author: { select: authorSelect } },
  });

  return formatPost(post as PostWithAuthor);
}

export async function deletePost(
  postId: string,
  userId: string
): Promise<void> {
  const existing = await prisma.gratitudePost.findUnique({
    where: { id: postId },
  });

  if (!existing) {
    const err = new Error('Post not found');
    (err as any).status = 404;
    throw err;
  }

  if (existing.authorId !== userId) {
    const err = new Error('Not authorized to delete this post');
    (err as any).status = 403;
    throw err;
  }

  await prisma.gratitudePost.delete({ where: { id: postId } });
}

export async function heartPost(
  postId: string,
  _userId: string
): Promise<{ heartCount: number }> {
  const existing = await prisma.gratitudePost.findUnique({
    where: { id: postId },
  });

  if (!existing) {
    const err = new Error('Post not found');
    (err as any).status = 404;
    throw err;
  }

  const post = await prisma.gratitudePost.update({
    where: { id: postId },
    data: { heartCount: { increment: 1 } },
  });

  return { heartCount: post.heartCount };
}

export async function getUserPublicWall(
  userId: string,
  page: number,
  limit: number
): Promise<PaginatedResponse<PostWithAuthor>> {
  const where = {
    authorId: userId,
    visibility: { in: ['PUBLIC', 'ANONYMOUS'] },
  };

  const [items, total] = await Promise.all([
    prisma.gratitudePost.findMany({
      where,
      include: { author: { select: authorSelect } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.gratitudePost.count({ where }),
  ]);

  return {
    items: (items as PostWithAuthor[]).map(formatPost),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
