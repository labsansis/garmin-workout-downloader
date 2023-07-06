PACKAGE_FILENAME=garmin-workout-downloader.xpi

format:
	npx prettier -w .

package:
	mkdir -p build
	cd src && zip -r -FS ../build/$(PACKAGE_FILENAME) * --exclude '*.git*' 'Makefile' '*.zip' 'build' '.env*'

self-publish: package
	aws s3 cp ./build/$(PACKAGE_FILENAME) ${WORKOUTSTATS_FRONTEND_S3_BUCKET_URL_PROD}/garmin-workout-downloader/
