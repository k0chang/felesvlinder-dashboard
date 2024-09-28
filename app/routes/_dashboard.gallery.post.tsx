import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, useNavigate, useNavigation } from "@remix-run/react";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone-esm";
import { DnD } from "~/components/dnd";
import { LoadingView } from "~/components/loading/loading-view";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { useToast } from "~/hooks/use-toast";
import { galleryFormSchema, GalleryPayload } from "~/models/gallery";
import { getImageFileMeta } from "~/utils/image";

export async function clientLoader() {
  document.title = "新規投稿 | FELESVLINDER";
  return null;
}

export default function GalleryPost() {
  const [storage, db] = [getStorage(), getFirestore()];

  const navigation = useNavigation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fieldError, setFieldError] = useState<{ file: string | null }>({
    file: null,
  });
  const [file, setFile] = useState<File | null>(null);
  const [form, field] = useForm({
    onValidate: ({ formData }) => {
      if (!file) {
        setFieldError({ file: "画像プリーズ" });
      }
      return parseWithZod(formData, { schema: galleryFormSchema });
    },
    onSubmit: async (event, { formData }) => {
      event.preventDefault();
      if (!file) return;
      const submission = parseWithZod(formData, { schema: galleryFormSchema });
      if (submission.status !== "success") {
        return submission.reply();
      }
      const { title, description, inSlideView } = submission.value;
      try {
        const { width, height } = await getImageFileMeta(file);
        const storageRef = ref(storage, `images/gallery/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        const id = window.crypto.randomUUID();
        const payload: GalleryPayload = {
          title,
          description: description ?? "",
          url,
          id,
          filename: file.name,
          width,
          height,
          inSlideView: inSlideView === "on",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await setDoc(doc(db, "gallery", id), payload);
        toast({ title: "保存しました", className: "bg-[#00cb00] text-white" });
        navigate("/gallery");
      } catch (e) {
        toast({
          title: "保存に失敗しました",
          className: "bg-[#cb0000] text-white",
        });
      }
    },
    shouldRevalidate: "onInput",
    defaultValue: {
      inSlideView: null,
      title: "",
      description: "",
    },
  });

  const onDrop = (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (rejectedFiles.length) {
      setFieldError({ file: "画像ファイルを選択" });
      return;
    }
    setFieldError({ file: null });
    setFile(acceptedFiles[0]);
  };

  const {
    getInputProps: getDropzoneInputProps,
    getRootProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  return (
    <Form {...getFormProps(form)}>
      <h1>新規投稿</h1>
      <DnD
        rootProps={getRootProps()}
        inputProps={getDropzoneInputProps()}
        isDragActive={isDragActive}
        file={file}
        onFileChange={setFile}
      />
      {fieldError.file && <p className="text-red-500">{fieldError.file}</p>}

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

      <label htmlFor={field.title.name} className="mb-2 block">
        <p>題名</p>
        <Input
          {...getInputProps(field.title, { type: "text" })}
          id={field.title.name}
        />
        {field.title.errors && (
          <p className="text-sm text-red-500">{field.title.errors[0]}</p>
        )}
      </label>

      <label htmlFor={field.description.name}>
        <p>説明</p>
        <Input
          {...getInputProps(field.description, { type: "text" })}
          id={field.description.name}
        />
      </label>
      <Button className="mt-6 w-full">保存</Button>
      {navigation.state === "submitting" && <LoadingView title="送信中" />}
    </Form>
  );
}
