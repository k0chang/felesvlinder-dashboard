import { Form, json, useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import { ja } from "date-fns/locale/ja";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
import { PencilLine } from "lucide-react";
import { FormEvent, useState } from "react";
import { useDropzone } from "react-dropzone-esm";
import { Descendant } from "slate";
import { DnD } from "~/components/dnd";
import { RichTextEditor } from "~/components/editor";
import { LoadingView } from "~/components/loading/loading-view";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import { type About, aboutSchema } from "~/models/about";

export async function clientLoader() {
  document.title = "About | FELESVLINDER";

  const db = getFirestore();
  const aboutRef = doc(db, "about", "v2");
  const aboutDoc = await getDoc(aboutRef);
  const result = aboutSchema.safeParse(aboutDoc.data());
  if (!result.success) {
    throw new Response(null, { status: 404 });
  }

  const storage = getStorage();
  const imageRef = ref(
    storage,
    `gs://${import.meta.env.VITE_FIREBASE_STORAGE_BUCKET}/${
      result.data.icon_object_path
    }`
  );
  const url = await getDownloadURL(imageRef);

  return json({ about: result.data, icon: url });
}

export default function About() {
  const { about, icon } = useLoaderData<typeof clientLoader>();
  const [profileContent, setProfileContent] = useState<Descendant[]>(
    JSON.parse(about.profile)
  );
  const [worksContent, setWorksContent] = useState<Descendant[]>(
    JSON.parse(about.works)
  );
  const [file, setFile] = useState<File | null>(null);

  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      const payload: About = {
        ...about,
        profile: JSON.stringify(profileContent),
        works: JSON.stringify(worksContent),
      };
      if (file) {
        const storage = getStorage();
        const storageRef = ref(storage, `images/profile/${file.name}`);
        const deleteRef = ref(storage, about.icon_object_path);
        const uploadResult = await uploadBytes(storageRef, file);
        // 前のアイコンを削除
        await deleteObject(deleteRef);
        payload.icon_object_path = uploadResult.metadata.fullPath;
      }
      const db = getFirestore();
      const now = Date.now();
      payload.updated_at = now;
      payload.created_at = about.created_at ?? now;
      await setDoc(doc(db, "about", "v2"), payload);
      toast({ title: "保存しました", className: "bg-green-500 text-white" });
    } catch (e) {
      toast({
        title: "保存に失敗しました",
        className: "bg-red-500 text-white",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form onSubmit={onSubmit}>
      <h1 className="font-bold text-3xl inline-flex w-full justify-between items-center border-black border-b-[1px] pb-3">
        About{" "}
        {about.updated_at && (
          <span className="text-amber-950 flex gap-2 text-sm">
            <PencilLine size={20} />
            {format(about.updated_at, "yyyy/MM/dd - HH:mm", { locale: ja })}
          </span>
        )}
      </h1>

      <h2 className="font-bold text-lg mt-5">アイコンを変更する</h2>
      <img src={icon} alt="" className="size-[100px] mt-3" />
      <DnD
        file={file}
        rootProps={getRootProps()}
        inputProps={getInputProps()}
        isDragActive={isDragActive}
        onFileChange={setFile}
        className="h-[140px]"
      />

      <h2 className="font-bold text-lg mt-7">プロフィールを変更する</h2>
      <div className="font-sans">
        <RichTextEditor
          initialValue={profileContent}
          onChange={setProfileContent}
          classNames={{ root: "mt-5" }}
        />
      </div>

      <h2 className="font-bold text-lg mt-7">実績を変更する</h2>
      <div className="font-sans">
        <RichTextEditor
          initialValue={worksContent}
          onChange={setWorksContent}
          classNames={{ root: "mt-5" }}
        />
      </div>

      <Button
        className={
          "sticky text-white bottom-7 left-1/2 mt-8 w-1/2 -translate-x-1/2 bg-[#00000096]"
        }
        type="submit"
      >
        Submit
      </Button>

      {isSubmitting && <LoadingView title="送信中..." />}
    </Form>
  );
}
