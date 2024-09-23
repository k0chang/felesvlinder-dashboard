import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, useNavigation } from "@remix-run/react";
import { ChangeEvent, useState } from "react";
import { useDropzone } from "react-dropzone-esm";
import { LoadingView } from "~/components/loading/loading-view";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { galleryFormSchema } from "~/models/gallery";

export default function GalleryPost() {
  const navigation = useNavigation();
  const [form, field] = useForm({
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: galleryFormSchema });
    },
    onSubmit: async (event, { formData }) => {
      console.log(formData.get("inSlideView"));
    },
    defaultValue: {
      inSlideView: null,
      title: "",
      description: "",
    },
  });
  const [file, setFile] = useState<File | null>(null);

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

  return (
    <Form {...getFormProps(form)}>
      <h1>画像を投稿</h1>
      <div
        {...getRootProps()}
        className={cn(
          "relative flex min-h-[500px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[#444444]",
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
          <Input onChange={onChange} {...getDropzoneInputProps()} />
        </div>
      </div>

      <label htmlFor={field.inSlideView.name} className="my-3">
        <Checkbox
          defaultChecked={!!field.inSlideView.value}
          name={field.inSlideView.name}
          id={field.inSlideView.name}
        />
        スライドビューに表示する
      </label>

      <label htmlFor={field.title.name}>
        <p>題名</p>
        <Input {...getInputProps(field.title, { type: "text" })} />
      </label>
      <label htmlFor={field.description.name}>
        <p>説明</p>
        <Input {...getInputProps(field.description, { type: "text" })} />
      </label>
      <Button className="mt-6 w-full">保存</Button>
      {navigation.state === "submitting" && <LoadingView title="送信中" />}
    </Form>
  );
}
