import gulp from 'gulp';
import { spawn } from 'child_process';
import browserSync from 'browser-sync';
import fileInclude from 'gulp-file-include';

const bs = browserSync.create();

const cssInput = './src/css/global.css';
const cssOutput = './dist/assets/css/tailwind.min.css';

const htmlPagesInput = './src/html/pages/**/*.html';
const htmlWatchInput = './src/html/**/*.html';
const htmlOutput = './dist';

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

export const build = gulp.series(html, stylesMinify);

export const dev = gulp.series(html, styles, server, watcher);
export default dev;
