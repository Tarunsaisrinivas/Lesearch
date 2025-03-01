"use client";

import { useState } from "react";
// import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Drawer as AntdDrawer } from "antd";
import Comments_Component from "./comments";
import {
  BookmarkPlus,
  ExternalLink,
  MessageCircle,
  Search,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// import { createClient } from '@/lib/supabase/client'
import { toastError, toastSuccess } from "@/components/toast";
// import { useSidebarStore } from '@/store/use-sidebar-store'
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/spinner";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface Paper {
  title: string;
  authors: string[];
  abstract: string;
  url: string;
}

export default function PaperSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [papers, setPapers] = useState<Paper[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConversionLoading, setConversionLoading] = useState(false);
  const [useSemanticScholar] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [convertedPaper] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSavePdf, setShowSavePdf] = useState(false);
  const [showConvertSaveDialog, setShowConvertSaveDialog] = useState(false);
  const supabase = createClient();

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/${useSemanticScholar ? "semantic-scholar" : "arxiv"}?query=${encodeURIComponent(query)}`,
      );
      if (response.ok) {
        const data = await response.json();
        setPapers(data.length > 0 ? data : null);
      } else {
        setPapers(null);
      }
    } catch (error) {
      console.error("Error fetching papers:", error);
      setPapers(null);
    } finally {
      setIsLoading(false);
    }
  };

  const showDrawer = async (paper: Paper) => {
    setSelectedPaper(paper);
    setOpen(true);
  };

  // const handleSaveClick = async (paper: Paper) => {
  //   setSelectedPaper(paper);
  //   const arxiv_id = paper.url.match(/abs\/(\d+\.\d+)(v\d+)?/);
  //   const open_access_id = arxiv_id ? `arxiv:${arxiv_id[1]}` : null;
  //   if (!open_access_id) {
  //     toastError({ description: "No URL found" });
  //     return;
  //   }

  //   const { data: convertedPaper } = await supabase
  //     .from("pages")
  //     .select("*")
  //     .eq("open_access_id", open_access_id)
  //     .single();
  //   if (!convertedPaper) {
  //     setShowConvertSaveDialog(true);
  //   } else {
  //     setConvertedPaper(convertedPaper);
  //     setShowSaveDialog(true);
  //   }
  // };

  const SavePdfDialog = async (paper: Paper) => {
    // TODO : handle semamtic scholar  as well
    setSelectedPaper(paper);
    const paper_id = paper.url.split("/").slice(-1)[0];
    const open_access_id = `semantic:${paper_id}`;

    const { data: user } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("pages")
      .select("uuid")
      .eq("open_access_id", open_access_id)
      .eq("is_public", true)
      .eq("user_id", user.user?.id)
      .single();
    if (data) {
      toastError({ description: "Pdf already exists" });
    } else {
      setShowSavePdf(true);
    }
  };
  const handleSavePdf = async () => {
    //https://arxiv.org/pdf/2501.13927
    if (!selectedPaper) return;
    const { data: user } = await supabase.auth.getUser();
    const paper_id = selectedPaper.url.split("/").slice(-1)[0];
    const open_access_id = `semantic:${paper_id}`;
    try {
      const response = await fetch(
        `/api/annotate?open_access_id=${open_access_id}&user_id=${user.user?.id}&ret_only_url=false`,
      );
      const { data } = await response.json();

      if (data) {
        toastSuccess({ description: "Paper saved successfully" });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSavePaper = async (isPublic: boolean) => {
    setConversionLoading(true);
    if (!selectedPaper) {
      toastError({
        description: "No paper selected. Please select a paper first.",
      });
      setConversionLoading(false);
      return;
    }

    const { data: user } = await supabase.auth.getUser();
    if (showConvertSaveDialog) {
      const arxivIdMatch = selectedPaper.url.match(/abs\/(\d+\.\d+)(v\d+)?/);
      const arxivId = arxivIdMatch ? arxivIdMatch[1] : null;

      if (!arxivId) {
        toastError({
          description: "Invalid arXiv URL. Please check the selected paper.",
        });
        setConversionLoading(false);
        return;
      }
      try {
        const response = await fetch("/api/save-paper", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ arxivId, isPublic }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "An error occurred while saving the paper",
          );
        }

        if (data.paper) {
          toastSuccess({
            description: `Convert request successful. The paper will be added to your ${isPublic ? "Public" : "Personal"} pages soon.`,
          });
        } else {
          toastError({
            description: "Convert request failed. Please try again later.",
          });
        }
      } catch (error) {
        console.error("Error saving paper:", error);
        toastError({
          description:
            error instanceof Error
              ? error.message
              : "Error while converting. Please try again later.",
        });
      } finally {
        setConversionLoading(false);
        setShowConvertSaveDialog(false);
      }
    } else {
      if (!convertedPaper) {
        toastError({
          description: "No paper selected. Please select a paper first.",
        });
        setConversionLoading(false);
        return;
      }
      try {
        const response = await fetch("/api/insert-paper", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            convertedPaper,
            isPublic,
            userId: user.user?.id,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "An error occurred while saving the paper",
          );
        }

        if (data.paper) {
          toastSuccess({
            description: `Insertion successful. The paper is added to your ${isPublic ? "Public" : "Personal"} pages.`,
          });
        } else {
          toastError({
            description: "Paper insertion failed. Please try again later.",
          });
        }
      } catch (error) {
        console.error("Error saving paper:", error);
        toastError({
          description:
            error instanceof Error
              ? error.message
              : "Error while Saving. Please try again later.",
        });
      } finally {
        setConversionLoading(false);
        setShowSaveDialog(false);
      }
    }

    setShowSaveDialog(false);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Research Paper Search
      </h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex space-x-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter search query"
                className="pl-8"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </form>
          <div className="flex items-center space-x-2 mt-4">
            <Label htmlFor="use-semantic-scholar">
              Powered by Semantic Scholar Search
            </Label>
          </div>
        </CardContent>
      </Card>

      <ScrollArea className="h-[calc(100vh-300px)]">
        {isLoading ? (
          <Card>
            <CardContent className="w-full flex justify-center items-center p-4">
              <Spinner />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {papers === null ? (
              <Card>
                <CardContent className="p-4">
                  <p className="text-center text-muted-foreground">
                    No papers found for the given search query.
                  </p>
                </CardContent>
              </Card>
            ) : (
              papers.map((paper, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{paper.title}</CardTitle>
                    <Badge variant="secondary" className="w-fit">
                      {paper.authors.join(", ")}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {paper.abstract}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={paper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Redirect to Semantic Scholar
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => showDrawer(paper)}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Comments
                      </Button>
                    </div>
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => SavePdfDialog(paper)}
                      >
                        <BookmarkPlus className="mr-2 h-4 w-4" />
                        Save Paper
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        )}
      </ScrollArea>
      <AntdDrawer title="Comments" onClose={onClose} open={open} width={500}>
        <Comments_Component paper={selectedPaper} />
      </AntdDrawer>
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Where do you want to save?</AlertDialogTitle>
            <AlertDialogDescription>
              Choose whether to save the paper privately or publicly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="flex justify-between w-full">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <div className="flex gap-3">
                <AlertDialogAction onClick={() => handleSavePaper(false)}>
                  Personal
                </AlertDialogAction>
                <AlertDialogAction onClick={() => handleSavePaper(true)}>
                  Public
                </AlertDialogAction>
              </div>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showSavePdf} onOpenChange={setShowSavePdf}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save the Pdf?</AlertDialogTitle>
            <AlertDialogDescription>
              Pdf will save in public collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="flex justify-between w-full">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSavePdf}>Yes</AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={showConvertSaveDialog}
        onOpenChange={setShowConvertSaveDialog}
      >
        {!isConversionLoading ? (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>The paper is not Converted!</AlertDialogTitle>
              <AlertDialogDescription>
                Choose whether to convert and save the paper privately or
                publicly.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <div className="flex justify-between w-full">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <div className="flex gap-3">
                  <AlertDialogAction onClick={() => handleSavePaper(false)}>
                    Personal
                  </AlertDialogAction>
                  <AlertDialogAction onClick={() => handleSavePaper(true)}>
                    Public
                  </AlertDialogAction>
                </div>
              </div>
            </AlertDialogFooter>
          </AlertDialogContent>
        ) : (
          <AlertDialogContent>
            <VisuallyHidden>
              <AlertDialogTitle>The paper is not Converted!</AlertDialogTitle>
            </VisuallyHidden>
            <div className="w-full flex justify-center items-center p-4">
              <Spinner />
            </div>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </div>
  );
}
