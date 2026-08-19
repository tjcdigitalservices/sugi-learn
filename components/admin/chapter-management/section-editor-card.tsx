"use client";

import { useEffect, useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

import {
  buttonDangerClassName,
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  FormFeedback,
  FormField,
  formControlClassName,
} from "@/components/admin/chapter-management/form-primitives";
import { ReviewStatusBadge } from "@/components/admin/review-status-badge";
import {
  formatSectionKind,
  REVIEW_STATUS_OPTIONS,
} from "@/lib/chapter-management/constants";
import {
  deleteSectionAction,
  reorderSectionsAction,
  saveSectionAction,
} from "@/lib/chapter-management/actions";
import { SectionMediaPicker } from "@/components/admin/media-management/section-media-picker";
import type {
  ChapterSection,
  Character,
  LearningPoint,
} from "@/types/chapter";
import type { MediaAsset } from "@/types/media";
import type { ReviewStatus } from "@/types/review";

interface SectionEditorCardProps {
  chapterId: string;
  section: ChapterSection;
  sectionIndex: number;
  sectionCount: number;
  allSectionIds: string[];
  characters: Character[];
  learningPoints: LearningPoint[];
  mediaAssets: MediaAsset[];
  onChanged: () => void;
}

export function SectionEditorCard({
  chapterId,
  section,
  sectionIndex,
  sectionCount,
  allSectionIds,
  characters,
  learningPoints,
  mediaAssets,
  onChanged,
}: SectionEditorCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(
    section.reviewStatus,
  );
  const [body, setBody] = useState(
    section.kind === "introduction" ||
      section.kind === "story" ||
      section.kind === "cultural_context" ||
      section.kind === "activity"
      ? section.body
      : "",
  );
  const [transcript, setTranscript] = useState(
    section.kind === "audio" ? section.transcript ?? "" : "",
  );
  const [completionMessage, setCompletionMessage] = useState(
    section.kind === "completion" ? section.message ?? "" : "",
  );
  const [characterIds, setCharacterIds] = useState<string[]>(
    section.kind === "characters" ? section.characterIds : [],
  );
  const [learningPointIds, setLearningPointIds] = useState<string[]>(
    section.kind === "learning_points" ? section.learningPointIds : [],
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setTitle(section.title);
    setReviewStatus(section.reviewStatus);
    if (
      section.kind === "introduction" ||
      section.kind === "story" ||
      section.kind === "cultural_context" ||
      section.kind === "activity"
    ) {
      setBody(section.body);
    }
    if (section.kind === "audio") {
      setTranscript(section.transcript ?? "");
    }
    if (section.kind === "completion") {
      setCompletionMessage(section.message ?? "");
    }
    if (section.kind === "characters") {
      setCharacterIds(section.characterIds);
    }
    if (section.kind === "learning_points") {
      setLearningPointIds(section.learningPointIds);
    }
  }, [section]);

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const payload = {
        title,
        reviewStatus,
        body:
          section.kind === "introduction" ||
          section.kind === "story" ||
          section.kind === "cultural_context" ||
          section.kind === "activity"
            ? body
            : undefined,
        transcript: section.kind === "audio" ? transcript : undefined,
        completionMessage:
          section.kind === "completion" ? completionMessage : undefined,
        characterIds: section.kind === "characters" ? characterIds : undefined,
        learningPointIds:
          section.kind === "learning_points" ? learningPointIds : undefined,
      };

      const result = await saveSectionAction(chapterId, section.id, payload);
      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess("Section saved.");
      onChanged();
    });
  }

  function handleDelete() {
    if (
      !window.confirm(
        "Delete this section? This action cannot be undone.",
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteSectionAction(chapterId, section.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onChanged();
    });
  }

  function handleMove(direction: "up" | "down") {
    const targetIndex = direction === "up" ? sectionIndex - 1 : sectionIndex + 1;
    if (targetIndex < 0 || targetIndex >= sectionCount) {
      return;
    }

    const nextOrder = [...allSectionIds];
    [nextOrder[sectionIndex], nextOrder[targetIndex]] = [
      nextOrder[targetIndex],
      nextOrder[sectionIndex],
    ];

    startTransition(async () => {
      const result = await reorderSectionsAction(chapterId, nextOrder);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onChanged();
    });
  }

  function toggleReferenceId(
    current: string[],
    id: string,
    setter: (value: string[]) => void,
  ) {
    if (current.includes(id)) {
      setter(current.filter((item) => item !== id));
    } else {
      setter([...current, id]);
    }
  }

  return (
    <article className="rounded-lg border bg-card">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {formatSectionKind(section.kind)}
            </span>
            <ReviewStatusBadge status={section.reviewStatus} />
          </div>
          <h3 className="truncate text-base font-semibold">{section.title}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-label="Move section up"
            className="rounded-md border p-2 hover:bg-muted disabled:opacity-40"
            onClick={() => handleMove("up")}
            disabled={isPending || sectionIndex === 0}
          >
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Move section down"
            className="rounded-md border p-2 hover:bg-muted disabled:opacity-40"
            onClick={() => handleMove("down")}
            disabled={isPending || sectionIndex === sectionCount - 1}
          >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={buttonSecondaryClassName}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "Collapse" : "Edit"}
          </button>
        </div>
      </div>

      {expanded ? (
        <form onSubmit={handleSave} className="space-y-4 border-t p-4">
          <FormField label="Title" htmlFor={`section-title-${section.id}`}>
            <input
              id={`section-title-${section.id}`}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={formControlClassName}
              required
            />
          </FormField>

          <FormField label="Status" htmlFor={`section-status-${section.id}`}>
            <select
              id={`section-status-${section.id}`}
              value={reviewStatus}
              onChange={(event) =>
                setReviewStatus(event.target.value as ReviewStatus)
              }
              className={formControlClassName}
            >
              {REVIEW_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          {(section.kind === "introduction" ||
            section.kind === "story" ||
            section.kind === "cultural_context" ||
            section.kind === "activity") && (
            <FormField label="Content" htmlFor={`section-body-${section.id}`}>
              <textarea
                id={`section-body-${section.id}`}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                className={`${formControlClassName} min-h-32`}
                placeholder="Enter content from approved sources only."
              />
            </FormField>
          )}

          {section.kind === "audio" ? (
            <FormField
              label="Transcript"
              htmlFor={`section-transcript-${section.id}`}
            >
              <textarea
                id={`section-transcript-${section.id}`}
                value={transcript}
                onChange={(event) => setTranscript(event.target.value)}
                className={`${formControlClassName} min-h-24`}
              />
            </FormField>
          ) : null}

          {section.kind === "completion" ? (
            <FormField
              label="Completion message"
              htmlFor={`section-completion-${section.id}`}
            >
              <textarea
                id={`section-completion-${section.id}`}
                value={completionMessage}
                onChange={(event) => setCompletionMessage(event.target.value)}
                className={`${formControlClassName} min-h-24`}
              />
            </FormField>
          ) : null}

          {section.kind === "illustration" ||
          section.kind === "audio" ||
          section.kind === "animation" ? (
            <SectionMediaPicker
              chapterId={chapterId}
              section={section}
              mediaAssets={mediaAssets}
              onChanged={onChanged}
            />
          ) : null}

          {section.kind === "characters" ? (
            <FormField label="Character references" htmlFor={`section-characters-${section.id}`}>
              {characters.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No characters associated with this chapter yet. Add characters
                  on the Characters tab first.
                </p>
              ) : (
                <div className="space-y-2 rounded-md border p-3">
                  {characters.map((character) => (
                    <label
                      key={character.id}
                      className="flex items-start gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={characterIds.includes(character.id)}
                        onChange={() =>
                          toggleReferenceId(
                            characterIds,
                            character.id,
                            setCharacterIds,
                          )
                        }
                      />
                      <span>
                        <span className="font-medium">{character.name}</span>
                        {character.description ? (
                          <span className="block text-muted-foreground">
                            {character.description}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </FormField>
          ) : null}

          {section.kind === "learning_points" ? (
            <FormField
              label="Learning point references"
              htmlFor={`section-points-${section.id}`}
            >
              {learningPoints.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No learning points have been added yet. Add learning points on
                  the Learning points tab first.
                </p>
              ) : (
                <div className="space-y-2 rounded-md border p-3">
                  {learningPoints.map((point) => (
                    <label
                      key={point.id}
                      className="flex items-start gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={learningPointIds.includes(point.id)}
                        onChange={() =>
                          toggleReferenceId(
                            learningPointIds,
                            point.id,
                            setLearningPointIds,
                          )
                        }
                      />
                      <span>
                        {point.title ? (
                          <span className="font-medium">{point.title}</span>
                        ) : null}
                        <span className="block text-muted-foreground">
                          {point.text}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </FormField>
          ) : null}

          <FormFeedback error={error} success={success} />

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className={buttonPrimaryClassName}
              disabled={isPending}
            >
              {isPending ? "Saving…" : "Save section"}
            </button>
            <button
              type="button"
              className={buttonDangerClassName}
              onClick={handleDelete}
              disabled={isPending}
            >
              <Trash2 className="mr-1 h-4 w-4" aria-hidden="true" />
              Delete
            </button>
          </div>
        </form>
      ) : null}
    </article>
  );
}
