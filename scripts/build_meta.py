"""Generate llms.txt and sitemap.xml from the site's JSON data.

The GitHub Action in .github/workflows/build-meta.yml runs this on
every push to main that changes data/ or this script, and commits the
result. To run it locally, from the repository root:

    python3 scripts/build_meta.py

Only the standard library is used. The home page highlights are not
stored in the JSON files, so they live in HOME_HIGHLIGHTS below and must
be kept in line with index.html by hand.
"""

import datetime
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / 'data'
SITE = 'https://jboixcampos.github.io'

PAGES = ['/', '/projects.html', '/research.html', '/cv.html']
MY_NAMES = {'Boix-Campos J', 'Boix Campos J'}
EM_DASH = '—'

HOME_HIGHLIGHTS = """\
## Home page highlights (in order)

The home page leads with cited work, one section per organisation. \
The numbers match the citation indices used on the page.

1. **UKE Hamburg (Science Advances, 2026):** "Trade-off between \
branching and polarity controls decision-making during cell migration". \
More arms sense the surroundings better, but get the cell less far. \
CNN pipelines built with the Sáez Lab at UKE Hamburg; more than 95% \
less analysis time. https://doi.org/10.1126/sciadv.ads2734
2. **Multiverse Computing (2026):** 95% compression, no loss in \
accuracy. A vision model went from 258 MB to 8 MB with tensorization \
inspired by quantum computing. 1.91x the throughput, 49% less energy \
per inference, SSIM of 0.97 on 20,780 samples. \
https://multiversecomputing.com/papers/\
from-258mb-to-8mb-answering-the-95-compression-question
3. **Global Shapers Valencia (Curator):** AIwareness and Camí, two \
tools made with the Global Shapers community. AIwareness: 4,000+ \
answers, 21 hubs, 14 countries, 9 languages.
"""

LINKS = """\
## Links

- Portfolio: https://jboixcampos.github.io/
- Projects: https://jboixcampos.github.io/projects.html
- Research: https://jboixcampos.github.io/research.html
- CV: https://jboixcampos.github.io/cv.html
- GitHub: https://github.com/JBoixCampos
- LinkedIn: https://www.linkedin.com/in/javier-boix-campos
- Bluesky: https://bsky.app/profile/jboixcampos.bsky.social
- Email: javierboixcampos@gmail.com
"""


def load(name):
    """Return the parsed JSON file data/<name>.json."""
    with open(DATA / f'{name}.json', encoding='utf-8') as fh:
        return json.load(fh)


def authors(names):
    """Join author names, marking mine in bold."""
    return ', '.join(
        f'**{n}**' if n.strip() in MY_NAMES else n for n in names
    )


def status(project):
    """Format the status line of a project."""
    start, end = project.get('startDate'), project.get('endDate')
    if project.get('status') == 'active':
        return f'Active ({start}–)' if start else 'Active'
    if start and end and start != end:
        return f'Completed ({start}–{end})'
    return f'Completed ({end or start})' if (end or start) else 'Completed'


def profile_section(cv):
    b = cv['basics']
    return '\n'.join([
        '## Profile',
        '',
        f"**Name:** {b['name']}",
        f"**Role:** {b['label']}",
        f"**Location:** {b['location']['address']}",
        f"**Email:** {b['email']}",
        f"**Website:** {b['website']}",
        '',
        f"**Summary:** {b['summary']}",
        '',
    ])


def work_section(cv):
    out = [f"## {cv['headings'].get('work', 'Professional Experience')}", '']
    for job in cv['work']:
        out += [
            f"### {job['position']} · {job['company']}",
            f"**Period:** {job['startDate']} – {job['endDate']}",
            f"**Location:** {job['location']}",
        ]
        out += [f'- {h}' for h in job['highlights']]
        out.append('')
    return '\n'.join(out)


def education_section(cv):
    out = [f"## {cv['headings'].get('education', 'Education')}", '']
    for edu in cv['education']:
        out += [
            f"### {edu['studyType']}",
            f"**Institution:** {edu['institution']}",
            f"**Period:** {edu['startDate']} – {edu['endDate']}",
            f"**Location:** {edu['location']}",
            edu['summary'],
            '',
        ]
    return '\n'.join(out)


def skills_section(cv):
    out = [f"## {cv['headings'].get('skills', 'Technical Skills')}", '']
    for group in cv['skills']:
        keywords = ', '.join(k for k in group['keywords'] if k)
        out.append(f"- **{group['name']}:** {keywords}")
    out.append('')
    return '\n'.join(out)


