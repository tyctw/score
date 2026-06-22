import { ScoreData } from '../types';

export const scoreSubjects: Array<keyof Pick<ScoreData, 'chineseScore' | 'mathScore' | 'englishScore' | 'socialScore' | 'scienceScore'>> = [
  'chineseScore',
  'mathScore',
  'englishScore',
  'socialScore',
  'scienceScore',
];

export const normalizeGrade = (grade: string | number | undefined) => String(grade ?? '').trim().toUpperCase();

export const gradeBaseLevel = (grade: string) => {
  if (grade.startsWith('A')) return 3;
  if (grade.startsWith('B')) return 2;
  if (grade.startsWith('C')) return 1;
  return 0;
};

export const gradeModifierPoint = (grade: string) => {
  if (grade.includes('++')) return 2;
  if (grade.includes('+')) return 1;
  return 0;
};

export const parseRankNumber = (value: string | number | undefined) => {
  const parsed = parseFloat(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const getGradeCounts = (item: ScoreData) => {
  let aCount = 0;
  let bCount = 0;
  let cCount = 0;

  scoreSubjects.forEach(subject => {
    const grade = normalizeGrade(item[subject]);
    const baseLevel = gradeBaseLevel(grade);

    if (baseLevel === 3) aCount += 1;
    if (baseLevel === 2) bCount += 1;
    if (baseLevel === 1) cCount += 1;
  });

  return { aCount, bCount, cCount };
};

export const getGradeCategory = (item: ScoreData) => {
  const { aCount, bCount, cCount } = getGradeCounts(item);
  return `${aCount}A${bCount}B${cCount}C`;
};

export const getGradeDetailScore = (item: ScoreData) => (
  scoreSubjects.reduce((sum, subject) => {
    const grade = normalizeGrade(item[subject]);
    return sum + (gradeBaseLevel(grade) * 10) + gradeModifierPoint(grade);
  }, 0)
);

export const getGradeRankScore = (item: ScoreData) => {
  const { aCount, bCount } = getGradeCounts(item);
  const detailScore = getGradeDetailScore(item);
  const essayScore = parseRankNumber(item.essayScore);
  const rankRatio = parseRankNumber(item.minRatio);

  return (aCount * 1_000_000) + (bCount * 10_000) + (detailScore * 100) + essayScore - (rankRatio / 100);
};

export const compareByGradeRank = (a: ScoreData, b: ScoreData) => {
  const rankA = getGradeRankScore(a);
  const rankB = getGradeRankScore(b);

  if (rankA !== rankB) return rankB - rankA;

  const ratioA = parseRankNumber(a.minRatio);
  const ratioB = parseRankNumber(b.minRatio);
  if (ratioA !== ratioB) return ratioA - ratioB;

  return parseRankNumber(a.maxRatio) - parseRankNumber(b.maxRatio);
};

export const scoreIdentityKey = (item: ScoreData) => [
  item.examYear,
  item.region,
  ...scoreSubjects.map(subject => normalizeGrade(item[subject])),
  String(item.essayScore ?? '').trim(),
].join('|');
