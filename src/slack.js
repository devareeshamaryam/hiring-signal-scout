const MAX_LISTED = 10;

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\|/g, '¦');

const gbp = (v) => (v == null ? 'value n/a' : `≈£${new Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 }).format(v)}`);

function awardLine(a) {
  return `• *${escape(a.suppliers)}* won <${a.url}|${escape(a.title.slice(0, 120))}> – ${escape(a.buyer)} (${a.source}${a.source === 'TED' ? `, ${a.country}` : ''}) – ${gbp(a.valueGbp)}`;
}

function awardsLines(s) {
  const lines = [`${s.firstRun ? '📥 Initial load' : '🏆 New winning contracts'}: *${s.added.length}*`];
  lines.push(...s.added.slice(0, MAX_LISTED).map(awardLine));
  if (s.added.length > MAX_LISTED) lines.push(`…and ${s.added.length - MAX_LISTED} more in the sheet`);
  for (const e of s.errors || []) lines.push(`⚠️ ${escape(e)}`);
  return lines;
}

function buildReport({ date, awards, sheetUrl }) {
  const lines = [`*TenderScout – who won IT contracts – ${date}*`, '', ...awardsLines(awards)];
  if (sheetUrl) lines.push('', `<${sheetUrl}|Open Google Sheet>`);
  return lines.join('\n');
}

// Hiring signal bot: just the hiring manager's name and email per ramping-up company.
function buildManagersAlert({ date, contacts }) {
  return [
    `*TenderScout – hiring managers – ${date}*`,
    ...contacts.map((c) => `• ${escape(c.company)}: *${escape(c.name || 'Unknown name')}* – ${c.email || 'no email'}`),
  ].join('\n');
}

async function post(webhookUrl, text) {
  if (!webhookUrl) {
    console.log('SLACK_WEBHOOK_URL not set, message would be:\n' + text);
    return;
  }
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, unfurl_links: false }),
  });
  if (!res.ok) throw new Error(`Slack ${res.status}: ${await res.text()}`);
}

module.exports = { buildReport, buildManagersAlert, post };
