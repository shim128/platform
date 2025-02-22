const Prism = require('prismjs')
const loadLanguages = require('prismjs/components/')
const { escape } = require('html-escaper')

loadLanguages()

const endOfLine = '\n'

const LANG_ALIASES= {
  'js': 'javascript',
  'nginxconf': 'nginx'
}

function renderOriginalLine(line) {
  return `<span class="block-code__original-line">${escape(line)}</span>`
}

function highlightCode(source, language) {
  return Prism.highlight(source, Prism.languages[language], language)
}

// расстановка классов и атрибутов для элементов кода внутри тела статьи,
// подсветка синтаксиса,
// расстановка номеров строк,
// расстановка классов на инлайновые блоки с кодом
/**
 * @param {Window} window
 */
module.exports = function(window) {
  const articleContent = window.document.querySelector('.article__content-inner')

  articleContent
    ?.querySelectorAll('pre[data-lang]')
    ?.forEach(preElement => {
      const codeElement = preElement.querySelector('code')

      let language = preElement.getAttribute('data-lang').trim()
      language = LANG_ALIASES[language] || language

      const originalContent = codeElement.textContent
      const highlightedContent = language
        ? highlightCode(originalContent, language)
        : originalContent

      const lines = originalContent
        .split(endOfLine)
        .filter((line, index, linesArray) => {
          // удаляем первую и последнюю пустые строки
          const isFirtsOrLastLine = (index === 0 || index === linesArray.length -1)
          const isEmptyLine = line.trim() === ''
          return !(isFirtsOrLastLine && isEmptyLine)
        })
        .map((line) => renderOriginalLine(line))

      const originalSplittedContent = lines.join('')

      const linesBlock = window.document.createElement('span')
      linesBlock.classList.add('block-code__lines')
      linesBlock.innerHTML = Array.from(
        { length: lines.length },
        () => `<span class="block-code__line"></span>`
      ).join('')

      preElement.classList.add('block-code', 'font-theme', 'font-theme--code')
      preElement.innerHTML = `
        <span class="block-code__inner " tabindex="0">
          ${linesBlock.outerHTML}
          <code class="block-code__original">${originalSplittedContent}</code>
          <code class="block-code__highlight">${highlightedContent}</code>
        </span>
        <span class="block-code__tools">
          <button class="block-code__copy-button copy-button" type="button" data-state="idle">
            <svg class="copy-button__icon" width="14" height="17" viewBox="0 0 14 17" fill="none" stroke="currentColor">
              <rect width="8.75" height="11.35" x="4.75" y="4.43" rx="1.5"/>
              <path d="M8.8 2.3c0-.72-.58-1.3-1.3-1.3H3a2 2 0 0 0-2 2v8.07c0 .9.73 1.63 1.63 1.63"/>
            </svg>
            <span class="copy-button__text link" data-state="idle">Скопировать</span>
            <span class="copy-button__text" data-state="success">Скопировано</span>
            <span class="copy-button__text" data-state="error">Не удалось скопировать</span>
          </button>
        </span>
      `
    })

  articleContent
    ?.querySelectorAll('pre:not([data-lang])')
    ?.forEach(preElement => {
      preElement.classList.add('format-block', 'font-theme', 'font-theme--code')
      preElement.setAttribute('tabindex', 0)
    })

  articleContent
    ?.querySelectorAll('p code, ul code, ol code, table code')
    ?.forEach(codeElement => {
      codeElement.classList.add('inline-code', 'font-theme', 'font-theme--code')
    })

  // добавление классов на блоки `code` внутри заголовков
  {
    const classMap = {
      'articles-group__link': 'articles-group__code',
      'articles-group__title': 'articles-group__code',
      'article__title': 'article__title-code',
      'social-card__title': 'social-card__title-code',
      'featured-article': 'featured-article__code',
      'index-group-list__link': 'index-group-list__code',
      'header__title': 'header__title-code',
      'article__description': 'article__description-code',
      'article-heading': 'article-heading__code',
      'figure__caption': 'figure__caption-code',
    }

    for (const [parentClass, codeClass] of Object.entries(classMap)) {
      window.document.querySelectorAll(`.${parentClass}`)
        .forEach(parentElement => {
          parentElement.querySelectorAll('code').forEach(codeElement => {
            codeElement.classList.add(codeClass, 'font-theme', 'font-theme--code')
          })
        })
    }
  }

}
