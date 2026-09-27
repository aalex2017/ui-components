# 🧠 File Selector

A library that extends the functionality for adding files to file inputs. It allows for reordering files and handles extension validation as well as thumbnail generation.

![](demo.gif)

---

## 📦 Installation

Include the stylesheet and script on your page.

```html
<link rel="stylesheet" href="attaching-files.css">

<script src="attaching-files.js"></script>
```

---

## 🛠 Quick Start

Initialize all file selectors after the document has loaded.

```javascript
document.addEventListener('DOMContentLoaded', () => {
	document
	.querySelectorAll('.file-selector')
	.forEach(fileSelector => {
		new FileSelector(fileSelector);
	});
});
```

---

## ⚠ Requirements

Every file-selector element must be located inside the form with enctype="multipart/form-data".

---

## 📋 Generated Form Fields

Files are sent to the server with names file_1, thumbnail_1, file_2, thumbnail_2 etc.
If a thumbnail is not required for a file, the corresponding thumbnail is not sent and it's input is not displayed.

---

## 📚 Public API

Every File Selector instance exposes the following public properties.

| Property 		| Type 				| Description																			|
|---------------|-------------------|---------------------------------------------------------------------------------------|
| `element` 	| `HTMLElement` 	| Root File Selector element. 															|
| `hasError` 	| `boolean` 		| Indicates whether the File Selector contains validation errors or no file selected. 	|

---

## 📝 Constructor Options

Constructor accepts an options object. A complete configuration example:

```javascript
document.addEventListener('DOMContentLoaded', () => {
	document
	.querySelectorAll('.file-selector')
	.forEach(fileSelector => {
		const options = {
			rowsLimit: 5												,
			thumbnailLabel: 'Mini'										,
			fileAccept: '.jpg, .jpeg, .png, .webp, .avif, .mp4, .webm'	,
			filesRequiringThumbnail: '.mp4, .webm'						,
			thumbnailAccept: '.jpg, .webp, .avif'						,
			firstFileAccept: '.jpg, .webp, .avif'						,
			extraCheckIsError											,
			extraCheckIsThumbnailRequired								,
			fileSize: 20000000											,
			firstFileSize: 50000										,
			totalSize: 22000000
		};
		
		new FileSelector(fileSelector, options);
	});
});
```

---

## 📋 Available Options

| Option 							| Type 		| Default 			| Description 												|
|-----------------------------------|-----------|-------------------|-----------------------------------------------------------|
| rowsLimit 						| number 	| 1 				| Maximum number of files to add. 							|
| thumbnailLabel 					| string 	| `Thumbnail` 		| Thumbnail input title. 									|
| fileAccept 						| string 	| `` 				| Accept attribute value. 									|
| filesRequiringThumbnail 			| string 	| `` 				| Files requiring a thumbnail. 								|
| thumbnailAccept 					| string 	| `` 				| Accept attribute value for thumbnail. 					|
| firstFileAccept 					| string 	| `` 				| Accept attribute value for the first file. 				|
| firstFilesRequiringThumbnail 		| string 	| `` 				| First file requiring a thumbnail. 						|
| firstThumbnailAccept 				| string 	| `` 				| Accept attribute value for the first file's thumbnail. 	|
| extraCheckIsError 				| function 	| `null` 			| Custom additional validation callback. 					|
| extraCheckIsThumbnailRequired 	| function 	| `null` 			| Custom additional validation callback. 					|
| fileSize 							| number 	| `null` 			| Maximum file size. 										|
| thumbnailSize 					| number 	| fileSize 			| Maximum thumbnail size. 									|
| firstFileSize 					| number 	| fileSize 			| Maximum size of the first file. 							|
| firstThumbnailSize 				| number 	| firstFileSize 	| Maximum size of the first file's thumbnail. 				|
| totalSize 						| number 	| `null` 			| Maximum size of all files and thumbnails. 				|
| totalFilesSize 					| number 	| totalSize 		| Maximum size of all files. 								|
| totalThumbnailsSize 				| number 	| totalFilesSize 	| Maximum size of all thumbnails. 							|
| scrollAreaWidth 					| number 	| `50` 				| Horizontal auto-scroll activation area. 					|
| scrollAreaHeight 					| number 	| `50` 				| Vertical auto-scroll activation area. 					|
| scrollSpeedWidth 					| number 	| `20` 				| Horizontal auto-scroll speed. 							|
| scrollSpeedHeight 				| number 	| `20` 				| Vertical auto-scroll speed. 								|

- An empty string for `...accept` means that any files are allowed.
- An empty string for `...requiringThumbnail` means that a thumbnail is not needed.
- Syntax for writing a string for `...accept` and `...requiringThumbnail` is the same as for `accept` html attribute (".txt, .png", "image/jpeg", "video/*").
- `null` for `...size` means that size is not checked.
- non-integer number and 0 for number type converts to the default value.

---

## 🔌 Callbacks

extraCheckIsError and extraCheckIsThumbnailRequired - custom callbacks wich are called when changes occur.
The library checks only the validity of file sizes and their declared types. Custom callbacks, however, can additionally verify file contents. For example, to check whether an image is static.
extraCheckIsError must return `true` if an error exists, and `false` if it does not. Error highlighting and the like must be implemented within this function.
extraCheckIsThumbnailRequired must return `true` if thumbnail is needed, and `false` otherwise.
Both functions accept input as a parameter.

---