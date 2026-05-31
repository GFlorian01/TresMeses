// ─── Helpers ───────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

function scoreEmoji(score: number) {
  if (score >= 80) return "🌟";
  if (score >= 60) return "✅";
  if (score >= 40) return "📈";
  return "💡";
}

function scoreMessage(score: number) {
  if (score >= 80) return "¡Día de élite! Sigue así.";
  if (score >= 60) return "Buen trabajo. Puedes llegar al 80%.";
  if (score >= 40) return "A mitad de camino. ¿Qué puedes hacer ahora?";
  return "Cada pequeño paso cuenta. Mañana es un día nuevo.";
}

function wrap(content: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>TresMeses</title>
</head>
<body style="margin:0;padding:0;background:#0a0f0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="margin-bottom:24px;">
      <span style="color:#14b8a6;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">TresMeses</span>
    </div>
    ${content}
    <div style="margin-top:36px;padding-top:20px;border-top:1px solid #1a2e1e;text-align:center;">
      <p style="color:#374151;font-size:11px;margin:0;">Puedes ajustar los horarios de correo en <strong style="color:#4b5563;">Configuración → Correos</strong></p>
    </div>
  </div>
</body>
</html>`;
}

function statBox(value: string, label: string) {
  return `<div style="background:#111c14;border:1px solid #1a2e1e;border-radius:10px;padding:14px;text-align:center;">
    <div style="color:#f1f5f9;font-size:20px;font-weight:700;">${value}</div>
    <div style="color:#64748b;font-size:11px;margin-top:3px;">${label}</div>
  </div>`;
}

// ─── Morning email ──────────────────────────────────────────────────────────

export function buildMorningEmail(opts: {
  name: string;
  dateStr: string;
  formattedDate: string;
  yesterdayScore: number | null;
  streak: number;
  appUrl: string;
}) {
  const { name, formattedDate, yesterdayScore, streak, appUrl } = opts;

  const yesterdayBlock = yesterdayScore !== null
    ? `<div style="background:#111c14;border:1px solid #1a2e1e;border-radius:12px;padding:20px;margin-bottom:16px;">
        <div style="color:#64748b;font-size:12px;margin-bottom:8px;">Ayer terminaste con</div>
        <div style="font-size:48px;font-weight:800;color:${scoreColor(yesterdayScore)};line-height:1;">${yesterdayScore}%</div>
        <div style="color:#94a3b8;font-size:13px;margin-top:6px;">${scoreEmoji(yesterdayScore)} ${scoreMessage(yesterdayScore)}</div>
      </div>`
    : `<div style="background:#111c14;border:1px solid #1a2e1e;border-radius:12px;padding:20px;margin-bottom:16px;">
        <div style="color:#64748b;font-size:13px;">Ayer no registraste actividad. Hoy es una oportunidad nueva.</div>
      </div>`;

  const streakBlock = streak > 0
    ? `<div style="background:#111c14;border:1px solid #1a2e1e;border-radius:10px;padding:14px;margin-bottom:16px;display:flex;align-items:center;gap:12px;">
        <span style="font-size:24px;">🔥</span>
        <div>
          <div style="color:#f1f5f9;font-size:16px;font-weight:700;">${streak} día${streak > 1 ? "s" : ""} de racha</div>
          <div style="color:#64748b;font-size:12px;">No rompas la cadena hoy</div>
        </div>
      </div>`
    : "";

  const content = `
    <h1 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 4px;">Buenos días, ${name} 🌅</h1>
    <p style="color:#64748b;font-size:14px;margin:0 0 24px;text-transform:capitalize;">${formattedDate}</p>

    ${yesterdayBlock}
    ${streakBlock}

    <a href="${appUrl}/check"
       style="display:block;background:#14b8a6;color:#000;text-decoration:none;text-align:center;padding:14px;border-radius:10px;font-weight:700;font-size:15px;margin-top:8px;">
      Empezar el día →
    </a>`;

  return wrap(content);
}

// ─── Evening email ──────────────────────────────────────────────────────────

export function buildEveningEmail(opts: {
  name: string;
  formattedDate: string;
  score: number;
  habitsDone: number;
  habitsTotal: number;
  mealsDone: number;
  mealsTotal: number;
  hasReading: boolean;
  hasTraining: boolean;
  streak: number;
  appUrl: string;
}) {
  const {
    name, formattedDate, score,
    habitsDone, habitsTotal, mealsDone, mealsTotal,
    hasReading, hasTraining, streak, appUrl,
  } = opts;

  const pending = (habitsTotal - habitsDone) + (mealsTotal - mealsDone)
    + (hasReading ? 0 : 1) + (hasTraining ? 0 : 1);

  const pendingNote = pending > 0
    ? `<p style="color:#94a3b8;font-size:13px;margin:12px 0 0;">Aún tienes <strong style="color:#f1f5f9;">${pending} pendiente${pending > 1 ? "s" : ""}</strong> para cerrar el día. ¡Aún estás a tiempo!</p>`
    : `<p style="color:#22c55e;font-size:13px;margin:12px 0 0;">✅ ¡Completaste todo! Día de élite.</p>`;

  const content = `
    <h1 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 4px;">Tu día, ${name} 📊</h1>
    <p style="color:#64748b;font-size:14px;margin:0 0 24px;text-transform:capitalize;">${formattedDate}</p>

    <div style="background:#111c14;border:1px solid #1a2e1e;border-radius:12px;padding:20px;margin-bottom:16px;">
      <div style="color:#64748b;font-size:12px;margin-bottom:8px;">Score del día</div>
      <div style="font-size:48px;font-weight:800;color:${scoreColor(score)};line-height:1;">${score}%</div>
      <div style="color:#94a3b8;font-size:13px;margin-top:6px;">${scoreEmoji(score)} ${scoreMessage(score)}</div>
      ${pendingNote}
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
      ${statBox(`${habitsDone}/${habitsTotal}`, "Hábitos")}
      ${statBox(`${mealsDone}/${mealsTotal}`, "Comidas")}
      ${statBox(hasTraining ? "✓" : "—", "Entrenamiento")}
      ${statBox(hasReading ? "✓" : "—", "Lectura")}
    </div>

    ${streak > 0 ? `<div style="background:#111c14;border:1px solid #1a2e1e;border-radius:10px;padding:12px 16px;margin-bottom:16px;color:#94a3b8;font-size:13px;">🔥 Racha actual: <strong style="color:#f1f5f9;">${streak} día${streak > 1 ? "s" : ""}</strong></div>` : ""}

    <a href="${appUrl}/check"
       style="display:block;background:#14b8a6;color:#000;text-decoration:none;text-align:center;padding:14px;border-radius:10px;font-weight:700;font-size:15px;">
      ${pending > 0 ? "Completar pendientes →" : "Ver mi día →"}
    </a>`;

  return wrap(content);
}

// ─── Weekly email ───────────────────────────────────────────────────────────

export function buildWeeklyEmail(opts: {
  name: string;
  weekLabel: string;
  days: { label: string; score: number | null }[];
  weeklyAvg: number;
  gymDays: number;
  readingDays: number;
  streak: number;
  cycleWeek: number;
  appUrl: string;
}) {
  const { name, weekLabel, days, weeklyAvg, gymDays, readingDays, streak, cycleWeek, appUrl } = opts;

  const dayBlocks = days.map(({ label, score }) => {
    const bg = score === null ? "#0d1117" : score >= 80 ? "#14532d" : score >= 60 ? "#713f12" : "#450a0a";
    const color = score === null ? "#374151" : scoreColor(score);
    const display = score === null ? "—" : `${score}%`;
    return `<div style="text-align:center;">
      <div style="color:#64748b;font-size:10px;font-weight:600;margin-bottom:6px;">${label}</div>
      <div style="background:${bg};border-radius:8px;padding:8px 4px;">
        <div style="color:${color};font-size:11px;font-weight:700;">${display}</div>
      </div>
    </div>`;
  }).join("");

  const content = `
    <h1 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 4px;">Tu semana, ${name} 📈</h1>
    <p style="color:#64748b;font-size:14px;margin:0 0 24px;">${weekLabel} · Semana ${cycleWeek}/12</p>

    <div style="background:#111c14;border:1px solid #1a2e1e;border-radius:12px;padding:20px;margin-bottom:16px;">
      <div style="color:#64748b;font-size:12px;margin-bottom:16px;">Cada día de la semana</div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;">
        ${dayBlocks}
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
      ${statBox(`${weeklyAvg}%`, "Promedio semanal")}
      ${statBox(`${streak}d`, "Racha actual 🔥")}
      ${statBox(`${gymDays}`, "Días de gym")}
      ${statBox(`${readingDays}`, "Días de lectura")}
    </div>

    ${weeklyAvg >= 70
      ? `<div style="background:#14532d;border:1px solid #166534;border-radius:10px;padding:14px 16px;margin-bottom:16px;color:#86efac;font-size:13px;">🌟 <strong>Semana sólida.</strong> Estás construyendo un hábito real. Mantén el ritmo la próxima semana.</div>`
      : `<div style="background:#450a0a;border:1px solid #7f1d1d;border-radius:10px;padding:14px 16px;margin-bottom:16px;color:#fca5a5;font-size:13px;">🎯 <strong>Semana de aprendizaje.</strong> Identifica qué te bloqueó y ajústalo esta semana.</div>`
    }

    <a href="${appUrl}/dashboard"
       style="display:block;background:#14b8a6;color:#000;text-decoration:none;text-align:center;padding:14px;border-radius:10px;font-weight:700;font-size:15px;">
      Ver dashboard completo →
    </a>`;

  return wrap(content);
}