def projects_section(projects):
    out = ['## Projects & Leadership', '']
    for p in projects['projects']:
        out += [f"### {p['name']} · {p['tagline']}",
                f'**Status:** {status(p)}']
        category = p['category']
        if p.get('organization'):
            category += f" ({p['organization']})"
        out.append(f'**Category:** {category}')
        if p.get('url'):
            out.append(f"**URL:** {p['url']}")
        if p.get('press'):
            press = ', '.join(
                f"{m['outlet']} ({m['url']})" for m in p['press']
            )
            out.append(f'**Press:** {press}')
        description = p['description']
        if p.get('details'):
            description += ' ' + p['details']
        out += [description,
                f"**Keywords:** {', '.join(p['keywords'])}", '']
    return '\n'.join(out)


def journals_section(pubs):
    out = ['## Journal Publications', '']
    for p in pubs['publications']:
        if p.get('type') != 'journal':
            continue
        venue = p['journal']
        if p.get('volume'):
            venue += f", Vol. {p['volume']}"
        if p.get('issue'):
            venue += f", No. {p['issue']}"
        if p.get('pages'):
            venue += f", pp. {p['pages']}"
        out += [
            f"### {p['title']}",
            f"**Authors:** {authors(p['authors'])}",
            f'**Journal:** {venue}',
            f"**Date:** {p['date']}",
            f"**DOI:** https://doi.org/{p['doi']}",
            '',
        ]
    return '\n'.join(out)


def conferences_section(pubs):
    out = ['## Conference Contributions', '']
    for c in pubs['conferences']:
        where = []
        if c.get('location') and c['location'] != 'Location TBD':
            where.append(c['location'])
        date = re.sub(r'^\d{4}\s*', '', c.get('date', '')).strip()
        if date:
            where.append(date)
        if c.get('journal'):
            where.insert(0, c['journal'])
        tail = f" {', '.join(where)}." if where else ''
        out.append(
            f"- **{c['year']}**: \"{c['title']}\" "
            f"({authors(c['authors'])}). {c['conference']}.{tail}"
        )
    out.append('')
    return '\n'.join(out)


def awards_section(cv):
    out = [f"## {cv['headings'].get('awards', 'Key Certifications')}", '']
    for a in cv['awards']:
        out.append(f"- **{a['title']}**: {a['awarder']} ({a['category']})")
    out.append('')
    return '\n'.join(out)


def build_llms(cv, projects, pubs):
    header = '\n'.join([
        '# Javier Boix Campos · Portfolio',
        '',
        "> This file is generated by scripts/build_meta.py from the site's "
        'JSON data sources:',
        '> - /data/cv.json (profile, experience, education, skills, awards)',
        '> - /data/projects.json (projects and leadership roles)',
        '> - /data/publications.json (journal papers and conference '
        'contributions)',
        '>',
        '> The main site at https://jboixcampos.github.io renders these '
        'dynamically via JavaScript.',
        '> Fetch this file for a complete, LLM-parseable snapshot of the '
        'same content.',
        '',
    ])
    sections = [
        header,
        HOME_HIGHLIGHTS,
        profile_section(cv),
        work_section(cv),
        education_section(cv),
        skills_section(cv),
        projects_section(projects),
        journals_section(pubs),
        conferences_section(pubs),
        awards_section(cv),
        LINKS,
    ]
    text = '\n---\n\n'.join(s.rstrip('\n') + '\n' for s in sections)
    if EM_DASH in text:
        raise ValueError('Em dash found in generated llms.txt')
    if 'linkedin.com/posts' in text:
        raise ValueError('Link to a LinkedIn post found in llms.txt')
    return text


def build_sitemap(today):
    urls = '\n'.join(
        f'  <url>\n    <loc>{SITE}{page}</loc>\n'
        f'    <lastmod>{today}</lastmod>\n  </url>'
        for page in PAGES
    )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f'{urls}\n'
        '</urlset>\n'
    )


def main():
    cv, projects, pubs = load('cv'), load('projects'), load('publications')
    (ROOT / 'llms.txt').write_text(
        build_llms(cv, projects, pubs), encoding='utf-8')
    today = datetime.date.today().isoformat()
    (ROOT / 'sitemap.xml').write_text(build_sitemap(today), encoding='utf-8')
    print('Wrote llms.txt and sitemap.xml')


if __name__ == '__main__':
    main()
