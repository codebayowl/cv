var gulp            = require('gulp'), // сам Галп
    sass            = require('gulp-sass'), // Sass/SCSS для галпа
    browserSync     = require('browser-sync'), // обновлялка браузера
    concat          = require('gulp-concat'), // конкатенация файлов
    uglify          = require('gulp-uglify'), // сжатие JS
    cssnano         = require('gulp-cssnano'), // минификации CSS
    rename          = require('gulp-rename'), // переименование файлов CSS
    del             = require('del'), //удаление файлов и папок
    imagemin        = require('gulp-imagemin'), // работа с изображениями
    pngquant        = require('imagemin-pngquant'), // работа с png
    cache           = require('gulp-cache'), // кеширование
    autoprefixer    = require('gulp-autoprefixer'), // автопрефиксер
    pug             = require('gulp-pug'); //препроцессор pug

// СБОРКА SASS/SCSS
gulp.task('sass', function() {
    return gulp.src('src/scss/*.+(scss|sass)') // Берем источник
    .pipe(sass()) //Преобразуем Sass в CSS посредством gulp-sass
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
    .pipe(gulp.dest('src/css')) // Выгружаем результата в папку src/css
    .pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
});

// СЖАТИЕ CSS БИБЛИОТЕК
gulp.task('css-libs', ['sass'], function() {
    return gulp.src('src/css/libs.css') // Выбираем файл для минификации
        .pipe(cssnano()) // Сжимаем
        .pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
        .pipe(gulp.dest('src/css')); // Выгружаем в папку app/css
});

// СБОРКА PUG
gulp.task('pug', function() {
    return gulp.src('src/pug/index.pug')
        .pipe(pug())
        .pipe(gulp.dest('src'))
});

// ПЕРЕЖАТИЕ БИБЛИОТЕК JS
gulp.task('scripts', function() {
    return gulp.src([ // Берем все необходимые библиотеки
        'src/libs/jquery/dist/jquery.min.js' // Берем jQuery
        ])
        .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('src/js')); // Выгружаем в папку app/js
});

// СИНХРОНИЗАЦИЯ БРАУЗЕРА
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: 'src'
        },
        notify: false
    });
});


// ШПИЁН
gulp.task('watch', ['browser-sync', 'css-libs', 'pug', 'scripts'], function() {
    gulp.watch('src/scss/*.+(scss|sass)', ['sass']); //watch sass files
    gulp.watch('src/pug/*.pug', ['pug']); //watch pug files
    gulp.watch('src/*.html', browserSync.reload); // watch HTML files
    gulp.watch('src/js/**/*.js', browserSync.reload); // watch JS files
});

// ПРОДАКШН
gulp.task('clean', function() {
    return del.sync('prod'); // Удаляем папку prod перед сборкой
});
 
gulp.task('img', function() {
    return gulp.src('src/img/**/*') // Берем все изображения из app
        .pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('prod/img')); // Выгружаем на продакшен
});

gulp.task('build', ['clean', 'img', 'sass', 'pug', 'scripts'], function() {
 
    var buildCss = gulp.src([ // Переносим библиотеки в продакшн
        'src/css/styles.css',
        'src/css/libs.min.css'
        ])
    .pipe(gulp.dest('prod/css'))
 
    //var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшн
    //.pipe(gulp.dest('dist/fonts'))
 
    var buildJs = gulp.src('src/js/**/*') // Переносим скрипты в продакшн
    .pipe(gulp.dest('prod/js'))
 
    var buildHtml = gulp.src('src/*.html') // Переносим HTML в продакшн
    .pipe(gulp.dest('prod'));
 
});

gulp.task('clear', function () {
    return cache.clearAll();
})

gulp.task('default', ['watch']);