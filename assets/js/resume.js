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
