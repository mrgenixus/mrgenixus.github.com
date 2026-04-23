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
const FILTER = 'filter';
const FILTER_LOGIC_AND = 'and';
const FILTER_LOGIC_OR = 'or';

const identity = ($) => $;
const arrayFromString = (str, sep=',') => str?.split(sep).filter(identity) ?? [];

const ul = document.querySelector(LIST_SKILLS)
ul.innerHTML = '';
// const sections = Array.from(document.querySelectorAll('h2#experience ~ section:not(h2#experience ~ h2 ~ *)'));

const sections = Array.from(document.querySelector(EXPERIENCE).parentElement.querySelectorAll('section'));

const tagList = Array.from(document.querySelectorAll(STAR_LIST_ITEM))
  .reduce((tl, e) => tl.reduceIn(e), new TagList())
  .sort();

tagList.forEach((tag) => {
  ul.appendChild(tag.listItem);
});

const filterState = (() => {
  let baseHidden = new Map();
  let active = false;

  const isExperienceSection = (section) => section.id.startsWith(EXPERIENCE_SECTION_ID);
  const isSelected = (tag) => tag.listItem.classList.contains('text-bg-primary');
  const selectedSkillSlugs = () => tagList.filter(isSelected).map((tag) => tag.slug);

  const clearSelectedSkills = () => {
    tagList.forEach((tag) => {
      if (isSelected(tag)) {
        tag.highlight();
      }
    });
  };

  const snapshotBaseVisibility = () => {
    baseHidden = new Map(sections.map((section) => [section.id, section.classList.contains(DISPLAY_NONE)]));
  };

  const sectionHasSelectedSkills = (section, selected) => {
    const skills = arrayFromString(section.getAttribute('data-skills'), ' ');
    const logic = window.mode?.dataset?.filterLogic ?? FILTER_LOGIC_AND;
    if (logic === FILTER_LOGIC_OR) {
      return selected.some((skill) => skills.includes(skill));
    }
    return selected.every((skill) => skills.includes(skill));
  };

  const restoreBaseVisibility = () => {
    sections.forEach((section) => {
      if (baseHidden.get(section.id)) {
        hide(section);
      } else {
        show(section);
      }
    });
  };

  const apply = () => {
    if (!active) return;

    const selected = selectedSkillSlugs();

    sections.forEach((section) => {
      if (!isExperienceSection(section)) {
        hide(section);
        return;
      }

      if (baseHidden.get(section.id)) {
        hide(section);
        return;
      }

      if (!selected.length) {
        show(section);
        return;
      }

      if (sectionHasSelectedSkills(section, selected)) {
        show(section);
      } else {
        hide(section);
      }
    });
  };

  const enter = () => {
    snapshotBaseVisibility();
    active = true;
    clearSelectedSkills();
    restoreBaseVisibility();
    apply();
  };

  const exit = () => {
    if (!active) return;
    clearSelectedSkills();
    active = false;
    restoreBaseVisibility();
  };

  return {
    apply,
    enter,
    exit,
  };
})();

window.resumeFilter = filterState;

const updateModeClass = ((mode_cache) => () => {
  const mode = window.mode.dataset.mode;
  const isInitialCall = typeof mode_cache === 'undefined';
  if (mode === mode_cache && !isInitialCall) return;
  const previousMode = mode_cache;
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

    if (!isInitialCall) {
      if (mode === FILTER) {
        filterState.enter();
      } else if (previousMode === FILTER) {
        filterState.exit();
      }
    }
  });
  return true;
})();
updateModeClass();

const suppressProject = (project) => {
  const url = new URL(window.location.href);
  const strSuppress = url.searchParams.get(SUPPRESS);
  const suppress = arrayFromString(strSuppress);

  suppress.push(project);
  url.searchParams.set(SUPPRESS, uniq(suppress).join(','));
  window.history.replaceState({suppress},'', url.toString());
}

const observer = new MutationObserver(updateModeClass);
observer.observe(window.mode, { attributes: true});

const filterLogicObserver = new MutationObserver(() => {
  if (window.mode.dataset.mode === FILTER) {
    filterState.apply();
  }
});
filterLogicObserver.observe(document.querySelector('#filter-logic'), { attributes: true });

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

    } else if (mode === 'explore') {
      section.querySelectorAll(STAR_LIST_ITEM).forEach((li) => {
        tagList.find((tag) => tag.name === li.innerText).highlight();
      });
    }
  });
});

const url = new URL(window.location.href);
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
    if (window.mode.dataset.mode === FILTER) {
      filterState.enter();
    }
  });
}

window.requestAnimationFrame(() => {
  if (window.mode.dataset.mode === FILTER) {
    filterState.enter();
  }
});

document.querySelector('#reset').addEventListener('click', () => {
  const url = new URL(window.location.href);
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
