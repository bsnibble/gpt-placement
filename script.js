function extractFormRelatedHtml() {

    var removed = false;

    // Function to check if an element is a form, inside a form, contains a form,
    // or has a BUTTON tag in the descendants
    function isOrContainsFormOrButton(element) {
        // Check for form or button tag in the element itself
        if (element.tagName === 'FORM' || element.tagName === 'BUTTON') {
            return true;
        }

        // Check for form or button tag in the descendants
        if (element.querySelector('form, button')) {
            return true;
        }

        // Check if the element is inside a form
        let parent = element.parentElement;
        while (parent) {
            if (parent.tagName === 'FORM') {
                return true;
            }
            parent = parent.parentElement;
        }

        return false;
    }

    // Function to clean attributes of an element
    function cleanAttributes(element) {
        for (let i = element.attributes.length - 1; i >= 0; i--) {
            const attrName = element.attributes[i].name;
            if (!['class', 'id', 'type', 'action', 'onSubmit'].includes(attrName)) {
                element.removeAttribute(attrName);
            }
        }
    }

    // Function to remove unwanted form elements and clean attributes
    function cleanFormElements(element) {
        if (element.nodeType !== Node.ELEMENT_NODE) {
            return null;
        }
        if (element.tagName.toUpperCase() === 'SCRIPT' || element.tagName.toUpperCase() === 'STYLE') {
            return null;
        }

        // If it is a media object or iframe remove it
        if (['IMG', 'MEDIA', 'SVG', 'FIGURE', 'SYMBOL', 'EMBED', 'OBJECT', 'IFRAME'].indexOf(element.tagName.toUpperCase()) !== -1) {
            return null;
        }

        // Check for empty elements (P, SPAN, DIV)
        if (['P', 'SPAN', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'UL', 'OL'].includes(element.tagName.toUpperCase())) {
            if (!element.textContent.trim() && !element.innerHTML.trim()) {
                removed = true;
                return null;
            }
        }

        // If the element is a form element but not a button or input type="button", remove it
        if (['INPUT', 'SELECT', 'TEXTAREA', 'LABEL', 'FIELDSET', 'LEGEND', 'DATALIST', 'OUTPUT'].indexOf(element.tagName.toUpperCase()) !== -1) {
            if (element.tagName !== 'INPUT' || !element.type || !['button', 'text', 'number'].includes(element.type.toLowerCase())) {
                return null;
            }
        }
       
        if (isOrContainsFormOrButton(element)) {
            const clone = element.cloneNode(false);
            cleanAttributes(clone);

            Array.from(element.childNodes).forEach(child => {
                const childClone = cleanFormElements(child);
                if (childClone) {
                    clone.appendChild(childClone);
                }
            });

            return clone;
        }

        return null;
    }


    // Extract and clean the relevant elements from the body
    var bodyClone = isOrContainsFormOrButton(document.body) ? cleanFormElements(document.body) : null;

    while (removed) {
        console.log('recleaning');
        removed = false;
        bodyClone = isOrContainsFormOrButton(bodyClone) ? cleanFormElements(bodyClone) : null;
    }

    // Creating a container to convert the cloned body into HTML string
    const container = document.createElement('div');
    if (bodyClone) {
        container.appendChild(bodyClone);
    }

    // Retrieve the HTML string
    var htmlString = container.innerHTML;

    // Clear variables
    bodyClone = undefined;

    // Remove newline characters
    htmlString = htmlString.replace(/\n/g, '');

    // Replace multiple spaces with a single space
    htmlString = htmlString.replace(/  +/g, ' ');

    // Clear the container
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    return htmlString;
}

function getPage() {
    const htmlContent = extractFormRelatedHtml();
    return htmlContent;
}

return getPage();

