import {
  calculateRawScore,
  toLearnerAssessmentQuestions,
} from "@/lib/assessment/scoring";
import { buildAttemptQuestionReviews } from "@/lib/assessment/attempt-review";
import {
  getOfficialAssessmentMeta,
  getOfficialAssessmentQuestions,
  OFFICIAL_POST_ASSESSMENT_ID,
  OFFICIAL_PRE_ASSESSMENT_ID,
} from "@/lib/assessment/official-question-bank";
import type { AssessmentRepository } from "@/lib/data/types";
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
import { isPublishedReviewStatus } from "@/types/review";
import { isLocalMockDevelopment } from "@/lib/runtime/environment";

/**
 * Official Sugidanon assessment content for mock mode (no Supabase).
 * Sourced from lib/assessment/official-question-bank.json
 */
const DEV_PRE_ASSESSMENT_ID = OFFICIAL_PRE_ASSESSMENT_ID;
const POST_ASSESSMENT_ID = OFFICIAL_POST_ASSESSMENT_ID;

interface StoredAttempt {
  summary: AssessmentAttemptSummary;
  answers: AssessmentAnswer[];
}

interface MockAssessmentRecord {
  id: string;
  type: AssessmentType;
  title: string;
  instructions: string | null;
  reviewStatus: Assessment["reviewStatus"];
  updatedAt: string;
}

const preMeta = getOfficialAssessmentMeta("pre");
const postMeta = getOfficialAssessmentMeta("post");

const mockAssessments: MockAssessmentRecord[] = [
  {
    id: preMeta.id,
    type: preMeta.type,
    title: preMeta.title,
    instructions: preMeta.instructions,
    reviewStatus: preMeta.reviewStatus,
    updatedAt: new Date().toISOString(),
  },
  {
    id: postMeta.id,
    type: postMeta.type,
    title: postMeta.title,
    instructions: postMeta.instructions,
    reviewStatus: postMeta.reviewStatus,
    updatedAt: new Date().toISOString(),
  },
];

let mockQuestions: AssessmentQuestion[] = [
  ...getOfficialAssessmentQuestions("pre"),
  ...getOfficialAssessmentQuestions("post"),
];

const mockQuestionAnswers = new Set<string>();
const mockAttemptStore = new Map<string, StoredAttempt>();

function attemptKey(learnerId: string, assessmentId: string): string {
  return `${learnerId}:${assessmentId}`;
}

export function exportMockAttemptsForAnalytics(): import("@/lib/analytics/raw-data").AnalyticsAttemptRecord[] {
  const rows: import("@/lib/analytics/raw-data").AnalyticsAttemptRecord[] = [];

  for (const [key, stored] of mockAttemptStore.entries()) {
    const learnerId = key.split(":")[0] ?? "unknown";
    const assessment = mockAssessments.find(
      (item) => item.id === stored.summary.assessmentId,
    );
    rows.push({
      id: stored.summary.id,
      learnerId,
      assessmentId: stored.summary.assessmentId,
      assessmentType: stored.summary.assessmentType,
      assessmentTitle: assessment?.title ?? "Assessment",
      score: stored.summary.score,
      completedAt: stored.summary.completedAt,
    });
  }

  return rows;
}

export function exportMockAttemptAnswersForAnalytics(): import("@/lib/analytics/raw-data").AnalyticsAnswerRecord[] {
  const rows: import("@/lib/analytics/raw-data").AnalyticsAnswerRecord[] = [];

  for (const [, stored] of mockAttemptStore.entries()) {
    const questionById = new Map(
      mockQuestions.map((question) => [question.id, question]),
    );

    for (const answer of stored.answers) {
      const question = questionById.get(answer.questionId);
      rows.push({
        attemptId: stored.summary.id,
        questionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId,
        isCorrect:
          question?.correctOptionId === answer.selectedOptionId &&
          answer.selectedOptionId !== null,
      });
    }
  }

  return rows;
}

