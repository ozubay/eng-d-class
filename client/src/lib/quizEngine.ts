// ============================================================
// Quiz Engine
// Generates quiz questions from sentence data
// Supports: fill-blank, multiple-choice, short-answer, kr-to-en, en-to-kr
//
// Design: Neo-Minimal Workspace
// Student sentences shown as: "English sentence (한글 번역)"
// Korean answers detected → provide English answer + KR translation + alt English
// ============================================================

import { Sentence, QuizType, ALL_SENTENCES } from "./courseData";

export interface QuizQuestion {
  id: string;
  type: QuizType;
  sentenceId: number;
  // Fill-blank
  displayText?: string;        // text with ___ for blank
  blankedWord?: string;        // the word that was removed
  // Multiple choice
  question?: string;
  options?: string[];
  correctIndex?: number;
  // Short answer
  prompt?: string;
  sampleAnswer?: string;
  sampleAnswerKR?: string;     // Korean translation of sample answer
  // Translation
  sourceText?: string;
  sourceTextBilingual?: string; // companion text for bilingual display
  targetText?: string;
  targetTextKR?: string;       // Korean translation of target (for kr-to-en)
  hint?: string;
}

// ── Detect if answer is primarily Korean ──
export function isKoreanAnswer(text: string): boolean {
  const koreanChars = (text.match(/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g) || []).length;
  const totalChars = text.replace(/\s/g, '').length;
  return totalChars > 0 && koreanChars / totalChars > 0.3;
}

