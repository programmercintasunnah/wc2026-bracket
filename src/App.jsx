import { useState } from "react";
import "./App.css";

const INITIAL_R32 = [
  { id: "L1", t1: "Germany", t2: "Paraguay" },
  { id: "L2", t1: "France", t2: "Sweden" },
  { id: "L3", t1: "South Africa", t2: "Canada" },
  { id: "L4", t1: "Netherlands", t2: "Morocco" },
  { id: "L5", t1: "Portugal", t2: "Croatia" },
  { id: "L6", t1: "Spain", t2: "Austria" },
  { id: "L7", t1: "USA", t2: "Bosnia" },
  { id: "L8", t1: "Belgium", t2: "Senegal" },
  { id: "R1", t1: "Brazil", t2: "Japan" },
  { id: "R2", t1: "Ivory Coast", t2: "Norway" },
  { id: "R3", t1: "Mexico", t2: "Ecuador" },
  { id: "R4", t1: "England", t2: "DR Congo" },
  { id: "R5", t1: "Argentina", t2: "Cape Verde" },
  { id: "R6", t1: "Australia", t2: "Egypt" },
  { id: "R7", t1: "Switzerland", t2: "Algeria" },
  { id: "R8", t1: "Colombia", t2: "Ghana" },
];

const FIFA_RANKINGS = {
  Argentina: 1, Spain: 2, France: 3, England: 4,
  Portugal: 5, Brazil: 6, Morocco: 7, Netherlands: 8,
  Belgium: 9, Germany: 10, Croatia: 11, Colombia: 13,
  Mexico: 14, Senegal: 15, USA: 17, Japan: 18,
  Switzerland: 19, Ecuador: 23, Austria: 24, Australia: 27,
  Algeria: 28, Egypt: 29, Canada: 30, Norway: 31,
  Sweden: 38, Paraguay: 41, "DR Congo": 46, Ireland: 58,
  "South Africa": 60, Bosnia: 64,   "Cape Verde": 67, Ghana: 73, "Ivory Coast": 33,
};

const GROUP_STAGE_STATS = {
  Argentina: { gf: 8, ga: 1 },
  Spain: { gf: 5, ga: 0 },
  France: { gf: 10, ga: 2 },
  England: { gf: 6, ga: 2 },
  Portugal: { gf: 6, ga: 1 },
  Brazil: { gf: 7, ga: 1 },
  Morocco: { gf: 6, ga: 3 },
  Netherlands: { gf: 10, ga: 4 },
  Belgium: { gf: 6, ga: 2 },
  Germany: { gf: 10, ga: 4 },
  Croatia: { gf: 5, ga: 5 },
  Colombia: { gf: 4, ga: 1 },
  Mexico: { gf: 6, ga: 0 },
  Senegal: { gf: 8, ga: 6 },
  USA: { gf: 8, ga: 4 },
  Japan: { gf: 7, ga: 3 },
  Switzerland: { gf: 7, ga: 3 },
  Ecuador: { gf: 2, ga: 2 },
  Austria: { gf: 6, ga: 6 },
  Australia: { gf: 2, ga: 2 },
  Algeria: { gf: 5, ga: 7 },
  Egypt: { gf: 5, ga: 3 },
  Canada: { gf: 8, ga: 3 },
  Norway: { gf: 8, ga: 7 },
  Sweden: { gf: 7, ga: 7 },
  Paraguay: { gf: 2, ga: 4 },
  "DR Congo": { gf: 4, ga: 3 },
  "South Africa": { gf: 2, ga: 3 },
  Bosnia: { gf: 5, ga: 6 },
  "Cape Verde": { gf: 2, ga: 2 },
  Ghana: { gf: 2, ga: 2 },
  "Ivory Coast": { gf: 4, ga: 2 },
};

function randScore(t1, t2) {
  const s1 = GROUP_STAGE_STATS[t1] ?? { gf: 2, ga: 2 };
  const s2 = GROUP_STAGE_STATS[t2] ?? { gf: 2, ga: 2 };

  const avgGf1 = s1.gf / 3;
  const avgGa1 = s1.ga / 3;
  const avgGf2 = s2.gf / 3;
  const avgGa2 = s2.ga / 3;

  let exp1 = (avgGf1 + avgGa2) / 2;
  let exp2 = (avgGf2 + avgGa1) / 2;

  const r1 = FIFA_RANKINGS[t1] ?? 50;
  const r2 = FIFA_RANKINGS[t2] ?? 50;
  const adj = (r2 - r1) / 100;
  exp1 += adj;
  exp2 -= adj;

  exp1 = Math.max(0, exp1);
  exp2 = Math.max(0, exp2);

  let g1 = Math.max(0, Math.round(exp1 + (Math.random() - 0.5) * 1.5));
  let g2 = Math.max(0, Math.round(exp2 + (Math.random() - 0.5) * 1.5));

  return [g1, g2];
}

function penaltyShootout() {
  let a = 0, b = 0;
  for (let i = 0; i < 5; i++) {
    if (Math.random() < 0.75) a++;
    if (Math.random() < 0.75) b++;
  }
  while (a === b) {
    if (Math.random() < 0.75) a++;
    if (Math.random() < 0.75) b++;
  }
  return { a, b };
}

function resolveMatch(m) {
  const [s1, s2] = randScore(m.t1, m.t2);
  let winner, pen;
  if (s1 !== s2) {
    winner = s1 > s2 ? m.t1 : m.t2;
  } else {
    pen = penaltyShootout();
    winner = pen.a > pen.b ? m.t1 : m.t2;
  }
  return { ...m, s1, s2, winner, pen };
}

