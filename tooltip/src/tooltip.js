class Tooltip {
    element;
    #button;
    #content;
    
    static #buttonTemplate;
    
    static #initialized             = false;
    static #instances               = new WeakMap();
    static #activeTooltipContent    = null;
    
    constructor(element) {
        if (Tooltip.#instances.has(element)) {
            return Tooltip.#instances.get(element);
        }
        
        this.element = element;
        
        this.#createbuttonTemplate();
        this.#createTooltipContent();
        
        this.#button = Tooltip.#buttonTemplate.cloneNode(true);
        
        this.element.innerHTML = '';
        
        this.element.append(this.#button, this.#content);
        
        if (!Tooltip.#initialized) {
            Tooltip.#handleClick();
            
            Tooltip.#initialized = true;
        }
        
        Tooltip.#instances.set(element, this);
    }
    
    #createbuttonTemplate() {
        const button = this.element.querySelector('.tooltip__button');
        
        if (button) {
            Tooltip.#buttonTemplate             = button;
            
            button.remove();
            
        } else if (!Tooltip.#buttonTemplate) {
            Tooltip.#buttonTemplate             = document.createElement('button');
            
            Tooltip.#buttonTemplate.className   = 'tooltip__button';
            Tooltip.#buttonTemplate.type        = 'button';
        }
    }
    
    #createTooltipContent() {
        const content = this.element.querySelector('.tooltip__content');
        
        if (content) {
            this.#content               = content;
        } else {
            this.#content               = document.createElement('div');
            
            this.#content.className     = 'tooltip__content';
            this.#content.textContent   = this.element.textContent.trim();
        }
        
        this.#content.classList.add('tooltip__content--hidden');
    }
    
    static #handleClick() {
        document.addEventListener('click', event => {
            if (event.target.closest('.tooltip__content')) {
                return;
            }
            
            const button = event.target.closest('.tooltip__button');
            
            if (button) {
                const tooltipContent = button.closest('.tooltip').querySelector('.tooltip__content');
                
                if (tooltipContent === Tooltip.#activeTooltipContent) {
                    tooltipContent.classList.toggle('tooltip__content--hidden');
                } else {
                    Tooltip.#activeTooltipContent?.classList.add('tooltip__content--hidden');
                    
                    tooltipContent.classList.remove('tooltip__content--hidden');
                    
                    Tooltip.#activeTooltipContent = tooltipContent;
                }
            } else {
                Tooltip.#activeTooltipContent?.classList.add('tooltip__content--hidden');
                
                Tooltip.#activeTooltipContent = null;
            }
        });
    }
}