// ── Generate English alternative for a Korean answer ──
// Uses design vocabulary to create a contextually appropriate English version
export function generateEnglishAlt(koreanAnswer: string, sentence: Sentence): string {
  const kr = koreanAnswer.trim();
  const keywords = sentence.keywords;
  const kw1 = keywords[0] ?? "design";
  const kw2 = keywords[1] ?? "composition";

  // Pattern-based translation using design vocabulary
  // These cover common Korean response patterns in design critique
  const patterns: Array<{ regex: RegExp; template: (m: RegExpMatchArray) => string }> = [
    {
      regex: /좋아요|좋습니다|잘했어요|잘 했어요/,
      template: () => `That observation is on the right track. In design language, what you're seeing relates to ${kw1} — the way ${kw2} shapes the viewer's experience.`
    },
    {
      regex: /네거티브\s?스페이스|여백|빈\s?공간/,
      template: () => `You're noticing negative space. That empty area isn't simply blank — it functions as breathing room, allowing the ${kw1} to become clearer and the main message to stand apart from visual noise.`
    },
    {
      regex: /대비|콘트라스트/,
      template: () => `You're identifying contrast. The tension between light and dark, large and small, creates ${kw1} and directs the viewer's eye through the composition.`
    },
    {
      regex: /위계|하이어라키|계층/,
      template: () => `You're seeing hierarchy. The ${kw1} establishes a clear reading order, so the viewer knows where to begin and how to move through the information.`
    },
    {
      regex: /균형|밸런스/,
      template: () => `You're responding to balance. The visual weight of the ${kw1} is distributed so that the composition feels stable without being static.`
    },
    {
      regex: /리듬|반복/,
      template: () => `You're noticing rhythm. The repeated ${kw1} creates a visual cadence that guides the viewer's eye and gives the composition a sense of movement.`
    },
    {
      regex: /정렬|얼라인/,
      template: () => `You're seeing alignment. The consistent ${kw1} creates order and makes the layout feel intentional and controlled.`
    },
    {
      regex: /색|컬러|색상|색감/,
      template: () => `You're responding to color. The ${kw1} palette creates a specific mood and reinforces the visual hierarchy of the composition.`
    },
    {
      regex: /타이포|글자|폰트|서체/,
      template: () => `You're noticing the typography. The ${kw1} choices — typeface, size, and spacing — contribute to the overall tone and legibility of the design.`
    },
    {
      regex: /복잡|너무\s?많|과부하/,
      template: () => `You're identifying visual density. There's too much information competing at the same level, which makes it difficult for the viewer to find the main message through the ${kw1}.`
    },
    {
      regex: /단순|심플|미니멀/,
      template: () => `You're responding to simplicity. The minimal use of ${kw1} reduces visual noise and allows the core message to communicate more directly.`
    },
    {
      regex: /강하|임팩트|눈에\s?띄/,
      template: () => `You're noticing visual impact. The ${kw1} creates a strong focal point that immediately draws the viewer's attention.`
    },
    {
      regex: /약하|힘이\s?없|밋밋/,
      template: () => `You're sensing a lack of visual tension. The ${kw1} needs more contrast or scale variation to create a stronger focal point and direct the viewer's eye.`
    },
    {
      regex: /움직임|역동|다이나믹/,
      template: () => `You're feeling movement. The diagonal energy and ${kw1} create visual velocity, so the viewer's eye travels through the composition rather than staying fixed.`
    },
    {
      regex: /정적|딱딱|경직/,
      template: () => `You're noticing rigidity. The composition lacks visual movement because the ${kw1} is too predictable — try introducing scale contrast or diagonal energy.`
    },
  ];

  for (const p of patterns) {
    if (p.regex.test(kr)) {
      return p.template(kr.match(p.regex)!);
    }
  }

  // Fallback: generic design-language response
  return `In design language, what you're describing relates to ${kw1}. To express this more precisely in English, consider how ${kw2} shapes the viewer's experience — the way visual elements create meaning through their relationships, not just their individual qualities.`;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickKeyword(sentence: Sentence): string {
  const text = sentence.professorEN;
  for (const kw of sentence.keywords) {
    if (text.toLowerCase().includes(kw.toLowerCase())) {
      return kw;
    }
  }
  return sentence.keywords[0] ?? "design";
}

function createBlankText(text: string, word: string): string {
  const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  return text.replace(regex, '___');
}

function getWrongOptions(correct: string, count: number, pool: string[]): string[] {
  const others = pool.filter(w => w.toLowerCase() !== correct.toLowerCase());
  return shuffleArray(others).slice(0, count);
}

// ── Format student sentence: "English (한글)" ──
function formatStudentPrompt(sentence: Sentence): string {
  return `"${sentence.studentEN}" (${sentence.studentKR})`;
}

export function generateFillBlank(sentence: Sentence): QuizQuestion {
  const keyword = pickKeyword(sentence);
  const text = sentence.professorEN;
  const displayText = createBlankText(text, keyword);

  return {
    id: `fb-${sentence.id}-${Date.now()}`,
    type: 'fill-blank',
    sentenceId: sentence.id,
    displayText,
    blankedWord: keyword,
    prompt: `학생이 ${formatStudentPrompt(sentence)}라고 말했을 때, 교수의 응답에서 빈칸에 들어갈 단어를 입력하세요.`,
    hint: `키워드 힌트: ${sentence.keywords.slice(0, 2).join(', ')}`,
    sampleAnswer: sentence.professorEN,
    sampleAnswerKR: sentence.professorKR,
  };
}

export function generateMultipleChoice(sentence: Sentence, allSentences: Sentence[]): QuizQuestion {
  const keyword = pickKeyword(sentence);

  const wrongPool = allSentences
    .filter(s => s.id !== sentence.id)
    .flatMap(s => s.keywords)
    .filter(k => k.toLowerCase() !== keyword.toLowerCase());

  const wrongOptions = getWrongOptions(keyword, 3, wrongPool);
  const allOptions = shuffleArray([keyword, ...wrongOptions]);
  const correctIndex = allOptions.indexOf(keyword);

  return {
    id: `mc-${sentence.id}-${Date.now()}`,
    type: 'multiple-choice',
    sentenceId: sentence.id,
    question: `학생: ${formatStudentPrompt(sentence)}\n\n교수가 사용해야 할 핵심 디자인 용어는?`,
    options: allOptions,
    correctIndex,
    hint: `힌트: ${sentence.keywords[0]}와 관련된 개념입니다.`,
    sampleAnswer: sentence.professorEN,
    sampleAnswerKR: sentence.professorKR,
  };
}

export function generateShortAnswer(sentence: Sentence): QuizQuestion {
  return {
    id: `sa-${sentence.id}-${Date.now()}`,
    type: 'short-answer',
    sentenceId: sentence.id,
    prompt: `학생이 ${formatStudentPrompt(sentence)}라고 말했습니다.\n교수로서 영어로 어떻게 응답하겠습니까? (핵심 용어를 포함하여 작성하세요)`,
    sampleAnswer: sentence.professorEN,
    sampleAnswerKR: sentence.professorKR,
    hint: `포함할 키워드: ${sentence.keywords.slice(0, 3).join(', ')}`,
  };
}

export function generateKrToEn(sentence: Sentence): QuizQuestion {
  return {
    id: `ke-${sentence.id}-${Date.now()}`,
    type: 'kr-to-en',
    sentenceId: sentence.id,
    sourceText: sentence.studentKR,
    sourceTextBilingual: sentence.studentEN, // English companion for bilingual display
    targetText: sentence.studentEN,
    targetTextKR: sentence.studentKR,
    prompt: `다음 학생 발언을 영어로 번역하세요:`,
    hint: `참고: 학생의 발언을 영어로 표현합니다.`,
    sampleAnswer: sentence.studentEN,
    sampleAnswerKR: sentence.studentKR,
  };
}

export function generateEnToKr(sentence: Sentence): QuizQuestion {
  const text = sentence.professorEN;
  const sentences = text.split('. ');
  const targetSentence = sentences[0] + (sentences.length > 1 ? '.' : '');
  const targetKR = sentence.professorKR.split('. ')[0] + '.';

  return {
    id: `ek-${sentence.id}-${Date.now()}`,
    type: 'en-to-kr',
    sentenceId: sentence.id,
    sourceText: targetSentence,
    sourceTextBilingual: targetKR, // Korean companion for bilingual display
    targetText: targetKR,
    targetTextKR: targetKR,
    prompt: `다음 교수 응답을 한국어로 번역하세요:`,
    hint: `힙트: 교수의 피드백 첫 문장입니다.`,
    sampleAnswer: targetKR,
    sampleAnswerKR: targetKR,
  };
}

export function generateQuizForSentence(
  sentence: Sentence,
  type: QuizType,
  allSentences: Sentence[] = ALL_SENTENCES
): QuizQuestion {
  switch (type) {
    case 'fill-blank': return generateFillBlank(sentence);
    case 'multiple-choice': return generateMultipleChoice(sentence, allSentences);
    case 'short-answer': return generateShortAnswer(sentence);
    case 'kr-to-en': return generateKrToEn(sentence);
    case 'en-to-kr': return generateEnToKr(sentence);
  }
}

export function generateQuizSession(
  sentences: Sentence[],
  questionsPerSentence: number = 3
): QuizQuestion[] {
  const quizTypes: QuizType[] = ['fill-blank', 'multiple-choice', 'kr-to-en', 'short-answer', 'en-to-kr'];
  const questions: QuizQuestion[] = [];

  sentences.forEach(sentence => {
    const types = shuffleArray(quizTypes).slice(0, questionsPerSentence);
    types.forEach(type => {
      questions.push(generateQuizForSentence(sentence, type, ALL_SENTENCES));
    });
  });

  return shuffleArray(questions);
}

export interface CheckResult {
  correct: boolean;
  score: number;       // 0-100
  feedback: string;
  isKorean: boolean;   // true if user answered in Korean
  // Populated when wrong or when Korean answer detected
  expectedEN?: string;   // The expected English answer
  expectedKR?: string;   // Korean translation of expected answer
  altEN?: string;        // English version of the user's Korean answer
}

export function checkAnswer(question: QuizQuestion, userAnswer: string, allSentences: Sentence[] = ALL_SENTENCES): CheckResult {
  const normalize = (s: string) => s.toLowerCase().trim().replace(/[.,!?;:]/g, '');
  const korean = isKoreanAnswer(userAnswer);
  const sentence = allSentences.find(s => s.id === question.sentenceId);

  // Helper to build wrong-answer result with bilingual feedback
  function wrongResult(feedback: string, score = 0): CheckResult {
    const altEN = korean && sentence ? generateEnglishAlt(userAnswer, sentence) : undefined;
    return {
      correct: false,
      score,
      feedback,
      isKorean: korean,
      expectedEN: question.sampleAnswer ?? question.targetText,
      expectedKR: question.sampleAnswerKR ?? question.targetTextKR,
      altEN,
    };
  }

  switch (question.type) {
    case 'fill-blank': {
      // Korean answer for fill-blank is always wrong
      if (korean) {
        return wrongResult(`한국어로 답하셨습니다. 영어 단어를 입력해주세요.`);
      }
      const correct = normalize(question.blankedWord ?? '') === normalize(userAnswer);
      if (correct) {
        return { correct: true, score: 100, feedback: `"${question.blankedWord}" — 이 맥락에서 핵심 디자인 용어를 정확히 선택했습니다.`, isKorean: false };
      }
      return wrongResult(`오답입니다. 정답은 "${question.blankedWord}"입니다.`);
    }

    case 'multiple-choice': {
      const selectedIndex = parseInt(userAnswer);
      const correct = selectedIndex === question.correctIndex;
      if (correct) {
        return { correct: true, score: 100, feedback: `"${question.options?.[question.correctIndex ?? 0]}" — 이 상황에 맞는 디자인 용어를 정확히 선택했습니다.`, isKorean: false };
      }
      return {
        correct: false,
        score: 0,
        feedback: `오답입니다. 정답은 "${question.options?.[question.correctIndex ?? 0]}"입니다.`,
        isKorean: false,
        expectedEN: question.sampleAnswer,
        expectedKR: question.sampleAnswerKR,
      };
    }

    case 'short-answer': {
      // If answered in Korean, give special feedback
      if (korean) {
        return wrongResult(`한국어로 답하셨습니다. 영어로 교수 응답을 작성해주세요.`);
      }
      const answer = normalize(userAnswer);
      const sample = question.sampleAnswer ?? '';
      const keywords = extractKeyTerms(sample);
      const matchedKeywords = keywords.filter(kw => answer.includes(normalize(kw)));
      const score = Math.round((matchedKeywords.length / Math.max(keywords.length, 1)) * 100);
      const correct = score >= 50;

      if (correct) {
        return {
          correct: true,
          score,
          feedback: `핵심 용어 ${matchedKeywords.length}/${keywords.length}개 포함 — 정확한 디자인 언어로 응답했습니다.`,
          isKorean: false,
          expectedEN: question.sampleAnswer,
          expectedKR: question.sampleAnswerKR,
        };
      }
      return wrongResult(`핵심 용어를 더 포함해보세요. 참고 답안을 확인하세요.`, score);
    }

    case 'kr-to-en': {
      // This question asks to translate Korean → English
      // If user answers in Korean, it's wrong
      if (korean) {
        return wrongResult(`한국어로 답하셨습니다. 영어로 번역해주세요.`);
      }
      const answer = normalize(userAnswer);
      const target = normalize(question.targetText ?? '');
      const words = target.split(' ').filter(w => w.length > 3);
      const matched = words.filter(w => answer.includes(w));
      const score = Math.round((matched.length / Math.max(words.length, 1)) * 100);
      const correct = score >= 60;

      if (correct) {
        return {
          correct: true,
          score,
          feedback: `핵심 표현을 정확히 영어로 옮겼습니다.`,
          isKorean: false,
          expectedEN: question.targetText,
          expectedKR: question.targetTextKR,
        };
      }
      return wrongResult(`번역을 다시 시도해보세요.`, score);
    }

    case 'en-to-kr': {
      // This question asks to translate English → Korean
      // Korean answer is expected and correct here
      const answer = normalize(userAnswer);
      const target = normalize(question.targetText ?? '');

      // For en-to-kr, Korean answers are valid — check Korean content
      const targetWords = target.split(/\s+/).filter(w => w.length > 1);
      const matched = targetWords.filter(w => answer.includes(w));
      const score = Math.round((matched.length / Math.max(targetWords.length, 1)) * 100);
      const correct = score >= 40;

      if (correct) {
        return {
          correct: true,
          score,
          feedback: `교수 응답을 정확히 한국어로 이해했습니다.`,
          isKorean: korean,
          expectedEN: undefined,
          expectedKR: question.targetText,
        };
      }
      return {
        correct: false,
        score,
        feedback: `번역을 다시 시도해보세요.`,
        isKorean: korean,
        expectedEN: undefined,
        expectedKR: question.targetText,
      };
    }
  }
}

function extractKeyTerms(text: string): string[] {
  const designTerms = [
    'visual weight', 'negative space', 'figure-ground', 'visual hierarchy',
    'focal point', 'visual rhythm', 'compositional', 'typographic',
    'contrast', 'hierarchy', 'alignment', 'proximity', 'similarity',
    'balance', 'tension', 'velocity', 'gestalt', 'scale', 'proportion',
    'legibility', 'readability', 'grid', 'baseline', 'margin', 'leading',
    'tracking', 'kerning', 'typeface', 'weight', 'texture', 'pattern',
  ];
  const found: string[] = [];
  const lower = text.toLowerCase();
  designTerms.forEach(term => {
    if (lower.includes(term)) found.push(term);
  });
  return found.length > 0 ? found : text.split(' ').filter(w => w.length > 5).slice(0, 5);
}
