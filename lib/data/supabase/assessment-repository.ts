import type { SupabaseClient } from "@supabase/supabase-js";

import {
  calculateRawScore,
  toLearnerAssessmentQuestions,
} from "@/lib/assessment/scoring";
import { buildAttemptQuestionReviews } from "@/lib/assessment/attempt-review";
import type { AssessmentRepository } from "@/lib/data/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { TypedSupabaseClient } from "@/lib/supabase/service";
import type {
  Assessment,
  AssessmentAnswer,
  AssessmentAttemptSummary,
  AssessmentQuestion,
  AssessmentSubmissionResult,
  AssessmentType,
  CompletedAttemptReview,
  LearnerAssessmentQuestion,
  LearnerAttemptHistoryItem,
} from "@/types/assessment";
import type {
  AdminAssessmentDetail,
  AdminAssessmentListItem,
  CreateQuestionInput,
  DeleteQuestionResult,
  UpdateAssessmentMetadataInput,
  UpdateQuestionInput,
} from "@/types/assessment-management";
import type { ReviewStatus } from "@/types/review";

type ClientFactory = () => Promise<SupabaseClient>;

function throwAssessmentError(message: string): never {
  throw new Error(message);
}

async function getChapterSlugMap(
  supabase: TypedSupabaseClient,
): Promise<Map<string, string>> {
  const { data, error } = await supabase.from("chapters").select("id, slug");
  if (error) {
    throwAssessmentError("Unable to load chapters.");
  }
  return new Map((data ?? []).map((row) => [row.id, row.slug]));
}

async function getChapterUuidBySlug(
  supabase: TypedSupabaseClient,
  chapterSlug: string | null | undefined,
): Promise<string | null> {
  if (!chapterSlug) {
    return null;
  }
  const { data, error } = await supabase
    .from("chapters")
    .select("id")
    .eq("slug", chapterSlug)
    .maybeSingle();
  if (error || !data) {
    throwAssessmentError("Invalid chapter association.");
  }
  return data.id;
}

async function applyQuestionSortOrder(
  supabase: TypedSupabaseClient,
  questionIds: string[],
): Promise<void> {
  const offset = 1000;
  for (let index = 0; index < questionIds.length; index += 1) {
    const { error } = await supabase
      .from("questions")
      .update({ sort_order: offset + index })
      .eq("id", questionIds[index]);
    if (error) {
      throwAssessmentError("Unable to reorder questions.");
    }
  }
  for (let index = 0; index < questionIds.length; index += 1) {
    const { error } = await supabase
      .from("questions")
      .update({ sort_order: index })
      .eq("id", questionIds[index]);
    if (error) {
      throwAssessmentError("Unable to reorder questions.");
    }
  }
}

async function mapQuestionsForAssessment(
  supabase: TypedSupabaseClient,
  assessmentId: string,
  assessmentType: AssessmentType,
): Promise<AssessmentQuestion[]> {
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("*")
    .eq("assessment_id", assessmentId)
    .order("sort_order", { ascending: true });

  if (questionsError) {
    throwAssessmentError("Unable to load assessment questions.");
  }

  if (!questions?.length) {
    return [];
  }

  const chapterSlugById = await getChapterSlugMap(supabase);
  const questionIds = questions.map((question) => question.id);
  const { data: options, error: optionsError } = await supabase
    .from("question_options")
    .select("*")
    .in("question_id", questionIds)
    .order("sort_order", { ascending: true });

  if (optionsError) {
    throwAssessmentError("Unable to load question options.");
  }

  const optionsByQuestion = new Map<string, NonNullable<typeof options>>();
  for (const option of options ?? []) {
    const list = optionsByQuestion.get(option.question_id) ?? [];
    list.push(option);
    optionsByQuestion.set(option.question_id, list);
  }

  return questions.map((question) => {
    const questionOptions = optionsByQuestion.get(question.id) ?? [];
    const correctOption = questionOptions.find((option) => option.is_correct);

    return {
      id: question.id,
      assessmentId: question.assessment_id,
      assessmentType,
      chapterId: question.chapter_id
        ? (chapterSlugById.get(question.chapter_id) ?? null)
        : null,
      prompt: question.prompt,
      options: questionOptions.map((option) => ({
        id: option.id,
        label: option.label,
        sortOrder: option.sort_order,
      })),
      correctOptionId: correctOption?.id ?? "",
      explanation: question.explanation,
      sourceReference: question.source_reference,
      reviewStatus: question.review_status as ReviewStatus,
      sortOrder: question.sort_order,
    };
  });
}

