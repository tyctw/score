import { Grade, WritingGrade, Region, SubjectScores } from '../types';

export function calculateRegionalScore(region: Region, scores: SubjectScores): { points: string, credits: string } {
    const { chinese, english, math, nature, social, writing } = scores;
    const subjects = [chinese, english, math, nature, social];
    
    let points = 0;
    let credits = 0;

    // 1~7分制 (基北區、台南區積分 / 大多數區的同分比序積點)
    const get7Point = (g: Grade) => {
        if (g === 'A++') return 7;
        if (g === 'A+') return 6;
        if (g === 'A') return 5;
        if (g === 'B++') return 4;
        if (g === 'B+') return 3;
        if (g === 'B') return 2;
        return 1; // C
    };

    // 2~6分制 (多數區會考基礎積分 A=6, B=4, C=2)
    const get30Point = (g: Grade) => {
        if (g.startsWith('A')) return 6;
        if (g.startsWith('B')) return 4;
        return 2; // C
    };

    // 花蓮區積分制 (A=6, B++=5, B+=4, B=3, C=2)
    const getHualienPoint = (g: Grade) => {
        if (g.startsWith('A')) return 6;
        if (g === 'B++') return 5;
        if (g === 'B+') return 4;
        if (g === 'B') return 3;
        return 2; // C
    };

    // 中投區總積點 (各級點數為級數的 3 倍)
    const getTaichungCredit = (g: Grade) => {
        if (g === 'A++') return 21;
        if (g === 'A+') return 18;
        if (g === 'A') return 15;
        if (g === 'B++') return 12;
        if (g === 'B+') return 9;
        if (g === 'B') return 6;
        return 3; // C
    };

    // 寫作測驗換算 (基北區/台南區)
    const getWritingMax1 = (w: WritingGrade) => {
        const mapping: Record<number, number> = { 6: 1, 5: 0.8, 4: 0.6, 3: 0.4, 2: 0.2, 1: 0.1, 0: 0 };
        return mapping[w] || 0;
    };

    // 寫作測驗換算 (桃連區：4-6級分得3分；2-3級分得2分；1級分得1分)
    const getTaoyuanWriting = (w: WritingGrade) => {
        if (w >= 4) return 3;
        if (w >= 2) return 2;
        if (w === 1) return 1;
        return 0;
    };

    // ================= 依區域計算 =================

    // 1. 基北區 & 台南區 (會考積分上限 36 分)
    if (region === Region.KEELUNG_TAIPEI_NEWTAIPEI || region === Region.TAINAN) {
        points = subjects.reduce((sum, g) => sum + get7Point(g), 0);
        const total = points + getWritingMax1(writing);
        return { points: total.toFixed(1).replace('.0', ''), credits: '' };
    } 
    // 2. 桃連區 (會考總分上限 33 分)
    else if (region === Region.TAOYUAN) {
        points = subjects.reduce((sum, g) => sum + get30Point(g), 0);
        const totalPoints = points + getTaoyuanWriting(writing);
        credits = subjects.reduce((sum, g) => sum + get7Point(g), 0); // 桃連區常留作同分積點參考
        return { points: totalPoints.toString(), credits: credits.toString() };
    }
    // 3. 中投區 (積分 30 分；獨有 111 積點制)
    else if (region === Region.TAICHUNG) {
        points = subjects.reduce((sum, g) => sum + get30Point(g), 0);
        credits = subjects.reduce((sum, g) => sum + getTaichungCredit(g), 0) + writing; // 總積點 = 科目點數 + 寫作點數
        return { points: points.toString(), credits: credits.toString() };
    }
    // 4. 花蓮區 (B區間有特別分拆計分，上限 30 分)
    else if (region === Region.HUALIEN) {
        points = subjects.reduce((sum, g) => sum + getHualienPoint(g), 0);
        credits = subjects.reduce((sum, g) => sum + get7Point(g), 0); 
        return { points: points.toString(), credits: credits.toString() };
    }
    
    // 5. 其他區預設 (例如 高雄區 等大多採 A=6,B=4,C=2 計 30分；積點以 1~7 點轉換)
    points = subjects.reduce((sum, g) => sum + get30Point(g), 0);
    credits = subjects.reduce((sum, g) => sum + get7Point(g), 0);
    return { points: points.toString(), credits: credits.toString() };
}
