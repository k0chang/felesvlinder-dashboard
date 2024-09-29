import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  ClientLoaderFunctionArgs,
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { format } from "date-fns";
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
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
import { ArrowLeft, PencilLine } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone-esm";
import { DnD } from "~/components/dnd";
import { LoadingView } from "~/components/loading/loading-view";
import { Button, buttonVariants } from "~/components/ui/button";
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
import { useToast } from "~/hooks/use-toast";
import { galleryFormSchema, gallerySchema } from "~/models/gallery";
import { getImageFileMeta } from "~/utils/image";

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  if (!params.id) {
    throw new Response("Not found", { status: 404 });
  }
  const db = getFirestore();
  const docRef = doc(db, "gallery", params.id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Response("Not found", { status: 404 });
  }

  document.title = `${docSnap.data().title} | Gallery`;

  return {
    gallery: gallerySchema.parse(docSnap.data()),
  };
}

export default function GalleryDetail() {
  const { gallery } = useLoaderData<typeof clientLoader>();
  const [db, storage] = [getFirestore(), getStorage()];

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
        <Button variant={"ghost"} asChild className="p-3">
          <Link to={"/gallery"}>
            <ArrowLeft />
          </Link>
        </Button>
        <p>一覧に戻る</p>
      </div>
      <div className="my-8">
        <h1 className="font-bold text-3xl inline-flex w-full justify-between items-center border-black border-b-[1px] pb-3">
          {gallery.title}
          {gallery.updatedAt && (
            <span className="text-amber-950 flex gap-2 text-sm">
              <PencilLine size={20} />
              {format(gallery.updatedAt, "yyyy/MM/dd - HH:mm")}
            </span>
          )}
        </h1>
      </div>

      <h2 className="font-bold text-lg">Before</h2>
      <div className="flex justify-center min-h-[300px] mb-4">
        <img
          src={gallery.url}
          alt="Current"
          className="object-contain max-h-[500px]"
        />
      </div>

      <h2 className="font-bold text-lg">After</h2>
      <DnD
        rootProps={getRootProps()}
        inputProps={getDropzoneInputProps()}
        isDragActive={isDragActive}
        file={file}
        onFileChange={setFile}
      />

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
          <DialogContent className="font-serif">
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
      {navigation.state === "submitting" && <LoadingView title="送信中" />}
    </Form>
  );
}
