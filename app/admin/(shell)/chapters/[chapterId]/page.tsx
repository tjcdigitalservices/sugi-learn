import { notFound } from "next/navigation";

import { ChapterManagementEditor } from "@/components/admin/chapter-management/chapter-management-editor";
import {
  getChapterForAdmin,
  listAllCharacters,
} from "@/lib/domain/chapter-management";

interface AdminChapterDetailPageProps {
  params: Promise<{ chapterId: string }>;
}

export default async function AdminChapterDetailPage({
  params,
}: AdminChapterDetailPageProps) {
  const { chapterId } = await params;

  let chapter;
  let allCharacters;

  try {
    [chapter, allCharacters] = await Promise.all([
      getChapterForAdmin(chapterId),
      listAllCharacters(),
    ]);
  } catch {
    notFound();
  }

  if (!chapter) {
    notFound();
  }

  return (
    <ChapterManagementEditor chapter={chapter} allCharacters={allCharacters} />
  );
}
