"use client";

import { useState, useTransition } from "react";
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
import { REVIEW_STATUS_OPTIONS } from "@/lib/chapter-management/constants";
import {
  createLearningPointAction,
  deleteLearningPointAction,
  reorderLearningPointsAction,
  saveLearningPointAction,
} from "@/lib/chapter-management/actions";
import type { LearningPoint } from "@/types/chapter";
import type { ReviewStatus } from "@/types/review";

interface ChapterLearningPointsPanelProps {
  chapterId: string;
  learningPoints: LearningPoint[];
  onChanged: () => void;
}

export function ChapterLearningPointsPanel({
  chapterId,
  learningPoints,
  onChanged,
}: ChapterLearningPointsPanelProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createLearningPointAction(chapterId, {
        title: newTitle.trim() || null,
        description: newDescription,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setNewTitle("");
      setNewDescription("");
      setShowCreate(false);
      onChanged();
    });
  }

  function handleMove(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= learningPoints.length) {
      return;
    }

    const nextOrder = learningPoints.map((point) => point.id);
    [nextOrder[index], nextOrder[targetIndex]] = [
      nextOrder[targetIndex],
      nextOrder[index],
    ];

    startTransition(async () => {
      const result = await reorderLearningPointsAction(chapterId, nextOrder);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onChanged();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Learning points</h2>
        <p className="text-sm text-muted-foreground">
          Manage learning points for this chapter.
        </p>
      </div>

      {!showCreate ? (
        <button
          type="button"
          className={buttonPrimaryClassName}
          onClick={() => setShowCreate(true)}
        >
          Add learning point
        </button>
      ) : (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-lg border bg-muted/10 p-4"
        >
          <FormField label="Title (optional)" htmlFor="new-point-title">
            <input
              id="new-point-title"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              className={formControlClassName}
            />
          </FormField>
          <FormField label="Description" htmlFor="new-point-description">
            <textarea
              id="new-point-description"
              value={newDescription}
              onChange={(event) => setNewDescription(event.target.value)}
              className={`${formControlClassName} min-h-24`}
              required
              placeholder="Enter from approved sources only."
            />
          </FormField>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className={buttonPrimaryClassName}
              disabled={isPending}
            >
              {isPending ? "Adding…" : "Add learning point"}
            </button>
            <button
              type="button"
              className={buttonSecondaryClassName}
              onClick={() => {
                setShowCreate(false);
                setNewTitle("");
                setNewDescription("");
              }}
              disabled={isPending}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <FormFeedback error={error} />

      {learningPoints.length === 0 ? (
        <div className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          No learning points have been added yet.
        </div>
      ) : (
        <ul className="space-y-4">
          {learningPoints.map((point, index) => (
            <LearningPointEditor
              key={point.id}
              chapterId={chapterId}
              point={point}
              index={index}
              total={learningPoints.length}
              isPending={isPending}
              onMove={handleMove}
              onChanged={onChanged}
              onError={setError}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface LearningPointEditorProps {
  chapterId: string;
  point: LearningPoint;
  index: number;
  total: number;
  isPending: boolean;
  onMove: (index: number, direction: "up" | "down") => void;
  onChanged: () => void;
  onError: (message: string) => void;
}

function LearningPointEditor({
  chapterId,
  point,
  index,
  total,
  isPending,
  onMove,
  onChanged,
  onError,
}: LearningPointEditorProps) {
  const [title, setTitle] = useState(point.title ?? "");
  const [description, setDescription] = useState(point.text);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(
    point.reviewStatus,
  );
  const [success, setSuccess] = useState<string | null>(null);
  const [localPending, startTransition] = useTransition();

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(null);

    startTransition(async () => {
      const result = await saveLearningPointAction(chapterId, point.id, {
        title: title.trim() || null,
        description,
        reviewStatus,
      });

      if (!result.success) {
        onError(result.error);
        return;
      }

      setSuccess("Learning point saved.");
      onChanged();
    });
  }

  function handleDelete() {
    if (
      !window.confirm(
        "Delete this learning point? This action cannot be undone.",
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteLearningPointAction(chapterId, point.id);
      if (!result.success) {
        onError(result.error);
        return;
      }
      onChanged();
    });
  }

  const pending = isPending || localPending;

  return (
    <li className="rounded-lg border p-4">
      <form onSubmit={handleSave} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <ReviewStatusBadge status={point.reviewStatus} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-label="Move learning point up"
              className={buttonSecondaryClassName}
              onClick={() => onMove(index, "up")}
              disabled={pending || index === 0}
            >
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Move learning point down"
              className={buttonSecondaryClassName}
              onClick={() => onMove(index, "down")}
              disabled={pending || index === total - 1}
            >
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <FormField label="Title (optional)" htmlFor={`point-title-${point.id}`}>
          <input
            id={`point-title-${point.id}`}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={formControlClassName}
          />
        </FormField>

        <FormField
          label="Description"
          htmlFor={`point-description-${point.id}`}
        >
          <textarea
            id={`point-description-${point.id}`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={`${formControlClassName} min-h-24`}
            required
          />
        </FormField>

        <FormField label="Status" htmlFor={`point-status-${point.id}`}>
          <select
            id={`point-status-${point.id}`}
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

        {success ? (
          <p className="text-sm text-emerald-700">{success}</p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className={buttonPrimaryClassName}
            disabled={pending}
          >
            {pending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            className={buttonDangerClassName}
            onClick={handleDelete}
            disabled={pending}
          >
            <Trash2 className="mr-1 h-4 w-4" aria-hidden="true" />
            Delete
          </button>
        </div>
      </form>
    </li>
  );
}
