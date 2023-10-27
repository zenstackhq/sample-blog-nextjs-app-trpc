"use client";

import type { Post } from "@prisma/client";
import type { Session } from "next-auth";
import { api } from "~/trpc/react";

const Posts = ({ user }: { user: Session["user"] }) => {
  const { data: posts, refetch } = api.post.findMany.useQuery({
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });
  const { mutateAsync: createPost } = api.post.create.useMutation();
  const { mutateAsync: updatePost } = api.post.update.useMutation();
  const { mutateAsync: deletePost } = api.post.delete.useMutation();

  async function onCreatePost() {
    const title = prompt("Enter post title");
    if (title) {
      await createPost({ data: { title, authorId: user.id } });
      await refetch();
    }
  }

  async function onTogglePublished(post: Post) {
    await updatePost({
      where: { id: post.id },
      data: { published: !post.published },
    });
    await refetch();
  }

  async function onDelete(post: Post) {
    await deletePost({ where: { id: post.id } });
    await refetch();
  }

  return (
    <div className="container flex flex-col text-white">
      <button
        className="rounded border border-white p-2 text-lg"
        onClick={onCreatePost}
      >
        + Create Post
      </button>

      <ul className="container mt-8 flex flex-col gap-2">
        {posts?.map((post) => (
          <li key={post.id} className="flex items-end justify-between gap-4">
            <p className={`text-2xl ${!post.published ? "text-gray-400" : ""}`}>
              {post.title}
              <span className="text-lg"> by {post.author.email}</span>
            </p>
            <div className="flex w-32 justify-end gap-1 text-left">
              <button
                className="underline"
                onClick={() => onTogglePublished(post)}
              >
                {post.published ? "Unpublish" : "Publish"}
              </button>
              <button className="underline" onClick={() => onDelete(post)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Posts;
