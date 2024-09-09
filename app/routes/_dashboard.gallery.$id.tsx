import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { ArrowLeft } from "lucide-react";
import { DragEvent, useRef, useState } from "react";
import { z } from "zod";
import { LoadingView } from "~/components/loading/loading-view";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { db, storage } from "~/lib/firebase";
import { cn } from "~/lib/utils";
import { gallerySchema } from "~/models/gallery";
import { getImageFileMeta } from "~/utils/image";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema: galleryFormSchema });
  if (submission.status !== "success") {
    return json(submission.reply());
  }
  const { id, title, description, inSlideView, createdAt, image, filename } =
    submission.value;
  if (image) {
    const fileMeta = await getImageFileMeta(image);
    const storageRef = ref(storage, `images/gallery/${image.name}`);
    await deleteObject(ref(storage, `images/gallery/${filename}`));
    await uploadBytes(storageRef, image);
    const url = await getDownloadURL(
      ref(storage, `images/gallery/${image.name}`)
    );

    const payload = {
      title,
      description: description || "",
      url,
      filename: image.name,
      width: fileMeta.width,
      height: fileMeta.height,
      inSlideView: inSlideView === "on",
      updatedAt: Date.now(),
      createdAt: createdAt ? createdAt : Date.now(),
    };
    await updateDoc(doc(db, "gallery", id), payload);
    console.log("updated");
  } else {
    const payload = {
      title,
      description: description || "",
      inSlideView: inSlideView === "on",
      updatedAt: Date.now(),
      createdAt: createdAt ? createdAt : Date.now(),
    };
    await updateDoc(doc(db, "gallery", id), payload);
  }

  return json(submission.reply());
}

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.id) {
    throw new Response("Not found", { status: 404 });
  }
  const docRef = doc(db, "gallery", params.id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Response("Not found", { status: 404 });
  }

  return json({ gallery: gallerySchema.parse(docSnap.data()) });
}

const galleryFormSchema = z.object({
  id: z.string(),
  title: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string({ required_error: "タイトルを入力してください" })
  ),
  description: z.string().optional(),
  inSlideView: z.union([z.literal("on"), z.null()]),
  image: z.instanceof(File, { message: "選択してください" }).optional(),
  filename: z.string(),
  createdAt: z.number().optional(),
});
export const galleryPayloadSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  url: z.string().optional(),
  id: z.string().optional(),
  filename: z.string(),
  width: z.number(),
  height: z.number(),
  inSlideView: z.boolean(),
  updatedAt: z.number(),
  createdAt: z.number(),
});

export default function GalleryDetail() {
  const { gallery } = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();

  const navigation = useNavigation();
  const [file, setFile] = useState<File | null>(null);
  const [form, field] = useForm({
    lastResult,
    onValidate: ({ formData }) => {
      if (file) {
        formData.append("image", file);
      }

      return parseWithZod(formData, { schema: galleryFormSchema });
    },
    shouldValidate: "onInput",
    defaultValue: {
      title: gallery.title,
      description: gallery.description,
      inSlideView: gallery.inSlideView ? "on" : null,
      image: undefined,
      filename: gallery.filename,
    },
  });
  const [dragState, setDragState] = useState<"over" | "leave">("leave");
  const [dialogOpen, setDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragState("over");
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragState("leave");
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragState("leave");

    const files = e.dataTransfer?.files;
    if (files?.length && files[0].type.includes("image")) {
      setFile(files[0]);
    }
  }
  return (
    <Form method="post" encType="multipart/form-data" {...getFormProps(form)}>
      <div className="mb-3 flex items-center gap-2">
        <Button variant={"ghost"} asChild>
          <Link to={"/gallery"}>
            <ArrowLeft />
          </Link>
        </Button>
        <p>一覧に戻る</p>
      </div>

      <Card className="rounded-none p-7">
        <p>現在の画像</p>
        <div className="relative min-h-[500px]">
          <img src={gallery.url} alt="Current" className="object-contain" />
        </div>
        <button
          className={cn(
            "relative w-full flex min-h-[500px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[#444444]",
            dragState === "over" && "border-orange-600 bg-orange-100"
          )}
          type="button"
          onClick={() => {
            fileInputRef.current?.click();
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div>
            {!file && <p>ドラッグ&ドロップも可能</p>}
            {file && (
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="object-contain"
              />
            )}
            <input
              {...getInputProps(field.image, { type: "file" })}
              ref={fileInputRef}
              name="image"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) {
                  setFile(e.target.files[0]);
                }
              }}
            />
          </div>
        </button>
        <p className="text-red-600 text-sm">{field.image.errors?.[0]}</p>

        <label htmlFor="inSlideView" className="flex items-center my-3">
          <Input
            {...getInputProps(field.inSlideView, { type: "checkbox" })}
            id="inSlideView"
            className="mr-2 size-10"
          />
          スライドビューに表示する
        </label>

        <Input
          {...getInputProps(field.title, { type: "text" })}
          placeholder="title"
        />
        <p className="text-red-600 text-sm mb-3">{field.title.errors?.[0]}</p>
        <Input
          {...getInputProps(field.description, { type: "text" })}
          placeholder="description"
        />

        <div className="mt-5 flex justify-end gap-3">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant={"destructive"} className="">
                削除
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>確認</DialogTitle>
              </DialogHeader>
              <div>
                <p>本当に？</p>
                <div className="mt-6 flex justify-end gap-4">
                  <DialogClose>
                    <Button type="button" variant="secondary">
                      キャンセル
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    name="confirm-delete"
                    variant="destructive"
                  >
                    確定
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            type="submit"
            disabled={!form.valid || navigation.state === "submitting"}
          >
            保存
          </Button>
        </div>
      </Card>
      {navigation.state === "submitting" && <LoadingView title="送信中" />}
    </Form>
  );
}
