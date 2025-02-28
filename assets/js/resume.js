import { hideEmptyHeadings } from './hideEmptyHeadings.js';
import { SkillTagList as TagList } from '/assets/js/tags.js';

const ul = document.querySelector('#list-skills')
ul.innerHTMl = '';
// const sections = Array.from(document.querySelectorAll('h2#experience ~ section:not(h2#experience ~ h2 ~ *)'));

const sections = Array.from(document.querySelector('#experience').parentElement.querySelectorAll('section'));

const tagList = Array.from(document.querySelectorAll('.list-star li'))
.reduce((tl, e) => tl.reduceIn(e), new TagList())
.sort();

tagList.forEach((tag) => {
  ul.appendChild(tag.listItem);
});

sections.forEach((section) => {
  section.querySelector('h3').addEventListener('click', (e) => {
    const mode = window.mode.dataset.mode;

    if (mode === 'tune') {
      section.classList.add('d-none');
      section.querySelectorAll('.list-star li').forEach((li) => {
        tagList.find((tag) => tag.name === li.innerText).hide();
      });

      hideEmptyHeadings(section);

    } else {
      section.querySelectorAll('.list-star li').forEach((li) => {
        tagList.find((tag) => tag.name === li.innerText).highlight();
      });
    }
  })
});

const url = URL.parse(window.location.href);
const suppress = url.searchParams.get('suppress');
(suppress?.split(',').filter((x) => x) ?? []).forEach((project) => {
  const section = document.querySelector(`#previous-experience-${project}, #education-${project}`);
  section?.classList.add('d-none');
});

const feature = url.searchParams.get('feature');
const featuredProjects = feature?.split(',').filter((x) => x) ?? [];
const featuredProjectIds = featuredProjects.map((project) => `previous-experience-${project}`);
console.log(featuredProjectIds)
if (false && featuredProjects.length) {
  sections.forEach((section) => {
    console.log(section.id)
    if (featuredProjectIds.includes(section.id)) {
      section.classList.remove('d-none');
      section.classList.add('d-block');
    } else {
      section.classList.add('d-none');
      section.classList.remove('d-block');
    }
  })
}
