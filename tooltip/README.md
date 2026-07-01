# 🧠 Tooltip

Tooltip is a lightweight vanilla JavaScript library that automatically creates tooltip buttons and displays contextual help without requiring any dependencies. It supports custom button templates, custom content markup, and multiple tooltips on the same page.

![](demo.gif)

---

## 📦 Installation

Include the stylesheet and script on your page.

```html
<link rel="stylesheet" href="tooltip.css">

<script src="tooltip.js"></script>
```

---

## 🛠 Quick Start

Initialize all tooltips after the document has loaded.

```javascript
document.addEventListener('DOMContentLoaded', () => {
	document
	.querySelectorAll('.tooltip')
	.forEach(tooltip => {
		new Tooltip(tooltip);
	});
});
```

---

## 📝 Basic Usage

The tooltip text should already be present in the HTML document. AJAX loading is not required.

The simplest markup is:

```html
<div class="tooltip">
	Tooltip text.
</div>
```

The library will automatically create both the tooltip button and the tooltip content element.

---

## 🎨 Custom Button

If you want to use your own button (custom styling, text, icon, aria-label, nested elements, etc.), add an element with the class 'tooltip__button' inside the root 'tooltip' element.

```html
<div class="tooltip">
	<button class="tooltip__button" aria-label="Help">
		?
	</button>
	
	Tooltip text.
</div>
```

The first custom button found on the page becomes the template for all subsequent automatically generated tooltip buttons. The template remains in use until another custom button template is encountered.

This means you usually only need to define a custom button once.

---

## 💬 Custom Content

If you want full control over the tooltip content (custom markup, formatting, images, links, nested elements, etc.), provide an element with the class 'tooltip__content'.

```html
<div class="tooltip">
	<div class="tooltip__content">
		...
	</div>
</div>
```

When a custom 'tooltip__content' element is provided, the library uses it instead of generating one automatically.

---
