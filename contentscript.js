// 2 TODO: Check JIRA api v3
// 2 TODO: Split on two content scripts ?
// 4 TODO: Seperate helper for api, add to plan for next version(need migration to npm architecture)
// 4 TODO: Option page with regexp
// 4 TODO: Check if exist better way to get jira current open task
if (
  window.location.href.match(
    /(?=.*(\.atlassian\.net\/jira|jira.*))(?=.*\?selectedIssue\=).*|(.atlassian.net|jira.*)\/browse/g
  )
) {
  chrome.runtime.sendMessage({ activeIcon: true });
}
chrome.runtime.onMessage.addListener(message => {
  if (message.action === 'get_issue_name') {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const isJiraTaskPage = pathname.startsWith('/browse/');
    const params = new URLSearchParams(window.location.search);
    const selectedIssue = params.get('selectedIssue');
    let url = '';
    if (selectedIssue) {
      url = createGetIssueUrl(origin, selectedIssue);
    }
    if (isJiraTaskPage) {
      const issueKey = pathname.split('/')[2];
      url = createGetIssueUrl(origin, issueKey);
    }
    if (url) {
      (async () => {
        const [key, summary, issueType] = await fetchIssueData(url);
        const branchName = await parseIssueResponse(key, summary, issueType);
        copyToClipboard(branchName);
      })();
    }
  }
});

function parseTilte(title) {
  // 2 TODO: Better summary parsing
  if (!title) return '';

  const cyrillicCheck = /[а-яА-ЯЁё]/.test(title);
  let transliterated;
  if (cyrillicCheck) transliterated = transliterate(title);
  const clearTag = transliterated
    ? transliterated.replace(/[^а-яa-z0-9- ]*/gi, '')
    : title.replace(/[^a-z0-9- ]*/gi, '');
  const trimedTitle = clearTag.trim();
  const titleWithoutSpaces = trimedTitle.replace(/ /g, '-');
  const trimMoreThatOneSlash = titleWithoutSpaces.replace(/-{2,}/g, '-');
  return trimMoreThatOneSlash;
}

function copyToClipboard(textToCopy) {
  // 4 TODO check clipboard API problem with no focus
  const tempInput = document.createElement('input');
  tempInput.style.cssText =
    'opacity:0; position:fixed; width:1px; height:1px; top:0; left:0;';
  tempInput.value = textToCopy;
  document.body.appendChild(tempInput);
  tempInput.focus();
  tempInput.select();
  try {
    // Not good, but tackles issues, if Security blocks the copy, or execCommand is not supported
    document.execCommand('selectAll'); // Now selects the content of the focused element only
    document.execCommand('copy');
  } catch (err) {
    console.error(err);
    // Security options of this browser blocks copy
    // or the API is not supported
    // Provide an alternative way to copy the table
  }
  tempInput.remove();
}

async function parseIssueResponse(key, summary, issueType) {
  // 3 TODO: move string construct logic to seperate functions
  const parsedTilte = parseTilte(summary);
  const selectedFlow = await getSelectedFlowFromStorage();
  if (selectedFlow === 'gitlab') {
    if (issueType === 'Bug') {
      return parsedTilte ? `bugfix/${key}-${parsedTilte}` : '';
    } else {
      return parsedTilte ? `feature/${key}-${parsedTilte}` : '';
    }
  } else {
    return parsedTilte ? `${key}-${parsedTilte}` : '';
  }
}

async function fetchIssueData(url) {
  try {
    const response = await fetch(url);
    const issueData = await response.json();
    // 3 TODO: Check fetching issuetype by api
    return [
      issueData.key,
      issueData.fields.summary,
      issueData.fields.issuetype.name,
    ];
  } catch (err) {
    // 2 TODO: Check log errors for chrome extension, think about error messages
    console.error('Failed to fetch issue: ', err);
  }
}

function createGetIssueUrl(origin, issueKey) {
  return `${origin}/rest/api/2/issue/${issueKey}`;
}

function getSelectedFlowFromStorage() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('selectedFlow', options => {
      if (options) {
        resolve(options.selectedFlow);
      } else {
        reject(new Error());
      }
    });
  });
}

const ru = {
  Ё: 'YO',
  Й: 'I',
  Ц: 'TS',
  У: 'U',
  К: 'K',
  Е: 'E',
  Н: 'N',
  Г: 'G',
  Ш: 'SH',
  Щ: 'SCH',
  З: 'Z',
  Х: 'H',
  Ъ: "'",
  ё: 'yo',
  й: 'i',
  ц: 'ts',
  у: 'u',
  к: 'k',
  е: 'e',
  н: 'n',
  г: 'g',
  ш: 'sh',
  щ: 'sch',
  з: 'z',
  х: 'h',
  ъ: "'",
  Ф: 'F',
  Ы: 'I',
  В: 'V',
  А: 'a',
  П: 'P',
  Р: 'R',
  О: 'O',
  Л: 'L',
  Д: 'D',
  Ж: 'ZH',
  Э: 'E',
  ф: 'f',
  ы: 'i',
  в: 'v',
  а: 'a',
  п: 'p',
  р: 'r',
  о: 'o',
  л: 'l',
  д: 'd',
  ж: 'zh',
  э: 'e',
  Я: 'Ya',
  Ч: 'CH',
  С: 'S',
  М: 'M',
  И: 'I',
  Т: 'T',
  Ь: "'",
  Б: 'B',
  Ю: 'YU',
  я: 'ya',
  ч: 'ch',
  с: 's',
  м: 'm',
  и: 'i',
  т: 't',
  ь: "'",
  б: 'b',
  ю: 'yu',
};

function transliterate(word) {
  return word
    .split('')
    .map(function(char) {
      return ru[char] || char;
    })
    .join('');
}
