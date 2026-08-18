# Референсный проект

При реализации проекта Gedeliks опираемся на проект **kripten**:

```
/Users/evgeny/Work/projects/kripten
```

Стек: Gulp + Tailwind v4, дизайн-токены/компоненты, data-атрибуты для состояний, vanilla JS.
Подробный технический разбор стиля разработки — см. память `gedeliks-dev-style-profile`.

## Текущее состояние базы (18.08.2026)

В этот проект уже вручную перенесена и почищена большая часть файлов из kripten —
это стартовая база для дальнейшей работы. Возможно, ходить в исходный kripten
уже не понадобится — всё нужное перенесено сюда.

Перенесено:
- `src/css/tokens/*` — токены (colors, fonts, spacing, breakpoints, animations)
- `src/css/components/*` — компоненты (buttons, cards, forms, labels, menu, modal,
  pagination, sliders, spoilers, typography и т.д.)
- `gulpfile.js` — минимальный (только сборка Tailwind CSS + browser-sync)

Ещё **сырое, не зачищено под Gedeliks** (зачистка будет по ходу работы, не сразу):
- `dist/index.html`, `dist/assets/js/*` — всё ещё контент/файлы Криптена (title,
  embla-carousel через unpkg и т.д.)
- `README.md` — список страниц Криптена
- `package.json` — `name: "static-template"`, generic
- В `src/` пока нет `js/`, `img/`, `fonts/` — только CSS
- В gulpfile нет пайплайна для картинок (sharp/avif/webp) — см. память
  `gedeliks-image-pipeline-spec`, его предстоит перенести отдельно

## Шрифты (18.08.2026)

Разобрали `tokens/fonts.css` и `components/typography.css` по фреймам Figma
(UI-кит node 14-2846, главная десктоп 6009-910 + hero-баннеры 42023-6999/26045-2780,
главная мобилка 42022-3738 + hero 42022-4017).

- Шрифт в макете — **Inter** (variable, 100–900), а не Geist, который был в коде
  из kripten. Заменили: файлы скачаны с Google Fonts и лежат в `src/fonts/Inter-Variable-*.woff2`
  (разбиты по unicode-range: cyrillic/cyrillic-ext/latin/latin-ext — на сайте нужна кириллица).
  Пакет `geist` убран из package.json.
  **Важно:** в gulpfile нет задачи, которая копирует шрифты из `src/fonts` в
  `dist/assets/fonts` (её и для Geist не было — dist/assets/fonts пустой). Нужно
  добавить copy-таск, иначе `@font-face` будет 404.
- Шкала `--text-h*/--font-h*/--leading-h*`, `big-r/sm`, `p-r/sm`, `tag-m/r` в
  `tokens/fonts.css` переписана на реальные размеры/веса/lineHeight из стилей
  Figma (Desktop/Mobile H1-H6, P/P SM, Small R/Small M(CAPS)). Почти все значения
  отличались от шаблонных из kripten (веса у h1-h4 были везде 500, в макете
  700/600/600/600/500/500 для h1-h6; p-sm был 600, в макете 500 и т.д.).
- Два значения не подтверждены в Figma (там их пока нет) и помечены TODO прямо
  в коде: mobile H1 (hero на мобилке ещё не свёрстан — заголовок набран
  смешанными размерами 42/50px, не единым стилем) и mobile H3 (нигде на экранах
  не встретился, размер 29px посчитан по пропорции соседних уровней).
- `typography-tagm/tagr` теперь по значениям совпадают с `p-sm/p-r` — это ожидаемо,
  в Figma это один и тот же текстовый стиль (Small M/R), у тега просто добавлен
  uppercase на уровне компонента, а не отдельная шкала размеров. Сам uppercase
  на `.link-tag` и другие компоненты пока не трогали — это уже не про шрифты,
  а про перестройку компонентов (`labels.css` в целом рассинхронизирован с
  текущими токенами, использует несуществующие классы sh1/sh2/b2/b3 — отдельная задача).
