import { createClient } from "@/lib/supabase/client";
import { Enums } from "@/lib/supabase/database.types";
import { toastError, toastSuccess } from "@/components/toast";
import { useRef, useState } from "react";

type ModalData = {
  feel: Enums<"FEEDBACK_FEEL"> | null;
  message: string;
  isContacted: boolean;
  isSubmitting: boolean;
};

export default function useFeedback() {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [content, setContent] = useState<ModalData>({
    feel: null,
    message: "",
    isContacted: false,
    isSubmitting: false,
  });

  const contentChangeHandler = (props: Partial<ModalData> = {}) => {
    if (content.isSubmitting) return;
    setContent((prev) => ({ ...prev, ...props }));
  };

  const resetContentHandler = () =>
    setContent({
      feel: null,
      message: "",
      isContacted: false,
      isSubmitting: false,
    });

  const onSubmitHandler = async () => {
    try {
      contentChangeHandler({ isSubmitting: true });
      const supabase = createClient();
      const { error } = await supabase.from("feedback").insert({
        message: content.message ?? null,
        is_contacted: content.isContacted ?? false,
        feel: content.feel as Enums<"FEEDBACK_FEEL">,
      });

      if (error) throw new Error(error.message);

      toastSuccess({
        description: "Feedback has been submit successfully.",
      });

      closeButtonRef.current?.click();
    } catch (error) {
      console.log(error);
      toastError({
        description: "Something went wrong, failed to submit feedback.",
      });
    } finally {
      contentChangeHandler({ isSubmitting: false });
    }
  };

  const FEEL: Record<number, Enums<"FEEDBACK_FEEL">> = {
    1: "TERRIBLE",
    2: "BAD",
    3: "OKAY",
    4: "GOOD",
    5: "AMAZING",
  };

  return {
    closeButtonRef,
    content,
    contentChangeHandler,
    resetContentHandler,
    onSubmitHandler,
    FEEL,
  };
}
