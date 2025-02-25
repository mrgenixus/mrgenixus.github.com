const SLUG_STEPS = [
  ['replace', ['#', 'sharp']],
  ['replace', ['.', 'dot']],
  ['toLowerCase'],
  ['replace', [/\W+/ig,'-']],
  ['replace', [/(^-|-$)/, '']],
];
const applyEach = (s, [method, args=[]]) => s[method].apply(s, args);
const slugify = (s) => {
  return SLUG_STEPS.reduce(applyEach, s);
}

const updateAttribute = (e, name, op) => {
  e.setAttribute(name, op(e.getAttribute(name)));
}

const updateAttributeList = (sep, e, name, op) => {
  updateAttribute(e, name, (s) => {
    return op((s ?? '').split(sep).filter((s) => s)).join(sep);
  });
}

export class Tag {
  #name
  #slug
  #elements
  #listItem

  constructor(name) {
    this.#elements = [];
    this.#name = name;
    this.#slug = slugify(name);
    this.#listItem = document.createElement('li');
    this.#listItem.classList.add('list-inline-item')
    this.#listItem.addEventListener('click', this.hide.bind(this))
    this.#updateInnerText();
  }

  hide(e) {
    window.requestAnimationFrame(() => {
      this.#elements.forEach((e) => e.classList.add('d-none'));
      this.#listItem.classList.add('d-none');
    });
  }

  addElement(e) {
    this.#elements.push(e);
    e.addEventListener('click', this.hide.bind(this));
    this.#updateInnerText();
  }

  get name() {
    return this.#name;
  }

  get slug() {
    return this.#slug;
  }

  get count() {
    return this.#elements.length;
  }
  get elements() {
    return Array.from(this.#elements);
  }

  #updateInnerText() {
    this.#listItem.innerText = `${this.#name}`;
    this.#listItem.style.fontSize = `${(100 + 15 * this.count)}%`;
  }

  get listItem() {
    return this.#listItem;
  }

  toString() {
    return this.slug;
  }
}

export class SkillTag extends Tag {
  #sections;
  static sectionSelector = 'section';
  static dataAttribute = 'skills'
  static separator = ' ';
  constructor(name) {
    super(name);
    this.#sections = [];
    this.listItem.addEventListener('click', this.removeTagData.bind(this));
  }

  addElement(e) {
    super.addElement(e);
    this.#addSection(e.closest(this.constructor.sectionSelector));
    e.addEventListener('click', this.removeTagData.bind(this));
  }

  removeTagData() {
    this.#sections.forEach((section) => {
      updateAttributeList(this.constructor.separator, section, `data-${this.constructor.dataAttribute}`, (l) => {
        return l.filter((s) => s !== this.slug);
      });
    })
  }

  #addSection(section) {
    if (!section) {
      console.warn("Section not found for selector", this.constructor.selectionSelector);
      return;
    }
    this.#sections.push(section);
    updateAttributeList(this.constructor.separator, section, `data-${this.constructor.dataAttribute}`, (l) => l.concat(this.slug));
  }
}

export class TagList {
  static T = Tag;

  constructor() {
    this.tags = [];
  }

  addTag(name, element) {
    const slug = slugify(name);
    let tag = this.tags.find((t) => t.slug === slug);
    if (!tag) {
      tag = new this.constructor.T(name);
      this.tags.push(tag);
    }
    tag.addElement(element);
  }

  reduceIn(e) {
    this.addTag(e.innerText, e);
    return this;
  }

  sort(...args) {
    this.tags.sort(...args);
    return this;
  }

  find(...args) {
    return this.tags.find(...args);
  }

  filter(...args) {
    const tl = new TagList();
    tl.tags = this.tags.filter(...args);
    return tl;
  }

  toSorted(...args) {
    const tl = new TagList()
    tl.tags = this.tags.toSorted(...args1);
    return tl;
  }

  map(...args) {
    return this.tags.map(...args);
  }

  reduce(...args) {
    return this.tags.reduce(...args);
  }

  static subclass({
    sectionSelector:lSelectionSelector=SkillTag.sectionSelector,
    dataAttribute:lDataAttribute=SkillTag.dataAttribute,
  }={}) {
    return class extends this {
      static T = class extends SkillTag {
        static sectionSelector = lSelectionSelector;
        static dataAttribute = lDataAttribute;
      }
    }
  }
}

export const SkillTagList = TagList.subclass();
