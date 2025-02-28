export function hideEmptyHeadings(section) {
  let curr = section.parentElement.querySelectorAll('h2, h2 ~ section')[0];
  let heading;
  let hide = true;

  while (true) {
    if (curr === null || curr.tagName.toLowerCase() === 'h2') {
      if (heading && hide) {
        heading.classList.add('d-none');
      }

      heading = curr;
      hide = true;
    } else {
      const isHidden = curr.classList.contains('d-none') || curr.getAttribute('data-skills') === ''
      if (hide !== false && !isHidden) {
        hide = false;
      }
    }

    if (curr === null) break;

    curr = curr.nextElementSibling;
  }
}
