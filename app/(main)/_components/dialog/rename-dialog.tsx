import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlayCustom,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoaderIcon, PlusCircleIcon, SmilePlusIcon } from "lucide-react";
import { type PropsWithChildren } from "react";
import useRename from "../../_hooks/use-rename";
import EmojiPickerPopover, {
  type Emoji,
} from "@/components/popover/emoji-picker-popover";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { type EmitActionStatus } from "@/types";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type { EmojiClickData } from "emoji-picker-react";

type Props = PropsWithChildren & {
  uuid: string;
  emitActionStatus?: EmitActionStatus;
};

const transformEmojiData = (emojiData: EmojiClickData): Emoji => {
  return {
    id: emojiData.unified,
    name: emojiData.names[0] || "",
    keywords: [], // EmojiClickData doesn't provide keywords
    native: emojiData.emoji,
    shortcodes: "",
    unified: emojiData.unified,
  };
};

export default function RenameDialog({
  children,
  uuid,
  emitActionStatus,
}: Props) {
  const { privateSidebarTree } = useSidebarStore();
  const selected = privateSidebarTree?.get(uuid);
  const {
    closeButtonRef,
    form,
    isDisableSubmit,
    isLoadingSubmit,
    openDialogHandler,
    submitHandler,
  } = useRename({
    uuid,
    title: selected?.title ?? null,
    emoji: (selected?.emoji as Emoji) ?? null,
    emitActionStatus,
  });

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    const transformedEmoji = transformEmojiData(emojiData);
    form.setValue("emoji", transformedEmoji);
  };

  return (
    <Dialog onOpenChange={openDialogHandler}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        overlay={<DialogOverlayCustom />}
        className="top-[5%] flex w-[90%] translate-y-[0] flex-col gap-0 rounded-xl bg-background p-0 md:!max-w-xl"
      >
        <VisuallyHidden>
          <DialogTitle>Rename page</DialogTitle>
        </VisuallyHidden>
        <RenameDialog.Title />

        <Form {...form}>
          <form
            onSubmit={submitHandler}
            className="flex w-full gap-x-2 px-3 pb-3"
            autoComplete="off"
          >
            <EmojiPickerPopover onEmojiSelect={handleEmojiSelect}>
              <Button
                variant="outline"
                size="lg"
                className="h-11 w-11 shrink-0 rounded-xl p-0"
              >
                {form.getValues("emoji.native") ? (
                  <span className="text-xl">
                    {form.getValues("emoji.native")}
                  </span>
                ) : (
                  <SmilePlusIcon className="w-5" />
                )}
              </Button>
            </EmojiPickerPopover>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="w-full space-y-0">
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter page title..."
                      className="rounded-xl"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="m-0 px-3 pb-3 pt-0" />
                </FormItem>
              )}
            />

            <Button
              size="lg"
              className="w-20 rounded-xl"
              type="submit"
              disabled={isDisableSubmit}
            >
              {isLoadingSubmit ? (
                <LoaderIcon className="h-4 w-4 animate-spin" />
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </Form>

        <DialogClose asChild>
          <Button className="hidden" ref={closeButtonRef}>
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

RenameDialog.Title = function Title() {
  return (
    <div className="mb-1 flex items-center justify-start p-3">
      <PlusCircleIcon className="mr-2 h-4 w-4" />
      <p className="text-base font-medium leading-none">Rename page</p>
    </div>
  );
};
