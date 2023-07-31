if (!customElements.get('product-modal')) {
  customElements.define('product-modal', class ProductModal extends ModalDialog {
    constructor() {
      super();
    }

    hide() {
      super.hide();
    }

    show(opener) {
      super.show(opener);
      this.showActiveMedia();
    }

    showActiveMedia() {
      this.querySelectorAll(`[data-media-id]:not([data-media-id="${this.openedBy.getAttribute("data-media-id")}"])`).forEach((element) => {
          element.classList.remove('active');
        }
      )
      const activeMedia = this.querySelector(`[data-media-id="${this.openedBy.getAttribute("data-media-id")}"]`);
      const activeMediaTemplate = activeMedia.querySelector('template');
      const activeMediaContent = activeMediaTemplate ? activeMediaTemplate.content : null;
      activeMedia.classList.add('active');
      activeMedia.scrollIntoView();

      const container = this.querySelector('[role="document"]');
      container.scrollLeft = (activeMedia.width - container.clientWidth) / 2;

      if (activeMedia.nodeName == 'DEFERRED-MEDIA' && activeMediaContent && activeMediaContent.querySelector('.js-youtube'))
        activeMedia.loadContent();
    }
  });
}


// SIMPL BUTTON DISABLE


//Manuplating Simpl on product

// const pdpPage = async () => {
//   try {
//     const checkoutProduct = document.querySelector("#simpl-checkout-product-v2");
//     const fcfsElement = document.querySelector(".product-form-fcfs");
//     const target = document.querySelector("button[name='add']");

//     if (!fcfsElement && !checkoutProduct) {
//       target.insertAdjacentHTML("afterend", `<div id="simpl-checkout-product-v2" class="simpl-button-container"></div>`);
//     }

//   } catch (e) {
//     console.log("!!ERROR while request", e);
//   }
// };





//Manupulating contents on ajaxCart page
const ajaxCart = async () => {
  let carTurl = "https://www.superkicks.in/cart.json";
  try {
    const res = await fetch(carTurl);
    const response = await res.json();
    const itemsID = response?.items;
    let localStorageArray = JSON.parse(localStorage.getItem("pid")) || [];
    let uniqueArrayId = [...new Set(localStorageArray)];
    let simplajax = document.querySelector("#simpl-checkout-ajaxCart-v2");
    let item_present = false;
    for (let i in itemsID) {
      let itemID = itemsID[i].product_id;
    
      if (uniqueArrayId.includes(itemID)) {
        item_present = true;
        break; 
      }
    }
    if (item_present) {
      if (simplajax) {
        simplajax.style.display = "none";
      }
      console.log("Simpl is Disabled !!!")
    } else {
      if (simplajax) {
        simplajax.removeAttribute("style");
      }
      console.log("Simpl is Enabled !!!")
    }
    return false;
  } catch (e) {
    console.log(e);
    return false;
  }
};

//Accessing function on each page load
window.addEventListener("DOMContentLoaded", (event) => {
  // console.log("DOM fully loaded and parsed");
  // pdpPage();
   ajaxCart();
});

//Analysis changes on the Ajax Cart Page.
var mutates = new MutationObserver(() => {
  ajaxCart();
});

mutates.observe(document.querySelector("#CartDrawer"), {
  attributes: true,
  childList: true,
  subtree: true,
});


