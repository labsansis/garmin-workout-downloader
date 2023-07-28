PACKAGE_FILENAME=garmin-workout-downloader.xpi

format:
	npx prettier -w .

package:
	npm run sign

# take the only file in web-ext-artifacts and upload it to s3 with a standardised name.
self-publish:
	ls web-ext-artifacts/ \
		| head -n 1 \
		| xargs -I {} \
		aws s3 cp web-ext-artifacts/{} ${WORKOUTSTATS_FRONTEND_S3_BUCKET_URL_PROD}/garmin-workout-downloader/$(PACKAGE_FILENAME)
	# invalidate the cloudfront distribution cache
	aws cloudfront create-invalidation \
		--distribution-id ${WORKOUTSTATS_FRONTEND_CLOUDFRONT_DISTRO_ID} \
		--paths "/garmin-workout-downloader/*"