function mapAdminAssessmentRow(
  row: {
    id: string;
    type: AssessmentType;
    title: string;
    instructions: string | null;
    review_status: string;
    updated_at: string;
  },
  questionCount: number,
): AdminAssessmentListItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    instructions: row.instructions,
    questionCount,
    reviewStatus: row.review_status as ReviewStatus,
    updatedAt: row.updated_at,
  };
}

export class SupabaseAssessmentRepository implements AssessmentRepository {
  constructor(
    private readonly clientFactory: ClientFactory = getSupabaseServerClient,
  ) {}

  async listAssessments(): Promise<Assessment[]> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;

    const { data: assessments, error } = await supabase
      .from("assessments")
      .select("*")
      .order("type", { ascending: true });

    if (error) {
      throwAssessmentError("Unable to load assessments.");
    }

    if (!assessments?.length) {
      return [];
    }

    const assessmentIds = assessments.map((assessment) => assessment.id);
    const { data: questionCounts, error: countError } = await supabase
      .from("questions")
      .select("assessment_id")
      .in("assessment_id", assessmentIds);

    if (countError) {
      throwAssessmentError("Unable to load assessment questions.");
    }

    const counts = new Map<string, number>();
    for (const row of questionCounts ?? []) {
      counts.set(row.assessment_id, (counts.get(row.assessment_id) ?? 0) + 1);
    }

