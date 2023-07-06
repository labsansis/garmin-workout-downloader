format:
	npx prettier -w .

package:
	mkdir -p build && zip -r -FS build/garmin-workout-downloader.zip * --exclude '*.git*' 'Makefile' '*.zip' 'build'
