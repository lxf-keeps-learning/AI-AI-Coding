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


def test_parse_results_respects_limit():
    html = "".join(
        f'<div class="result"><h3><a href="https://example.com/{i}">标题{i}</a></h3></div>'
        for i in range(3)
    )

    assert len(parse_results(html, limit=2)) == 2
