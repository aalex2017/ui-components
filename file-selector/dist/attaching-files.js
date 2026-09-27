class FileSelector {
	element;
	
	#rowsLimit;
	
	#thumbnailLabel;
	
	#fileAccept;
	#filesRequiringThumbnail;
	#thumbnailAccept;
	
	#firstFileAccept;
	#firstFilesRequiringThumbnail;
	#firstThumbnailAccept;
	
	#extraCheckIsError;
	#extraCheckIsThumbnailRequired;
	
	#fileSize;
	#thumbnailSize;
	
	#firstFileSize;
	#firstThumbnailSize;
	
	#totalSize;
	#totalFilesSize;
	#totalThumbnailsSize;
	
	#scrollAreaWidth;
	#scrollAreaHeight;
	#scrollSpeedWidth;
	#scrollSpeedHeight;
	
	#addButton;
	#trashCan;
	
	#rowTemplate;
	#firstRowTemplate;
	
	#lastMouseX = 0;
	#lastMouseY = 0;
	
	#currentTotalSize 				= 0;
	#currentTotalFilesSize 			= 0;
	#currentTotalThumbnailsSize 	= 0;
	
	#ghostRow = {
		pointerId: 		null,
		row: 			null,
		ghost: 			null,
		insertionZone: 	null,
		offsetX: 		0,
		offsetY: 		0
	};
	
	constructor(element, options = {}) {
		const {
			rowsLimit						,
			
			thumbnailLabel					,
			
			fileAccept						,
			filesRequiringThumbnail			,
			thumbnailAccept					,
			
			firstFileAccept					,
			firstFilesRequiringThumbnail	,
			firstThumbnailAccept			,
			
			extraCheckIsError				,
			extraCheckIsThumbnailRequired	,
			
			fileSize						,
			thumbnailSize					,
			
			firstFileSize					,
			firstThumbnailSize				,
			
			totalSize						,
			totalFilesSize					,
			totalThumbnailsSize				,
			
			scrollAreaWidth					,
			scrollAreaHeight				,
			scrollSpeedWidth				,
			scrollSpeedHeight
		
		} = options;
		
		this.#rowsLimit 						= Number.isInteger(rowsLimit) 				&& rowsLimit 				> 0 	? rowsLimit 						: 1							;
		
		this.#thumbnailLabel 					= typeof thumbnailLabel 					=== 'string' 						? thumbnailLabel 					: 'Thumbnail'				;
		
		this.#fileAccept 						= typeof fileAccept 						=== 'string' 						? fileAccept 						: ''						;
		this.#filesRequiringThumbnail 			= typeof filesRequiringThumbnail 			=== 'string' 						? filesRequiringThumbnail 			: ''						;
		this.#thumbnailAccept 					= typeof thumbnailAccept 					=== 'string' 						? thumbnailAccept 					: ''						;
		
		this.#firstFileAccept 					= typeof firstFileAccept 					=== 'string' 						? firstFileAccept 					: ''						;
		this.#firstFilesRequiringThumbnail 		= typeof firstFilesRequiringThumbnail 		=== 'string' 						? firstFilesRequiringThumbnail 		: ''						;
		this.#firstThumbnailAccept 				= typeof firstThumbnailAccept 				=== 'string' 						? firstThumbnailAccept 				: ''						;
		
		this.#extraCheckIsError 				= typeof extraCheckIsError 					=== 'function' 						? extraCheckIsError 				: null						;
		this.#extraCheckIsThumbnailRequired 	= typeof extraCheckIsThumbnailRequired 		=== 'function' 						? extraCheckIsThumbnailRequired 	: null						;
		
		this.#fileSize 							= Number.isInteger(fileSize) 				&& fileSize 				> 0 	? fileSize 							: null						;
		this.#thumbnailSize 					= Number.isInteger(thumbnailSize) 			&& thumbnailSize 			> 0 	? thumbnailSize 					: this.#fileSize			;
		
		this.#firstFileSize 					= Number.isInteger(firstFileSize) 			&& firstFileSize 			> 0 	? firstFileSize 					: this.#fileSize			;
		this.#firstThumbnailSize 				= Number.isInteger(firstThumbnailSize) 		&& firstThumbnailSize 		> 0 	? firstThumbnailSize 				: this.#firstFileSize		;
		
		this.#totalSize 						= Number.isInteger(totalSize) 				&& totalSize 				> 0 	? totalSize 						: null						;
		this.#totalFilesSize 					= Number.isInteger(totalFilesSize) 			&& totalFilesSize 			> 0 	? totalFilesSize 					: this.#totalSize			;
		this.#totalThumbnailsSize 				= Number.isInteger(totalThumbnailsSize) 	&& totalThumbnailsSize 		> 0 	? totalThumbnailsSize 				: this.#totalFilesSize		;
		
		this.#scrollAreaWidth 					= Number.isInteger(scrollAreaWidth) 		&& scrollAreaWidth 			> 0 	? scrollAreaWidth 					: 50						;
		this.#scrollAreaHeight 					= Number.isInteger(scrollAreaHeight) 		&& scrollAreaHeight 		> 0 	? scrollAreaHeight 					: 50						;
		this.#scrollSpeedWidth 					= Number.isInteger(scrollSpeedWidth) 		&& scrollSpeedWidth 		> 0 	? scrollSpeedWidth 					: 20						;
		this.#scrollSpeedHeight 				= Number.isInteger(scrollSpeedHeight) 		&& scrollSpeedHeight 		> 0 	? scrollSpeedHeight 				: 20						;
		
		this.element 							= element;
		
		
		
		this.#createAddButton();
		this.#createTrashCan();
		
		if (this.#rowsLimit === 1) {
			this.#addButton.disabled = true;
		}
		
		this.#rowTemplate 		= this.#createRowTemplate(this.#fileAccept, this.#filesRequiringThumbnail, this.#thumbnailAccept);
		this.#firstRowTemplate 	= this.#createRowTemplate(this.#firstFileAccept, this.#firstFilesRequiringThumbnail, this.#firstThumbnailAccept);
		
		this.#firstRowTemplate.classList.add('file-selector__row--first');
		
		
		this.element.append(this.#trashCan, this.#firstRowTemplate.cloneNode(true), this.#addButton);
		
		
		this.#updateInsertionZones();
		
		this.#handleClick();
		this.#handleChange();
		
		this.#handleWheel();
		this.#handleContextmenu();
		this.#handleStopDrag();
		
		this.#handlePointerdown();
		this.#handlePointermove();
		this.#handlePointerup();
    }
	
	
	
	get hasError() {
		const inputs = this.element.querySelectorAll('input');
		
		for (const input of inputs) {
			if (input.disabled) {
				continue;
			}
			
			if (input.files.length === 0) {
				return true;
			}
		}
		
        return !!this.element.querySelector(`
			.file-selector--total-size-error				,
			.file-selector--total-files-size-error			,
			.file-selector--total-thumbnails-size-error		,
			.file-selector__input-wrapper--type-error		,
			.file-selector__input-wrapper--size-error		,
			.file-selector__input-wrapper--another-error
			`);
    }
	
	#createAddButton() {
		this.#addButton 			= document.createElement('button');
		this.#addButton.className 	= 'file-selector__add-button';
		this.#addButton.type 		= 'button';
	}
	
	#createTrashCan() {
		this.#trashCan 				= document.createElement('div');
		this.#trashCan.className 	= 'file-selector__trash-can file-selector__trash-can--hidden';
	}
	
	#createRowTemplate(fileAccept, filesRequiringThumbnail, thumbnailAccept) {
		const row 		= document.createElement('div');
		row.className 	= 'file-selector__row';
		
		row.innerHTML 	=
			`
			<label class="file-selector__input-wrapper">
				<input class="file-selector__input" type="file" name="file_0" accept="${fileAccept}" data-files-requiring-thumbnail="${filesRequiringThumbnail}">
			</label>
			`;
		
		if (this.#filesRequiringThumbnail !== '' || this.#firstFilesRequiringThumbnail !== '') {
			const thumbnail 		= document.createElement('label');
			thumbnail.className 	= 'file-selector__input-wrapper file-selector__input-wrapper--hidden';
			
			thumbnail.innerHTML 	=
				`
				<span class="file-selector__input-name">
					${this.#thumbnailLabel}
				</span>
				
				<input class="file-selector__input file-selector__input--thumbnail" type="file" name="thumbnail_0" accept="${thumbnailAccept}" disabled required>
				`;
			
			row.append(thumbnail);
		}
		
		const dragHandle 		= document.createElement('button');
		dragHandle.className 	= 'file-selector__drag-handle';
		dragHandle.type 		= 'button';
		
		row.append(dragHandle);
		
		return row;
	}
    
	#update() {
		this.element
		.querySelectorAll(':scope > .file-selector__row')
		.forEach((row, index) => {
			const file 			= row.querySelector('[name^="file"]');
			const thumbnail 	= row.querySelector('[name^="thumbnail"]');
			
			let isThumbnailRequired 	= false;
			let thumbnailAccept 		= '';
			
			if (index === 0) {
				row.classList.add('file-selector__row--first');
				
				file.accept 							= this.#firstFileAccept;
				file.dataset.filesRequiringThumbnail 	= this.#firstFilesRequiringThumbnail;
				
				isThumbnailRequired 	= this.#firstFilesRequiringThumbnail !== '' && file.files.length > 0;
				thumbnailAccept 		= this.#firstThumbnailAccept;
				
			} else {
				row.classList.remove('file-selector__row--first');
				
				file.accept 							= this.#fileAccept;
				file.dataset.filesRequiringThumbnail 	= this.#filesRequiringThumbnail;
				
				isThumbnailRequired 	= this.#filesRequiringThumbnail !== '' && file.files.length > 0;
				thumbnailAccept 		= this.#thumbnailAccept;
				
			}
			
			file.name = `file_${index}`;
			
			if (thumbnail) {
				thumbnail.name 		= `thumbnail_${index}`;
				thumbnail.accept 	= thumbnailAccept;
				thumbnail.disabled 	= !isThumbnailRequired;
				
				thumbnail
				.closest('.file-selector__input-wrapper')
				.classList
				.toggle('file-selector__input-wrapper--hidden', !isThumbnailRequired);
			}
		});
    }
    
	#updateInsertionZones() {
		this.element
		.querySelectorAll(':scope > .file-selector__insertion-zone')
		.forEach(zone => {
			zone.remove();
		});
		
		this.element
		.querySelectorAll(':scope > .file-selector__row')
		.forEach((row, index) => {
			const insertionZone         = document.createElement('div');
			insertionZone.className     = 'file-selector__insertion-zone';
			
			row.insertAdjacentElement('afterEnd', insertionZone);
			
			if (index === 0) {
				row.insertAdjacentElement('beforeBegin', insertionZone.cloneNode(true));
			}
		});
    }
	
	#checkAll() {
		this.#currentTotalSize 				= 0;
		this.#currentTotalFilesSize 		= 0;
		this.#currentTotalThumbnailsSize 	= 0;
		
		this.element
		.querySelectorAll('.file-selector__input')
		.forEach(input => {
			if (input.disabled) {
				return;
			}
			
			if (input.files.length > 0) {
				const size = [...input.files][0].size;
				
				this.#currentTotalSize += size;
				
				if (input.name.startsWith('file')) {
					this.#currentTotalFilesSize 		+= size;
				} else {
					this.#currentTotalThumbnailsSize 	+= size;
				}
			}
			
			this.#check(input);
		});
		
		if (this.#totalSize) {
			this.element.classList.toggle('file-selector--total-size-error'				, this.#currentTotalSize 			> this.#totalSize			);
		}
		
		if (this.#totalFilesSize) {
			this.element.classList.toggle('file-selector--total-files-size-error'		, this.#currentTotalFilesSize 		> this.#totalFilesSize		);
		}
		
		if (this.#totalThumbnailsSize) {
			this.element.classList.toggle('file-selector--total-thumbnails-size-error'	, this.#currentTotalThumbnailsSize 	> this.#totalThumbnailsSize	);
		}
	}
	
	#check(input) {
		let isTypeError 	= false;
		let isSizeError 	= false;
		let isAnotherError 	= false;
		
		let isValid 		= true;
		
		if (input.files.length > 0) {
			const wrapper 	= input.closest('.file-selector__input-wrapper');
			
			isTypeError 	= input.accept.trim() !== '' && !this.#checkIsFileMatcheType([...input.files][0], input.accept);
			
			wrapper.classList.toggle('file-selector__input-wrapper--type-error', isTypeError);
			
			let maxSize = null;
			
			if (input.name.endsWith('thumbnail_0') && this.#firstThumbnailSize) {
				maxSize = this.#firstThumbnailSize;
				
			} else if (input.name.endsWith('file_0') && this.#firstFileSize) {
				maxSize = this.#firstFileSize;
				
			} else if (input.name.startsWith('thumbnail') && this.#thumbnailSize) {
				maxSize = this.#thumbnailSize;
				
			} else if (input.name.startsWith('file') && this.#fileSize) {
				maxSize = this.#fileSize;
				
			}
			
			isSizeError = maxSize && [...input.files][0].size > maxSize;
			
			wrapper.classList.toggle('file-selector__input-wrapper--size-error', isSizeError);
			
			if (this.#extraCheckIsError) {
				isAnotherError = this.#extraCheckIsError(input);
				
				wrapper.classList.toggle('file-selector__input-wrapper--another-error', isAnotherError);
			}
			
			isValid = !isTypeError && !isSizeError && !isAnotherError;
		}
		
		if (input.name.startsWith('file')) {
			const thumbnail = input.closest('.file-selector__row').querySelector('[name^="thumbnail"]');
			
			if (thumbnail) {
				let isThumbnailRequired = false;
				
				if (input.files.length > 0) {
					isThumbnailRequired = input.dataset.filesRequiringThumbnail.trim() !== '' && this.#checkIsFileMatcheType([...input.files][0], input.dataset.filesRequiringThumbnail);
					
					if (!isThumbnailRequired && this.#extraCheckIsThumbnailRequired) {
						isThumbnailRequired = this.#extraCheckIsThumbnailRequired(input);
					}
				}
				
				const isThumbnailShouldBeDisplayed = isThumbnailRequired && isValid;
				
				thumbnail.disabled = !isThumbnailShouldBeDisplayed;
				
				thumbnail
				.closest('.file-selector__input-wrapper')
				.classList
				.toggle('file-selector__input-wrapper--hidden', !isThumbnailShouldBeDisplayed);
			}
		}
	}
	
	#checkIsFileMatcheType(file, accept) {
		return accept.split(',').some(type => {
			type = type.trim().toLowerCase();
			
			if (type.startsWith('.')) {
				return file.name.toLowerCase().endsWith(type);
			}
			
			if (type.endsWith('/*')) {
				const mimeType = type.slice(0, -1);
				
				return file.type.toLowerCase().startsWith(mimeType);
			}
			
			return file.type.toLowerCase() === type;
		});
	}
	
	#handleClick() {
		this.#addButton.addEventListener('click', event => {
			const rows = this.element.querySelectorAll(':scope > .file-selector__row');
			
			if (rows.length >= this.#rowsLimit) {
				return;
			}
			
			if (rows.length === 0) {
				this.#addButton.insertAdjacentElement('beforeBegin', this.#firstRowTemplate.cloneNode(true));
			} else {
				this.#addButton.insertAdjacentElement('beforeBegin', this.#rowTemplate.cloneNode(true));
			}
			
			if (rows.length + 1 >= this.#rowsLimit) {
				this.#addButton.disabled = true;
			}
			
			this.#update();
			this.#checkAll();
			this.#updateInsertionZones();
		});
    }
	
	#handleChange() {
		this.element.addEventListener('change', event => {
			if (event.target.classList.contains('file-selector__input')) {
				this.#checkAll();
			}
		});
	}
	
	#handlePointerdown() {
		this.element.addEventListener('pointerdown', event => {
			const dragHandle = event.target.closest('.file-selector__drag-handle');
			
			if (!dragHandle) {
				return;
			}
			
			event.preventDefault();
			
			this.element.setPointerCapture(event.pointerId);
			
			const row 				= dragHandle.closest('.file-selector__row');
			const ghost 			= row.cloneNode(true);
			const insertionZones 	= this.element.querySelectorAll('.file-selector__insertion-zone');
			const ghostDragHandle 	= ghost.querySelector(':scope > .file-selector__drag-handle');
			
			
			this.#ghostRow.pointerId 	= event.pointerId;
			this.#ghostRow.row 			= row;
			this.#ghostRow.ghost 		= ghost;
			
			
			document.documentElement.classList.add('file-selector--dragging');
			row.classList.add('file-selector__row--dragged');
			ghost.classList.add('file-selector__ghost');
			ghostDragHandle.classList.add('file-selector__drag-handle--dragging');
			
			this.#trashCan.classList.remove('file-selector__trash-can--hidden');
			
			const rect 					= row.getBoundingClientRect();
			const styles 				= getComputedStyle(row);
			
			const marginLeft 			= parseFloat(styles.marginLeft);
			const marginTop 			= parseFloat(styles.marginTop);
			const paddingLeft 			= parseFloat(styles.paddingLeft);
			
			ghost.style.left 			= rect.left 	- marginLeft 	+ 'px';
			ghost.style.top 			= rect.top 		- marginTop 	+ 'px';
			ghost.style.width 			= rect.width 					+ 'px';
			ghost.style.height 			= rect.height 					+ 'px';
			
			this.#ghostRow.offsetX 		= event.clientX - rect.left;
			this.#ghostRow.offsetY 		= event.clientY - rect.top;
			this.#ghostRow.marginLeft 	= marginLeft;
			this.#ghostRow.marginTop 	= marginTop;
			
			
			document.body.append(ghost);
			
			insertionZones.forEach(zone => {
				if (zone.previousElementSibling === row || zone.nextElementSibling === row) {
					return;
				}
				
				zone.classList.add('file-selector__insertion-zone--visible');
			});
		});
	}
	
	#handlePointermove() {
		this.element.addEventListener('pointermove', event => {
			if (!this.#ghostRow.ghost) {
				return;
			}
			
			this.#lastMouseX = event.clientX;
			this.#lastMouseY = event.clientY;
			
			this.#updateDragState();
		});
	}
	
	#handlePointerup() {
		this.element.addEventListener('pointerup', event => {
			if (!this.#ghostRow.ghost) {
				return;
			}
			
			const dropTargets 	= document.elementsFromPoint(event.clientX, event.clientY);
			let insertionZone 	= null;
			let isRemoving 		= false;

			for (const element of dropTargets) {
				if (element.classList.contains('file-selector__insertion-zone--visible')) {
					insertionZone = element;
					
					break;
					
				} else if (element.classList.contains('file-selector__trash-can')) {
					isRemoving = true;
					
					break;
					
				}
			}
			
			if (isRemoving && !this.#trashCan.classList.contains('file-selector__trash-can--hidden')) {
				this.#removeRow(this.#ghostRow.row);
				
				this.#update();
				this.#checkAll();
				this.#updateInsertionZones();
				
				
				const trashRect 	= this.#trashCan.getBoundingClientRect();
				const ghostRect 	= this.#ghostRow.ghost.getBoundingClientRect();
				
				const targetX 		= trashRect.left 	+ trashRect.width 	/ 2;
				const targetY 		= trashRect.top 	+ trashRect.height 	/ 2;
				
				const originX 		= targetX - ghostRect.left;
				const originY 		= targetY - ghostRect.top;
				
				this.#ghostRow.ghost.style.transformOrigin = `${originX}px ${originY}px`;
				
				this.#ghostRow.ghost.classList.add('file-selector__ghost--removing');
				
				this.#addButton.disabled = false;
				
			} else if (insertionZone) {
				const clone = this.#ghostRow.row.cloneNode(true);
				
				clone.classList.remove('file-selector__row--dragged');
				
				insertionZone.replaceWith(clone);
				
				this.#removeRow(this.#ghostRow.row);
				
				this.#update();
				this.#checkAll();
				this.#updateInsertionZones();
				
			}
			
			this.#stopDrag();
		});
	}
	
	#updateDragState() {
		this.#ghostRow.ghost.style.left 	= (this.#lastMouseX - this.#ghostRow.offsetX - this.#ghostRow.marginLeft) 	+ 'px';
		this.#ghostRow.ghost.style.top 		= (this.#lastMouseY - this.#ghostRow.offsetY - this.#ghostRow.marginTop) 	+ 'px';
		
		const hoveredElements 	= document.elementsFromPoint(this.#lastMouseX, this.#lastMouseY);
		let insertionZone 		= null;
		let isOverTrashCan 		= false;
		
		for (const element of hoveredElements) {
			if (element.classList.contains('file-selector__insertion-zone--visible')) {
				insertionZone = element;
				
				break;
				
			} else if (element.classList.contains('file-selector__trash-can')) {
				isOverTrashCan = true;
				
				break;
				
			}
		}
		
		if (!this.#trashCan.classList.contains('file-selector__trash-can--hidden')) {
			this.#trashCan.classList.toggle('file-selector__trash-can--hover', isOverTrashCan);
		}
		
		if (insertionZone && !this.#ghostRow.insertionZone) {
			insertionZone.classList.add('file-selector__insertion-zone--hover');
			
			this.#ghostRow.insertionZone = insertionZone;
			
		} else if (!insertionZone && this.#ghostRow.insertionZone) {
			this.#ghostRow.insertionZone.classList.remove('file-selector__insertion-zone--hover');
			
			this.#ghostRow.insertionZone = null;
			
		} else if (insertionZone && insertionZone !== this.#ghostRow.insertionZone) {
			this.#ghostRow.insertionZone?.classList.remove('file-selector__insertion-zone--hover');
			
			insertionZone.classList.add('file-selector__insertion-zone--hover');
			
			this.#ghostRow.insertionZone = insertionZone;
		}
		
		
		const scrollParentX = this.#getScrollableParent('x');
		const scrollParentY = this.#getScrollableParent('y');
		
		if (scrollParentX) {
			if (this.#lastMouseX > window.innerWidth - this.#scrollAreaWidth) {
				scrollParentX.scrollBy(this.#scrollSpeedWidth, 0);
			}
			
			if (this.#lastMouseX < this.#scrollAreaWidth) {
				scrollParentX.scrollBy(-this.#scrollSpeedWidth, 0);
			}
		}
		
		if (scrollParentY) {
			if (this.#lastMouseY > window.innerHeight - this.#scrollAreaHeight) {
				scrollParentY.scrollBy(0, this.#scrollSpeedHeight);
			}
			
			if (this.#lastMouseY < this.#scrollAreaHeight) {
				scrollParentY.scrollBy(0, -this.#scrollSpeedHeight);
			}
		}
	}
	
	#stopDrag() {
		const ghost = this.#ghostRow.ghost;
		
		if (!ghost.classList.contains('file-selector__ghost--removing')) {
			ghost.classList.add('file-selector__ghost--disappearing');
		}
		
		const styles 			= getComputedStyle(ghost);
		const durations 		= styles.transitionDuration.split(',');
		const delays 			= styles.transitionDelay.split(',');
		
		const hasTransition = durations.some((duration, index) => {
			const d 	= parseFloat(duration);
			const delay = parseFloat(delays[index] ?? delays[0]);
			
			return d + delay > 0;
		});
		
		if (hasTransition) {
			ghost.addEventListener('transitionend', () => {
				ghost.remove();
			}, { once: true });
		} else {
			ghost.remove();
		}
		
		
		document.documentElement.classList.remove('file-selector--dragging');
		this.#ghostRow.row.classList.remove('file-selector__row--dragged');
		this.#ghostRow.insertionZone?.classList.remove('file-selector__insertion-zone--hover');
		this.#trashCan.classList.remove('file-selector__trash-can--hover');
		this.#trashCan.classList.add('file-selector__trash-can--hidden');
		
		const insertionZones = this.element.querySelectorAll('.file-selector__insertion-zone');
		
		insertionZones.forEach(zone => {
			zone.classList.remove('file-selector__insertion-zone--visible');
		});
		
		this.#ghostRow.pointerId 		= null;
		this.#ghostRow.row 				= null;
		this.#ghostRow.ghost 			= null;
		this.#ghostRow.insertionZone 	= null;
		this.#ghostRow.offsetX 			= 0;
		this.#ghostRow.offsetY 			= 0;
	}
	
	#handleWheel() {
		this.element.addEventListener('wheel', event => {
			if (!this.#ghostRow.ghost) {
				return;
			}
			
			requestAnimationFrame(() => {
				this.#updateDragState();
			});
		});
	}
	
	#handleContextmenu() {
		this.element.addEventListener('contextmenu', event => {
			if (this.#ghostRow.ghost) {
				event.preventDefault();
			}
		});
	}
	
	#handleStopDrag() {
		window.addEventListener('blur', event => {
			if (this.#ghostRow.ghost) {
				this.#stopDrag();
			}
		});
		
		document.addEventListener('visibilitychange', event => {
			if (this.#ghostRow.ghost) {
				this.#stopDrag();
			}
		});
		
		this.element.addEventListener('pointercancel', event => {
			if (this.#ghostRow.ghost) {
				this.#stopDrag();
			}
		});
		
		this.element.addEventListener('lostpointercapture', event => {
			if (this.#ghostRow.ghost) {
				this.#stopDrag();
			}
		});
	}
	
	#getScrollableParent(axis) {
		let parent = this.element;
		
		while (parent) {
			const style = getComputedStyle(parent);
			
			let canScroll = false;
			
			switch (axis) {
				case 'x':
					canScroll = /(auto|scroll)/.test(style.overflowX) && parent.scrollWidth > parent.clientWidth;
				break;
				
				case 'y':
					canScroll = /(auto|scroll)/.test(style.overflowY) && parent.scrollHeight > parent.clientHeight;
				break;
			}
			
			if (canScroll) {
				return parent;
			}
			
			parent = parent.parentElement;
		}
		
		return document.scrollingElement || null;
	}
	
	#removeRow(row) {
		row.classList.add('file-selector__row--removing');
		
		row.remove();
	}
}