class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);
    
    const facetForm = this.querySelector('form');
    facetForm.addEventListener('input', this.debouncedOnSubmit.bind(this));

    const params = new URLSearchParams(document.location.search);
    if (!params.has('filter.v.availability')) {
      params.set('filter.v.availability', 1);
      FacetFiltersForm.renderPage(params.toString());
    }
    
    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);
  }

  static setListeners() {
    // Returning if browser is safari as filters dont retain when coming back from PDP.
    if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) return;
    
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    }
    window.addEventListener('popstate', onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    const countContainer = document.getElementById('ProductCount');
    const countContainerDesktop = document.getElementById('ProductCountDesktop');
    document.getElementById('ProductGridContainer').querySelector('.collection').classList.add('loading');
    if (countContainer){
      countContainer.classList.add('loading');
    }
    if (countContainerDesktop){
      countContainerDesktop.classList.add('loading');
    }

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = element => element.url === url;

      FacetFiltersForm.filterData.some(filterDataUrl) ?
        FacetFiltersForm.renderSectionFromCache(filterDataUrl, event) :
        FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    if (url.includes('undefined')) {
      debugger
    }
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
        FacetFiltersForm.renderFilters(html, event);
        window.newHtml = new DOMParser().parseFromString(html, 'text/html')
        console.log(url)
        if (url.includes('undefined')) {
          debugger
        }
        console.log(window.newHtml.querySelectorAll('[data-filtername="men"]'))
        FacetFiltersForm.renderProductGridContainer(html);
        // FacetFiltersForm.renderProductCount(html);
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    // FacetFiltersForm.renderProductCount(html);
  }

  static renderProductGridContainer(html) {
    document.getElementById('ProductGridContainer').innerHTML = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductGridContainer').innerHTML;
  }

  // static renderProductCount(html) {
  //   const count = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductCount').innerHTML
  //   const container = document.getElementById('ProductCount');
  //   const containerDesktop = document.getElementById('ProductCountDesktop');
  //   container.innerHTML = count;
  //   container.classList.remove('loading');
  //   if (containerDesktop) {
  //     containerDesktop.innerHTML = count;
  //     containerDesktop.classList.remove('loading');
  //   }
  // }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');

    const facetDetailsElements =
      parsedHTML.querySelectorAll('#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter');
    const matchesIndex = (element) => {
      const jsFilter = event ? event.target.closest('.js-filter') : undefined;
      return jsFilter ? element.dataset.index === jsFilter.dataset.index : false;
    }
    const facetsToRender = Array.from(facetDetailsElements).filter(element => !matchesIndex(element));
    const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);

    facetsToRender.forEach((element) => {
      document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
    });

    FacetFiltersForm.renderActiveFacets(parsedHTML);
    FacetFiltersForm.renderAdditionalElements(parsedHTML);

    if (countsToRender) FacetFiltersForm.renderCounts(countsToRender, event.target.closest('.js-filter'));
  }

  static renderActiveFacets(html) {
    const activeFacetElementSelectors = ['.active-facets-mobile', '.active-facets-desktop'];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
    })

    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderAdditionalElements(html) {
    const mobileElementSelectors = ['.mobile-facets__open', '.mobile-facets__count', '.sorting'];

    mobileElementSelectors.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });

    document.getElementById('FacetFiltersFormMobile').closest('menu-drawer').bindEvents();
  }

  static renderCounts(source, target) {
    const targetElement = target.querySelector('.facets__selected');
    const sourceElement = source.querySelector('.facets__selected');

    const targetElementAccessibility = target.querySelector('.facets__summary');
    const sourceElementAccessibility = source.querySelector('.facets__summary');

    if (sourceElement && targetElement) {
      target.querySelector('.facets__selected').outerHTML = source.querySelector('.facets__selected').outerHTML;
    }

    if (targetElementAccessibility && sourceElementAccessibility) {
      target.querySelector('.facets__summary').outerHTML = source.querySelector('.facets__summary').outerHTML;
    }
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      }
    ]
  }

  createSearchParams(form) {
    const formData = new FormData(form);
    return new URLSearchParams(formData).toString();
  }

  onSubmitForm(searchParams, event) {
    FacetFiltersForm.renderPage(searchParams, event);
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const sortFilterForms = document.querySelectorAll('facet-filters-form form');
    if (event.srcElement.className == 'mobile-facets__checkbox') {
      const searchParams = this.createSearchParams(event.target.closest('form'))
      this.onSubmitForm(searchParams, event)
    } else {
      const forms = [];
      const isMobile = event.target.closest('form').id === 'FacetFiltersFormMobile';

      sortFilterForms.forEach((form) => {
        if (!isMobile) {
          if (form.id === 'FacetSortForm' || form.id === 'FacetFiltersForm' || form.id === 'FacetSortDrawerForm') {
            const noJsElements = document.querySelectorAll('.no-js-list');
            noJsElements.forEach((el) => el.remove());
            forms.push(this.createSearchParams(form));
          }
        } else if (form.id === 'FacetFiltersFormMobile') {
         
          forms.push(this.createSearchParams(form));
        }
      });
      this.onSubmitForm(forms.join('&'), event)
    }
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url = event.currentTarget.href.indexOf('?') == -1 ? '' : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    FacetFiltersForm.renderPage(url);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.setListeners();

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll('input').forEach(element => element.addEventListener('change', this.onRangeChange.bind(this)));
    this.setMinAndMaxValues();
  }


  onRangeChange(event) {
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxValues();

  }

  setMinAndMaxValues() {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];

    let minvalue=document.querySelector("#Filter-Price-GTE").value;
    let maxvalue=document.querySelector("#Filter-Price-LTE").value;
    const totalval= minInput.getAttribute('max');

    
    // for mobile getting the min and max value from the range
    let mobileMinvalue = document.querySelector(".min-range_mobile").value;
    let mobileMaxvalue = document.querySelector(".max-range_mobile").value;

    //setting the input box value to show the current price range

    //For desktop min value
    document.querySelector(".min-price").value=minvalue;  
    document.querySelector(".input-progress").style.left = (minvalue / totalval) * 100 + "%"; //progress between the price range left
    document.querySelector(".input-progress").style.right = 100 - (maxvalue / totalval) * 100 + "%"; //progress between the price range right

     //For desktop max value 
    document.querySelector(".max-price").value=maxvalue;
    document.querySelector(".input-progress").style.left = (minvalue / totalval) * 100 + "%"; //progress between the price range left
    document.querySelector(".input-progress").style.right = 100 - (maxvalue / totalval) * 100 + "%"; //progress between the price range right

    //For mobile min value
    document.querySelector(".mobile_display-price.min-price").value = mobileMinvalue;
    document.querySelector(".mobile-input-progress").style.left = (mobileMinvalue / totalval) * 100 + "%"; //progress between the price range left
    document.querySelector(".mobile-input-progress").style.right = 100 - (mobileMaxvalue / totalval) * 100 + "%"; 
    
    //For mobile max value
    document.querySelector(".mobile_display-price.max-price").value = mobileMaxvalue;
    document.querySelector(".mobile-input-progress").style.left = (mobileMinvalue / totalval) * 100 + "%"; //progress between the price range left
    document.querySelector(".mobile-input-progress").style.right = 100 - (mobileMaxvalue / totalval) * 100 + "%"; 

    //bubble price for min desktop
    const minrange = document.querySelector(".min-price");
    const minbubble = document.querySelector(".min-price_bubble");

    //for Mobile
    const MobileMinrange = document.querySelector(".min-range_mobile");
    const MobileMininbubble = document.querySelector(".mobile-min_bubble");
    
    setBubble(MobileMinrange,MobileMininbubble)
    setBubble(minrange, minbubble);
    
    function setBubble(range, minbubble) {
      const val = range.value;
      const totalval= minInput.getAttribute('max');
    
      minbubble.innerHTML = val;
  
      // Sorta magic numbers based on size of the native UI thumb
      minbubble.style.left = `${val/totalval * 100}%`;
      minbubble.style.transform=`translateX(-${val/totalval * 100}%)`;
    }
  
    
     //bubble price for max mobile
    const maxrange = document.querySelector(".max-price");
    const maxbubble = document.querySelector(".max-price_bubble");

    //for Mobile
    const MobileMaxrange = document.querySelector(".max-range_mobile");
    const MobileMaxinbubble = document.querySelector(".mobile-max_bubble");

    setMaxBubble(MobileMaxrange, MobileMaxinbubble);
  
    maxrange.addEventListener("input", () => {
      setMaxBubble(maxrange, maxbubble);
    });
    setMaxBubble(maxrange, maxbubble);
    
    function setMaxBubble(range, maxbubble) {
      const val = range.value;
      const totalval= minInput.getAttribute('max');
      maxbubble.innerHTML = val;
    
      // Sort magic numbers based on size of the native UI thumb
      maxbubble.style.left = `${val/totalval * 100}%`;
      maxbubble.style.transform=`translateX(-${val/totalval * 100}%)`;
    }


    
}

  

  adjustToValidValues(input) {
    const value = Number(input.value);
    const min = Number(input.getAttribute('min'));
    const max = Number(input.getAttribute('max'));

    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }
}

customElements.define('price-range', PriceRange);

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    const facetLink = this.querySelector('a');
    facetLink.setAttribute('role', 'button');
    facetLink.addEventListener('click', this.closeFilter.bind(this));
    facetLink.addEventListener('keyup', (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === 'SPACE') this.closeFilter(event);
    });
  }

  closeFilter(event) {
    event.preventDefault();
    const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
    form.onActiveFilterClick(event);
  }
}

customElements.define('facet-remove', FacetRemove);



