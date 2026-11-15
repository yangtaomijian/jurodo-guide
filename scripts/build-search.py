"""Build the search index from rendered guide pages and their lookup aliases."""

from dataclasses import dataclass, field
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
from tempfile import NamedTemporaryFile


@dataclass
class Element:
    tag: str
    attrs: dict = field(default_factory=dict)
    children: list = field(default_factory=list)

    def has_class(self, name):
        return name in self.attrs.get("class", "").split()

    def elements(self):
        return (child for child in self.children if isinstance(child, Element))

    def descendants(self):
        for child in self.elements():
            yield child
            yield from child.descendants()

    def text(self):
        def raw_text(node):
            if isinstance(node, str):
                return node
            text = "".join(raw_text(child) for child in node.children)
            return f" {text} " if node.tag in ("br", "p", "li", "div", "summary", "section") else text

        return " ".join(raw_text(self).split())


class Article(HTMLParser):
    void_tags = set("area base br col embed hr img input link meta param source track wbr".split())

    def __init__(self, html):
        super().__init__()
        self.main = None
        self.stack = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        if not self.stack and tag != "main":
            return
        node = Element(tag, dict(attrs))
        if self.stack:
            self.stack[-1].children.append(node)
        else:
            self.main = node
        if tag not in self.void_tags:
            self.stack.append(node)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                break

    def handle_data(self, text):
        if self.stack:
            self.stack[-1].children.append(text)


def page_records(page, href):
    article = Article(page.read_text(encoding="utf-8")).main
    if article is None:
        return
    title = next((node.text() for node in article.descendants() if node.has_class("title")), "")
    if not title:
        return
    subtitle = next((node.text() for node in article.descendants() if node.has_class("subtitle")), "")
    day = re.match(r"guide/(d\d+)(?:-lunch)?\.html$", href)
    day_number = day[1].upper() if day else ""
    page_name = f"{day_number} · {title}" if day and not title.startswith(day_number + " ") else title
    page_context = subtitle.removeprefix(day_number + " · ") if day else subtitle
    page_text = " ".join(node.text() for node in article.elements() if node.tag == "p")
    page_aliases = next((node.attrs.get("data-page-lookup", "") for node in article.elements()
                         if "data-page-lookup" in node.attrs), "")
    yield dict(href=href, name=page_name, context=page_context, terms=page_text,
               aliases=page_aliases, day=day_number)

    def entries(node, place="", stage=""):
        for child in node.elements():
            context = child.attrs.get("data-place", place)
            heading = next((el for el in child.elements() if el.tag in ("h2", "h3", "h4")), None)
            subheading = heading.text() if heading is not None else ""
            next_stage = subheading if heading and heading.tag == "h2" else stage
            anchor = child.attrs.get("id")
            aliases = child.attrs.get("data-lookup")
            if anchor and (aliases is not None or heading is not None):
                if child.tag == "details":
                    label = next(child.elements())
                elif heading is not None:
                    label = heading
                else:
                    label = child if child.has_class("lookup-name") else next(
                        (el for el in child.descendants() if el.has_class("lookup-name")),
                        child,
                    )
                name = label.text()
                detail = child.text() if child.has_class("choice-row") or child.has_class("event-record") else " ".join(
                    el.text() for el in child.elements() if el.tag == "p"
                )
                terms = " ".join(filter(None, (subtitle, detail)))
                location = context or (stage if heading is None or heading.tag != "h2" else "")
                entry = dict(href=f"{href}#{anchor}", name=name,
                             context=" · ".join(filter(None, (page_name, location))),
                             terms=terms, aliases=aliases or "", day=child.attrs.get("data-day", day_number))
                if child.has_class("achievement-entry") or child.has_class("gallery-entry"):
                    is_achievement = child.has_class("achievement-entry")
                    day = child.attrs.get("data-day", "")
                    body = next(el for el in child.elements()
                                if el.has_class("achievement-body") or el.has_class("gallery-body"))
                    location, trigger, replay = (el.text() for el in body.elements())
                    summary = next(el.text() for el in label.elements() if el.tag == "small")
                    name = next(el.text() for el in label.elements() if el.has_class("lookup-name"))
                    kind = "成就" if is_achievement else "图库"
                    entry.update(name=name, day=day, context=" · ".join(filter(None, (kind, day, summary))),
                                 terms=f"{location} {trigger} {replay}",
                                 preview=dict(location=location, trigger=trigger, replay=replay))
                    entry["achievement" if is_achievement else "gallery"] = True
                elif href == "guide/endings.html":
                    entry["ending"] = True
                    if child.tag == "details":
                        display_name = next((el.text() for el in label.elements() if el.has_class("lookup-name")), name)
                        summary = name.removeprefix(display_name).strip(" ·")
                        entry.update(name=display_name, context=" · ".join(filter(None, (page_name, summary))))
                elif context == "标题立绘":
                    entry["titleArt"] = True
                yield entry
            if child.tag == "details":
                next_stage = ""
            yield from entries(child, context, next_stage)

    yield from entries(article)


def rebuild(output):
    records = []
    for page in sorted(output.rglob("*.html")):
        href = page.relative_to(output)
        if any((Path.cwd() / href.with_suffix(ext)).is_file() for ext in (".md", ".qmd")):
            records.extend(page_records(page, href.as_posix()))

    index = output / "guide-search.json"
    data = json.dumps(records, ensure_ascii=False, separators=(",", ":")) + "\n"
    if index.exists() and index.read_text(encoding="utf-8") == data:
        return
    with NamedTemporaryFile(mode="w", encoding="utf-8", dir=output, delete=False) as temporary:
        temporary.write(data)
    temporary_path = Path(temporary.name)
    temporary_path.chmod(0o644)
    temporary_path.replace(index)


if __name__ == "__main__":
    rebuild(Path(os.environ.get("QUARTO_PROJECT_OUTPUT_DIR", "_site")))
