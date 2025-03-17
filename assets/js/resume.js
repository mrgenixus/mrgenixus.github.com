import { hideEmptyHeadings } from './hideEmptyHeadings.js';
import { SkillTagList as TagList } from '/assets/js/tags.js';

const SUPPRESS = 'suppress';
const LIST_SKILLS = '#list-skills';
const EXPERIENCE = '#experience';
const DISPLAY_NONE = 'd-none';
const DISPLAY_BLOCK = 'd-block';
const EXPERIENCE_SECTION_ID="previous-experience-";
const EDUCATION_SECTION_ID="education-";
const SECTION_ID_PREFIXES_REGEX = new RegExp(`(${EXPERIENCE_SECTION_ID}|${EDUCATION_SECTION_ID})`);
const STAR_LIST_ITEM = '.list-star li';
const FEATURE = 'feature';
const TUNE = 'tune';

const identity = ($) => $;
const arrayFromString = (str, sep=',') => str?.split(sep).filter(identity) ?? [];

const ul = document.querySelector(LIST_SKILLS)
ul.innerHTMl = '';
// const sections = Array.from(document.querySelectorAll('h2#experience ~ section:not(h2#experience ~ h2 ~ *)'));

const sections = Array.from(document.querySelector(EXPERIENCE).parentElement.querySelectorAll('section'));

const tagList = Array.from(document.querySelectorAll(STAR_LIST_ITEM))
  .reduce((tl, e) => tl.reduceIn(e), new TagList())
  .sort();

tagList.forEach((tag) => {
  ul.appendChild(tag.listItem);
});

const updateModeClass = ((mode_cache) => () => {
  const mode = window.mode.dataset.mode;
  if (mode === mode_cache) return;
  mode_cache = mode;

  window.requestAnimationFrame(() => {
    try {
      for (className in document.body.classList.values()) {
        if (/mode-.*/.test(className)) {
          document.body.classList.remove(className);
        }
      }
      document.body.classList.add(`mode-${mode}`);
      console.log(document.body.classList);
    } catch (e) {
      console.warn(e);
    }

    const editable_sections = document.querySelectorAll('.content-editable');
    Array.from(editable_sections).forEach((section) => {
      section.contentEditable = (mode === TUNE);
    });
  });
  return true;
})();
updateModeClass();

const suppressProject = (project) => {
  const url = URL.parse(window.location.href);
  const strSuppress = url.searchParams.get(SUPPRESS);
  const suppress = arrayFromString(strSuppress);

  suppress.push(project);
  url.searchParams.set(SUPPRESS, uniq(suppress).join(','));
  window.history.replaceState({suppress},'', url.toString());
}

const observer = new MutationObserver(updateModeClass);
observer.observe(window.mode, { attributes: true});
sections.forEach((section) => {
  const project = section.id.replace(SECTION_ID_PREFIXES_REGEX, '');
  section.querySelector('h3').addEventListener('click', (e) => {
    const mode = window.mode.dataset.mode;
    if (mode === TUNE) {
      suppressProject(project);
      section.classList.add(DISPLAY_NONE);
      section.querySelectorAll(STAR_LIST_ITEM).forEach((li) => {
        tagList.find((tag) => tag.name === li.innerText).hide();
      });

      hideEmptyHeadings(section);

    } else {
      section.querySelectorAll(STAR_LIST_ITEM).forEach((li) => {
        tagList.find((tag) => tag.name === li.innerText).highlight();
      });
    }
  });
});

const url = URL.parse(window.location.href);
const suppress = url.searchParams.get(SUPPRESS);
arrayFromString(suppress).forEach((project) => {
  const section = getSectionByProject(project);
  console.log(suppress, project, section);
  hide(section);
});

const feature = url.searchParams.get(FEATURE);
const featuredProjectIds = arrayFromString(feature).map(getSectionId);

if (featuredProjectIds.length) {
  window.requestAnimationFrame(() => {
    sections.forEach((section) => {
      if (featuredProjectIds.includes(section.id)) {
        show(section);
      } else {
        hide(section);
      }
    });
  });
}

document.querySelector('#reset').addEventListener('click', () => {
  const url = URL.parse(window.location.href);
  url.searchParams.forEach((_v, key) => url.searchParams.delete(key));
  window.location.assign(url.toString());
});

function getSectionId(project) {
  return `#${EXPERIENCE_SECTION_ID}${project}, #${EDUCATION_SECTION_ID}${project}`;
}

function getSectionByProject(project) {
  return document.querySelector(getSectionId(project));
}

function hide(el) {
  el?.classList.add(DISPLAY_NONE);
  el?.classList.remove(DISPLAY_BLOCK);
}

function show(el) {
  el?.classList.remove(DISPLAY_NONE);
  el?.classList.add(DISPLAY_BLOCK);
}

function uniq(array) {
  const set = new Set();
  let item;
  while(item = array.shift()) {
    set.add(item);
    console.log('rem', item, array, Array.from(set));
  }
  console.log(set.values());
  for (let i of set.values()) {
    console.log('readd', i, array);
    array.push(i);
  }
  return array;
}
