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
	
	#extraCheck;
	#extraCheckIsThumbnailRequired;
	
	#scrollAreaWidth;
	#scrollAreaHeight;
	#scrollSpeedWidth;
	#scrollSpeedHeight;
	
	#dragHandleTemplate;
	#addButton;
	#trashCan;
	
	#rowTemplate;
	#firstRowTemplate;
	
	#thumbnailTemplate;
	#firstThumbnailTemplate;
	
	#lastMouseX = 0;
	#lastMouseY = 0;
	
	#ghostRow = {
		pointerId: 		null,
		row: 			null,
		ghost: 			null,
		insertionZone: 	null,
		offsetX: 		0,
		offsetY: 		0,
		clone: 			null
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
			
			extraCheck						,
			extraCheckIsThumbnailRequired	,
			
			scrollAreaWidth					,
			scrollAreaHeight				,
			scrollSpeedWidth				,
			scrollSpeedHeight
		
		} = options;
		
		this.#rowsLimit 						= Number.isInteger(rowsLimit) 			&& rowsLimit > 0 				? rowsLimit 						: 1				;
		
		this.#thumbnailLabel 					= typeof thumbnailLabel 				=== 'string' 					? thumbnailLabel 					: 'Thumbnail'	;
		
		this.#fileAccept 						= typeof fileAccept 					=== 'string' 					? fileAccept 						: ''			;
		this.#filesRequiringThumbnail 			= typeof filesRequiringThumbnail 		=== 'string' 					? filesRequiringThumbnail 			: ''			;
		this.#thumbnailAccept 					= typeof thumbnailAccept 				=== 'string' 					? thumbnailAccept 					: ''			;
		
		this.#firstFileAccept 					= typeof firstFileAccept 				=== 'string' 					? firstFileAccept 					: ''			;
		this.#firstFilesRequiringThumbnail 		= typeof firstFilesRequiringThumbnail 	=== 'string' 					? firstFilesRequiringThumbnail 		: ''			;
		this.#firstThumbnailAccept 				= typeof firstThumbnailAccept 			=== 'string' 					? firstThumbnailAccept 				: ''			;
		
		this.#extraCheck 						= typeof extraCheck 					=== 'function' 					? extraCheck 						: null			;
		this.#extraCheckIsThumbnailRequired 	= typeof extraCheckIsThumbnailRequired 	=== 'function' 					? extraCheckIsThumbnailRequired 	: null			;
		
		this.#scrollAreaWidth 					= Number.isInteger(scrollAreaWidth) 	&& scrollAreaWidth 		> 0 	? scrollAreaWidth 					: 50			;
		this.#scrollAreaHeight 					= Number.isInteger(scrollAreaHeight) 	&& scrollAreaHeight 	> 0 	? scrollAreaHeight 					: 50			;
		this.#scrollSpeedWidth 					= Number.isInteger(scrollSpeedWidth) 	&& scrollSpeedWidth 	> 0 	? scrollSpeedWidth 					: 20			;
		this.#scrollSpeedHeight 				= Number.isInteger(scrollSpeedHeight) 	&& scrollSpeedHeight 	> 0 	? scrollSpeedHeight 				: 20			;
		
		
		
		this.element = element;
		
		this.#createDragHandleTemplate();
		this.#createAddButton();
		this.#createTrashCan();
		
		
		this.#rowTemplate 		= this.#createRowTemplate(this.#fileAccept);
		this.#firstRowTemplate 	= this.#createRowTemplate(this.#firstFileAccept);
		
		this.#firstRowTemplate.classList.add('file-selector__row--first');
		
		if (this.#filesRequiringThumbnail !== '') {
			this.#thumbnailTemplate = this.#createThumbnailTemplate(this.#thumbnailAccept);
			
			this.#rowTemplate.append(this.#thumbnailTemplate.cloneNode(true));
			
			this.#rowTemplate.querySelector('[name^="file"]').dataset.filesRequiringThumbnail = this.#filesRequiringThumbnail;
		}
		
		this.#rowTemplate.append(this.#dragHandleTemplate.cloneNode(true));
        
		if (this.#firstFilesRequiringThumbnail !== '') {
			this.#firstThumbnailTemplate = this.#createThumbnailTemplate(this.#firstThumbnailAccept);
			
			this.#firstRowTemplate.append(this.#firstThumbnailTemplate.cloneNode(true));
			
			this.#firstRowTemplate.querySelector('[name^="file"]').dataset.filesRequiringThumbnail = this.#firstFilesRequiringThumbnail;
		}
		
		this.#firstRowTemplate.append(this.#dragHandleTemplate.cloneNode(true));
		
		
		this.element.append(this.#firstRowTemplate.cloneNode(true), this.#addButton);
		
		
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
	
	
	
	#createDragHandleTemplate() {
		this.#dragHandleTemplate 			= document.createElement('button');
		this.#dragHandleTemplate.className 	= 'file-selector__drag-handle';
		this.#dragHandleTemplate.type 		= 'button';
	}
	
	#createAddButton() {
		this.#addButton 			= document.createElement('button');
		this.#addButton.className 	= 'file-selector__add-button';
		this.#addButton.type 		= 'button';
	}
	
	#createTrashCan() {
		this.#trashCan 				= document.createElement('div');
		this.#trashCan.className 	= 'file-selector__trash-can file-selector__trash-can--hidden';
		
		this.element.prepend(this.#trashCan);
	}
	
	#createThumbnailTemplate(accept) {
		const template 		= document.createElement('label');
		template.className 	= 'file-selector__input-wrapper file-selector__input-wrapper--hidden';
		
		template.innerHTML 	=
			`
			<span class="file-selector__input-name">
				${this.#thumbnailLabel}
			</span>
			
			<input class="file-selector__input file-selector__input--thumbnail" type="file" name="thumbnail_1" accept="${accept}">
			`;
		
		template.querySelector(':scope > .file-selector__input--thumbnail').disabled = true;
		
		return template;
	}
	
	#createRowTemplate(accept) {
		const template 		= document.createElement('div');
		template.className 	= 'file-selector__row';
		
		template.innerHTML 	=
			`
			<label class="file-selector__input-wrapper">
				<input class="file-selector__input" type="file" name="file_1" accept="${accept}">
			</label>
			`;
		
		return template;
	}
    
	#update() {
		const rows 	= this.element.querySelectorAll(':scope > .file-selector__row');
		
		let index 	= 0;
		
		rows.forEach(row => {
			const file 				= row.querySelector('[name^="file"]');
			const thumbnail 		= row.querySelector('[name^="thumbnail"]');
			const thumbnailWrapper 	= thumbnail?.closest('.file-selector__input-wrapper');
			
			file.name 			= `file_${index}`;
			
			if (thumbnail) {
				thumbnail.name 	= `thumbnail_${index}`;
			}
			
			if (index === 0) {
				row.classList.add('file-selector__row--first');
				
				file.accept 							= this.#firstFileAccept;
				file.dataset.filesRequiringThumbnail 	= this.#firstFilesRequiringThumbnail;
				
				if (this.#firstFilesRequiringThumbnail === '') {
					thumbnailWrapper?.remove();
					
				} else if (thumbnail) {
					thumbnail.accept = this.#firstThumbnailAccept;
					
				} else {
					const dragHandle = row.querySelector(':scope > .file-selector__drag-handle');
					
					dragHandle.insertAdjacentElement('beforeBegin', this.#firstThumbnailTemplate.cloneNode(true));
					
				}
				
			} else {
				row.classList.remove('file-selector__row--first');
				
				file.accept 							= this.#fileAccept;
				file.dataset.filesRequiringThumbnail 	= this.#filesRequiringThumbnail;
				
				if (this.#filesRequiringThumbnail === '') {
					thumbnailWrapper?.remove();
					
				} else if (thumbnail) {
					thumbnail.accept = this.#thumbnailAccept;
					
				} else {
					const dragHandle = row.querySelector(':scope > .file-selector__drag-handle');
					
					dragHandle.insertAdjacentElement('beforeBegin', this.#thumbnailTemplate.cloneNode(true));
					
				}
				
			}
			
			++index;
		});
    }
    
	#updateInsertionZones() {
		const insertionZones    = this.element.querySelectorAll(':scope > .file-selector__insertion-zone');
		const rows          	= this.element.querySelectorAll(':scope > .file-selector__row');
		
		insertionZones.forEach(zone => {
			zone.remove();
		});
		
		rows.forEach((row, index) => {
			const insertionZone         = document.createElement('div');
			insertionZone.className     = 'file-selector__insertion-zone';
			
			row.insertAdjacentElement('afterEnd', insertionZone);
			
			if (index === 0) {
				row.insertAdjacentElement('beforeBegin', insertionZone.cloneNode(true));
			}
		});
    }
	
	#checkAll() {
		const inputs = this.element.querySelectorAll('.file-selector__input');
		
		inputs.forEach(input => {
			this.#check(input);
		});
	}
	
	#check(input) {
		const wrapper 	= input.closest('.file-selector__input-wrapper');
		let isValid 	= true;
		
		if (input.files.length > 0) {
			isValid = [...input.files].every(file => this.#fileMatchesAccept(file, input.accept));
			
			if (isValid && this.#extraCheck) {
				isValid = this.#extraCheck(input);
			}
		}
		
		if (isValid) {
			wrapper.classList.remove('file-selector__input-wrapper--error');
		} else {
			wrapper.classList.add('file-selector__input-wrapper--error');
		}
		
		
		if (input.name.startsWith('file') && isValid) {
			const thumbnail = input.closest('.file-selector__row').querySelector('[name^="thumbnail"]');
			
			if (thumbnail) {
				const thumbnailWrapper 		= thumbnail.closest('.file-selector__input-wrapper');
				let isThumbnailRequired 	= false;
				
				if (input.files.length > 0) {
					isThumbnailRequired = [...input.files].every(file => this.#fileMatchesAccept(file, input.dataset.filesRequiringThumbnail));
					
					if (!isThumbnailRequired && this.#extraCheckIsThumbnailRequired) {
						isThumbnailRequired = this.#extraCheckIsThumbnailRequired(input);
					}
				}
				
				if (isThumbnailRequired) {
					thumbnailWrapper.classList.remove('file-selector__input-wrapper--hidden');
					
					thumbnail.required 	= true;
					thumbnail.disabled 	= false;
					
				} else {
					thumbnailWrapper.classList.add('file-selector__input-wrapper--hidden');
					
					thumbnail.required 	= false;
					thumbnail.disabled 	= true;
					
					thumbnail.value = '';
					
				}
			}
		}
	}
	
	#fileMatchesAccept(file, accept) {
		if (accept.trim() === '') {
			return true;
		}
		
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
			this.#updateInsertionZones();
		});
    }
	
	#handleChange() {
		this.element.addEventListener('change', event => {
			if (event.target.classList.contains('file-selector__input')) {
				this.#check(event.target);
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
				const clone 			= this.#ghostRow.row.cloneNode(true);
				this.#ghostRow.clone 	= clone;
				
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
		this.#ghostRow.clone 			= null;
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