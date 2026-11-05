'use strict';

function getCodeforcesTaskCode(url, problemCode) {
  const urlMatch = String(url || '').match(/(?:\/problemset\/problem\/(\d+)\/|\/(?:contest|gym)\/(\d+)\/problem\/)([A-Za-z]\d*)(?![A-Za-z0-9])/i);
  const codeMatch = String(problemCode || '').trim().match(/^(?:CF)?(\d+)[\s_-]*([A-Za-z]\d*)$/i);
  if (urlMatch) return { contestId: urlMatch[1] || urlMatch[2], index: urlMatch[3].toUpperCase() };
  if (codeMatch) return { contestId: codeMatch[1], index: codeMatch[2].toUpperCase() };
  return null;
}

module.exports = { getCodeforcesTaskCode };
