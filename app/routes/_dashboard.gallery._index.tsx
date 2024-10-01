import { json, Link, MetaFunction, useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import {
  collection,
  getDocs,
  getFirestore,
  orderBy,
  query,
} from "firebase/firestore";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { gallerySchema } from "~/models/gallery";

export const meta: MetaFunction = () => [{ title: "全投稿 | FELESVLINDER" }];

export async function clientLoader() {
  const db = getFirestore();
  const q = query(collection(db, "gallery"), orderBy("updatedAt", "desc"));
  const querySnapshot = await getDocs(q);
  const data = querySnapshot.docs.map((doc) => doc.data());

  const result = gallerySchema.array().safeParse(data);
  if (!result.success) {
    return json({ gallery: [] });
  }

  return json({ gallery: result.data });
}

export default function Gallery() {
  const { gallery } = useLoaderData<typeof clientLoader>();
  return (
    <>
      <div className="mb-10 mx-4 sm:mx-0 p-0 flex flex-row items-center justify-between">
        <h1 className="font-bold text-lg">全投稿</h1>
        <Button className="text-md" asChild>
          <Link to={"/gallery/post"}>新規作成</Link>
        </Button>
      </div>
      <div className="grid gap-3 p-0 md:grid-cols-2 lg:grid-cols-3">
        {gallery.map((g, i) => (
          <Link
            key={i}
            to={`/gallery/${g.id}`}
            className="flex h-20 sm:h-28 bg-white flex-row border transition hover:-translate-x-[1px] hover:-translate-y-[1px] hover:opacity-60"
          >
            <div className="aspect-square h-full bg-slate-200">
              <img
                src={g.url}
                alt="kari"
                width={g.width}
                height={g.height}
                className="h-full w-full object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
            <div className="flex flex-col gap-1 overflow-hidden px-2 py-2">
              <p className="truncate text-sm sm:text-base font-semibold">
                {g.title}
              </p>
              <p
                className={cn(
                  g.description && "text-gray-600",
                  !g.description && "text-gray-300",
                  "line-clamp-2 text-[8px] sm:text-xs italic"
                )}
              >
                {g.description || "-"}
              </p>
              <p
                className={cn(
                  g.updatedAt && "text-gray-600",
                  !g.updatedAt && "text-gray-300",
                  "font-mono text-[8px] sm:text-xs"
                )}
              >
                {g.updatedAt
                  ? format(new Date(g.updatedAt), "yyyy/MM/dd HH:mm")
                  : "--/--/-- --:--"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
