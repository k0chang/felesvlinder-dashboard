import { json, useLoaderData } from "@remix-run/react";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { useState } from "react";
import { useDropzone } from "react-dropzone-esm";
import { Descendant } from "slate";
import { DnD } from "~/components/dnd";
import { RichTextEditor } from "~/components/editor";
import { aboutSchema } from "~/models/about";

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
    `gs://${import.meta.env.VITE_FIREBASE_STORAGE_BUCKET}/images/${
      result.data.icon_url
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

  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  return (
    <>
      <h1 className="font-bold text-3xl">About</h1>

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
    </>
  );
}
