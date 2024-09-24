import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { FirebaseError } from "firebase/app";
import {
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { ArrowLeft } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { useDropzone } from "react-dropzone-esm";
import { LoadingView } from "~/components/loading/loading-view";
import { Button, buttonVariants } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
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
import { firebaseConfigFromEnv } from "~/lib/firebase";
import { cn } from "~/lib/utils";
import { galleryFormSchema, gallerySchema } from "~/models/gallery";
import { getImageFileMeta } from "~/utils/image";

export async function loader({ params, context }: LoaderFunctionArgs) {
  if (!params.id) {
    throw new Response("Not found", { status: 404 });
  }
  const db = getFirestore();
  const docRef = doc(db, "gallery", params.id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Response("Not found", { status: 404 });
  }

  return json({
    gallery: gallerySchema.parse(docSnap.data()),
    firebaseConfig: firebaseConfigFromEnv(context.cloudflare.env),
  });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data?.gallery.title
        ? `📝 ${data.gallery.title} | Gallery`
        : "📝 Gallery",
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
        // フォームに変更があった場合のみ更新日時を更新
        updatedAt: form.dirty ? Date.now() : gallery.updatedAt,
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
          toast({ title: "よくわからんエラー", variant: "destructive" });
          return;
        }
        try {
          await uploadBytes(storageRef, file);
        } catch (e) {
          toast({ title: "よくわからんエラー", variant: "destructive" });
          return;
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
  const [dialogOpen, setDialogOpen] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setFile(e.target.files[0]);
  };

  const {
    getInputProps: getDropzoneInputProps,
    getRootProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  async function handleDelete() {
    try {
      await deleteDoc(doc(db, "gallery", gallery.id));
      const imgRef = ref(storage, `images/gallery/${gallery.filename}`);
      await deleteObject(imgRef);
      toast({
        title: "削除しました",
        className: "bg-green-500 text-white",
      });

      navigate("/gallery");
    } catch (e) {
      toast({
        title: "削除に失敗しました",
        className: "bg-red-500 text-white",
      });
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
        <h2 className="font-bold text-lg">Before</h2>
        <div className="relative min-h-[500px] mb-4">
          <img src={gallery.url} alt="Current" className="object-contain" />
        </div>

        <h2 className="font-bold text-lg">After</h2>
        <div
          {...getRootProps()}
          className={cn(
            "relative w-full flex min-h-[500px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[#444444]",
            isDragActive && "border-orange-600 bg-orange-100"
          )}
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
            <Input {...getDropzoneInputProps()} onChange={onChange} />
          </div>
        </div>

        <label
          htmlFor={field.inSlideView.name}
          className="my-3 flex items-center"
        >
          <Checkbox
            defaultChecked={!!field.inSlideView.value}
            name={field.inSlideView.name}
            id={field.inSlideView.name}
            className="size-10 mr-2"
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
                  <Button variant="destructive" onClick={handleDelete}>
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
