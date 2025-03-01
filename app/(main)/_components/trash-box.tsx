import * as React from "react";
import { useTrashStore } from "@/store/use-trash-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Trash, Undo } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

export function TrashBox() {
  const router = useRouter();
  const [search, setSearch] = React.useState<string>("");
  const {
    list,
    loading,
    more,
    getTrashAsync,
    nextPageAsync,
    deletePagePermanent,
    restorePageAsync,
  } = useTrashStore();

  const debouncedSearch = React.useMemo(() => {
    return debounce((value: string) => {
      getTrashAsync(value);
    }, 300);
  }, [getTrashAsync]);

  React.useEffect(() => {
    getTrashAsync();
  }, [getTrashAsync]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
  };

  const onClick = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 p-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search trash..."
          value={search}
          onChange={handleSearch}
          className="h-7 px-2 text-xs"
        />
      </div>
      <div className="flex-1 overflow-auto px-4">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && list && list.length === 0 && (
          <p className="text-sm text-muted-foreground">No items in trash</p>
        )}
        {!loading &&
          list &&
          list.map((item) => (
            <div
              key={item.uuid}
              className="flex items-center justify-between py-2"
            >
              <div>
                <p
                  className="text-sm font-medium"
                  role="button"
                  onClick={() => onClick(item.uuid)}
                >
                  {item.title && item.title.length > 25
                    ? item.title.slice(0, 25) + "..."
                    : item.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  Created{" "}
                  {formatDistanceToNow(new Date(item.updated_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => restorePageAsync(item.uuid)}
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deletePagePermanent(item.uuid)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
      </div>
      {more && (
        <div className="p-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => nextPageAsync()}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export function debounce<T extends (...args: never[]) => ReturnType<T>>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
