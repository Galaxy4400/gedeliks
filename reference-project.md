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
