import { Grade, WritingGrade, Region, SubjectScores } from '../types';

export function calculateRegionalScore(region: Region, scores: SubjectScores): { points: string, credits: string } {
    const { chinese, english, math, nature, social, writing } = scores;
    const subjects = [chinese, english, math, nature, social];
    
    let points = 0;
    let credits = 0;

    const get7Point = (g: Grade) => {
        if (g === 'A++') return 7;
        if (g === 'A+') return 6;
        if (g === 'A') return 5;
        if (g === 'B++') return 4;
        if (g === 'B+') return 3;
        if (g === 'B') return 2;
        return 1; // C
    };

    const get30Point = (g: Grade) => {
        if (g.startsWith('A')) return 6;
        if (g.startsWith('B')) return 4;
        return 2;
    };

    const getWritingMax1 = (w: WritingGrade) => {
        const mapping: Record<number, number> = { 6: 1, 5: 0.8, 4: 0.6, 3: 0.4, 2: 0.2, 1: 0.1, 0: 0 };
        return mapping[w] || 0;
    };

    const getWritingMax3 = (w: WritingGrade) => w / 2;
    
    const getWritingMax6 = (w: WritingGrade) => w;

    if (region === Region.KEELUNG_TAIPEI_NEWTAIPEI) {
        // 基北區: 會考積分最高36分 (5科 * 7分 = 35分 + 作文 1分)
        points = subjects.reduce((sum, g) => sum + get7Point(g), 0);
        const total = points + getWritingMax1(writing);
        return { points: total.toFixed(1).replace('.0', ''), credits: '' };
    } 
    else if (region === Region.TAOYUAN) {
        // 桃連區: 總分最高33分 (5科 * 6分 = 30分 + 作文 3分), 總積點最高35點
        points = subjects.reduce((sum, g) => sum + get30Point(g), 0);
        const totalPoints = points + getWritingMax3(writing);
        credits = subjects.reduce((sum, g) => sum + get7Point(g), 0);
        return { points: totalPoints.toFixed(1).replace('.0', ''), credits: credits.toString() };
    }
    else if (region === Region.TAICHUNG || region === Region.HUALIEN || region === Region.TAINAN) {
        // 中投區/台南等: 各科30分 (A=6, etc)
        points = subjects.reduce((sum, g) => sum + get30Point(g), 0);
        const totalPoints = points;
        credits = subjects.reduce((sum, g) => sum + get7Point(g), 0);
        // return points & credits but some regions might also add writing to points
        return { points: (totalPoints + getWritingMax6(writing)).toString(), credits: credits.toString() };
    }
    
    // Default generic calculation for elsewhere (A=6, B=4, C=2 => Total 30)
    points = subjects.reduce((sum, g) => sum + get30Point(g), 0);
    credits = subjects.reduce((sum, g) => sum + get7Point(g), 0);
    return { points: (points + getWritingMax6(writing)).toString(), credits: credits.toString() };
}
