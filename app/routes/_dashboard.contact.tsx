import { Form, json, useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import { ja } from "date-fns/locale/ja";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { PencilLine } from "lucide-react";
import { FormEvent, useState } from "react";
import { Descendant } from "slate";
import { RichTextEditor } from "~/components/editor";
import { Heading } from "~/components/heading";
import { LoadingView } from "~/components/loading/loading-view";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import { type Contact, contactSchema } from "~/models/contact";

export async function clientLoader() {
  document.title = "Contact | FELESVLINDER";
  const db = getFirestore();
  const contactRef = doc(db, "contact", "v2");
  const contactDoc = await getDoc(contactRef);
  const result = contactSchema.safeParse(contactDoc.data());
  if (!result.success) {
    throw new Response(null, { status: 404 });
  }
  return json({ contact: result.data });
}

export default function Contact() {
  const { contact } = useLoaderData<typeof clientLoader>();

  const [content, setContent] = useState<Descendant[]>(
    JSON.parse(contact.content)
  );

  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      const db = getFirestore();
      setIsSubmitting(true);

      const now = Date.now();
      const payload: Contact = {
        content: JSON.stringify(content),
        updated_at: now,
        created_at: contact.created_at ?? now,
      };
      await setDoc(doc(db, "contact", "v2"), payload);
      toast({
        title: "保存しました",
        className: "bg-green-500 text-white",
      });
    } catch (e) {
      toast({
        title: "保存に失敗しました",
        className: "bg-red-500 text-white",
      });
      throw new Error((e as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <>
      <Heading>
        Contact{" "}
        {contact.updated_at && (
          <span className="text-amber-950 flex gap-2 text-sm">
            <PencilLine size={20} />
            {format(contact.updated_at, "yyyy/MM/dd - HH:mm", { locale: ja })}
          </span>
        )}
      </Heading>

      <Form onSubmit={onSubmit}>
        <div className="font-sans">
          <RichTextEditor
            initialValue={content}
            onChange={setContent}
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
      </Form>

      {isSubmitting && <LoadingView title="送信中..." />}
    </>
  );
}
