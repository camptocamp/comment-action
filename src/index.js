import { getInput, setFailed } from '@actions/core';
import { context, getOctokit } from '@actions/github';


function isPR() {
  return context.eventName === 'pull_request';
}


function getBranch() {
  return context.payload.pull_request.head.ref;
}

function formatComment() {
  let template = getInput('template');
  const DNAME = getBranch().replaceAll('/', '_');
  const jiraIssue = getJiraIssue();
  if (!jiraIssue) {
    // Remove comment line containing ${JIRA_ISSUE}
    template = template.split('\n').filter(l => !l.includes('${JIRA_ISSUE}')).join('\n');
  }

  return template.replaceAll('${DNAME}', DNAME).replaceAll('${JIRA_ISSUE}', jiraIssue);
}

function getJiraIssue() {
  const branch = getBranch();
  const project = getInput('jira-project');
  const regexp = new RegExp(`.*(${project}-\\d+).*`);
  const match = regexp.exec(branch);
  if (!match) {
    console.log('No Jira issue found in branch name', branch, 'using project key', project);
    return '';
  }
  return match[1];
}

async function getCurrentComments() {
  const ok = getOctokit(process.env.GITHUB_TOKEN);
  return (await ok.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.payload.pull_request.number,
  })).data.map(e => e.body);
}

async function addComment(comment) {
  const ok = getOctokit(process.env.GITHUB_TOKEN);
  await ok.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.payload.pull_request.number,
    body: comment
  });
}

try {
  if (isPR()) {
    const comment = formatComment();
    if (comment) {
      const currentComments = await getCurrentComments();
      if (!currentComments.includes(comment)) {
        await addComment(comment);
        console.log('Comment added');
      } else {
        console.log('Comment already present, skipping');
      }
    } else {
      console.log('Comment body empty, skipping')
    }
  } else {
    console.log('Not a PR, skipping');
  }
} catch (error) {
  setFailed(error.message);
}
