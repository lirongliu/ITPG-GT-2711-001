var DropboxBooth = {
	start: function() {

	},

	convert: function(blob) {
		var fileReader= new FileReader({'blob': true});
		fileReader.onload = function(e) {
			DropboxBooth.save( fileReader.result );
		}
		fileReader.readAsDataURL( blob );
	},

	save: function( url ) {
		TwitterBooth.hideDiv($('#preview'));
		TwitterBooth.showLoader();

		var filename = Math.random().toString(36).substr(2,9) + ".gif";
		var options = {
			files: [
				{
					'url': url,
					'filename': filename
				}
			],

			// Success is called once all files have been successfully added to the user's
			// Dropbox, although they may not have synced to the user's devices yet.
			success: function () {
				// console.log("Dropbox.save success");
				TwitterBooth.hideLoader();
				TwitterBooth.restart();
			},

			// Progress is called periodically to update the application on the progress
			// of the user's downloads. The value passed to this callback is a float
			// between 0 and 1. The progress callback is guaranteed to be called at least
			// once with the value 1.
			progress: function (progress) {},

			// Cancel is called if the user presses the Cancel button or closes the Saver.
			cancel: function () {
				TwitterBooth.hideLoader();
				TwitterBooth.showDiv($('#preview'));
			},

			// Error is called in the event of an unexpected response from the server
			// hosting the files, such as not being able to find a file. This callback is
			// also called if there is an error on Dropbox or if the user is over quota.
			error: function (errorMessage) {
				console.log("Dropbox.save error");
				console.log(errorMessage);
			}
		};
		Dropbox.save(options);
	}
}