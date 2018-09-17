module.exports = function runGrunt(grunt) {
  const ddmNameSrc = 'dd-manager.js';
  const ddmMinNameSrc = 'dd-manager.min.js';
  const staging = parseInt(grunt.option('staging'), 10);
  const ddmName = staging ? `dd-manager-${staging}.js` : ddmNameSrc;
  const ddmMinName = staging ? `dd-manager-${staging}.min.js` : ddmMinNameSrc;

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    wrap: {
      stage: {
        src: ['dist/dd-manager.js'],
        dest: 'dist/dd-manager.js',
        options: {
          wrapper: ['(function () { var define = undefined;', '})();'],
        },
      },
    },
    compress: {
      build: {
        options: {
          mode: 'gzip',
        },
        files: [{
          src: ['dist/dd-manager.min.js'],
          dest: 'deploy/dd-manager.js',
        }],
      },
    },
    clean: {
      pre_build: ['deploy/dd-manager.js'],
    },
    aws: grunt.file.readJSON('aws-keys.json'),
    aws_s3: {
      options: {
        accessKeyId: '<%= aws.AWSAccessKeyId %>', // Use the variables
        secretAccessKey: '<%= aws.AWSSecretKey %>', // You can also use env variables
        region: 'eu-west-1',
        params: {
          CacheControl: 'max-age=86400',
          ContentEncoding: 'gzip',
        },
      },
      production: {
        options: {
          bucket: 'cdn.ddmanager.ru',
          differential: true, // Only uploads the files that have changed
          gzipRename: 'ext', // when uploading a gz file, keep the original extension
        },
        files: [{
          expand: true,
          cwd: 'deploy',
          src: ['**'],
          dest: 'sdk/',
        }],
      },
      stage: {
        options: {
          bucket: 'cdn-stage.ddmanager.ru',
          differential: true, // Only uploads the files that have changed
          gzipRename: 'ext', // when uploading a gz file, keep the original extension
          params: {
            ContentEncoding: 'none',
            CacheControl: 'max-age=0',
          },
        },
        files: [
          { src: `dist/${ddmNameSrc}`, dest: `dist/${ddmName}` },
          { src: `dist/${ddmMinNameSrc}`, dest: `dist/${ddmMinName}` },
        ],
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-aws-s3');
  grunt.loadNpmTasks('grunt-wrap');

  // Default task(s).
  grunt.registerTask('build', [
    'clean:pre_build',
    'compress',
    'aws_s3:production',
  ]);

  grunt.registerTask('build:stage', [
    'aws_s3:stage',
  ]);
};
