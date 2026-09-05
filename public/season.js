// Reading Ladakhi season text.
//
// The catalogue writes seasons the way a farmer says them — "Jul–Aug",
// "October – March under cover", "March–April or October", "All year
// (greenhouse)". Two screens need those turned into actual months: the sowing
// calendar and the "in season now" strip on the home page.
//
// Two traps live here. A range can wrap the year end (October – March is six
// months, not eight backwards), and "or" and "," introduce separate windows
// rather than one long span.

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MONTH_RX = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\b/gi;

export function monthsOf(text) {
  if (!text || /^(not|marginal|—|-)/i.test(text.trim())) return [];
  if (/all year|year round|year-round/i.test(text)) return [...MONTHS.keys()];
  const out = new Set();
  for (const part of text.split(/,| or | and again /i)) {
    const seq = [];
    for (const m of part.matchAll(MONTH_RX)) {
      const i = MONTHS.findIndex((x) => m[1].toLowerCase().startsWith(x.toLowerCase()));
      if (i >= 0) seq.push(i);
    }
    if (!seq.length) continue;
    if (seq.length >= 2 && /[–—-]|\bto\b|through/i.test(part)) {
      for (let i = seq[0]; ; i = (i + 1) % 12) { out.add(i); if (i === seq[seq.length - 1]) break; }
    } else seq.forEach((i) => out.add(i));
  }
  return [...out];
}

export const thisMonth = () => new Date().getMonth();

// A crop counts as in season this month if its own season text says so.
// Greenhouse crops are flagged separately — they are in season, but only for
// someone who has a greenhouse, and the strip says as much.
export function seasonInfo(crop, month = thisMonth()) {
  if (!crop || !crop.season) return { inSeason: false, greenhouse: false };
  const greenhouse = /greenhouse/i.test(crop.season);
  const months = monthsOf(crop.season);
  return { inSeason: months.includes(month), greenhouse, months };
}

export const monthName = (i = thisMonth()) =>
  new Date(2000, i, 1).toLocaleString(undefined, { month: 'long' });