export function exportMockQuestionsForAnalytics(): import("@/lib/analytics/raw-data").AnalyticsQuestionRecord[] {
  return mockQuestions.map((question) => {
    const assessment = mockAssessments.find(
      (item) => item.id === question.assessmentId,
    );
    return {
      id: question.id,
      assessmentId: question.assessmentId,
      assessmentType: question.assessmentType,
      assessmentTitle: assessment?.title ?? "Assessment",
      prompt: question.prompt,
    };
  });
}

function mapAssessmentListItem(record: MockAssessmentRecord): AdminAssessmentListItem {
  const questionCount = mockQuestions.filter(
    (question) => question.assessmentId === record.id,
  ).length;

  return {
    id: record.id,
    type: record.type,
    title: record.title,
    instructions: record.instructions,
    questionCount,
    reviewStatus: record.reviewStatus,
    updatedAt: record.updatedAt,
  };
}

function buildQuestionFromInput(
  assessmentId: string,
  assessmentType: AssessmentType,
  questionId: string,
  sortOrder: number,
  input: CreateQuestionInput | UpdateQuestionInput,
): AssessmentQuestion {
  const options = input.options.map((option, index) => ({
    id: option.id ?? `${questionId}-opt-${index + 1}`,
    label: option.label.trim(),
    labelHiligaynon: option.labelHiligaynon?.trim() || null,
    sortOrder: option.sortOrder ?? index,
  }));
  const correctIndex = input.options.findIndex((option) => option.isCorrect);

  return {
    id: questionId,
    assessmentId,
    assessmentType,
    chapterId: input.chapterId ?? null,
    prompt: input.prompt.trim(),
    promptHiligaynon: input.promptHiligaynon?.trim() || null,
    options,
    correctOptionId: options[correctIndex]?.id ?? "",
    explanation: input.explanation?.trim() || null,
    explanationHiligaynon: input.explanationHiligaynon?.trim() || null,
    sourceReference: input.sourceReference?.trim() || null,
    reviewStatus: input.reviewStatus ?? "draft",
    sortOrder,
  };
}

export class MockAssessmentRepository implements AssessmentRepository {
  private attemptKey(learnerId: string, assessmentId: string): string {
    return attemptKey(learnerId, assessmentId);
  }

  async listAssessments(): Promise<Assessment[]> {
    if (!isLocalMockDevelopment()) {
      return [];
    }

    return mockAssessments.map((record) => mapAssessmentListItem(record));
  }

  async getAssessmentByType(type: AssessmentType): Promise<Assessment | null> {
    if (!isLocalMockDevelopment()) {
      return null;
    }

    const assessments = await this.listAssessments();
    return assessments.find((assessment) => assessment.type === type) ?? null;
  }