    return assessments.map((assessment) => ({
      id: assessment.id,
      type: assessment.type,
      title: assessment.title,
      questionCount: counts.get(assessment.id) ?? 0,
      reviewStatus: assessment.review_status as ReviewStatus,
    }));
  }

  async getAssessmentByType(type: AssessmentType): Promise<Assessment | null> {
    const assessments = await this.listAssessments();
    return assessments.find((assessment) => assessment.type === type) ?? null;
  }

  async getAssessmentQuestions(
    assessmentId: string,
  ): Promise<AssessmentQuestion[]> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;

    const { data: assessment, error: assessmentLoadError } = await supabase
      .from("assessments")
      .select("type")
      .eq("id", assessmentId)
      .maybeSingle();

    if (assessmentLoadError) {
      throwAssessmentError("Unable to load assessment.");
    }

    if (!assessment) {
      return [];
    }

    return mapQuestionsForAssessment(supabase, assessmentId, assessment.type);
  }

  async getLearnerAssessmentQuestions(
    assessmentId: string,
  ): Promise<LearnerAssessmentQuestion[]> {
    const questions = await this.getAssessmentQuestions(assessmentId);
    return toLearnerAssessmentQuestions(questions);
  }

  async getCompletedAttempt(
    learnerId: string,
    assessmentId: string,
  ): Promise<AssessmentAttemptSummary | null> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;

    const { data: attempt, error: attemptError } = await supabase
      .from("assessment_attempts")
      .select("id, assessment_id, score, completed_at")
      .eq("profile_id", learnerId)
      .eq("assessment_id", assessmentId)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (attemptError) {
      throwAssessmentError("Unable to load assessment attempt.");
    }

    if (!attempt) {
      return null;
    }

    const questions = await this.getAssessmentQuestions(assessmentId);
    const { data: answerRows, error: answersError } = await supabase
      .from("assessment_answers")
      .select("question_id, selected_option_id")
      .eq("attempt_id", attempt.id);

    if (answersError) {
      throwAssessmentError("Unable to load assessment answers.");
    }

    const answers: AssessmentAnswer[] = (answerRows ?? []).map((row) => ({
      questionId: row.question_id,
      selectedOptionId: row.selected_option_id,
    }));

    const { correctCount } = calculateRawScore(questions, answers);

    return {
      id: attempt.id,
      assessmentId: attempt.assessment_id,
      assessmentType: questions[0]?.assessmentType ?? "pre",
      score: attempt.score,
      completedAt: attempt.completed_at,
      totalQuestions: questions.length,
      correctCount,
    };
  }

  async getAttemptById(
    learnerId: string,
    attemptId: string,
  ): Promise<AssessmentAttemptSummary | null> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;

    const { data: attempt, error: attemptError } = await supabase
      .from("assessment_attempts")
      .select("id, assessment_id, score, completed_at")
      .eq("id", attemptId)
      .eq("profile_id", learnerId)
      .not("completed_at", "is", null)
      .maybeSingle();

    if (attemptError) {
      throwAssessmentError("Unable to load assessment attempt.");
    }

    if (!attempt) {
      return null;
    }

    const questions = await this.getAssessmentQuestions(attempt.assessment_id);
    const { data: answerRows, error: answersError } = await supabase
      .from("assessment_answers")
      .select("question_id, selected_option_id")
      .eq("attempt_id", attempt.id);

    if (answersError) {
      throwAssessmentError("Unable to load assessment answers.");
    }

    const answers: AssessmentAnswer[] = (answerRows ?? []).map((row) => ({
      questionId: row.question_id,
      selectedOptionId: row.selected_option_id,
    }));

    const { correctCount } = calculateRawScore(questions, answers);

    return {
      id: attempt.id,
      assessmentId: attempt.assessment_id,
      assessmentType: questions[0]?.assessmentType ?? "pre",
      score: attempt.score,
      completedAt: attempt.completed_at,
      totalQuestions: questions.length,
      correctCount,
    };
  }

  async getCompletedAttemptReview(
    learnerId: string,
    attemptId: string,
  ): Promise<CompletedAttemptReview | null> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;

    const { data: attempt, error: attemptError } = await supabase
      .from("assessment_attempts")
      .select("id, assessment_id, score, completed_at")
      .eq("id", attemptId)
      .eq("profile_id", learnerId)
      .not("completed_at", "is", null)
      .maybeSingle();

    if (attemptError) {
      throwAssessmentError("Unable to load assessment attempt.");
    }

    if (!attempt) {
      return null;
    }

    const questions = await this.getAssessmentQuestions(attempt.assessment_id);
    const { data: answerRows, error: answersError } = await supabase
      .from("assessment_answers")
      .select("question_id, selected_option_id")
      .eq("attempt_id", attempt.id);

    if (answersError) {
      throwAssessmentError("Unable to load assessment answers.");
    }

    const answers: AssessmentAnswer[] = (answerRows ?? []).map((row) => ({
      questionId: row.question_id,
      selectedOptionId: row.selected_option_id,
    }));

    const { correctCount } = calculateRawScore(questions, answers);
    const items = buildAttemptQuestionReviews(questions, answers);

    return {
      attempt: {
        id: attempt.id,
        assessmentId: attempt.assessment_id,
        assessmentType: questions[0]?.assessmentType ?? "pre",
        score: attempt.score,
        completedAt: attempt.completed_at,
        totalQuestions: questions.length,
        correctCount,
      },
      items,
    };
  }

  async listLearnerAttempts(learnerId: string): Promise<LearnerAttemptHistoryItem[]> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;

    const { data: attempts, error: attemptsError } = await supabase
      .from("assessment_attempts")
      .select("id, assessment_id, score, completed_at")
      .eq("profile_id", learnerId)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false });

    if (attemptsError) {
      throwAssessmentError("Unable to load assessment history.");
    }

    if (!attempts?.length) {
      return [];
    }

    const assessments = await this.listAssessments();
    const assessmentById = new Map(assessments.map((item) => [item.id, item]));

    const attemptIds = attempts.map((attempt) => attempt.id);
    const uniqueAssessmentIds = [
      ...new Set(attempts.map((attempt) => attempt.assessment_id)),
    ];

    const { data: allAnswerRows, error: answersError } = await supabase
      .from("assessment_answers")
      .select("attempt_id, question_id, selected_option_id")
      .in("attempt_id", attemptIds);

    if (answersError) {
      throwAssessmentError("Unable to load assessment answers.");
    }

    const answersByAttempt = new Map<string, AssessmentAnswer[]>();
    for (const row of allAnswerRows ?? []) {
      const list = answersByAttempt.get(row.attempt_id) ?? [];
      list.push({
        questionId: row.question_id,
        selectedOptionId: row.selected_option_id,
      });
      answersByAttempt.set(row.attempt_id, list);
    }

    const questionsByAssessment = new Map<string, AssessmentQuestion[]>();
    await Promise.all(
      uniqueAssessmentIds.map(async (assessmentId) => {
        const questions = await this.getAssessmentQuestions(assessmentId);
        questionsByAssessment.set(assessmentId, questions);
      }),
    );

    const items: LearnerAttemptHistoryItem[] = [];

    for (const attempt of attempts) {
      const assessment = assessmentById.get(attempt.assessment_id);
      const questions =
        questionsByAssessment.get(attempt.assessment_id) ?? [];
      const answers = answersByAttempt.get(attempt.id) ?? [];
      const { correctCount } = calculateRawScore(questions, answers);

      items.push({
        attemptId: attempt.id,
        assessmentType: assessment?.type ?? "pre",
        assessmentTitle: assessment?.title ?? "Assessment",
        score: attempt.score,
        correctCount,
        totalQuestions: questions.length,
        completedAt: attempt.completed_at,
      });
    }

    return items;
  }

  async submitAssessmentAttempt(params: {
    learnerId: string;
    assessmentId: string;
    answers: AssessmentAnswer[];
  }): Promise<AssessmentSubmissionResult> {
    const { learnerId, assessmentId, answers } = params;
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;

    const existing = await this.getCompletedAttempt(learnerId, assessmentId);
    if (existing) {
      throwAssessmentError("This assessment has already been submitted.");
    }

    const questions = await this.getAssessmentQuestions(assessmentId);
    if (questions.length === 0) {
      throwAssessmentError("This assessment has no questions.");
    }

    const questionIds = new Set(questions.map((question) => question.id));
    for (const answer of answers) {
      if (!questionIds.has(answer.questionId)) {
        throwAssessmentError("One or more answers are invalid.");
      }
    }

    const { correctCount, totalQuestions, score } = calculateRawScore(
      questions,
      answers,
    );
    const completedAt = new Date().toISOString();

    const { data: attempt, error: attemptError } = await supabase
      .from("assessment_attempts")
      .insert({
        profile_id: learnerId,
        assessment_id: assessmentId,
        score,
        completed_at: completedAt,
      })
      .select("id")
      .single();

    if (attemptError || !attempt) {
      throwAssessmentError("Unable to save assessment attempt.");
    }

    const answerRows = answers.map((answer) => ({
      attempt_id: attempt.id,
      question_id: answer.questionId,
      selected_option_id: answer.selectedOptionId,
    }));

    const { error: answersError } = await supabase
      .from("assessment_answers")
      .insert(answerRows);

    if (answersError) {
      throwAssessmentError("Unable to save assessment answers.");
    }

    return {
      attemptId: attempt.id,
      assessmentType: questions[0]?.assessmentType ?? "pre",
      score,
      totalQuestions,
      correctCount,
      completedAt,
    };
  }

  async listAssessmentsForAdmin(): Promise<AdminAssessmentListItem[]> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const { data: assessments, error } = await supabase
      .from("assessments")
      .select("*")
      .order("type", { ascending: true });

    if (error) {
      throwAssessmentError("Unable to load assessments.");
    }

    if (!assessments?.length) {
      return [];
    }

    const assessmentIds = assessments.map((assessment) => assessment.id);
    const { data: questionCounts, error: countError } = await supabase
      .from("questions")
      .select("assessment_id")
      .in("assessment_id", assessmentIds);

    if (countError) {
      throwAssessmentError("Unable to load assessment questions.");
    }

    const counts = new Map<string, number>();
    for (const row of questionCounts ?? []) {
      counts.set(row.assessment_id, (counts.get(row.assessment_id) ?? 0) + 1);
    }

    return assessments.map((assessment) =>
      mapAdminAssessmentRow(assessment, counts.get(assessment.id) ?? 0),
    );
  }

  async getAssessmentForAdmin(
    assessmentId: string,
  ): Promise<AdminAssessmentDetail | null> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const { data: assessment, error } = await supabase
      .from("assessments")
      .select("*")
      .eq("id", assessmentId)
      .maybeSingle();

    if (error) {
      throwAssessmentError("Unable to load assessment.");
    }

    if (!assessment) {
      return null;
    }

    const { count, error: countError } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("assessment_id", assessmentId);

    if (countError) {
      throwAssessmentError("Unable to load assessment questions.");
    }

    return mapAdminAssessmentRow(assessment, count ?? 0);
  }

  async initializeDefaultAssessments(): Promise<AdminAssessmentListItem[]> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const defaults: { type: AssessmentType; title: string }[] = [
      { type: "pre", title: "Pre-Assessment" },
      { type: "post", title: "Post-Assessment" },
    ];

    for (const item of defaults) {
      const { data: existing } = await supabase
        .from("assessments")
        .select("id")
        .eq("type", item.type)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase.from("assessments").insert({
          type: item.type,
          title: item.title,
          review_status: "draft",
        });
        if (error) {
          throwAssessmentError("Unable to initialize assessments.");
        }
      }
    }

    return this.listAssessmentsForAdmin();
  }

  async updateAssessmentMetadata(
    assessmentId: string,
    input: UpdateAssessmentMetadataInput,
  ): Promise<AdminAssessmentDetail> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const { data, error } = await supabase
      .from("assessments")
      .update({
        title: input.title.trim(),
        instructions: input.instructions?.trim() || null,
        review_status: input.reviewStatus,
      })
      .eq("id", assessmentId)
      .select("*")
      .single();

    if (error || !data) {
      throwAssessmentError("Unable to save assessment.");
    }

    const detail = await this.getAssessmentForAdmin(assessmentId);
    if (!detail) {
      throwAssessmentError("Assessment not found.");
    }
    return detail;
  }

  async createQuestion(
    assessmentId: string,
    input: CreateQuestionInput,
  ): Promise<AssessmentQuestion> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const assessment = await this.getAssessmentForAdmin(assessmentId);
    if (!assessment) {
      throwAssessmentError("Assessment not found.");
    }

    const { data: lastQuestion } = await supabase
      .from("questions")
      .select("sort_order")
      .eq("assessment_id", assessmentId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const sortOrder = (lastQuestion?.sort_order ?? -1) + 1;
    const chapterUuid = await getChapterUuidBySlug(supabase, input.chapterId);

    const { data: question, error: questionError } = await supabase
      .from("questions")
      .insert({
        assessment_id: assessmentId,
        prompt: input.prompt.trim(),
        explanation: input.explanation?.trim() || null,
        source_reference: input.sourceReference?.trim() || null,
        chapter_id: chapterUuid,
        sort_order: sortOrder,
        review_status: input.reviewStatus ?? "draft",
      })
      .select("*")
      .single();

    if (questionError || !question) {
      throwAssessmentError("Unable to create question.");
    }

    await this.replaceQuestionOptions(supabase, question.id, input.options);

    const questions = await mapQuestionsForAssessment(
      supabase,
      assessmentId,
      assessment.type,
    );
    const created = questions.find((item) => item.id === question.id);
    if (!created) {
      throwAssessmentError("Unable to load created question.");
    }
    return created;
  }

  async updateQuestion(
    assessmentId: string,
    questionId: string,
    input: UpdateQuestionInput,
  ): Promise<AssessmentQuestion> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const assessment = await this.getAssessmentForAdmin(assessmentId);
    if (!assessment) {
      throwAssessmentError("Assessment not found.");
    }

    const chapterUuid = await getChapterUuidBySlug(supabase, input.chapterId);

    const { error: questionError } = await supabase
      .from("questions")
      .update({
        prompt: input.prompt.trim(),
        explanation: input.explanation?.trim() || null,
        source_reference: input.sourceReference?.trim() || null,
        chapter_id: chapterUuid,
        review_status: input.reviewStatus ?? "draft",
      })
      .eq("id", questionId)
      .eq("assessment_id", assessmentId);

    if (questionError) {
      throwAssessmentError("Unable to save question.");
    }

    await this.replaceQuestionOptions(supabase, questionId, input.options);

    const questions = await mapQuestionsForAssessment(
      supabase,
      assessmentId,
      assessment.type,
    );
    const updated = questions.find((item) => item.id === questionId);
    if (!updated) {
      throwAssessmentError("Question not found.");
    }
    return updated;
  }

  private async replaceQuestionOptions(
    supabase: TypedSupabaseClient,
    questionId: string,
    options: CreateQuestionInput["options"],
  ): Promise<void> {
    const { error: deleteError } = await supabase
      .from("question_options")
      .delete()
      .eq("question_id", questionId);

    if (deleteError) {
      throwAssessmentError("Unable to update answer options.");
    }

    const rows = options.map((option, index) => ({
      question_id: questionId,
      label: option.label.trim(),
      sort_order: option.sortOrder ?? index,
      is_correct: option.isCorrect,
    }));

    const { error: insertError } = await supabase
      .from("question_options")
      .insert(rows);

    if (insertError) {
      throwAssessmentError("Unable to save answer options.");
    }
  }

  async questionHasLearnerAnswers(questionId: string): Promise<boolean> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const { count, error } = await supabase
      .from("assessment_answers")
      .select("*", { count: "exact", head: true })
      .eq("question_id", questionId);

    if (error) {
      throwAssessmentError("Unable to check question usage.");
    }

    return (count ?? 0) > 0;
  }

  async deleteQuestion(
    assessmentId: string,
    questionId: string,
  ): Promise<DeleteQuestionResult> {
    const hasAnswers = await this.questionHasLearnerAnswers(questionId);
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;

    if (hasAnswers) {
      const { data, error } = await supabase
        .from("questions")
        .update({ review_status: "draft" })
        .eq("id", questionId)
        .eq("assessment_id", assessmentId)
        .select("id")
        .maybeSingle();

      if (error || !data) {
        throwAssessmentError("Unable to retire question.");
      }

      return { outcome: "retired" };
    }

    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", questionId)
      .eq("assessment_id", assessmentId);

    if (error) {
      throwAssessmentError("Unable to delete question.");
    }

    const remaining = await this.getAssessmentQuestions(assessmentId);
    if (remaining.length > 0) {
      await applyQuestionSortOrder(
        supabase,
        remaining.map((question) => question.id),
      );
    }

    return { outcome: "deleted" };
  }

  async reorderQuestions(
    assessmentId: string,
    questionIds: string[],
  ): Promise<void> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const existing = await this.getAssessmentQuestions(assessmentId);
    const existingIds = new Set(existing.map((question) => question.id));

    if (
      questionIds.length !== existing.length ||
      questionIds.some((id) => !existingIds.has(id))
    ) {
      throwAssessmentError("Invalid question order.");
    }

    await applyQuestionSortOrder(supabase, questionIds);
  }
}
