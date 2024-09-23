import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { FirebaseError } from "firebase/app";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { ArrowLeft } from "lucide-react";
import { DragEvent, useRef, useState } from "react";
import { LoadingView } from "~/components/loading/loading-view";
import { Button, buttonVariants } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { useFirebase } from "~/hooks/use-firebase";
import { useToast } from "~/hooks/use-toast";
import { firebaseConfig } from "~/lib/firebase";
import { cn } from "~/lib/utils";
import { galleryFormSchema, gallerySchema } from "~/models/gallery";
import { getImageFileMeta } from "~/utils/image";

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.id) {
    throw new Response("Not found", { status: 404 });
  }
  const db = getFirestore();
  const docRef = doc(db, "gallery", params.id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Response("Not found", { status: 404 });
  }

  return json({ gallery: gallerySchema.parse(docSnap.data()), firebaseConfig });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data?.gallery.title
        ? `${data.gallery.title} | Gallery`
        : "Gallery",
    },
  ];
};

export default function GalleryDetail() {
  const { gallery, firebaseConfig } = useLoaderData<typeof loader>();
  const { db, storage } = useFirebase(firebaseConfig);

  const navigation = useNavigation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [form, field] = useForm({
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: galleryFormSchema });
    },
    onSubmit: async (event, { formData }) => {
      event.preventDefault();
      const submission = parseWithZod(formData, { schema: galleryFormSchema });
      if (submission.status !== "success") {
        return submission.reply();
      }
      const { title, description, inSlideView } = submission.value;

      let payload = {
        title,
        description: description ?? "",
        filename: gallery.filename,
        url: gallery.url,
        width: gallery.width,
        height: gallery.height,
        inSlideView: inSlideView === "on",
        updatedAt: Date.now(),
        createdAt: gallery.createdAt ?? Date.now(),
      };
      if (file) {
        const { width, height } = await getImageFileMeta(file);
        const storageRef = ref(storage, `images/gallery/${file.name}`);
        try {
          await deleteObject(
            ref(storage, `images/gallery/${gallery.filename}`)
          );
        } catch (e) {
          console.error(e);
        }
        try {
          await uploadBytes(storageRef, file);
        } catch (e) {
          console.error(e);
        }
        const url = await getDownloadURL(storageRef);

        payload = {
          ...payload,
          url,
          filename: file.name,
          width,
          height,
        };
      }
      try {
        await updateDoc(doc(db, "gallery", gallery.id), payload);
        navigate("/gallery");
      } catch (e) {
        if (e instanceof FirebaseError) {
          if (e.code === "permission-denied") {
            toast({ title: "権限が足らん", variant: "destructive" });
            return;
          }
        }
        toast({ title: "よくわからんエラー", variant: "destructive" });
      }
    },
    defaultValue: {
      title: gallery.title,
      description: gallery.description,
      inSlideView: gallery.inSlideView ? "on" : null,
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
    if (files?.length) {
      setFile(files[0]);
    }
  }

  return (
    <Form {...getFormProps(form)}>
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
              type="file"
              name="image"
              ref={fileInputRef}
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

        <label
          htmlFor={field.inSlideView.name}
          className="flex items-center my-3"
        >
          <Input
            {...getInputProps(field.inSlideView, { type: "checkbox" })}
            id={field.inSlideView.name}
            className="mr-2 size-10 rounded-full"
          />
          スライドビューに表示する
        </label>
        <p className="text-red-600 text-sm">{field.inSlideView.errors?.[0]}</p>

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
            <DialogTrigger
              type="button"
              className={buttonVariants({ variant: "destructive" })}
            >
              削除
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>確認</DialogTitle>
                <DialogDescription />
              </DialogHeader>
              <div>
                <p>本当に？</p>
                <div className="mt-6 flex justify-end gap-4">
                  <DialogClose asChild>
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
          <Button disabled={!form.valid || navigation.state === "submitting"}>
            保存
          </Button>
        </div>
      </Card>
      {navigation.state === "submitting" && <LoadingView title="送信中" />}
    </Form>
  );
}