  async getAssessmentQuestions(
    assessmentId: string,
  ): Promise<AssessmentQuestion[]> {
    return mockQuestions
      .filter((question) => question.assessmentId === assessmentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getLearnerAssessmentQuestions(
    assessmentId: string,
  ): Promise<LearnerAssessmentQuestion[]> {
    const questions = await this.getAssessmentQuestions(assessmentId);
    return toLearnerAssessmentQuestions(
      questions.filter((question) => isPublishedReviewStatus(question.reviewStatus)),
    );
  }

  async getCompletedAttempt(
    learnerId: string,
    assessmentId: string,
  ): Promise<AssessmentAttemptSummary | null> {
    return (
      mockAttemptStore.get(this.attemptKey(learnerId, assessmentId))
        ?.summary ?? null
    );
  }

  async getAttemptById(
    learnerId: string,
    attemptId: string,
  ): Promise<AssessmentAttemptSummary | null> {
    for (const [key, stored] of mockAttemptStore.entries()) {
      if (!key.startsWith(`${learnerId}:`)) {
        continue;
      }
      if (stored.summary.id === attemptId) {
        return stored.summary;
      }
    }
    return null;
  }

  async getCompletedAttemptReview(
    learnerId: string,
    attemptId: string,
  ): Promise<CompletedAttemptReview | null> {
    for (const [key, stored] of mockAttemptStore.entries()) {
      if (!key.startsWith(`${learnerId}:`)) {
        continue;
      }
      if (stored.summary.id !== attemptId) {
        continue;
      }

      const questions = await this.getAssessmentQuestions(
        stored.summary.assessmentId,
      );
      return {
        attempt: stored.summary,
        items: buildAttemptQuestionReviews(questions, stored.answers),
      };
    }
    return null;
  }

  async listLearnerAttempts(learnerId: string): Promise<LearnerAttemptHistoryItem[]> {
    const prefix = `${learnerId}:`;
    const items: LearnerAttemptHistoryItem[] = [];

    for (const [key, stored] of mockAttemptStore.entries()) {
      if (!key.startsWith(prefix)) {
        continue;
      }
      const assessmentId = key.slice(prefix.length);
      const assessment = mockAssessments.find((item) => item.id === assessmentId);
      items.push({
        attemptId: stored.summary.id,
        assessmentType: stored.summary.assessmentType,
        assessmentTitle: assessment?.title ?? "Assessment",
        score: stored.summary.score,
        correctCount: stored.summary.correctCount,
        totalQuestions: stored.summary.totalQuestions,
        completedAt: stored.summary.completedAt,
      });
    }

    return items.sort((a, b) =>
      (b.completedAt ?? "").localeCompare(a.completedAt ?? ""),
    );
  }

  async submitAssessmentAttempt(params: {
    learnerId: string;
    assessmentId: string;
    answers: AssessmentAnswer[];
  }): Promise<AssessmentSubmissionResult> {
    const { learnerId, assessmentId, answers } = params;
    const key = this.attemptKey(learnerId, assessmentId);

    if (mockAttemptStore.has(key)) {
      throw new Error("This assessment has already been submitted.");
    }

    const questions = await this.getAssessmentQuestions(assessmentId);
    if (questions.length === 0) {
      throw new Error("This assessment has no questions.");
    }

    const questionIds = new Set(questions.map((question) => question.id));
    for (const answer of answers) {
      if (!questionIds.has(answer.questionId)) {
        throw new Error("One or more answers are invalid.");
      }
      mockQuestionAnswers.add(answer.questionId);
    }

    const { correctCount, totalQuestions, score } = calculateRawScore(
      questions,
      answers,
    );
    const completedAt = new Date().toISOString();
    const attemptId = `attempt-${Date.now()}`;

    const summary: AssessmentAttemptSummary = {
      id: attemptId,
      assessmentId,
      assessmentType: questions[0]?.assessmentType ?? "pre",
      score,
      completedAt,
      totalQuestions,
      correctCount,
    };

    mockAttemptStore.set(key, { summary, answers });

    return {
      attemptId,
      assessmentType: summary.assessmentType,
      score,
      totalQuestions,
      correctCount,
      completedAt,
    };
  }

  async listAssessmentsForAdmin(): Promise<AdminAssessmentListItem[]> {
    if (!isLocalMockDevelopment()) {
      return [];
    }

    return mockAssessments.map((record) => mapAssessmentListItem(record));
  }

  async getAssessmentForAdmin(
    assessmentId: string,
  ): Promise<AdminAssessmentDetail | null> {
    const record = mockAssessments.find((assessment) => assessment.id === assessmentId);
    return record ? mapAssessmentListItem(record) : null;
  }

  async initializeDefaultAssessments(): Promise<AdminAssessmentListItem[]> {
    const defaults: { type: AssessmentType; title: string; id: string }[] = [
      { type: "pre", title: "Pre-Assessment", id: DEV_PRE_ASSESSMENT_ID },
      { type: "post", title: "Post-Assessment", id: POST_ASSESSMENT_ID },
    ];

    for (const item of defaults) {
      if (!mockAssessments.some((assessment) => assessment.type === item.type)) {
        mockAssessments.push({
          id: item.id,
          type: item.type,
          title: item.title,
          instructions: null,
          reviewStatus: "draft",
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return this.listAssessmentsForAdmin();
  }

  async updateAssessmentMetadata(
    assessmentId: string,
    input: UpdateAssessmentMetadataInput,
  ): Promise<AdminAssessmentDetail> {
    const index = mockAssessments.findIndex(
      (assessment) => assessment.id === assessmentId,
    );
    if (index === -1) {
      throw new Error("Assessment not found.");
    }

    mockAssessments[index] = {
      ...mockAssessments[index],
      title: input.title.trim(),
      instructions: input.instructions?.trim() || null,
      reviewStatus: input.reviewStatus,
      updatedAt: new Date().toISOString(),
    };

    const detail = await this.getAssessmentForAdmin(assessmentId);
    if (!detail) {
      throw new Error("Assessment not found.");
    }
    return detail;
  }

  async createQuestion(
    assessmentId: string,
    input: CreateQuestionInput,
  ): Promise<AssessmentQuestion> {
    const assessment = mockAssessments.find((item) => item.id === assessmentId);
    if (!assessment) {
      throw new Error("Assessment not found.");
    }

    const sortOrder =
      mockQuestions.filter((question) => question.assessmentId === assessmentId)
        .length;
    const questionId = `question-${Date.now()}-${sortOrder}`;
    const question = buildQuestionFromInput(
      assessmentId,
      assessment.type,
      questionId,
      sortOrder,
      input,
    );

    mockQuestions.push(question);
    return question;
  }

  async updateQuestion(
    assessmentId: string,
    questionId: string,
    input: UpdateQuestionInput,
  ): Promise<AssessmentQuestion> {
    const assessment = mockAssessments.find((item) => item.id === assessmentId);
    if (!assessment) {
      throw new Error("Assessment not found.");
    }

    const index = mockQuestions.findIndex(
      (question) =>
        question.id === questionId && question.assessmentId === assessmentId,
    );
    if (index === -1) {
      throw new Error("Question not found.");
    }

    const updated = buildQuestionFromInput(
      assessmentId,
      assessment.type,
      questionId,
      mockQuestions[index].sortOrder,
      input,
    );
    mockQuestions[index] = updated;
    return updated;
  }

  async questionHasLearnerAnswers(questionId: string): Promise<boolean> {
    return mockQuestionAnswers.has(questionId);
  }

  async deleteQuestion(
    assessmentId: string,
    questionId: string,
  ): Promise<DeleteQuestionResult> {
    const index = mockQuestions.findIndex(
      (question) =>
        question.id === questionId && question.assessmentId === assessmentId,
    );

    if (index === -1) {
      throw new Error("Question not found.");
    }

    if (await this.questionHasLearnerAnswers(questionId)) {
      mockQuestions[index] = {
        ...mockQuestions[index],
        reviewStatus: "draft",
      };
      return { outcome: "retired" };
    }

    mockQuestions = mockQuestions.filter(
      (question) =>
        !(question.id === questionId && question.assessmentId === assessmentId),
    );

    const remaining = mockQuestions
      .filter((question) => question.assessmentId === assessmentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    remaining.forEach((question, index) => {
      question.sortOrder = index + 1;
    });

    return { outcome: "deleted" };
  }

  async reorderQuestions(
    assessmentId: string,
    questionIds: string[],
  ): Promise<void> {
    const existing = await this.getAssessmentQuestions(assessmentId);
    const existingIds = new Set(existing.map((question) => question.id));

    if (
      questionIds.length !== existing.length ||
      questionIds.some((id) => !existingIds.has(id))
    ) {
      throw new Error("Invalid question order.");
    }

    questionIds.forEach((questionId, index) => {
      const question = mockQuestions.find((item) => item.id === questionId);
      if (question) {
        question.sortOrder = index;
      }
    });
  }
}