function resolveMatches(pairs) {
  return pairs.map(resolveMatch);
}

function buildRound(winners, prefix) {
  const matches = [];
  for (let i = 0; i < winners.length; i += 2) {
    matches.push({ id: `${prefix}_${i}`, t1: winners[i], t2: winners[i + 1] });
  }
  return matches;
}

function generateAll(r32fixed) {
  const r32 = resolveMatches(r32fixed);
  const leftWinners = r32.slice(0, 8).map((m) => m.winner);
  const rightWinners = r32.slice(8, 16).map((m) => m.winner);

  const r16L = resolveMatches(buildRound(leftWinners, "r16L"));
  const r16R = resolveMatches(buildRound(rightWinners, "r16R"));

  const qfL = resolveMatches(buildRound(r16L.map((m) => m.winner), "qfL"));
  const qfR = resolveMatches(buildRound(r16R.map((m) => m.winner), "qfR"));

  const sfL = resolveMatches([{ id: "sfL", t1: qfL[0].winner, t2: qfL[1].winner }]);
  const sfR = resolveMatches([{ id: "sfR", t1: qfR[0].winner, t2: qfR[1].winner }]);

  const final = resolveMatches([{ id: "final", t1: sfL[0].winner, t2: sfR[0].winner }]);

  return { r32, r16L, r16R, qfL, qfR, sfL, sfR, final };
}

function MatchCard({ match }) {
  if (!match) return <div className="match-card empty" />;
  const { t1, t2, s1, s2, winner, pen } = match;
  const hasScore = winner !== undefined;
  const t1Won = hasScore && winner === t1;
  const t2Won = hasScore && winner === t2;

  return (
    <div className="match-card">
      <div className={`team ${hasScore && !t1Won ? "loser" : ""}`}>
        <span className="tname">
          {t1}
          {FIFA_RANKINGS[t1] != null && <span className="rank">({FIFA_RANKINGS[t1]})</span>}
        </span>
        {hasScore && (
          <span className="score">
            {s1}{pen && t1Won && <span className="pen-badge">(P)</span>}
          </span>
        )}
      </div>
      <div className="divider" />
      <div className={`team ${hasScore && !t2Won ? "loser" : ""}`}>
        <span className="tname">
          {t2}
          {FIFA_RANKINGS[t2] != null && <span className="rank">({FIFA_RANKINGS[t2]})</span>}
        </span>
        {hasScore && (
          <span className="score">
            {s2}{pen && t2Won && <span className="pen-badge">(P)</span>}
          </span>
        )}
      </div>
    </div>
  );
}

// A column of match cards with optional connector lines
function RoundCol({ matches, side, roundClass }) {
  return (
    <div className={`round-col ${roundClass} side-${side}`}>
      {matches.map((m, i) => (
        <div key={m.id} className="match-wrapper">
          <MatchCard match={m} />
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [generated, setGenerated] = useState(false);

  const r32Left = INITIAL_R32.slice(0, 8);
  const r32Right = INITIAL_R32.slice(8, 16);

  const display = data || {
    r32: INITIAL_R32,
    r16L: buildRound(r32Left.map((m) => m.t1), "r16L_pre"),
    r16R: buildRound(r32Right.map((m) => m.t1), "r16R_pre"),
    qfL: [
      { id: "qfL_pre0", t1: "?", t2: "?" },
      { id: "qfL_pre1", t1: "?", t2: "?" },
    ],
    qfR: [
      { id: "qfR_pre0", t1: "?", t2: "?" },
      { id: "qfR_pre1", t1: "?", t2: "?" },
    ],
    sfL: [{ id: "sfL_pre", t1: "?", t2: "?" }],
    sfR: [{ id: "sfR_pre", t1: "?", t2: "?" }],
    final: [{ id: "final_pre", t1: "?", t2: "?" }],
  };

  function handleGenerate() {
    setData(generateAll(INITIAL_R32));
    setGenerated(true);
  }

  const leftR32 = generated ? display.r32.slice(0, 8) : r32Left;
  const rightR32 = generated ? display.r32.slice(8, 16) : r32Right;

  return (
    <div className="app">
      <div className="title-bar">
        <span className="trophy">🏆</span>
        <h1>WORLD CUP BRACKET 2026</h1>
        <span className="trophy">🏆</span>
      </div>

      <div className="bracket-scroll">
        <div className="bracket">
          {/* LEFT SIDE */}
          <div className="side left">
            <RoundCol matches={leftR32} side="left" roundClass="r32" />
            <RoundCol matches={display.r16L} side="left" roundClass="r16" />
            <RoundCol matches={display.qfL} side="left" roundClass="qf" />
            <RoundCol matches={display.sfL} side="left" roundClass="sf" />
          </div>

          {/* CENTER */}
          <div className="center-col">
            <div className="center-main">
              <div className="final-label">FINAL</div>
              <div className="final-wrap">
                <MatchCard match={display.final[0]} />
              </div>
              {display.final[0]?.winner && (
                <div className="champion-label">🥇 {display.final[0].winner}</div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="side right">
            <RoundCol matches={rightR32} side="right" roundClass="r32" />
            <RoundCol matches={display.r16R} side="right" roundClass="r16" />
            <RoundCol matches={display.qfR} side="right" roundClass="qf" />
            <RoundCol matches={display.sfR} side="right" roundClass="sf" />
          </div>
        </div>
      </div>

      <div className="bottom-bar">
        <button className="gen-btn" onClick={handleGenerate}>
          {generated ? "🔄 RE-GENERATE" : "⚽ GENERATE SCORES"}
        </button>
      </div>
    </div>
  );
}
