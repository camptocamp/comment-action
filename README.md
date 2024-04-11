# Comment action

This action adds a comment to pull requests with text created from a template.
This is useful to add links to a demo, JIRA ticket...

## Inputs

### `jira-project`

**Required** The JIRA project code. Ex: GSCHM

### `template`

**Required** The template to use for creating the comment

## Example usage

```yaml
  main_job:
    if: ${{ github.event_name == 'pull_request' }}
    permissions:
      pull-requests: write
    runs-on: ubuntu-latest
    name: Main job
    steps:
      - name: Add comment with links
        id: add_comment
        uses: camptocamp/comment-action@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          jira-project: GSCHM
          template: |
            Links:
            - [demo](https://data.dev.schweizmobil.ch/reviews/${DNAME}/index.html)
            - [design](https://data.dev.schweizmobil.ch/reviews/${DNAME}/design.html)
            - [jira](https://jira.camptocamp.com/browse/${JIRA_ISSUE})
```

Here:

- `${DNAME}` is the branch name with all `/` changed to `_`;
- `${JIRA_ISSUE}` is the jira issue (jira_project-number) parsed from the branch name
