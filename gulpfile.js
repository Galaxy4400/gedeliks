import gulp from 'gulp';
import { spawn } from 'child_process';
import browserSync from 'browser-sync';

const bs = browserSync.create();

const cssInput = './src/css/global.css';
const cssOutput = './dist/assets/css/tailwind.min.css';

const styles = (done) => {
  const tw = spawn('npx', ['tailwindcss', '-i', cssInput, '-o', cssOutput], {
    shell: true,
    stdio: 'inherit',
  });
  tw.on('close', done);
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
  gulp.watch('./dist/**/*.html', gulp.series(styles, reload));
};

export const build = (done) => {
  const tw = spawn('npx', ['tailwindcss', '-i', cssInput, '-o', cssOutput, '--minify'], {
    shell: true,
    stdio: 'inherit',
  });
  tw.on('close', done);
};

export const dev = gulp.series(styles, server, watcher);
export default dev;
