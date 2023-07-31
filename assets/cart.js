class CartRemoveButton extends HTMLElement {
  constructor() {
    super();
    
    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');
      this.fcfsToken = this.querySelector('[data-fcfs]')?.dataset.token;
      
      cartItems.updateQuantity(this.dataset.index, 0, undefined, this.fcfsToken);

      //for fcfs --- to enable the add to cart button after its been removed from the cart
      if(document.querySelector("[data-fcfs='true']") || sessionStorage.getItem("Added") == "true") {
        sessionStorage.setItem("Added",false)
        let addtocartBtn = document.querySelector(".product-form__submit");
        let btnText = document.querySelector(".product-form__submit span");
        let recaptcha = document.querySelector(".recaptcha");
        
        if(sessionStorage.getItem("Added") == "false") {
          addtocartBtn.removeAttribute("disabled");
          addtocartBtn.removeAttribute("data-added");
          btnText.textContent = "Add to cart";
          recaptcha.style.display ="block"          
        }  
      }
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();

    this.lineItemStatusElement = document.getElementById('shopping-cart-line-item-status') || document.getElementById('CartDrawer-LineItemStatus');

    this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
      .reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);

    this.debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, 300);

    this.addEventListener('change', this.debouncedOnChange.bind(this));
  }

  onChange(event) {
    this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
  }

  getSectionsToRender() {
    return [
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items').dataset.id,
        selector: '.js-contents',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section'
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section'
      },
      {
        id: 'main-cart-footer',
        section: document.getElementById('main-cart-footer').dataset.id,
        selector: '.js-contents',
      }
    ];
  }

  updateQuantity(line, quantity, name, fcfsToken) {
    this.enableLoading(line);

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname
    });

    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
    .then((response) => {
      return response.text();
    })
    .then((state) => {
      const parsedState = JSON.parse(state);
      this.classList.toggle('is-empty', parsedState.item_count === 0);
      const cartDrawerWrapper = document.querySelector('cart-drawer');
      const cartFooter = document.getElementById('main-cart-footer');

      if (cartFooter) cartFooter.classList.toggle('is-empty', parsedState.item_count === 0);
      if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle('is-empty', parsedState.item_count === 0);

      this.getSectionsToRender().forEach((section => {
        const elementToReplace =
          document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
        elementToReplace.innerHTML =
          this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
      }));

      //Deleting the FCFS product session
      this.deleteFCFSProductSession(fcfsToken)

      this.updateLiveRegions(line, parsedState.item_count);
      const lineItem = document.getElementById(`CartItem-${line}`) || document.getElementById(`CartDrawer-Item-${line}`);
      if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
        cartDrawerWrapper ? trapFocus(cartDrawerWrapper, lineItem.querySelector(`[name="${name}"]`)) : lineItem.querySelector(`[name="${name}"]`).focus();
      } else if (parsedState.item_count === 0 && cartDrawerWrapper) {
        trapFocus(cartDrawerWrapper.querySelector('.drawer__inner-empty'), cartDrawerWrapper.querySelector('a'))
      } else if (document.querySelector('.cart-item') && cartDrawerWrapper) {
        trapFocus(cartDrawerWrapper, document.querySelector('.cart-item__name'))
      }
      
      this.disableLoading();
    }).catch(() => {
      this.querySelectorAll('.loading-overlay').forEach((overlay) => overlay.classList.add('hidden'));
      const errors = document.getElementById('cart-errors') || document.getElementById('CartDrawer-CartErrors');
      errors.textContent = window.cartStrings.error;
      this.disableLoading();
    });
  }

  deleteFCFSProductSession(fcfsToken) {
    if (!fcfsToken) return;

    localStorage.removeItem("EndTimeCheckout")
    localStorage.removeItem("endTime");
    const deleteSessionURL = 'https://fcfs-stage.marmeto.com/api/delete/session';
    const data = {
      token: fcfsToken
    };
    
    fetch(deleteSessionURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

  updateLiveRegions(line, itemCount) {
    if (this.currentItemCount === itemCount) {
      const lineItemError = document.getElementById(`Line-item-error-${line}`) || document.getElementById(`CartDrawer-LineItemError-${line}`);
      const quantityElement = document.getElementById(`Quantity-${line}`) || document.getElementById(`Drawer-quantity-${line}`);

      if (!quantityElement) return;
      
      lineItemError
        .querySelector('.cart-item__error-text')
        .innerHTML = window.cartStrings.quantityError.replace(
          '[quantity]',
          quantityElement.value
        );
    }

    this.currentItemCount = itemCount;
    this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const cartStatus = document.getElementById('cart-live-region-text') || document.getElementById('CartDrawer-LiveRegionText');
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  enableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.add('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading-overlay`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading-overlay`);

    [...cartItemElements, ...cartDrawerItemElements].forEach((overlay) => overlay.classList.remove('hidden'));

    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute('aria-hidden', false);
  }

  disableLoading() {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.remove('cart__items--disabled');
  }
}

customElements.define('cart-items', CartItems);

if (!customElements.get('cart-note')) {
  customElements.define('cart-note', class CartNote extends HTMLElement {
    constructor() {
      super();

      this.addEventListener('change', debounce((event) => {
        const body = JSON.stringify({ note: event.target.value });
        fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } });
      }, 300))
    }
  });
};


// // SIMPL BUTTON DISABLE
//Fetching will be done on the basis of the Local Storage !!!

let carTurl = "https://www.superkicks.in/cart.json";
let localArray = JSON.parse(localStorage.getItem("pid")) || [];

let SimplcartFuntion = async () => {
  const request = await fetch(carTurl);
  const response = await request.json();
  const items = response?.items;

  let value = false;
  for (let i = 0; i < items.length; i++) {
    const productID = items[i].product_id;
    if (localArray.includes(productID)) {
      value = true;
      break;
    }
  }

  let cartPage_identity = document.querySelector("#simpl-checkout-cart-v2");
  console.log(cartPage_identity);
  if (!value) {
    cartPage_identity.removeAttribute("style");
  } else {
    cartPage_identity.setAttribute("style", "display:none;");
  }
};


if(document.querySelector(".title-wrapper-with-link #main-cart-items")){

const m = new MutationObserver(() => {
  SimplcartFuntion();
});  
  
m.observe(document.querySelector(".title-wrapper-with-link #main-cart-items"), {
  attributes: true,
  childList: true,
  subtree: true,
});
  
}else{
  console.log(" cart mutation on hold !!!")
}

SimplcartFuntion();


