import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  Blog,
  Paginated,
  BlogListParams,
  CreateBlogInput,
  UpdateBlogInput,
  LikeResponse,
} from "@/types/blog";

function toQueryString(params: BlogListParams): string {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.search) q.set("search", params.search);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const blogApi = createApi({
  reducerPath: "blogApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    credentials: "include",
  }),
  tagTypes: ["Blog", "MyBlog"],
  endpoints: (builder) => ({
    // ---------------- Queries ----------------

    getPublishedBlogs: builder.query<Paginated<Blog>, BlogListParams | void>({
      query: (params) => `/blogs${toQueryString(params ?? {})}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((b) => ({ type: "Blog" as const, id: b.id })),
              { type: "Blog" as const, id: "LIST" },
            ]
          : [{ type: "Blog" as const, id: "LIST" }],
    }),

    getMyBlogs: builder.query<Paginated<Blog>, BlogListParams | void>({
      query: (params) => `/blogs/mine${toQueryString(params ?? {})}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((b) => ({ type: "MyBlog" as const, id: b.id })),
              { type: "MyBlog" as const, id: "LIST" },
            ]
          : [{ type: "MyBlog" as const, id: "LIST" }],
    }),

    getBlogById: builder.query<Blog, string>({
      query: (id) => `/blogs/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Blog", id }],
    }),

    // ---------------- Mutations ----------------

    createBlog: builder.mutation<Blog, CreateBlogInput>({
      query: (body) => ({ url: "/blogs", method: "POST", body }),
      invalidatesTags: [
        { type: "Blog", id: "LIST" },
        { type: "MyBlog", id: "LIST" },
      ],
    }),

    updateBlog: builder.mutation<Blog, UpdateBlogInput>({
      query: ({ id, ...body }) => ({
        url: `/blogs/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Blog", id },
        { type: "Blog", id: "LIST" },
        { type: "MyBlog", id },
        { type: "MyBlog", id: "LIST" },
      ],
    }),

    deleteBlog: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/blogs/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Blog", id },
        { type: "Blog", id: "LIST" },
        { type: "MyBlog", id },
        { type: "MyBlog", id: "LIST" },
      ],
    }),

    toggleLike: builder.mutation<LikeResponse, string>({
      query: (id) => ({ url: `/blogs/like/${id}`, method: "POST" }),

      async onQueryStarted(blogId, { dispatch, getState, queryFulfilled }) {
        const patches: { undo: () => void }[] = [];

        const patchEndpoint = (
          endpointName: "getPublishedBlogs" | "getMyBlogs"
        ) => {
          const state = getState() as any;
          const queries: Record<string, any> =
            state?.blogApi?.queries ?? {};

          for (const key of Object.keys(queries)) {
            const entry = queries[key];
            if (
              !entry ||
              entry.endpointName !== endpointName ||
              !entry.data
            ) {
              continue;
            }

            const patch = dispatch(
              blogApi.util.updateQueryData(
                endpointName,
                entry.originalArgs as any,
                (draft: any) => {
                  const b = draft?.data?.find((x: Blog) => x.id === blogId);
                  if (!b) return;
                  const nowLiked = !b.liked;
                  b.liked = nowLiked;
                  b.likesCount = Math.max(
                    0,
                    b.likesCount + (nowLiked ? 1 : -1)
                  );
                }
              )
            );
            patches.push(patch as any);
          }
        };

        patchEndpoint("getPublishedBlogs");
        patchEndpoint("getMyBlogs");

        // Detail cache — may not exist; updateQueryData is a no-op if absent
        const detailPatch = dispatch(
          blogApi.util.updateQueryData("getBlogById", blogId, (draft) => {
            const nowLiked = !draft.liked;
            draft.liked = nowLiked;
            draft.likesCount = Math.max(
              0,
              draft.likesCount + (nowLiked ? 1 : -1)
            );
          })
        );
        patches.push(detailPatch as any);

        try {
          const { data } = await queryFulfilled;
          // Reconcile with server truth
          dispatch(
            blogApi.util.updateQueryData("getBlogById", blogId, (draft) => {
              draft.liked = data.liked;
              draft.likesCount = data.likesCount;
            })
          );
        } catch {
          // Roll back on failure
          patches.forEach((p) => p.undo());
        }
      },
    }),
  }),
});

export const {
  useGetPublishedBlogsQuery,
  useGetMyBlogsQuery,
  useGetBlogByIdQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useToggleLikeMutation,
} = blogApi;