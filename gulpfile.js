import gulp from 'gulp';
import { spawn } from 'child_process';
import browserSync from 'browser-sync';
import fileInclude from 'gulp-file-include';
import sharp from 'sharp';
import fg from 'fast-glob';
import path from 'path';
import fs from 'fs/promises';
import { minimatch } from 'minimatch';

const bs = browserSync.create();

const cssInput = './src/css/global.css';
const cssOutput = './dist/assets/css/tailwind.min.css';

const htmlPagesInput = './src/html/pages/**/*.html';
const htmlWatchInput = './src/html/**/*.html';
const htmlOutput = './dist';

const imgContentSrc = './src/img/content';
const imgContentDist = './dist/assets/img/content';

// --img=name1,name2 — пересобрать только конкретные файлы по имени (npm run buildimg --img=hero,logo)
const imgNames = process.env.npm_config_img?.split(',').map((s) => s.trim()) || null;

const styles = (done) => {
  const tw = spawn('npx', ['tailwindcss', '-i', cssInput, '-o', cssOutput], {
    shell: true,
    stdio: 'inherit',
  });
  tw.on('close', done);
};

const stylesMinify = (done) => {
  const tw = spawn('npx', ['tailwindcss', '-i', cssInput, '-o', cssOutput, '--minify'], {
    shell: true,
    stdio: 'inherit',
  });
  tw.on('close', done);
};

const html = () =>
  gulp.src(htmlPagesInput).pipe(fileInclude({ prefix: '@@', basepath: '@file' })).pipe(gulp.dest(htmlOutput));

// перенесено 1:1 из fin_system_2 (gulp/utils/is-newer.js) — сравнение mtime вместо gulp-newer,
// т.к. gulp-newer несовместим с async for-циклом вне gulp-потока
const isNewer = async (src, dist) => {
  try {
    const [srcStat, distStat] = await Promise.all([fs.stat(src), fs.stat(dist)]);
    return distStat.mtimeMs >= srcStat.mtimeMs;
  } catch {
    return false;
  }
};

const resetImg = () => fs.rm(imgContentDist, { recursive: true, force: true });

// адаптировано из fin_system_2 (gulp/tasks/imagesResponsive.js): без сетки ширин — только сжатие
// оригинала + генерация avif/webp на исходном разрешении (проект хранит изображения уже в нужном
// размере, ресайз не нужен). Только build/buildimg — в dev/watch не участвует.
const images = async () => {
  let files = await fg(['**/*.png', '**/*.jpg', '**/*.jpeg'], {
    cwd: imgContentSrc,
    absolute: false,
  });

  if (imgNames) {
    files = files.filter((file) => {
      const fileName = path.basename(file);
      return imgNames.some((pattern) => minimatch(fileName, pattern));
    });
  }

  const totalFiles = files.length;
  let filesLeft = 0;

  for (const file of files) {
    const inputFile = path.join(imgContentSrc, file);
    const ext = path.extname(file).toLowerCase();
    const base = path.basename(file, ext);
    const relDir = path.dirname(file);
    const outDir = path.join(imgContentDist, relDir);
    const input = sharp(inputFile);

    await fs.mkdir(outDir, { recursive: true });

    // ---------- PNG ----------
    if (ext === '.png') {
      const outAvif = path.join(outDir, `${base}.avif`);
      if (!(await isNewer(inputFile, outAvif))) {
        await input.clone().avif({ quality: 50, effort: 9, chromaSubsampling: '4:4:4' }).toFile(outAvif);
      }

      const outWebp = path.join(outDir, `${base}.webp`);
      if (!(await isNewer(inputFile, outWebp))) {
        await input.clone().webp({ quality: 72, alphaQuality: 85, effort: 6 }).toFile(outWebp);
      }

      const outPng = path.join(outDir, `${base}.png`);
      if (!(await isNewer(inputFile, outPng))) {
        await input.clone().png({ compressionLevel: 9, adaptiveFiltering: true, palette: true }).toFile(outPng);
      }
    }

    // ---------- JPG/JPEG ----------
    if (ext === '.jpg' || ext === '.jpeg') {
      const outAvif = path.join(outDir, `${base}.avif`);
      if (!(await isNewer(inputFile, outAvif))) {
        await input.clone().avif({ quality: 50, effort: 9, chromaSubsampling: '4:4:4' }).toFile(outAvif);
      }

      const outWebp = path.join(outDir, `${base}.webp`);
      if (!(await isNewer(inputFile, outWebp))) {
        await input.clone().webp({ quality: 72, effort: 6 }).toFile(outWebp);
      }

      const outJpg = path.join(outDir, `${base}.jpg`);
      if (!(await isNewer(inputFile, outJpg))) {
        await input
          .clone()
          .jpeg({ quality: 78, progressive: true, chromaSubsampling: '4:4:4', mozjpeg: true })
          .toFile(outJpg);
      }
    }

    filesLeft++;
    console.log(`${Math.round((filesLeft / totalFiles) * 100)}% | ${file}`);
  }
};

const server = (done) => {
  bs.init({ server: './dist', notify: false, port: 3000 });
  done();
};

const reload = (done) => {
  bs.reload();
  done();
};

const watcher = () => {
  gulp.watch('./src/css/**/*.css', gulp.series(styles, reload));
  gulp.watch(htmlWatchInput, gulp.series(html, styles, reload));
};

export const build = gulp.series(html, stylesMinify, resetImg, images);
export const buildimg = gulp.series(images);

export const dev = gulp.series(html, styles, server, watcher);
export default dev;
