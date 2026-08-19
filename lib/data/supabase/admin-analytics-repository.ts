import type { SupabaseClient } from "@supabase/supabase-js";

import {
  buildAnalyticsSummary,
} from "@/lib/analytics/aggregations";
import type { AnalyticsRawData } from "@/lib/analytics/raw-data";
import type { AdminAnalyticsRepository } from "@/lib/data/admin-analytics-types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { TypedSupabaseClient } from "@/lib/supabase/service";
import type { AnalyticsFilters } from "@/types/admin-analytics";
import type { AssessmentType } from "@/types/assessment";

type ClientFactory = () => Promise<SupabaseClient>;

function analyticsError(message: string): never {
  throw new Error(message);
}

async function loadRawData(
  supabase: TypedSupabaseClient,
): Promise<AnalyticsRawData> {
  const { data: chapters, error: chaptersError } = await supabase
    .from("chapters")
    .select("id, slug, chapter_number, title")
    .gt("chapter_number", 0)
    .order("chapter_number", { ascending: true });

  if (chaptersError) {
    analyticsError("Unable to load chapter analytics data.");
  }

  const { data: learners, error: learnersError } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("role", "learner");

  if (learnersError) {
    analyticsError("Unable to load learner profiles.");
  }

  const { data: progressRows, error: progressError } = await supabase
    .from("learner_chapter_progress")
    .select("profile_id, chapter_id, started_at, completed_at, updated_at");

  if (progressError) {
    analyticsError("Unable to load learner progress.");
  }

  const { data: assessments, error: assessmentsError } = await supabase
    .from("assessments")
    .select("id, type, title");

  if (assessmentsError) {
    analyticsError("Unable to load assessments.");
  }

  const assessmentById = new Map(
    (assessments ?? []).map((assessment) => [assessment.id, assessment]),
  );

  const { data: attemptRows, error: attemptsError } = await supabase
    .from("assessment_attempts")
    .select("id, profile_id, assessment_id, score, completed_at");

  if (attemptsError) {
    analyticsError("Unable to load assessment attempts.");
  }

  const completedAttemptIds = (attemptRows ?? [])
    .filter((attempt) => attempt.completed_at !== null)
    .map((attempt) => attempt.id);

  const { data: questionRows, error: questionsError } = await supabase
    .from("questions")
    .select("id, assessment_id, prompt");

  if (questionsError) {
    analyticsError("Unable to load assessment questions.");
  }

  let answerRows: {
    attempt_id: string;
    question_id: string;
    selected_option_id: string | null;
  }[] = [];

  if (completedAttemptIds.length > 0) {
    const { data, error: answersError } = await supabase
      .from("assessment_answers")
      .select("attempt_id, question_id, selected_option_id")
      .in("attempt_id", completedAttemptIds);

    if (answersError) {
      analyticsError("Unable to load assessment answers.");
    }
    answerRows = data ?? [];
  }

  const questionIds = (questionRows ?? []).map((question) => question.id);
  let optionRows: {
    id: string;
    question_id: string;
    is_correct: boolean;
  }[] = [];

  if (questionIds.length > 0) {
    const { data, error: optionsError } = await supabase
      .from("question_options")
      .select("id, question_id, is_correct")
      .in("question_id", questionIds);

    if (optionsError) {
      analyticsError("Unable to load question options.");
    }
    optionRows = data ?? [];
  }

  const slugByChapterId = new Map(
    (chapters ?? []).map((chapter) => [chapter.id, chapter.slug]),
  );

  const correctOptionByQuestion = new Map<string, Set<string>>();
  for (const option of optionRows) {
    if (!option.is_correct) {
      continue;
    }
    const set = correctOptionByQuestion.get(option.question_id) ?? new Set();
    set.add(option.id);
    correctOptionByQuestion.set(option.question_id, set);
  }

  return {
    chapters: (chapters ?? []).map((chapter) => ({
      id: chapter.id,
      slug: chapter.slug,
      number: chapter.chapter_number,
      title: chapter.title,
    })),
    learners: (learners ?? []).map((learner) => ({
      id: learner.id,
      displayName: learner.display_name,
    })),
    progress: (progressRows ?? [])
      .map((row) => {
        const slug = slugByChapterId.get(row.chapter_id);
        if (!slug) {
          return null;
        }
        return {
          learnerId: row.profile_id,
          chapterId: row.chapter_id,
          chapterSlug: slug,
          startedAt: row.started_at,
          completedAt: row.completed_at,
          updatedAt: row.updated_at,
        };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row)),
    attempts: (attemptRows ?? []).map((attempt) => {
      const assessment = assessmentById.get(attempt.assessment_id);
      return {
        id: attempt.id,
        learnerId: attempt.profile_id,
        assessmentId: attempt.assessment_id,
        assessmentType: (assessment?.type ?? "pre") as AssessmentType,
        assessmentTitle: assessment?.title ?? "Assessment",
        score: attempt.score,
        completedAt: attempt.completed_at,
      };
    }),
    answers: answerRows.map((answer) => {
      const correctOptions =
        correctOptionByQuestion.get(answer.question_id) ?? new Set();
      return {
        attemptId: answer.attempt_id,
        questionId: answer.question_id,
        selectedOptionId: answer.selected_option_id,
        isCorrect: answer.selected_option_id
          ? correctOptions.has(answer.selected_option_id)
          : false,
      };
    }),
    questions: (questionRows ?? [])
      .map((question) => {
        const assessment = assessmentById.get(question.assessment_id);
        if (!assessment) {
          return null;
        }
        return {
          id: question.id,
          assessmentId: question.assessment_id,
          assessmentType: assessment.type as AssessmentType,
          assessmentTitle: assessment.title,
          prompt: question.prompt,
        };
      })
      .filter((question): question is NonNullable<typeof question> =>
        Boolean(question),
      ),
  };
}

export class SupabaseAdminAnalyticsRepository implements AdminAnalyticsRepository {
  constructor(
    private readonly clientFactory: ClientFactory = getSupabaseServerClient,
  ) {}

  async getAnalyticsSummary(
    filters: AnalyticsFilters = {},
  ): Promise<ReturnType<typeof buildAnalyticsSummary>> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const raw = await loadRawData(supabase);
    return buildAnalyticsSummary(raw, filters);
  }
}
