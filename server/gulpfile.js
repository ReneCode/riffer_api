var gulp = require('gulp');
var mocha = require('gulp-mocha');

var watching = false;


function handleError(err) {
	console.log(err.toString());
	if (watching) {
		this.emit('end');
	} else {
		process.exit(1);
	}
}

gulp.task('test', function() {
	gulp.src('./test/*.js')
		.pipe(mocha({reporter: "spec"}))
		.on('error', handleError)
	;
});

gulp.task('watch', ['test'], function() {
	watching = true;
	gulp.watch(['./test/*.js', './*.js'], ['test']);
});

