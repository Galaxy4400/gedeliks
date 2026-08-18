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
- `typography-tag-m/tag-r` теперь по значениям совпадают с `small-m/small-r` — это
  ожидаемо, в Figma это один и тот же текстовый стиль (Small M/R), у тега просто
  добавлен uppercase на уровне компонента, а не отдельная шкала размеров. Сам
  uppercase на `.link-tag` и другие компоненты пока не трогали — это уже не про
  шрифты, а про перестройку компонентов (`labels.css` в целом рассинхронизирован
  с текущими токенами, использует несуществующие классы sh1/sh2/b2/b3 — отдельная
  задача).

### Переименование классов typography-* (по просьбе, следом за первым проходом)

Старые имена (`btr/btsm/pr/psm/tagm/tagr`) — калька из kripten, ничего не говорят
о смысле. Переименовал классы и переменные-токены на имена стилей из Figma:

| было (класс)         | стало (класс)         | стиль в Figma      |
| --------------------- | ---------------------- | ------------------ |
| `typography-btr`      | `typography-p`         | P                   |
| `typography-btsm`     | `typography-p-sm`      | P SM                |
| `typography-pr`       | `typography-small-r`   | Small R             |
| `typography-psm`      | `typography-small-m`   | Small M             |
| `typography-tagm`     | `typography-tag-m`     | Small M CAPS        |
| `typography-tagr`     | `typography-tag-r`     | Small R (в теге)    |

Токены в `fonts.css` переименованы синхронно (`--text-big-r`→`--text-p`,
`--text-p-r`→`--text-small-r` и т.д.). Обновлены все места использования:
`breadcrumbs.css`, `links.css`, `buttons.css`, `forms.css`, `cards.css`, `base.css`.
h1-h6 не трогал — они уже совпадали с Figma один в один.

### Починка `npm run dev` (18.08.2026, после переименования)

Сборка падала намертво — Tailwind v4 останавливается на первом же `@apply` с
несуществующей утилитой. Почти все файлы `src/css/components/*` (buttons, links,
forms, cards, labels, menu, pagination, modal, breadcrumbs, components) —
нетронутые копии из kripten с другой, более сложной цветовой системой
(`blue-dark/blue-hover`, `gray-text/gray-bg/gray-element`, `stroke-in-bg`,
`on-surface-*`, `button-teritary`, `on-button-primary`, `button-card-*`,
`sh1/sh2/b2/b3`, `cta`, `glass/white-glass`, `surface-error/success`), которых
нет в `tokens/colors.css` (там только 10 токенов Gedeliks: white/dark-green/
green/black/bg/txt/stroke-white/stroke-green/orange/red).

Сделал **механический проход** — заменил везде на ближайшие существующие токены,
чтобы сборка компилировалась:
- `blue-dark→green`, `blue-hover→dark-green`
- `gray-bg→bg`, `gray-text/gray-element→txt`, `stroke-in-bg→stroke-white`
- `on-surface-primary→black`, `on-surface-secondary/inactive→txt`,
  `on-surface-tertiary→white`, `on-surface-error→red`, `on-surface-success→green`
- `surface-error→red/10`, `surface-success→green/10`
- `white-glass/glass→white/10` (border-вариант → `white/20`)
- `button-teritary→green`, `on-button-primary→white`,
  `button-card-default/hover/press→bg/stroke-green/green`
- `cta→typography-p-sm`, `sh1→typography-p-sm`, `sh2→typography-small-m`,
  `b2→typography-small-r`, `b3→typography-tag-r` (эти 4 — неопознанные классы
  из ещё какого-то стороннего проекта, никогда не были определены; выбор
  ближайшего типографического токена — предположение, не сверено с Figma)
- `custom-radial-bg→bg-green`, `text-big-r→text-p` (забытая после переименования
  bare-утилита Tailwind)

**Важно:** это только чтобы сборка не падала. Цвета по каждому конкретному
компоненту (hover-состояния кнопок/лейблов и т.п.) ещё НЕ сверены с Figma —
будем уточнять по ходу пошаговой работы над UI-китом, как делали со шрифтами.

Заодно 2 отдельных бага из исходника:
- в `layout.css` не хватало токена `--spacing-container-narrow` — вернул
  значение kripten (`1194px`) с пометкой TODO, не проверено по Figma;
- в `menu.css` опечатка `before:` без утилиты (потерялось `content-['']`) —
  исправлено.

`links.css` в момент починки редактировался вручную (часть `blue-dark` уже
была закомментирована) — не трогал закомментированные строки, поправил
только то, что реально ломало сборку.
