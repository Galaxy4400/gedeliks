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

### Переименование классов typography-\* (по просьбе, следом за первым проходом)

Старые имена (`btr/btsm/pr/psm/tagm/tagr`) — калька из kripten, ничего не говорят
о смысле. Переименовал классы и переменные-токены на имена стилей из Figma:

| было (класс)      | стало (класс)        | стиль в Figma    |
| ----------------- | -------------------- | ---------------- |
| `typography-btr`  | `typography-p`       | P                |
| `typography-btsm` | `typography-p-sm`    | P SM             |
| `typography-pr`   | `typography-small-r` | Small R          |
| `typography-psm`  | `typography-small-m` | Small M          |
| `typography-tagm` | `typography-tag-m`   | Small M CAPS     |
| `typography-tagr` | `typography-tag-r`   | Small R (в теге) |

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
green/black/bg/txt/stroke-white/green-light/orange/red).

Сделал **механический проход** — заменил везде на ближайшие существующие токены,
чтобы сборка компилировалась:

- `blue-dark→green`, `blue-hover→dark-green`
- `gray-bg→bg`, `gray-text/gray-element→txt`, `stroke-in-bg→stroke-white`
- `on-surface-primary→black`, `on-surface-secondary/inactive→txt`,
  `on-surface-tertiary→white`, `on-surface-error→red`, `on-surface-success→green`
- `surface-error→red/10`, `surface-success→green/10`
- `white-glass/glass→white/10` (border-вариант → `white/20`)
- `button-teritary→green`, `on-button-primary→white`,
  `button-card-default/hover/press→bg/green-light/green`
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

## Иконки / SVG-спрайт (18.08.2026)

По образцу kripten (`dist/assets/img/svg/sprite.svg`: один файл, `<symbol>` на
иконку, `<use href="...#id">` в разметке, пути на `fill="currentColor"` —
цвет иконки берётся из `color`/`text-*` элемента или родителя, размер — через
`width`/`height`).

Источник иконок — фрейм Figma «Icons», `node-id=14-2787` (36 штук). У фрейма
свои узлы-символы под каждую иконку; экспортировал через `download_assets` по
каждому узлу отдельно (batch-экспорт всего фрейма разом упирается в лимит
Figma MCP — 20 SVG-ассетов за вызов, и непонятно, какие 20 из 36 вернутся).

Из 36 в спрайт вошли **30**:

- 24 — с понятным именем прямо из Figma (location, tick-circle, arrow-right,
  arrow-down, chevron-down, box, people, user, forbidden, lungs, add, minus,
  book, home, water-drop, energy, history, import, clipboard-text, car,
  danger, shield-tick, video-circle)
- 6 — без подписи в Figma (просто «Variant14/27/28/29/30/32»), имя дал по
  форме контура: `chevron-right`, `close`, `flame`, `share`, `flash`,
  `flash-down`. Названия приняты (18.08.2026) — пометку `?`/`provisional`
  убрал из UI-кита и из sprite.svg.

**Важная поправка (18.08.2026):** изначально принял `Variant19`/`Variant35`/`Variant20`
за точные дубли `arrow-right`/`arrow-down`/`people` — судил только по общему
внутреннему id `vuesax/linear/...` в самих SVG, не сверив реальную геометрию
путей. На деле это три другие иконки:

- `Variant19` → **`arrow-down`** — полноценная стрелка вниз (шеврон + стержень).
  Раньше под именем `icon-arrow-down` был другой узел (2:1065) — голый шеврон
  без стержня; переименовал его в **`icon-chevron-down`**, чтобы освободить
  правильное имя.
- `Variant35` → **`chevron-up`** — шеврон вверх (без стержня, пара к chevron-down/right)
- `Variant20` → **`user`** — один человек/профиль (2 пути), в отличие от
  `people` (два человека, 6 путей)

Ещё 6 многослойных иконок (leaves, wind, antibacterial, virus, target, один
безымянный `Variant22` → назвал `smile` по форме, не подтверждено) — теперь
тоже в общем спрайте на равных с остальными 30 (изначально выделял их в
отдельную секцию UI-кита с пунктирной рамкой «требует проверки», но
многослойность сама по себе не проблема — currentColor работает одинаково
для 1 path и для 17 — поэтому объединил в одну сетку). Что сделал при
вставке:

- вычленил вложенную группу `<g id="Property 1=...">` из «сырого» экспорта
  (экспорт узла у Figma отдаёт весь холст целиком — фон, дэшед-рамку
  выделения и т.д., не только саму иконку)
- у этих иконок Figma использует `<mask>`/`<clipPath>` — луминантная маска
  почти всегда рисуется как `<path fill="white">` на весь канвас 0,0–24,24.
  Наивная замена `fill="white"→currentColor` (как для простых иконок) превращает
  такую маску в закрашенный квадрат поверх иконки — это и было причиной
  «сломанной» **energy** (уже почищено: убрал маску-заглушку, оставил только
  реальный path со стрелкой-молнией). Для всех 6 новых сложных иконок
  `<mask>`/`<clipPath>`-определения вырезал целиком перед конвертацией в
  currentColor, чтобы не повторить тот же баг — но саму сборку/расположение
  путей не проверял, возможны неточности.

В `dist/ui.html` — отдельная сетка под эти 6 с пунктирной рамкой (пометка
«требует проверки»).

Источник (для повторной пересборки) — `src/img/svg/sprite.svg`, копия в
`dist/assets/img/svg/sprite.svg` (руками, как раньше со шрифтами — в gulpfile
по-прежнему нет copy-таска ни для шрифтов, ни для картинок/иконок).
