# Baidu Search Script Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone Python command-line script that searches Baidu and prints parsed result titles, URLs, and summaries.

**Architecture:** Keep network access and HTML parsing in small functions so parsing can be tested with fixed HTML. The CLI accepts a required keyword and optional result limit/timeout, then reports network and parsing failures clearly.

**Tech Stack:** Python 3, `requests`, `beautifulsoup4`, `pytest`.

## Global Constraints

- The script must be a standalone file named `baidu_search.py`.
- Search keywords must be URL-encoded before being sent to Baidu.
- Requests must include a browser-like User-Agent and a configurable timeout.
- Tests must not depend on live Baidu responses.

---

### Task 1: Add tested HTML parsing and search interfaces

**Files:**
- Create: `baidu_search.py`
- Create: `tests/test_baidu_search.py`
- Create: `requirements.txt`

**Interfaces:**
- Produces `parse_results(html: str, limit: int = 10) -> list[dict[str, str]]`.
- Produces `search_baidu(keyword: str, limit: int = 10, timeout: int = 10) -> list[dict[str, str]]`.
- Produces a CLI entry point invoked by `python baidu_search.py "keyword"`.

- [ ] **Step 1: Write the failing parser test**

```python
from baidu_search import parse_results


def test_parse_results_extracts_title_url_and_summary():
    html = """
    <div class="result c-container">
      <h3><a href="https://example.com">示例标题</a></h3>
      <div class="c-abstract">这是摘要内容</div>
    </div>
    """
    assert parse_results(html) == [{
        "title": "示例标题",
        "url": "https://example.com",
        "summary": "这是摘要内容",
    }]
```

- [ ] **Step 2: Run the parser test and verify it fails**

Run: `pytest -q tests/test_baidu_search.py::test_parse_results_extracts_title_url_and_summary`

Expected: FAIL because `baidu_search.py` and `parse_results` do not exist yet.

- [ ] **Step 3: Implement the minimal parser and HTTP search function**

Implement `parse_results` with BeautifulSoup, selecting result containers and returning only non-empty title/link entries. Implement `search_baidu` with:

```python
url = "https://www.baidu.com/s?wd=" + quote(keyword)
response = requests.get(url, headers=HEADERS, timeout=timeout)
response.raise_for_status()
return parse_results(response.text, limit)
```

Use `requests.RequestException` handling in the CLI to print an error to stderr and exit with status 1.

- [ ] **Step 4: Add CLI behavior and dependency declaration**

Use `argparse` with positional `keyword`, `--limit` defaulting to 10, and `--timeout` defaulting to 10. Print each result as a numbered block containing title, URL, and summary. Add `requests>=2.31.0` and `beautifulsoup4>=4.12.0` to `requirements.txt`.

- [ ] **Step 5: Add a limit test**

```python
def test_parse_results_respects_limit():
    html = "".join(
        f'<div class="result"><h3><a href="https://example.com/{i}">标题{i}</a></h3></div>'
        for i in range(3)
    )
    assert len(parse_results(html, limit=2)) == 2
```

- [ ] **Step 6: Run tests and syntax checks**

Run: `pytest -q`

Run: `python -m py_compile baidu_search.py`

Expected: all tests pass and `py_compile` exits successfully.
